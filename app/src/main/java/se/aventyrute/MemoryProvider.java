package se.aventyrute;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

public class MemoryProvider extends ContentProvider {
    @Override public boolean onCreate() { return true; }

    private File photo(Uri uri) throws FileNotFoundException {
        String name = uri.getLastPathSegment();
        if (name == null || (!"update.apk".equals(name) && !name.matches("memory-[a-zA-Z0-9-]+\\.jpg"))) {
            throw new FileNotFoundException();
        }
        File file = new File(new File(getContext().getCacheDir(), "shared"), name);
        if (!file.isFile()) throw new FileNotFoundException();
        return file;
    }

    @Override public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        File file = photo(uri);
        if ("r".equals(mode)) return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY);
        if (!file.getName().startsWith("memory-camera-") || !("w".equals(mode)
                || "wt".equals(mode) || "rw".equals(mode) || "rwt".equals(mode))) {
            throw new FileNotFoundException();
        }
        return ParcelFileDescriptor.open(file, ParcelFileDescriptor.parseMode(mode));
    }

    @Override public String getType(Uri uri) { return "update.apk".equals(uri.getLastPathSegment()) ? "application/vnd.android.package-archive" : "image/jpeg"; }

    @Override public Cursor query(Uri uri, String[] projection, String selection,
            String[] args, String sort) {
        try {
            File file = photo(uri);
            String[] columns = projection == null
                ? new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE} : projection;
            MatrixCursor cursor = new MatrixCursor(columns);
            Object[] values = new Object[columns.length];
            for (int i = 0; i < columns.length; i++) {
                if (OpenableColumns.DISPLAY_NAME.equals(columns[i])) values[i] = file.getName();
                if (OpenableColumns.SIZE.equals(columns[i])) values[i] = file.length();
            }
            cursor.addRow(values);
            return cursor;
        } catch (FileNotFoundException error) { return null; }
    }
    @Override public Uri insert(Uri uri, ContentValues values) { throw new UnsupportedOperationException(); }
    @Override public int delete(Uri uri, String selection, String[] args) { throw new UnsupportedOperationException(); }
    @Override public int update(Uri uri, ContentValues values, String selection, String[] args) { throw new UnsupportedOperationException(); }
}
