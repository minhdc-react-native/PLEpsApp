import { mapFile } from "@/mappers/file.mapper";
import { IFile } from "@/types/file.model";
import { api } from "@/utils/epsApi";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Icon, IconButton, Text, useTheme } from "react-native-paper";
import { useLoading } from "./dialog/loadingProvider";
import { useToast } from "./dialog/useToast";

interface Props {
  file: Partial<IFile>;
}

export function FileBadge({ file }: Props) {
  const { colors } = useTheme();
  const { show, hide } = useLoading();
  const { showToast } = useToast();
  const [data, setData] = useState<IFile | null>(null);

  useEffect(() => {
    const fetchFileDetails = async () => {
      console.log("Fetching file details for ID:", file.id);
      api.get({
        link: `/files/info/${file.id}`,
        callBack: (res) => {
          const mappedData = mapFile(res.returnData);

          setData(mappedData);
        },
      });
    };

    if (file.id && !file.name) fetchFileDetails();
    else setData(file as IFile);
  }, [file]);

  const handleView = async () => {
    try {
      await api.downloadFile({
        fileId: data?.id || "",
        file: data!,
        openAfterDownload: true,
        setLoading: (loading) => (loading ? show() : hide()),
        callError: (error) => {
          showToast("Xem file thất bại", { type: "error" });
        },
      });
    } catch (error) {
      // Error already handled by callError callback
      console.log("File view error:", error);
    }
  };

  const handleSaveToDownloads = async () => {
    try {
      await api.downloadFile({
        fileId: data?.id || "",
        file: data!,
        saveToDownloads: true,
        setLoading: (loading) => (loading ? show() : hide()),
        callBack: () => {
          showToast("Lưu file thành công", { type: "success" });
        },
        callError: (error) => {
          showToast("Tải file thất bại", { type: "error" });
        },
      });
    } catch (error) {
      // Error already handled by callError callback
      console.log("File download error:", error);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: colors.tertiaryContainer,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 8,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}
      >
        <Icon source="file" size={16} color={colors.onTertiaryContainer} />
        <Text style={{ color: colors.onTertiaryContainer, flex: 1 }}>
          {data?.name}
        </Text>
      </View>
      <IconButton icon="eye" size={20} onPress={handleView} />
      <IconButton icon="download" size={20} onPress={handleSaveToDownloads} />
    </View>
  );
}
