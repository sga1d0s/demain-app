// app/(tabs)/index.tsx
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function HomeScreen() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {

    /////////// PRODUCTION ///////////
    // const BASE_URL = "https://sgaldos.myqnapcloud.com:3443";

    /////////// DEVELOP ///////////
    const BASE_URL = "http://localhost:3000"

    fetch(`${BASE_URL}/health`)
      .then((res) => res.json())
      .then((json) => {
        json.db === "reachable" ? setStatus("ok") : setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <View style={styles.container}>
      {status === "loading" && <ActivityIndicator size="large" />}
      {status === "ok" && <Text style={[styles.text, styles.ok]}>✅ DB reachable</Text>}
      {status === "error" && <Text style={[styles.text, styles.error]}>❌ No hay acceso a la DB</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18, marginTop: 16 },
  ok: { color: "green" },
  error: { color: "red" },
});