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
    return new Promise<void>((resolve, reject) => {
      api.get({
        link: `/employees/current-user/`,
        callBack: (res) => {
          setUser(res?.returnData ?? null);
          resolve();
        },
        callError: (err) => {
          reject(err);
        },
      });
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
  const login = (login: ILogin) => {
    return new Promise<void>((resolve, reject) => {
      api.post({
        link: `/auth/login`,
        data: login,
        callBack: async (res) => {
          try {
            if (res?.message) {
              setIsLogin(false);
              showToast(res.message, { type: "error" });
              hide();
              return reject();
            }

            await setToken(res);
            await new Promise(r => setTimeout(r, 200));
            try {
              await getDataBegin();
            } catch {
              await getDataBegin();
            }

            login.remember ? await setLogin(login) : await removeLogin();

            setIsLogin(true);
            hide();
            router.replace("/(tabs)");
            resolve();
          } catch (e) {
            hide();
            setIsLogin(false);
            showToast("Đăng nhập thất bại", { type: "error" });
            reject(e);
          }
        },
        callError: (err) => {
          hide();
          setIsLogin(false);
          showToast(err.message || "Lỗi đăng nhập", { type: "error" });
          reject(err);
        },
        setLoading: (loading) => loading ? show("Truy cập...") : hide(),
      });
    });
  };

  const checkLogin = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setIsLogin(false);
        return;
      }
      await getDataBegin();
      setIsLogin(true);
    } catch {
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
