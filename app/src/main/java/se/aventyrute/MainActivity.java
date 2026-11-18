package se.aventyrute;

import android.app.Activity;
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

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        game = new WebView(this);
        game.setBackgroundColor(0xfffaf0d9);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowContentAccess(false);
        game.getSettings().setAllowFileAccess(false);
        game.setWebChromeClient(new WebChromeClient());
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
    public void onBackPressed() {
        game.evaluateJavascript("typeof window.gameBack === 'function' && window.gameBack()", result -> {
            if ("false".equals(result)) finish();
        });
    }
}
