package se.aventyrute;

import android.app.Activity;
import android.content.Intent;
import android.content.ClipData;
import android.webkit.ValueCallback;
import android.webkit.JavascriptInterface;
import android.util.Base64;
import java.io.File;
import java.io.FileOutputStream;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Collections;

public class MainActivity extends Activity {
    private static final String LOCAL_HOST = "appassets.androidplatform.net";
    private WebView game;
    private ValueCallback<Uri[]> photoPicker;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        game = new WebView(this);
        game.setBackgroundColor(0xfffaf0d9);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowContentAccess(false);
        game.getSettings().setAllowFileAccess(false);
        game.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void sharePhoto(String encoded) {
                if (encoded.length() > 12000000) return;
                runOnUiThread(() -> {
                    try {
                        File directory = new File(getCacheDir(), "shared");
                        directory.mkdirs();
                        File photo = File.createTempFile("memory-", ".jpg", directory);
                        try (FileOutputStream output = new FileOutputStream(photo)) {
                            output.write(Base64.decode(encoded, Base64.DEFAULT));
                        }
                        Uri uri = Uri.parse("content://se.aventyrute.memories/" + photo.getName());
                        Intent share = new Intent(Intent.ACTION_SEND);
                        share.setType("image/jpeg");
                        share.putExtra(Intent.EXTRA_STREAM, uri);
                        share.setClipData(ClipData.newRawUri("Memory", uri));
                        share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        startActivity(Intent.createChooser(share, null));
                    } catch (Exception error) {
                        game.evaluateJavascript("alert(t('Kunde inte dela bilden.'))", null);
                    }
                });
            }
        }, "AndroidAlbum");
        game.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                    FileChooserParams parameters) {
                if (photoPicker != null) photoPicker.onReceiveValue(null);
                photoPicker = callback;
                Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
                pick.setType("image/*");
                pick.addCategory(Intent.CATEGORY_OPENABLE);
                pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(Intent.createChooser(pick, null), 42);
                } catch (Exception error) {
                    photoPicker.onReceiveValue(null);
                    photoPicker = null;
                }
                return true;
            }
        });
        game.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return serveLocalAsset(request.getUrl());
            }
        });
        FrameLayout content = new FrameLayout(this);
        content.setBackgroundColor(0xfffaf0d9);
        content.addView(game, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        content.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            }
            return insets;
        });
        getWindow().setStatusBarColor(0xfffaf0d9);
        getWindow().setNavigationBarColor(0xfffaf0d9);
        setContentView(content);
        game.loadUrl("https://" + LOCAL_HOST + "/index.html");
    }

    private WebResourceResponse serveLocalAsset(Uri url) {
        String path = url.getPath();
        if ("https".equals(url.getScheme()) && LOCAL_HOST.equals(url.getHost())
                && path != null && path.matches("/[a-zA-Z0-9.-]+")) {
            String mime = null;
            if (path.endsWith(".html")) mime = "text/html";
            if (path.endsWith(".js")) mime = "text/javascript";
            if (path.endsWith(".css")) mime = "text/css";
            if (path.endsWith(".webp")) mime = "image/webp";
            if (mime != null) {
                try {
                    return new WebResourceResponse(mime, mime.startsWith("image/") ? null : "UTF-8",
                        getAssets().open(path.substring(1)));
                } catch (IOException ignored) {
                    // Missing assets get the same local error response as unknown paths.
                }
            }
        }
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
            Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
    }

    @Override
    protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request != 42 || photoPicker == null) return;
        photoPicker.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
        photoPicker = null;
    }

    @Override
    public void onBackPressed() {
        game.evaluateJavascript("typeof window.gameBack === 'function' && window.gameBack()", result -> {
            if ("false".equals(result)) finish();
        });
    }
}
