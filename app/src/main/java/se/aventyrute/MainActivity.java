package se.aventyrute;

import android.app.Activity;
import android.content.Intent;
import android.content.ClipData;
import android.provider.MediaStore;
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
    private AppUpdater updater;
    private ValueCallback<Uri[]> photoPicker;
    private Uri cameraOutput;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        updater = new AppUpdater(this);
        game = new WebView(this);
        game.setBackgroundColor(0xfffaf0d9);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowContentAccess(true);
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
                cameraOutput = null;
                try {
                    if (parameters.isCaptureEnabled()) {
                        File directory = new File(getCacheDir(), "shared");
                        directory.mkdirs();
                        File photo = File.createTempFile("memory-camera-", ".jpg", directory);
                        cameraOutput = Uri.parse("content://se.aventyrute.memories/" + photo.getName());
                        Intent capture = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                        capture.putExtra(MediaStore.EXTRA_OUTPUT, cameraOutput);
                        capture.setClipData(ClipData.newRawUri("Photo", cameraOutput));
                        capture.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                        startActivityForResult(capture, 42);
                    } else {
                        Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
                        pick.setType("image/*");
                        pick.addCategory(Intent.CATEGORY_OPENABLE);
                        pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,
                            parameters.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                        startActivityForResult(Intent.createChooser(pick, null), 42);
                    }
                } catch (Exception error) {
                    clearCameraOutput(true);
                    photoPicker.onReceiveValue(null);
                    photoPicker = null;
                    game.evaluateJavascript("alert(t('Kameran kunde inte öppnas.'))", null);
                }
                return true;
            }
        });
        game.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (!("https://" + LOCAL_HOST + "/index.html").equals(url)) return;
                view.evaluateJavascript("typeof language === 'string' ? language : 'sv'",
                    result -> updater.check("\"en\"".equals(result) ? "en" : "sv"));
            }

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
        if (request == 43) { updater.permissionReturned(); return; }
        if (request != 42 || photoPicker == null) return;
        ValueCallback<Uri[]> callback = photoPicker;
        photoPicker = null;
        if (cameraOutput != null) {
            File photo = new File(new File(getCacheDir(), "shared"), cameraOutput.getLastPathSegment());
            boolean success = result == RESULT_OK && photo.isFile() && photo.length() > 0;
            callback.onReceiveValue(success ? new Uri[]{cameraOutput} : null);
            clearCameraOutput(!success);
        } else {
            callback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
        }
    }

    private void clearCameraOutput(boolean delete) {
        if (cameraOutput == null) return;
        revokeUriPermission(cameraOutput, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        if (delete) new File(new File(getCacheDir(), "shared"), cameraOutput.getLastPathSegment()).delete();
        cameraOutput = null;
    }

    @Override
    protected void onDestroy() {
        updater.close();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        game.evaluateJavascript("typeof window.gameBack === 'function' && window.gameBack()", result -> {
            if ("false".equals(result)) finish();
        });
    }
}
