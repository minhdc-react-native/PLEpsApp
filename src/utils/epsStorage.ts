import AsyncStorage from "@react-native-async-storage/async-storage"; // lưu trữ cấu hình, lưu được nhiều
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const keyStorage = {
  login: "login",
  token: "token",
};

export const epsStorage = () => {
  const setToken = async (token: IToken) => {
    try {
      await AsyncStorage.setItem(keyStorage.token, JSON.stringify(token));
    } catch (error) {
      console.log("Error setToken>>", error);
    }
  };
  const getToken = async (): Promise<IToken | null> => {
    try {
      const token = await AsyncStorage.getItem(keyStorage.token);
      return token ? JSON.parse(token) : null;
    } catch (error) {
      return null;
    }
  };
  const setLogin = async (login: ILogin) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(keyStorage.login, JSON.stringify(login)),
      ]);
    } catch (error) {
      console.log("Error setLogin>>", error);
    }
  };
  const getLogin = async (): Promise<ILogin | null> => {
    try {
      const login = await AsyncStorage.getItem(keyStorage.login);
      return login ? JSON.parse(login) : null;
    } catch (error) {
      return null;
    }
  };
  const removeLogin = async () => {
    try {
      await AsyncStorage.removeItem(keyStorage.login);
    } catch (error) {}
  };
  const clearTokens = async () => {
    try {
      await AsyncStorage.removeItem(keyStorage.token);
    } catch (error) {
      console.log("error clean token>>");
    }
  };

  return {
    setToken,
    getToken,
    setLogin,
    getLogin,
    removeLogin,
    clearTokens,
  };
};
