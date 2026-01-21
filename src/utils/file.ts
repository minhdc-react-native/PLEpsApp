import Constants from "expo-constants";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { Linking, PermissionsAndroid, Platform } from "react-native";

export interface IResponseInfo {
  uri?: string;
  filename?: string;
  [k: string]: any;
}

export async function saveToDownloadsAndroid(
  response: IResponseInfo,
  filename?: string
): Promise<IResponseInfo> {
  try {
    // Dynamically import react-native-fs (optional native dependency)
    // This throws if module not installed, which the caller can handle.
    // @ts-ignore
    const RNFSModule: any = await import("react-native-fs");
    const RNFS = RNFSModule.default || RNFSModule;

    // Check if RNFS is properly initialized
    if (!RNFS || !RNFS.DownloadDirectoryPath) {
      throw new Error("react-native-fs not properly installed");
    }

    // For older Android versions, request write permission
    const androidVersion =
      typeof Platform.Version === "number"
        ? Platform.Version
        : typeof Platform.Version === "string"
        ? parseInt(Platform.Version as string, 10)
        : undefined;
    if (androidVersion && Number(androidVersion) < 30) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Permission to save files",
          message:
            "The app needs permission to save files to your device Downloads folder.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error("Permission denied");
      }
    }

    const name = filename || response.filename || `file_${Date.now()}`;
    const destPath = `${RNFS.DownloadDirectoryPath}/${name}`;

    const srcPath = response.uri?.startsWith("file://")
      ? response.uri.replace("file://", "")
      : response.uri;

    if (!srcPath) throw new Error("Source file path missing");

    await RNFS.copyFile(srcPath, destPath);

    const finalUri = destPath.startsWith("/") ? `file://${destPath}` : destPath;
    return { ...response, uri: finalUri } as IResponseInfo;
  } catch (error: any) {
    // If react-native-fs fails or not installed, fallback to share dialog
    const uri = response.uri;
    const name = filename || response.filename || "file";

    if (!uri) throw new Error("File URI missing");

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        dialogTitle: name,
      });
    }

    return response;
  }
}

export async function saveToDownloadsIOS(
  response: IResponseInfo,
  filename?: string
): Promise<IResponseInfo> {
  // iOS doesn't have a public Downloads folder like Android
  // The best approach is to use the Share sheet so users can save to Files app, iCloud, etc.
  const uri = response.uri;
  const name = filename || response.filename || "file";

  if (!uri) throw new Error("File URI missing");

  // Check if sharing is available
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device");
  }

  // Open share dialog - user can choose to save to Files, iCloud, AirDrop, etc.
  await Sharing.shareAsync(uri, {
    dialogTitle: name,
    UTI: getMimeType(undefined, name), // Use UTI for better iOS compatibility
  });

  return response;
}

export async function openFileAfterDownload(
  response: IResponseInfo,
  filename?: string,
  file?: Partial<{ type?: string }>
): Promise<void> {
  const uri = response.uri;
  const name = filename || response.filename || "file";
  const mimeType = getMimeType(file, name);

  if (!uri) throw new Error("File URI missing");

  if (Platform.OS === "android") {
    try {
      await IntentLauncher.startActivityAsync({
        action: "android.intent.action.VIEW",
        data: uri,
        type: mimeType || undefined,
      } as any);
      return;
    } catch {
      try {
        await Linking.openURL(uri);
        return;
      } catch {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { dialogTitle: name });
        }
      }
    }
  } else {
    try {
      await Linking.openURL(uri);
      return;
    } catch {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { dialogTitle: name });
      }
    }
  }
}

export async function shareIfExpo(response: IResponseInfo, filename?: string) {
  try {
    if (
      response?.uri &&
      Constants.appOwnership === "expo" &&
      (await Sharing.isAvailableAsync())
    ) {
      await Sharing.shareAsync(response.uri, {
        dialogTitle: filename || response.filename,
      });
    }
  } catch {
    // swallow; caller may log
  }
}

export function getMimeType(
  file?: Partial<{ type?: string }>,
  filename?: string
) {
  // Prefer explicit file.type
  if (file && file.type && typeof file.type === "string") return file.type;

  const ext = (filename || "").split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "xls") return "application/vnd.ms-excel";
  if (ext === "xlsx")
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  return "";
}
