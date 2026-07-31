import { mapFile } from "@/mappers/file.mapper";
import { IFile } from "@/types/file.model";
import { api } from "@/utils/epsApi";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, IconButton, Menu, Text, useTheme } from "react-native-paper";
import { useLoading } from "./dialog/loadingProvider";
import { useToast } from "./dialog/useToast";

interface Props {
  file?: Partial<IFile> | null;
  files?: Partial<IFile>[];
}

export function FileBadge({ file, files }: Props) {
  const { colors } = useTheme();
  const { show, hide } = useLoading();
  const { showToast } = useToast();
  const [data, setData] = useState<(Partial<IFile> | null)[]>([]);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const fileItems = useMemo(
    () => (files?.length ? files : file ? [file] : []),
    [file, files]
  );

  useEffect(() => {
    let active = true;
    setData(fileItems.map((item) => (item.name ? item : null)));

    fileItems.forEach((item, index) => {
      if (!item.id || item.name) return;

      api.get({
        link: `/files/info/${item.id}`,
        callBack: (res) => {
          if (!active) return;
          const mappedData = mapFile(res.returnData);
          setData((current) => {
            const next = [...current];
            next[index] = mappedData;
            return next;
          });
        },
      });
    });

    return () => {
      active = false;
    };
  }, [fileItems]);

  const getResolvedFile = (index: number) => data[index] ?? fileItems[index];

  const handleView = async (index: number) => {
    const resolvedFile = getResolvedFile(index);
    if (!resolvedFile?.id) return;

    try {
      await api.downloadFile({
        fileId: resolvedFile.id,
        file: resolvedFile as IFile,
        openAfterDownload: true,
        setLoading: (loading) => (loading ? show() : hide()),
        callError: () => {
          showToast("Xem file thất bại", { type: "error" });
        },
      });
    } catch {
      // Error already handled by callError callback.
    }
  };

  const handleSaveToDownloads = async (index: number) => {
    const resolvedFile = getResolvedFile(index);
    if (!resolvedFile?.id) return;

    try {
      await api.downloadFile({
        fileId: resolvedFile.id,
        file: resolvedFile as IFile,
        saveToDownloads: true,
        setLoading: (loading) => (loading ? show() : hide()),
        callBack: () => {
          showToast("Lưu file thành công", { type: "success" });
        },
        callError: () => {
          showToast("Tải file thất bại", { type: "error" });
        },
      });
    } catch {
      // Error already handled by callError callback.
    }
  };

  const formatFileSize = (size?: number) => {
    if (!size) return "";
    const units = ["B", "KB", "MB", "GB"];
    const unitIndex = Math.min(
      Math.floor(Math.log(size) / Math.log(1024)),
      units.length - 1
    );
    const value = size / 1024 ** unitIndex;
    return `${value < 10 && unitIndex > 0 ? value.toFixed(1) : Math.round(value)} ${units[unitIndex]}`;
  };

  const getFileMetadata = (file?: Partial<IFile>) => {
    const metadata = [
      file?.uploadedDate && dayjs(file.uploadedDate).format("DD/MM/YYYY"),
      file?.size && formatFileSize(file.size),
    ].filter(Boolean);

    return metadata.length ? metadata.join(" | ") : "Tệp đính kèm";
  };

  if (!fileItems.length) return null;

  return (
    <View style={styles.list}>
      {fileItems.map((item, index) => {
        const resolvedFile = getResolvedFile(index);
        return (
          <View
            key={resolvedFile?.id ?? item.id ?? index}
            style={[
              styles.item,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}
            >
              <Icon source="file-document-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.content}>
              <Text
                numberOfLines={1}
                ellipsizeMode="middle"
                style={[styles.name, { color: colors.onSurface }]}
              >
                {resolvedFile?.name ?? "Đang tải file..."}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.metadata, { color: colors.onSurfaceVariant }]}
              >
                {getFileMetadata(resolvedFile)}
              </Text>
            </View>
            <Menu
              visible={menuIndex === index}
              onDismiss={() => setMenuIndex(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={22}
                  iconColor={colors.onSurface}
                  style={styles.menuButton}
                  onPress={() => setMenuIndex(index)}
                />
              }
            >
              <Menu.Item
                leadingIcon="eye-outline"
                title="Xem file"
                onPress={() => {
                  setMenuIndex(null);
                  void handleView(index);
                }}
              />
              <Menu.Item
                leadingIcon="download-outline"
                title="Tải xuống"
                onPress={() => {
                  setMenuIndex(null);
                  void handleSaveToDownloads(index);
                }}
              />
            </Menu>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
    gap: 12,
  },
  item: {
    minHeight: 76,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  metadata: {
    fontSize: 13,
    lineHeight: 18,
  },
  menuButton: {
    margin: 0,
  },
});
