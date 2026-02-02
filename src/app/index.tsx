import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import PieLoader from "../components/dialog/pieLoader";

export default function AppScreen() {
  const { isLogin, checkLogin } = useAuth();
  useEffect(() => {
    checkLogin();
  }, []);
  if (isLogin === null) {
    return (
      <View style={styles.overlay}>
        <PieLoader />
      </View>
    );
  }
  return isLogin
    ? <Redirect href="/(tabs)" />
    : <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
