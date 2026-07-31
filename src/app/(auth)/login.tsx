import { useToast } from "@/components/dialog/useToast";
import FormWrapper from "@/components/formWrapper";
import VcCheckBox from "@/components/vcCheckbox";
import { zRequiredString } from "@/utils/checkZod";
import { epsStorage } from "@/utils/epsStorage";
import * as React from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import * as z from "zod";
import { useAuth } from "./AuthProvider";
const sizeLogo = { width: 874, height: 537 };
const { getLogin } = epsStorage();
const zod = z.object({
  userName: zRequiredString("Nhập tên"),
  password: zRequiredString("Nhập mật khẩu"),
});

export default function Login() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [secureText, setSecureText] = React.useState(true);
  const [loginInfo, setLoginInfo] = React.useState<ILogin>({
    userName: "",
    password: "",
    remember: false,
  });
  const { showToast } = useToast();

  const { login } = useAuth();
  const onLogin = async () => {
    try {
      zod.parse(loginInfo);
      await login(loginInfo);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.issues.map((issue: any) => issue.message);
        const errorMessage = messages.join("\n");
        showToast(errorMessage, { type: "error" });
      } else if (err instanceof Error) {
        showToast(err.message, { type: "error" });
      } else {
        // showToast("Đã có lỗi xảy ra", { type: "error" });
        console.log("Đã có lỗi xảy ra", err);
      }
    }
  };
  React.useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const savedLogin = await getLogin();
        if (mounted && savedLogin) {
          setLoginInfo(savedLogin);
        }
      } catch (e) {
        console.log("Init login error", e);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FormWrapper
      style={styles.page}
      backgroundColor={colors.background}
    >
      {/* Logo + tiêu đề */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={[
            {
              width: width - 80,
              height: ((width - 80) * sizeLogo.height) / sizeLogo.width,
              resizeMode: "contain",
              marginVertical: 20,
            },
          ]}
        />
      </View>

      {/* Form đăng nhập */}
      <View style={styles.form}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Đăng nhập</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Đăng nhập để tiếp tục sử dụng EPS TRAINING</Text>

        {/* EPS SSO */}
        {/* <Button mode="outlined" style={styles.ssoButton}>
          EPS SSO
        </Button>

        <Text style={styles.or}>HOẶC</Text> */}

        <TextInput
          label="Tên Đăng Nhập"
          value={loginInfo.userName}
          onChangeText={(value) =>
            setLoginInfo((prev) => ({ ...prev, userName: value }))
          }
          mode="outlined"
          left={
            <TextInput.Icon icon={"account"} color={colors.onErrorContainer} />
          }
          style={[styles.input, { backgroundColor: colors.surface }]}
        />

        <TextInput
          label="Mật Khẩu"
          value={loginInfo.password}
          onChangeText={(value) =>
            setLoginInfo((prev) => ({ ...prev, password: value }))
          }
          secureTextEntry={secureText}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }]}
          left={
            <TextInput.Icon
              icon={"key-chain-variant"}
              color={colors.onErrorContainer}
            />
          }
          right={
            <TextInput.Icon
              icon={secureText ? "eye" : "eye-off"}
              onPress={() => setSecureText(!secureText)}
            />
          }
        />

        {/* Ghi nhớ + Quên mật khẩu */}
        <View style={styles.row}>
          <VcCheckBox
            label="Ghi nhớ tôi"
            value={loginInfo.remember}
            onChange={(value) =>
              setLoginInfo((prev) => ({
                ...prev,
                remember: typeof value === "boolean" ? value : value === "C",
              }))
            }
            type="switch"
          />
          {/* <Button onPress={() => { }}>Quên Mật Khẩu?</Button> */}
          <View />
        </View>

        {/* Nút đăng nhập */}
        <Button
          mode="contained"
          onPress={onLogin}
          style={styles.loginButton}
          contentStyle={styles.loginButtonContent}
        >
          Đăng nhập
        </Button>
      </View>
    </FormWrapper>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  company: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 14,
    textAlign: "center",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginVertical: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  ssoButton: {
    marginBottom: 12,
  },
  or: {
    textAlign: "center",
    marginVertical: 8,
    color: "#666",
  },
  input: {
    marginBottom: 12,
    borderRadius: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  loginButton: { borderRadius: 14, marginTop: 4 },
  loginButtonContent: { height: 50 },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 14,
  },
  forgot: {
    fontSize: 14,
  },
});
