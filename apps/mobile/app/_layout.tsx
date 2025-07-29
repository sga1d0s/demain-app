// app/_layout.tsx
import { Slot, usePathname, Redirect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Si está en /login y ya está autenticado, redirige al inicio
  if (pathname === "/login" && isAuthenticated) {
    return <Redirect href="/" />;
  }

  // Si no está autenticado y trata de acceder a cualquier ruta privada, redirige a login
  if (!isAuthenticated && pathname !== "/login") {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}