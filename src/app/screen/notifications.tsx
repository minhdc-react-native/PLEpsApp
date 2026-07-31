import { Badge } from "@/components/badge";
import { helper } from "@/hooks/useHelper";
import { useNotification } from "@/hooks/useNotification";
import { mapNoti } from "@/mappers/noti.mapper";
import { INoti } from "@/types/noti.model";
import { api } from "@/utils/epsApi";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import {
  Appbar,
  Chip,
  Divider,
  IconButton,
  Modal,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const filters = {
  topic: [
    { id: "topic1", value: "Thi nâng bậc" },
    { id: "topic2", value: "Thi giữ bậc" },
    { id: "topic3", value: "Thi KTSHN" },
    { id: "topic4", value: "Nâng lương" },
    { id: "topic5", value: "Khác" },
  ],
  time: [
    { id: "time1", value: "Tất cả" },
    { id: "time2", value: "7 ngày" },
    { id: "time3", value: "14 ngày" },
    { id: "time4", value: "30 ngày" },
  ],
};
export default function NotificationScreen() {
  const { limit } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { fetchNotificationCount } = useNotification();
  const [visible, setVisible] = React.useState(false);
  const { colors } = useTheme();
  const showFilter = () => setVisible(true);
  const hideFilter = () => setVisible(false);
  const [filerSelect, setFilterSelect] = React.useState<string[]>([
    "topic1",
    "topic2",
    "time1",
  ]);
  const onPresFilterItem = (item: any) => {
    if (filerSelect.includes(item.id)) {
      setFilterSelect((prev) => prev.filter((f) => f !== item.id));
    } else {
      setFilterSelect((prev) => [...prev, item.id]);
    }
  };
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notifications, setNotifications] = React.useState<INoti[]>([]);

  const filtered = notifications.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const { displayDatetime } = helper();
  const renderItem = ({ item }: { item: (typeof notifications)[0] }) => (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          paddingVertical: 12,
          paddingHorizontal: 10,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
      onPress={async () => {}}
    >
      {/* Header row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View
          style={{
            alignItems: "flex-start",
            paddingBottom: 10,
            flex: 1,
          }}
        >
          <Text variant="titleMedium" style={{ flex: 1, fontWeight: "600" }}>
            {item.title}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {displayDatetime(item.sendAt)}
          </Text>
        </View>
        {!item.isRead && <Badge variant="tertiary">Mới</Badge>}
      </View>

      {/* Description */}
      <Markdown>{item.body}</Markdown>
    </Pressable>
  );
  const [infoParam, setInfoParam] = React.useState({
    totalItems: 0,
    totalPages: 3,
    itemCount: 5,
    currentPage: 1,
  });

  const [typeLoading, setTypeLoading] = React.useState<0 | 1 | 2>(0); // 1:refresh, 2:loadMore, 0:none

  const getData = async (refresh?: boolean) => {
    if (
      typeLoading !== 0 ||
      (!refresh && infoParam.currentPage === infoParam.totalPages)
    )
      return;
    const newCurrentPage = !!refresh ? 1 : infoParam.currentPage + 1;
    setTypeLoading(!!refresh ? 1 : 2);
    api.get({
      link: `/notifications?page=${!!refresh ? 1 : newCurrentPage}&limit=${
        infoParam.itemCount
      }`,
      callBack: async (res) => {
        const data = res.returnData.items.map((i: any) => mapNoti(i));
        const meta = res.returnData.meta;
        setNotifications((prev) => (!!refresh ? data : [...prev, ...data]));
        setInfoParam((prev) => ({
          ...prev,
          ...meta,
          currentPage: newCurrentPage,
        }));
        setTypeLoading(0);

        // Gọi lại API global để cập nhật số lượng thông báo chưa đọc
        await fetchNotificationCount();
      },
    });
  };

  React.useEffect(() => {
    getData(true);
  }, []);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        marginBottom: insets.bottom,
      }}
    >
      {/* Appbar */}
      <Appbar.Header
        mode="center-aligned"
        elevated={false}
        style={{ backgroundColor: theme.colors.background }}
      >
        <Appbar.BackAction onPress={() => router.back()} />
        <View
          style={{ flexDirection: "row", gap: 10, justifyContent: "center" }}
        >
          <Text variant="headlineMedium">{`Thông báo`}</Text>
          {/* <Badge style={{ position: "absolute", top: 0, right: -25 }}>
            {infoParam.totalItems > 99 ? "+99" : infoParam.totalItems}
          </Badge> */}
        </View>
      </Appbar.Header>
      <Divider />
      {/* <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                <Searchbar
                    placeholder="Tìm nội dung"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{ margin: 10, borderRadius: 20, flex: 1, backgroundColor: colors.elevation.level1, borderWidth: 0.2, borderColor: colors.backdrop }}
                />
                <Appbar.Action icon="filter-variant" onPress={showFilter} />
            </View> */}

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={typeLoading === 1}
            onRefresh={() => getData(true)}
          />
        }
        onEndReached={() => getData()}
        onEndReachedThreshold={0.5}
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideFilter}
          contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.title, { flex: 1 }]}>Bộ lọc</Text>
            <IconButton icon={"close"} onPress={hideFilter} />
          </View>
          <Divider style={{ marginBottom: 20 }} />
          <Text>Chủ đề</Text>
          <View style={styles.row}>
            {filters.topic.map((f, idx) => (
              <Chip
                key={f.id}
                mode={filerSelect.includes(f.id) ? "flat" : "outlined"}
                selected={filerSelect.includes(f.id)}
                onPress={() => onPresFilterItem(f)}
              >
                {f.value}
              </Chip>
            ))}
          </View>

          <Text style={{ marginTop: 16 }}>Khoảng thời gian</Text>
          <View style={styles.row}>
            {filters.time.map((f, idx) => (
              <Chip
                key={f.id}
                mode={filerSelect.includes(f.id) ? "flat" : "outlined"}
                selected={filerSelect.includes(f.id)}
                onPress={() => onPresFilterItem(f)}
              >
                {f.value}
              </Chip>
            ))}
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
});
