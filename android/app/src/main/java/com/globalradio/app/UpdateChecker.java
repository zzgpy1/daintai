package com.globalradio.app;

import android.content.Context;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class UpdateChecker {
    private static final String TAG = "UpdateChecker";
    private static final String GITHUB_API = "https://api.github.com/repos/moli-xia/global-radio/releases/latest";

    public interface UpdateListener {
        void onUpdateAvailable(String version, String downloadUrl);
        void onNoUpdate();
        void onError(String error);
    }

    public static void checkForUpdates(Context context, UpdateListener listener) {
        new AsyncTask<Void, Void, String>() {
            @Override
            protected String doInBackground(Void... voids) {
                try {
                    URL url = new URL(GITHUB_API);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.setRequestProperty("User-Agent", "GlobalRadioApp");

                    BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream())
                    );
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    return response.toString();
                } catch (Exception e) {
                    Log.e(TAG, "检查更新失败", e);
                    return null;
                }
            }

            @Override
            protected void onPostExecute(String result) {
                if (result == null) {
                    listener.onError("无法获取更新信息");
                    return;
                }

                try {
                    JSONObject json = new JSONObject(result);
                    String latestVersion = json.getString("tag_name").replace("v", "");
                    String downloadUrl = json.getString("html_url");

                    String currentVersion = context.getPackageManager()
                        .getPackageInfo(context.getPackageName(), 0)
                        .versionName;

                    // 比较版本号
                    if (compareVersions(latestVersion, currentVersion) > 0) {
                        listener.onUpdateAvailable(latestVersion, downloadUrl);
                    } else {
                        listener.onNoUpdate();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "解析更新信息失败", e);
                    listener.onError("解析更新信息失败");
                }
            }
        }.execute();
    }

    private static int compareVersions(String v1, String v2) {
        String[] parts1 = v1.split("[-.]");
        String[] parts2 = v2.split("[-.]");
        int len = Math.max(parts1.length, parts2.length);
        for (int i = 0; i < len; i++) {
            int n1 = i < parts1.length ? Integer.parseInt(parts1[i].replaceAll("\\D+", "0")) : 0;
            int n2 = i < parts2.length ? Integer.parseInt(parts2[i].replaceAll("\\D+", "0")) : 0;
            if (n1 != n2) return n1 - n2;
        }
        return 0;
    }
}
