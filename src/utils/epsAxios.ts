import axios, { AxiosInstance } from "axios";
import { router } from "expo-router";
import qs from "qs";
import { Alert } from "react-native";
import { BASE_URL, epsStorage } from "./epsStorage";

const { setToken, getToken, clearTokens } = epsStorage();

const epsAxios = axios.create();

let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Hàm xử lý lỗi
const handleError = async (err: any) => {
  const originalRequest = err.config;
  if (err.response?.status === 401 && !originalRequest._retry) {
    console.log("lỗi ");
    originalRequest._retry = true;

    // Kiểm tra xem có token không, nếu chưa đăng nhập thì không xử lý refresh
    const token = await getToken();
    if (!token) {
      // Chưa đăng nhập, return lỗi bình thường không hiện popup
      let _error = getErrorMessage(err);
      if (_error) _error = { error: _error };
      return _error || Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return epsAxios(originalRequest);
      });
    }

    isRefreshing = true;
    try {
      if (!token) throw new Error("No refresh token");

      const data = qs.stringify({
        // grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
        // client_id: 'VacomMartApi_App'
      });
      const baseURL = BASE_URL;
      const response = await axios.post(`${baseURL}/auth/refresh-token`, data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, refresh_token } = response.data;
      await setToken(response.data);

      epsAxios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      processQueue(null, access_token);

      originalRequest.headers.Authorization = `Bearer ${access_token}`;

      return epsAxios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();
      // Thông báo và điều hướng về login dùng expo-router
      Alert.alert(
        "Phiên đăng nhập hết hạn",
        "Vui lòng đăng nhập lại để tiếp tục.",
        [
          {
            text: "Đăng nhập",
            onPress: () => {
              router.replace("/(auth)/login"); // Điều hướng về login
            },
          },
        ],
        { cancelable: false },
      );
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  let _errorMsg = getErrorMessage(err);

  // Ném lỗi ra để try-catch bên ngoài bắt được
  return Promise.reject({
    message: _errorMsg.message || _errorMsg,
    originalError: err,
    isHandled: true, // Đánh dấu để biết lỗi này đã được xử lý qua interceptor
  });
};

// Add a request interceptor
epsAxios.interceptors.request.use(
  async (config: any) => {
    const baseURL = BASE_URL;
    if (baseURL) config.baseURL = baseURL;
    const token = await getToken();
    if (token) config.headers["Authorization"] = `Bearer ${token.access_token}`;
    config.headers["Accept-language"] =
      "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5";
    // config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add a response interceptor
epsAxios.interceptors.response.use(
  (res) => {
    // Kiểm tra nếu trạng thái trả về là 401 (không có quyền truy cập)
    if (res.status === 401) {
      console.log("lỗi 401", "...");
      return handleError({
        config: res.config,
        response: { status: res.status },
      }); // Gọi hàm handleError để xử lý
    }

    // Nếu responseType là arraybuffer hoặc blob thì trả về res
    const responseType = res.config?.responseType;
    if (
      responseType === "arraybuffer" ||
      responseType === "blob" ||
      responseType === "text"
    ) {
      return res; // Giữ nguyên toàn bộ response để xử lý file
    }

    // Convert date time data
    try {
      const respType = res.config?.responseType;
      const isBlob = respType === "blob" || res.data instanceof Blob;
      if (!isBlob && res && res.data) {
        res.data = convertISOStringsToDates(res.data);
      }
    } catch (err) {
      // ignore
    }

    // Nếu data rỗng, trả về null hoặc giá trị mặc định
    if (!res.data) {
      return null;
    }
    return res.data || res; // Trả về dữ liệu nếu không phải lỗi 401
  },
  async (err) => {
    // Convert date time data in error response
    try {
      if (err?.response?.data) {
        err.response.data = convertISOStringsToDates(err.response.data);
      }
    } catch (e) {
      // ignore
    }
    console.log("err axios>>", err);
    return handleError(err); // Gọi hàm handleError để xử lý
  },
);

let interceptorId: number | null = null;

export function setupInterceptors(epsAxios: AxiosInstance) {
  // Eject old interceptor
  if (interceptorId !== null) {
    epsAxios.interceptors.request.eject(interceptorId);
  }

  // Setup new one
  interceptorId = epsAxios.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  });
}

export default epsAxios;

const ERROR_MESSAGES = {
  UNKNOWN: "Đã xảy ra lỗi không xác định",
  NETWORK: "Lỗi kết nối mạng",
  SERVER: "Lỗi máy chủ",
  TIMEOUT: "Yêu cầu hết thời gian",
} as const;

export const getErrorMessage = (error: any) => {
  if (!error) {
    return { message: ERROR_MESSAGES.UNKNOWN };
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.data) {
    return error.response.data;
  }

  if (error.message) {
    return { message: error.message };
  }

  return { message: ERROR_MESSAGES.UNKNOWN };
};

export const isNotEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === "object" && Object.keys(value).length === 0)
    return false;
  return true;
};

const ZERO_DATE_RE = /^0001-01-01T00:00:00(?:\.0+)?(?:Z|[+-]\d{2}:\d{2})?$/;
const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
const TIMEZONE_LESS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

export function convertISOStringsToDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Treat server's SQL/DB 'zero' date (year 0001) as null. Server returns
    // strings like "0001-01-01T00:00:00" for null dates — convert them to null
    // so the frontend receives null instead of an invalid/meaningless Date.
    if (ZERO_DATE_RE.test(obj)) return null;

    if (ISO_DATE_RE.test(obj)) {
      // If the server sent a timezone-less datetime like "2025-01-01T17:00:00"
      // many environments will parse that as local time which can shift the
      // intended date. Treat timezone-less datetimes as UTC by appending 'Z'
      // so they are parsed consistently as UTC instants.
      const toParse = TIMEZONE_LESS_RE.test(obj) ? `${obj}Z` : obj;
      const d = new Date(toParse);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertISOStringsToDates);
  }

  if (typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertISOStringsToDates(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}
