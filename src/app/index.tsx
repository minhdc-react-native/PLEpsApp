import { StyleSheet, View } from "react-native";
import PieLoader from "../components/dialog/pieLoader";
import { useAuth } from "./(auth)/AuthProvider";

export default function AppScreen() {
  console.log("Đường dẫn API hiện tại là:", process.env.EXPO_PUBLIC_BASE_URL);

  const { isLogin } = useAuth();
  if (isLogin === null) {
    return (
      <View style={styles.overlay}>
        <PieLoader />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
