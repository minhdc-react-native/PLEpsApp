// axiosApiHelper.ts
import { mapFile } from "@/mappers/file.mapper";
import { IFile } from "@/types/file.model";
import { AxiosRequestConfig } from "axios";
import {
  createDownloadResumable,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  moveAsync,
} from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import epsAxios from "./epsAxios";
import { BASE_URL, epsStorage } from "./epsStorage";
import {
  openFileAfterDownload,
  saveToDownloadsAndroid,
  saveToDownloadsIOS,
} from "./file";

interface IApiParams {
  link: string;
  data?: any;
  config?: AxiosRequestConfig<any>;
  setLoading?: (loading: boolean) => void;
  callBack?: (res: any) => void;
  callError?: (error: any) => void;
}

export const api = {
  get: async ({
    link,
    config,
    setLoading,
    callBack,
    callError,
  }: IApiParams): Promise<any> => {
    try {
      setLoading?.(true);
      const res: any = await epsAxios.get(link, config);
      if (res?.data?.error) {
        callError?.(res.data);
        return Promise.reject(res.data);
      }
      callBack?.(res.data || res);
      return res.data || res;
    } catch (error: any) {
      callError?.(error);
      __DEV__ && console.log("GET error:", error?.response?.data || error);
      return Promise.reject(error);
    } finally {
      setLoading?.(false);
    }
  },

  post: async ({
    link,
    data,
    config,
    setLoading,
    callBack,
    callError,
  }: IApiParams): Promise<any> => {
    try {
      setLoading?.(true);
      const res = await epsAxios.post(link, data, config);
      if (res?.data?.error) {
        callError?.(res.data);
        return Promise.reject(res.data);
      }
      callBack?.(res);
      return res;
    } catch (error: any) {
      callError?.(error);
      console.log("link>>", link, data);
      __DEV__ && console.log(`POST error:`, error?.response?.data || error);
      return Promise.reject(error);
    } finally {
      setLoading?.(false);
    }
  },

  put: async ({
    link,
    data,
    config,
    setLoading,
    callBack,
    callError,
  }: IApiParams): Promise<any> => {
    try {
      setLoading?.(true);
      const res = await epsAxios.put(link, data, config);
      if (res?.data?.error) {
        callError?.(res.data);
        return Promise.reject(res.data);
      }
      callBack?.(res);
      return res;
    } catch (error: any) {
      callError?.(error);
      __DEV__ && console.log("PUT error:", error?.response?.data || error);
      return Promise.reject(error);
    } finally {
      setLoading?.(false);
    }
  },

  delete: async ({
    link,
    config,
    setLoading,
    callBack,
    callError,
  }: IApiParams): Promise<any> => {
    try {
      setLoading?.(true);
      const res = await epsAxios.delete(link, config);
      if (res?.data?.error) {
        callError?.(res.data);
        return Promise.reject(res.data);
      }
      callBack?.(res);
      return res;
    } catch (error: any) {
      callError?.(error);
      __DEV__ && console.log("DELETE error:", error?.response?.data || error);
      return Promise.reject(error);
    } finally {
      setLoading?.(false);
    }
  },

  getFile: async ({
    fileId,
    setLoading,
    callError,
  }: Pick<IApiParams, "setLoading" | "callError"> & {
    fileId: string;
  }): Promise<any> => {
    try {
      setLoading?.(true);
      const res: any = await epsAxios.get(`/files/info/${fileId}`);
      if (res?.data?.error) {
        callError?.(res.data);
        return Promise.reject(res.data);
      }
      return mapFile(res.returnData);
    } catch (error: any) {
      callError?.(error);
      __DEV__ && console.log("GET error:", error?.response?.data || error);
      return Promise.reject(error);
    } finally {
      setLoading?.(false);
    }
  },

  downloadFile: async ({
    fileId,
    setLoading,
    callBack,
    callError,
    // new optional flag: save directly to Android Downloads folder
    saveToDownloads,
    // optional file object to provide name/type
    file,
    // if true, attempt to open the file after download
    openAfterDownload,
  }: Pick<IApiParams, "setLoading" | "callBack" | "callError"> & {
    fileId: string;
    saveToDownloads?: boolean;
    file?: Partial<IFile>;
    openAfterDownload?: boolean;
  }): Promise<any> => {
    try {
      setLoading?.(true);

      // Get full download URL from epsAxios baseURL or fallback to BASE_URL
      const downloadUrl = `/files/download/${fileId}`;
      const base = epsAxios.defaults.baseURL || BASE_URL || "";
      const fullUrl = base ? `${base.replace(/\/$/, "")}${downloadUrl}` : "";

      // Validate fullUrl
      if (!fullUrl || !/^https?:\/\//i.test(fullUrl)) {
        const msg = {
          message:
            "Invalid download URL. Check BASE_URL / epsAxios baseURL configuration.",
          fullUrl,
        };
        callError?.(msg);
        return Promise.reject(msg);
      }

      // Temporary destination in app document directory (add .tmp to be safe)
      const tempName = `file_${fileId}_${Date.now()}.tmp`;
      const dest = `${documentDirectory}${tempName}`;

      // Get auth token from storage (more reliable than epsAxios.defaults)
      const headers: Record<string, string> = {};
      try {
        const { getToken } = epsStorage();
        const tokenObj = await getToken();
        if (tokenObj?.access_token) {
          headers["Authorization"] = `Bearer ${tokenObj.access_token}`;
        }
      } catch (err) {}

      // Download file using expo-file-system createDownloadResumable (more robust on Android)
      const downloadResumable = createDownloadResumable(fullUrl, dest, {
        headers,
      });
      const result: any = await downloadResumable.downloadAsync();

      // Validate response status and content type
      if (result.status !== 200) {
        const msg = {
          message: `Download failed with status ${result.status}`,
          status: result.status,
        };
        callError?.(msg);
        return Promise.reject(msg);
      }

      // Check if response is HTML/JSON error (not actual file)
      const contentType =
        result.headers?.["content-type"] ||
        result.headers?.["Content-Type"] ||
        "";
      if (
        contentType.includes("text/html") ||
        contentType.includes("application/json")
      ) {
        const msg = {
          message:
            "Server returned an error page instead of file. Please check API authorization.",
          contentType,
        };
        callError?.(msg);
        return Promise.reject(msg);
      }

      // Try to extract filename from response headers (Content-Disposition)
      let filename = tempName;
      // If caller provided a file object with a name, use it
      if (
        file &&
        file.name &&
        typeof file.name === "string" &&
        file.name.trim() !== ""
      ) {
        filename = file.name.trim();
      }
      try {
        const cd =
          (result as any).headers?.["content-disposition"] ||
          (result as any).headers?.["Content-Disposition"];
        // only override header filename when caller didn't pass file
        if (cd && (!file || !file.name || file.name.trim() === "")) {
          const match = cd.match(/filename\*?=(?:UTF-8''|\")?([^;\"]+)/i);
          if (match && match[1]) {
            // decode if encoded
            filename = decodeURIComponent(match[1].replace(/\"/g, "")).trim();
          }
        }
      } catch {
        // ignore parsing errors
      }

      // Build final file path with filename (preserve extension if present)
      const finalPath = `${documentDirectory}${filename}`;
      // Move downloaded file to final path (overwrite if exists)
      try {
        // Delete if exists
        const info = await getInfoAsync(finalPath);
        if (info.exists) {
          await deleteAsync(finalPath, {
            idempotent: true,
          });
        }
        await moveAsync({
          from: result.uri,
          to: finalPath,
        });
      } catch {
        // If moving fails, keep the original downloaded path
      }

      const actualPath = (await getInfoAsync(finalPath)).exists
        ? finalPath
        : result.uri;
      const fileInfo = await getInfoAsync(actualPath);

      const response = {
        uri: actualPath,
        status: result.status,
        filename,
        fileInfo,
      } as any;

      // If file size is zero, log and fallback to share so user can inspect
      if (
        !fileInfo.exists ||
        (fileInfo.size !== undefined && fileInfo.size <= 0)
      ) {
        const msg = { message: "Downloaded file is empty", fileInfo, response };
        // Try to let user inspect via share sheet
        try {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(response.uri, {
              dialogTitle: response.filename,
            });
          }
        } catch (shareErr) {}
        callError?.(msg);
        return Promise.reject(msg);
      }

      // If caller requested saving to Downloads, try platform-specific helper
      if (saveToDownloads) {
        if (Platform.OS === "android") {
          try {
            const finalResp = await saveToDownloadsAndroid(response, filename);
            callBack?.(finalResp);
            return finalResp;
          } catch (errSave: any) {
            try {
              if (response.uri && (await Sharing.isAvailableAsync())) {
                await Sharing.shareAsync(response.uri, {
                  dialogTitle: response.filename,
                });
              }
            } catch (shareErr) {}
            callBack?.(response);
            return response;
          }
        } else if (Platform.OS === "ios") {
          try {
            const finalResp = await saveToDownloadsIOS(response, filename);
            callBack?.(finalResp);
            return finalResp;
          } catch (errSave: any) {
            // iOS save failed, just return the response in document directory
            callBack?.(response);
            return response;
          }
        }
      }

      // If requested, try to open the file after download using helper
      if (openAfterDownload) {
        try {
          await openFileAfterDownload(response, filename, file);
        } catch (openErr: any) {
          try {
            if (response.uri && (await Sharing.isAvailableAsync())) {
              await Sharing.shareAsync(response.uri, { dialogTitle: filename });
            }
          } catch (shareErr) {}
        }
      }

      callBack?.(response);
      return response;
    } catch (error: any) {
      callError?.(error);
      return Promise.reject(error);
    } finally {
      setLoading?.(false);
    }
  },
};
