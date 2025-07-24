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
  const [dbPort, setDbPort] = useState<number | null>(null);

  useEffect(() => {

    const BASE_URL = __DEV__
      ? "http://localhost:3000"            // dev: servidor local/NAS
      : "https://demainapp.dnsalias.com";  // prod: tu API real

    fetch(`${BASE_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(
        (json: {
          status: string;
          db: string;
          dbName?: string;
          dbPort?: number;
        }) => {
          setDbName(json.dbName ?? null);
          setDbPort(json.dbPort ?? null);
          setStatus(json.db === "reachable" ? "ok" : "error");
        }
      )
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
          {dbPort !== null && (
            <Text style={[styles.text, styles.ok]}>
              🔌 Port: {dbPort}
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