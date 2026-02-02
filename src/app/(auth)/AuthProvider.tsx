import { useLoading } from "@/components/dialog/loadingProvider";
import { useToast } from "@/components/dialog/useToast";
import { useData } from "@/hooks/zustand/useData";
import { useTab } from "@/hooks/zustand/useTab";
import { api } from "@/utils/epsApi";
import { epsStorage } from "@/utils/epsStorage";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
const { getToken, setToken, setLogin, removeLogin } = epsStorage();
type AuthContextType = {
    isLogin: boolean | null; // null = đang check
    login: (data: ILogin) => Promise<void>;
    logout: () => Promise<void>;
    checkLogin: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
                setIsLogin(false);
                setUser(null);
                setIndex(0);
                router.replace("/(auth)/login");
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
                        await getDataBegin();

                        login.remember ? await setLogin(login) : await removeLogin();

                        setIsLogin(true);
                        hide();
                        router.replace("/(tabs)");
                        resolve();
                    } catch (e) {
                        hide();
                        setIsLogin(false);
                        showToast("Đăng nhập thất bại", { type: "error" });
                        router.replace("/(auth)/login");
                        reject(e);
                    }
                },
                callError: (err) => {
                    hide();
                    setIsLogin(false);
                    showToast(err.message || "Lỗi đăng nhập", { type: "error" });
                    router.replace("/(auth)/login");
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
                router.replace("/(auth)/login");
                return;
            }
            await getDataBegin();
            setIsLogin(true);
            router.replace("/(tabs)");
        } catch {
            setIsLogin(false);
            router.replace("/(auth)/login");
        }
    };

    useEffect(() => {
        checkLogin();
    }, []);

    return (
        <AuthContext.Provider
            value={{ isLogin, login, logout, checkLogin }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
};
