package se.aventyrute;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.provider.Settings;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class AppUpdater {
    private static final String API = "https://api.github.com/repos/tdavor/-ventyr-Ute";
    private static final long LIMIT = 150L * 1024 * 1024;
    private final Activity activity;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private boolean checked;
    private boolean english;
    private File pending;
    private volatile boolean cancelled;

    public AppUpdater(Activity activity) { this.activity = activity; }

    private String text(String sv, String en) { return english ? en : sv; }

    public void check(String language) {
        if (checked) return;
        checked = true;
        english = "en".equals(language);
        worker.execute(() -> {
            try {
                String installed = activity.getPackageManager()
                    .getPackageInfo(activity.getPackageName(), 0).versionName;
                JSONArray tags = new JSONArray(readJson(API + "/tags?per_page=100"));
                String newest = installed;
                String tag = null;
                for (int i = 0; i < tags.length(); i++) {
                    String candidate = tags.getJSONObject(i).getString("name");
                    if (isNewer(candidate, newest.replaceFirst("^v", ""))) {
                        newest = candidate;
                        tag = candidate;
                    }
                }
                if (tag == null) return;
                String name = "AventyrUte-" + tag.replaceFirst("^v", "") + "-debug.apk";
                JSONObject asset = new JSONObject(readJson(API + "/contents/downloads/" + name + "?ref=" + tag));
                String checksum = asset.getString("sha");
                long size = asset.getLong("size");
                if (!checksum.matches("[a-f0-9]{40}") || size <= 0 || size > LIMIT) return;
                String url = "https://raw.githubusercontent.com/tdavor/-ventyr-Ute/" + tag + "/downloads/" + name;
                final String version = tag;
                activity.runOnUiThread(() -> {
                    if (!alive()) return;
                    new AlertDialog.Builder(activity)
                        .setTitle(text("Ny version", "New version"))
                        .setMessage(text("Version ", "Version ") + version + text(" finns. Vill du hämta uppdateringen?", " is available. Download the update?"))
                        .setNegativeButton(text("Senare", "Later"), null)
                        .setPositiveButton(text("Hämta", "Download"), (dialog, which) -> download(url, checksum, size))
                        .show();
                });
            } catch (Exception ignored) {
                // The offline game remains available when a release check fails.
            }
        });
    }

    static boolean isNewer(String candidate, String installed) {
        if (candidate == null || installed == null) return false;
        String clean = candidate.replaceFirst("^v", "");
        if (!clean.matches("[0-9]{1,6}\\.[0-9]{1,6}\\.[0-9]{1,6}")
                || !installed.matches("[0-9]{1,6}\\.[0-9]{1,6}\\.[0-9]{1,6}")) return false;
        String[] next = clean.split("\\.");
        String[] current = installed.split("\\.");
        for (int i = 0; i < 3; i++) {
            int difference = Integer.parseInt(next[i]) - Integer.parseInt(current[i]);
            if (difference != 0) return difference > 0;
        }
        return false;
    }

    private boolean alive() { return !activity.isFinishing() && !activity.isDestroyed(); }

    private HttpURLConnection connection(String address) throws Exception {
        URL url = new URL(address);
        for (int redirect = 0; redirect < 6; redirect++) {
            String host = url.getHost();
            if (!"https".equals(url.getProtocol()) || !(host.equals("api.github.com")
                    || host.equals("github.com") || host.equals("release-assets.githubusercontent.com")
                    || host.equals("objects.githubusercontent.com") || host.equals("raw.githubusercontent.com"))) throw new Exception("Invalid download host");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(20000);
            connection.setRequestProperty("User-Agent", "AventyrUte-Android");
            connection.setInstanceFollowRedirects(false);
            int status = connection.getResponseCode();
            if (status >= 300 && status < 400) {
                String location = connection.getHeaderField("Location");
                connection.disconnect();
                url = new URL(url, location);
            } else if (status == 200) return connection;
            else { connection.disconnect(); throw new Exception("Download failed"); }
        }
        throw new Exception("Too many redirects");
    }

    private String readJson(String address) throws Exception {
        HttpURLConnection connection = connection(address);
        try (InputStream input = connection.getInputStream();
                ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int count;
            while ((count = input.read(buffer)) != -1) {
                if (output.size() + count > 2 * 1024 * 1024) throw new Exception("Release too large");
                output.write(buffer, 0, count);
            }
            return output.toString("UTF-8");
        } finally { connection.disconnect(); }
    }

    private void download(String url, String expectedHash, long expectedSize) {
        cancelled = false;
        ProgressDialog progress = new ProgressDialog(activity);
        progress.setTitle(text("Hämtar uppdateringen", "Downloading update"));
        progress.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
        progress.setMax(100);
        progress.setCancelable(false);
        progress.setButton(ProgressDialog.BUTTON_NEGATIVE, text("Avbryt", "Cancel"),
            (dialog, which) -> cancelled = true);
        progress.show();
        worker.execute(() -> {
            File directory = new File(activity.getCacheDir(), "shared");
            File temporary = new File(directory, "update.part");
            try {
                directory.mkdirs();
                HttpURLConnection connection = connection(url);
                MessageDigest digest = MessageDigest.getInstance("SHA-1");
                digest.update(("blob " + expectedSize + "\0").getBytes("UTF-8"));
                try (InputStream input = connection.getInputStream();
                        FileOutputStream output = new FileOutputStream(temporary)) {
                    long length = expectedSize;
                    if (length > LIMIT) throw new Exception("APK too large");
                    activity.runOnUiThread(() -> progress.setIndeterminate(length <= 0));
                    byte[] buffer = new byte[32768];
                    long total = 0;
                    int previous = -1;
                    int count;
                    while ((count = input.read(buffer)) != -1) {
                        if (cancelled || !alive()) throw new Exception("Cancelled");
                        total += count;
                        if (total > LIMIT) throw new Exception("APK too large");
                        output.write(buffer, 0, count);
                        digest.update(buffer, 0, count);
                        int percent = length > 0 ? (int) Math.min(100, total * 100 / length) : 0;
                        if (percent != previous) {
                            previous = percent;
                            activity.runOnUiThread(() -> progress.setProgress(percent));
                        }
                    }
                } finally { connection.disconnect(); }
                if (temporary.length() != expectedSize) throw new Exception("Incomplete download");
                StringBuilder hash = new StringBuilder();
                for (byte value : digest.digest()) hash.append(String.format("%02x", value & 255));
                if (!expectedHash.equalsIgnoreCase(hash.toString())) throw new Exception("Checksum mismatch");
                verifyPackage(temporary);
                File apk = new File(directory, "update.apk");
                if (!temporary.renameTo(apk)) throw new Exception("Cannot save update");
                activity.runOnUiThread(() -> {
                    if (!alive()) return;
                    progress.dismiss();
                    pending = apk;
                    install();
                });
            } catch (Exception error) {
                temporary.delete();
                activity.runOnUiThread(() -> {
                    if (!alive()) return;
                    progress.dismiss();
                    if (!cancelled) new AlertDialog.Builder(activity)
                        .setMessage(text("Uppdateringen kunde inte hämtas eller verifieras. Försök nästa gång du startar appen.",
                            "The update could not be downloaded or verified. Try again next time you open the app."))
                        .setPositiveButton("OK", null).show();
                });
            }
        });
    }

    @SuppressWarnings("deprecation")
    private void verifyPackage(File file) throws Exception {
        PackageManager manager = activity.getPackageManager();
        PackageInfo installed = manager.getPackageInfo(activity.getPackageName(), PackageManager.GET_SIGNATURES);
        PackageInfo update = manager.getPackageArchiveInfo(file.getAbsolutePath(), PackageManager.GET_SIGNATURES);
        if (update == null || !installed.packageName.equals(update.packageName)
                || update.versionCode <= installed.versionCode
                || !sameSignatures(installed.signatures, update.signatures)) {
            throw new Exception("Invalid update package");
        }
    }

    private boolean sameSignatures(Signature[] installed, Signature[] update) {
        return installed != null && installed.length > 0 && Arrays.equals(installed, update);
    }

    public void install() {
        if (pending == null || !pending.isFile() || !alive()) return;
        try {
            if (!activity.getPackageManager().canRequestPackageInstalls()) {
                new AlertDialog.Builder(activity)
                    .setMessage(text("Android behöver ditt tillstånd att installera uppdateringen. Tillåt den här appen på nästa skärm.",
                        "Android needs your permission to install the update. Allow this app on the next screen."))
                    .setNegativeButton(text("Senare", "Later"), (dialog, which) -> pending = null)
                    .setPositiveButton(text("Öppna inställningar", "Open settings"), (dialog, which) ->
                        activity.startActivityForResult(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                            Uri.parse("package:" + activity.getPackageName())), 43)).show();
                return;
            }
            Uri uri = Uri.parse("content://se.aventyrute.memories/update.apk");
            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(uri, "application/vnd.android.package-archive");
            install.setClipData(ClipData.newRawUri("Update", uri));
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            activity.startActivity(install);
            pending = null;
        } catch (Exception error) {
            pending = null;
            new AlertDialog.Builder(activity).setMessage(text(
                "Android kunde inte öppna installationen.", "Android could not open the installer."))
                .setPositiveButton("OK", null).show();
        }
    }

    public void permissionReturned() {
        if (activity.getPackageManager().canRequestPackageInstalls()) install();
        else pending = null;
    }

    public void close() {
        cancelled = true;
        worker.shutdownNow();
    }
}
