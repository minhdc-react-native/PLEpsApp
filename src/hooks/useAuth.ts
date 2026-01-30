import { useLoading } from "@/components/dialog/loadingProvider";
import { useToast } from "@/components/dialog/useToast";
import { api } from "@/utils/epsApi";
import { epsStorage } from "@/utils/epsStorage";
import { router } from "expo-router";
import { useState } from "react";
import { useData } from "./zustand/useData";
import { useTab } from "./zustand/useTab";
const { getToken, setToken, setLogin, removeLogin } = epsStorage();

export const useAuth = () => {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const { show, hide } = useLoading();
  const { showToast } = useToast();
  // các biến toàn ứng dụng
  const setUser = useData((state) => state.setUser);
  const setIndex = useTab((state) => state.setIndex);
  const getDataBegin = async () => {
    await api.get({
      link: `/employees/current-user/`,
      callBack: (res) => {
        if (res) setUser(res.returnData);
      },
      callError: (err) => {
        console.log("err get current user>>", err);
        throw new Error(err?.message || "Lấy thông tin người dùng thất bại");
      },
    });
  };
  const logout = async () => {
    await api.post({
      link: `/auth/logout`,
      callBack: async () => {
        router.replace("/(auth)/login");
        setUser(null);
        setIndex(0);
      },
      setLoading: (loading) => (loading ? show("Đăng xuất...") : hide()),
    });
  };
  const login = async (login: ILogin) => {
    await api.post({
      link: `/auth/login`,
      data: login,
      callBack: async (res) => {
        if (res && res.message) {
          showToast(res.message || "Lỗi đăng nhập", { type: "error" });
        } else {
          await setToken(res);

          router.replace("/(tabs)");

          setTimeout(async () => {
            try {
              await getDataBegin();

              if (login.remember) {
                await setLogin(login);
              } else {
                await removeLogin();
              }
            } catch (e) {
              console.log("Post-login init error", e);
            }
          }, 200); // delay 200ms cho token duoc set vao storeage so ipad cham.
        }
      },
      setLoading: (loading) => (loading ? show("Truy cập...") : hide()),
      callError: (err) => {
        console.log("err login>>", err);
        showToast(err.message || "Lỗi đăng nhập", { type: "error" });
        throw new Error(err);
      },
    });
  };
  const checkLogin = async () => {
    const token = await getToken();
    if (token) {
      await getDataBegin();
      setIsLogin(true);
      router.replace("/(tabs)");
    } else {
      setIsLogin(false);
    }
  };

  return {
    isLogin,
    checkLogin,
    login,
    logout,
  };
};
