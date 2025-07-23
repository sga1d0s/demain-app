import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function App() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    "loading"
  );
  const [dbName, setDbName] = useState<string | null>(null);

  useEffect(() => {
    const BASE_URL = "http://192.168.1.96:3000";

    fetch(`${BASE_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: { status: string; db: string; dbName?: string }) => {
        setDbName(json.dbName ?? null);
        setStatus(json.db === "reachable" ? "ok" : "error");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {status === "loading" && <ActivityIndicator size="large" />}

      {status === "ok" && (
        <>
          <Text style={[styles.text, styles.ok]}>✅ DB reachable</Text>
          {dbName && (
            <Text style={[styles.text, styles.ok]}>
              📛 Database: {dbName}
            </Text>
          )}
        </>
      )}

      {status === "error" && (
        <Text style={[styles.text, styles.error]}>
          ❌ No hay acceso a la DB
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, marginTop: 16 },
  ok: { color: "green" },
  error: { color: "red" },
});