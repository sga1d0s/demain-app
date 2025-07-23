// App.tsx (o App.js si no usas TS)
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function App() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    // • En Expo Go en dispositivo real, usa la IP de tu máquina en la red local:
    //   ej. "http://192.168.1.50:3000"
    // • En Android emulador con Expo CLI, también puedes usar 10.0.2.2
    // • En iOS simulador: localhost
    const BASE_URL = "http://192.168.1.50:3000";

    fetch(`${BASE_URL}/health`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        json.db === "reachable" ? setStatus("ok") : setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {status === "loading" && <ActivityIndicator size="large" />}
      {status === "ok"     && <Text style={[styles.text, styles.ok]}>✅ DB reachable</Text>}
      {status === "error"  && <Text style={[styles.text, styles.error]}>❌ No hay acceso a la DB</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text:      { fontSize: 18, marginTop: 16 },
  ok:        { color: "green" },
  error:     { color: "red" }
});