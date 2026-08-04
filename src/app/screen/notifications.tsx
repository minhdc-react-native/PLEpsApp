import AppHeader from "@/components/app-header";
import { helper } from "@/hooks/useHelper";
import { useNotification } from "@/hooks/useNotification";
import { mapNoti } from "@/mappers/noti.mapper";
import { INoti } from "@/types/noti.model";
import { api } from "@/utils/epsApi";
import { router } from "expo-router";
import * as React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ReadFilter = "all" | "unread";

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { fetchNotificationCount } = useNotification();
  const { displayDatetime } = helper();
  const [readFilter, setReadFilter] = React.useState<ReadFilter>("all");
  const [notifications, setNotifications] = React.useState<INoti[]>([]);
  const [infoParam, setInfoParam] = React.useState({
    totalItems: 0,
    totalPages: 1,
    itemCount: 5,
    currentPage: 1,
  });
  const [typeLoading, setTypeLoading] = React.useState<0 | 1 | 2>(0);

  const getData = async (refresh = false) => {
    if (
      typeLoading !== 0 ||
      (!refresh && infoParam.currentPage === infoParam.totalPages)
    ) {
      return;
    }

    const newCurrentPage = refresh ? 1 : infoParam.currentPage + 1;
    setTypeLoading(refresh ? 1 : 2);
    api.get({
      link: `/notifications?page=${newCurrentPage}&limit=${infoParam.itemCount}`,
      callBack: async (res) => {
        const data = res.returnData.items.map((item: any) => mapNoti(item));
        const meta = res.returnData.meta;

        setNotifications((prev) => (refresh ? data : [...prev, ...data]));
        setInfoParam((prev) => ({
          ...prev,
          ...meta,
          currentPage: newCurrentPage,
        }));
        setTypeLoading(0);
        await fetchNotificationCount();
      },
    });
  };

  React.useEffect(() => {
    getData(true);
  }, []);

  const filteredNotifications = notifications.filter(
    (item) => readFilter === "all" || !item.isRead
  );

  const renderItem = ({ item }: { item: INoti }) => (
    <NotificationCard item={item} displayDatetime={displayDatetime} />
  );

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, marginBottom: insets.bottom },
      ]}
    >
      <AppHeader title="Thông báo" onBack={() => router.back()} />

      <View style={styles.filterSection}>
        <View
          style={[
            styles.filterControl,
            { borderColor: colors.primaryContainer },
          ]}
        >
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: readFilter === "all" }}
            onPress={() => setReadFilter("all")}
            style={[
              styles.filterOption,
              readFilter === "all" && {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    readFilter === "all"
                      ? colors.onPrimary
                      : colors.primary,
                },
              ]}
            >
              Tất cả
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: readFilter === "unread" }}
            onPress={() => setReadFilter("unread")}
            style={[
              styles.filterOption,
              readFilter === "unread" && {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    readFilter === "unread"
                      ? colors.onPrimary
                      : colors.primary,
                },
              ]}
            >
              Chưa đọc
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={typeLoading === 1}
            onRefresh={() => getData(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={() => getData()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.onSurface }] }>
              {readFilter === "unread"
                ? "Bạn đã đọc hết thông báo"
                : "Chưa có thông báo"}
            </Text>
            <Text
              style={[styles.emptyDescription, { color: colors.onSurfaceVariant }]}
            >
              Nội dung mới sẽ được hiển thị tại đây.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function NotificationCard({
  item,
  displayDatetime,
}: {
  item: INoti;
  displayDatetime: (value?: Date | null, fallback?: string) => string;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: item.isRead ? colors.outlineVariant : colors.primary,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text
          numberOfLines={3}
          style={[
            styles.cardTitle,
            {
              color: colors.onSurface,
              fontWeight: item.isRead ? "600" : "700",
            },
          ]}
        >
          {item.title}
        </Text>
      </View>
      <Text style={[styles.timestamp, { color: colors.onSurfaceVariant }] }>
        {displayDatetime(item.sendAt)}
      </Text>
      <Markdown
        style={{
          body: {
            color: colors.onSurface,
            fontSize: 15,
            lineHeight: 22,
          },
          paragraph: {
            marginTop: 0,
            marginBottom: 8,
          },
          strong: {
            color: colors.primary,
            fontWeight: "700",
          },
          link: {
            color: colors.primary,
          },
        }}
      >
        {item.body}
      </Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  filterControl: {
    flexDirection: "row",
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    padding: 2,
    overflow: "hidden",
  },
  filterOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
  },
  timestamp: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyDescription: {
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
  },
});
