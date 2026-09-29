import { useLoading } from "@/components/dialog/loadingProvider";
import { useToast } from "@/components/dialog/useToast";
import { useData } from "@/hooks/zustand/useData";
import { useTab } from "@/hooks/zustand/useTab";
import { api } from "@/utils/epsApi";
import { BASE_URL, epsStorage } from "@/utils/epsStorage";
import {
  AUTH_REQUEST_TIMEOUT_MS,
  AUTH_SESSION_EXPIRED_EVENT,
  resetAuthSessionExpiryNotification,
} from "@/utils/epsAxios";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";
const { clearTokens, getToken, setToken, setLogin, removeLogin } = epsStorage();

function getSafeBaseUrl() {
    if (!BASE_URL) return "<unset>";
    try {
        const url = new URL(BASE_URL);
        return `${url.protocol}//${url.host}${url.pathname}`;
    } catch {
        return "<invalid>";
    }
}

function authDebug(stage: string, details: Record<string, unknown> = {}) {
    if (__DEV__) console.log("[auth-debug]", stage, { baseUrl: getSafeBaseUrl(), ...details });
}

function authErrorDetails(error: any) {
    const originalError = error?.originalError ?? error;
    return {
        message: originalError?.message ?? error?.message ?? "unknown",
        code: originalError?.code ?? error?.code ?? null,
        status: originalError?.response?.status ?? error?.response?.status ?? null,
        hasResponse: !!(originalError?.response ?? error?.response),
        hasRequest: !!(originalError?.request ?? error?.request),
    };
}
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
        const requestStartedAt = Date.now();
        authDebug("GET /employees/current-user/ started");
        return new Promise<void>((resolve, reject) => {
            api.get({
                link: `/employees/current-user/`,
                config: { timeout: AUTH_REQUEST_TIMEOUT_MS },
                callBack: (res) => {
                    const currentUser = res?.returnData ?? null;
                    authDebug("GET /employees/current-user/ succeeded", {
                        elapsedMs: Date.now() - requestStartedAt,
                        receivedUser: !!currentUser,
                    });
                    setUser(currentUser);
                    resolve();
                },
                callError: (err) => {
                    authDebug("GET /employees/current-user/ failed", {
                        elapsedMs: Date.now() - requestStartedAt,
                        ...authErrorDetails(err),
                    });
                    reject(err);
                },
            });
        });
    };
    const logout = async () => {
        try {
            await api.post({
                link: `/auth/logout`,
                setLoading: (loading) => (loading ? show("Đăng xuất...") : hide()),
            });
        } finally {
            await clearTokens();
            setIsLogin(false);
            setUser(null);
            setIndex(0);
            router.replace("/(auth)/login");
        }
    };
    const login = (login: ILogin) => {
        const requestStartedAt = Date.now();
        let stage = "POST /auth/login";
        authDebug("login flow started");
        return new Promise<void>((resolve, reject) => {
            api.post({
                link: `/auth/login`,
                data: login,
                config: { timeout: AUTH_REQUEST_TIMEOUT_MS },
                callBack: async (res) => {
                    try {
                        authDebug("POST /auth/login succeeded", {
                            elapsedMs: Date.now() - requestStartedAt,
                            returnedAccessToken: !!res?.access_token,
                            returnedMessage: !!res?.message,
                        });
                        if (res?.message) {
                            showToast(res.message, { type: "error" });
                            hide();
                            return reject();
                        }

                        const authResponse = res as IToken;
                        await setToken(
                            authResponse?.access_token
                                ? authResponse
                                : { cookie_session: true },
                        );
                        authDebug("session stored", {
                            sessionType: authResponse?.access_token ? "bearer" : "cookie",
                        });
                        resetAuthSessionExpiryNotification();
                        stage = "GET /employees/current-user/";
                        await getDataBegin();
                        authDebug("login current-user step completed", {
                            elapsedMs: Date.now() - requestStartedAt,
                        });

                        // eslint-disable-next-line no-unused-expressions
                        login.remember ? await setLogin(login) : await removeLogin();

                        setIsLogin(true);
                        hide();
                        router.replace("/(tabs)");
                        authDebug("login flow completed", {
                            elapsedMs: Date.now() - requestStartedAt,
                        });
                        resolve();
                    } catch (e) {
                        authDebug("login flow failed", {
                            stage,
                            elapsedMs: Date.now() - requestStartedAt,
                            ...authErrorDetails(e),
                        });
                        hide();
                        showToast("Đăng nhập thất bại", { type: "error" });
                        reject(e);
                    }
                },
                callError: (err) => {
                    authDebug("POST /auth/login failed", {
                        elapsedMs: Date.now() - requestStartedAt,
                        ...authErrorDetails(err),
                    });
                    hide();
                    showToast(err.message || "Lỗi đăng nhập", { type: "error" });
                    reject(err);
                },
                setLoading: (loading) => {
                    authDebug("login request loading", { visible: loading });
                    loading ? show("Truy cập...") : hide();
                },
            });
        });
    };

    const checkLogin = async () => {
        authDebug("startup session check started");
        try {
            const token = await getToken();
            authDebug("startup session read", {
                hasStoredSession: !!token,
                sessionType: token?.access_token ? "bearer" : token?.cookie_session ? "cookie" : "none",
            });
            if (!token) {
                setIsLogin(false);
                router.replace("/(auth)/login");
                return;
            }
            await getDataBegin();
            setIsLogin(true);
            router.replace("/(tabs)");
            authDebug("startup session check completed");
        } catch (error) {
            authDebug("startup session check failed", authErrorDetails(error));
            setIsLogin(false);
            router.replace("/(auth)/login");
        }
    };

    useEffect(() => {
        checkLogin();
    }, []);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(
            AUTH_SESSION_EXPIRED_EVENT,
            () => {
                setIsLogin(false);
                setUser(null);
                setIndex(0);
            },
        );

        return () => subscription.remove();
    }, [setIndex, setUser]);

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
