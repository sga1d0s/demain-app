// app/(auth)/login.tsx
import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { login } from "../../firebase/auth"; // usa tu helper

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      // No hace falta redirigir manualmente, _layout lo hace al detectar sesión
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}