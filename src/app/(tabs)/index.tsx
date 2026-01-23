import { CustomAvatar } from "@/components/avatar";
import { StarRating } from "@/components/starRating";
import { useAuth } from "@/hooks/useAuth";
// import useDeviceToken from "@/hooks/useDeviceToken";
import { useData } from "@/hooks/zustand/useData";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
const sizeLogo = { width: 500, height: 199 };
const EmployeeInfo = () => {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const totalUnread = useData((state) => state.totalUnread);
  const { logout } = useAuth();
  const [openLogout, setOpenLogout] = useState(false);

  return (
    <ScrollView>
      {/* Header */}
      <Appbar.Header mode="center-aligned">
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={{
            width: (1 / 3) * sizeLogo.width,
            height: (1 / 3) * sizeLogo.height,
            resizeMode: "cover",
            marginLeft: 20,
          }}
        />
        <Appbar.Content title="" />
        <View style={{ flexDirection: "row" }}>
          <Appbar.Action
            icon="bell-outline"
            onPress={() =>
              router.navigate({
                pathname: "/screen/notifications",
                params: { limit: totalUnread },
              })
            }
          />
          {totalUnread !== 0 && (
            <Badge
              size={15}
              style={{ position: "absolute", top: 10, right: 10 }}
            >
              {totalUnread}
            </Badge>
          )}
        </View>
        <Appbar.Action
          icon={() => (
            <AntDesign name="logout" size={24} color={colors.primary} />
          )}
          onPress={() => setOpenLogout(true)}
        />
      </Appbar.Header>

      {/* Avatar + Name */}
      <View style={[styles.profile]}>
        <CustomAvatar src={user?.imageUrl} size={128} />
        <Text
          variant="titleMedium"
          style={{ fontWeight: "bold", marginTop: 12, color: colors.secondary }}
        >
          {user?.code}
        </Text>
        <Text variant="titleLarge" style={{ fontWeight: "bold", marginTop: 8 }}>
          {user?.fullName}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="chart-bar"
          onPress={() => router.navigate("/screen/history")}
        >
          Lịch sử
        </Button>
        <Button
          mode="text"
          icon="arrow-right"
          contentStyle={{ flexDirection: "row-reverse" }}
          onPress={() => router.navigate("/screen/employee-profile")}
        >
          Hồ sơ nhân sự
        </Button>
      </View>

      {/* Info Cards */}
      <View style={styles.row}>
        <Card
          style={{
            flex: 1,
          }}
        >
          <Card.Content
            style={{
              gap: 12,
            }}
          >
            <View style={styles.actionContent}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Avatar.Icon
                  icon={"star"}
                  style={{ backgroundColor: colors.background }}
                  color={colors.primary}
                  size={24}
                />
                <Text variant="titleSmall">
                  Bậc thợ{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: colors.onErrorContainer,
                    }}
                  >{`${user?.currentRank}/${user?.rankScale}`}</Text>
                </Text>
              </View>
              <StarRating
                value={user?.currentRank ?? 0}
                max={user?.rankScale}
              />
            </View>
            <View style={styles.actionContent}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Avatar.Icon
                  icon={"account"}
                  style={{ backgroundColor: colors.background }}
                  color={colors.primary}
                  size={24}
                />
                <Text variant="titleSmall">Chức danh</Text>
              </View>
              <Text
                variant="bodyMedium"
                style={{
                  fontWeight: "bold",
                  color: colors.onErrorContainer,
                  marginBottom: 8,
                }}
              >
                {user?.position?.name}
              </Text>
            </View>
            <View style={styles.actionContent}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Avatar.Icon
                  icon={"toolbox"}
                  style={{ backgroundColor: colors.background }}
                  color={colors.primary}
                  size={24}
                />
                <Text variant="titleSmall">Chuyên môn</Text>
              </View>
              <Text
                variant="bodyMedium"
                style={{
                  fontWeight: "bold",
                  color: colors.onErrorContainer,
                  marginBottom: 8,
                }}
              >
                {user?.area?.name}
              </Text>
            </View>
            <View style={styles.actionContent}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Avatar.Icon
                  icon={"home-account"}
                  style={{ backgroundColor: colors.background }}
                  color={colors.primary}
                  size={24}
                />
                <Text variant="titleSmall">Phòng ban</Text>
              </View>
              <Text
                variant="bodyMedium"
                style={{
                  fontWeight: "bold",
                  color: colors.onErrorContainer,
                  marginBottom: 8,
                }}
              >
                {user?.department?.name}
              </Text>
            </View>
            {/* <View style={styles.actionContent}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Avatar.Icon
                  icon={"account"}
                  style={{ backgroundColor: colors.background }}
                  color={colors.primary}
                  size={24}
                />
                <Text variant="titleSmall">Tổ nhóm</Text>
              </View>
              <Text
                variant="bodyMedium"
                style={{
                  fontWeight: "bold",
                  color: colors.onErrorContainer,
                  marginBottom: 8,
                }}
              >
                {user?.team.name}
              </Text>
            </View> */}
          </Card.Content>
        </Card>
      </View>

      <Portal>
        <Dialog
          visible={openLogout}
          onDismiss={() => setOpenLogout(false)}
          style={{ backgroundColor: colors.background }}
        >
          <Dialog.Content>
            <Text variant="bodyMedium">Xác nhận đăng xuất?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpenLogout(false)}>Không</Button>
            <Button onPress={logout}>Đăng xuất</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

export default EmployeeInfo;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  profile: { alignItems: "center", marginTop: 24 },
  name: { marginTop: 8, fontSize: 18, fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 50,
    marginTop: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 32,
  },
  actionContent: {
    gap: 8,
  },
  sectionTitle: {
    marginTop: 24,
    marginLeft: 16,
    fontWeight: "600",
    fontSize: 16,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
