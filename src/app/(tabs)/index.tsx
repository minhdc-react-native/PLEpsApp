import { CustomAvatar } from "@/components/avatar";
import PieLoader from "@/components/dialog/pieLoader";
import { StarRating } from "@/components/starRating";
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
import { useAuth } from "../(auth)/AuthProvider";
type InfoRowProps = {
  icon: string;
  label: string;
  value?: string | null;
};

const InfoRow = ({ icon, label, value }: InfoRowProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.infoRow}>
      <Avatar.Icon
        icon={icon}
        size={34}
        style={styles.infoIcon}
        color={colors.primary}
      />
      <View style={styles.infoCopy}>
        <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
          {label}
        </Text>
        <Text variant="bodyLarge" style={styles.infoValue} numberOfLines={2}>
          {value || "Chưa cập nhật"}
        </Text>
      </View>
    </View>
  );
};

const EmployeeInfo = () => {
  const { colors } = useTheme();
  const user = useData((state) => state.user);
  const totalUnread = useData((state) => state.totalUnread);
  const { logout } = useAuth();
  const [openLogout, setOpenLogout] = useState(false);
  if (user === null) {
    return (
      <View style={styles.overlay}>
        <PieLoader />
      </View>
    );
  }
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Appbar.Header
        mode="center-aligned"
        elevated={false}
        style={{ backgroundColor: colors.background }}
      >
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.logo}
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

      <View style={styles.profile}>
        <View style={styles.avatarRing}>
          <CustomAvatar src={user?.imageUrl} size={92} />
        </View>
        <Text
          variant="labelLarge"
          style={{ marginTop: 16, color: colors.primary, fontWeight: "700" }}
        >
          {user?.code}
        </Text>
        <Text variant="headlineSmall" style={styles.fullName}>
          {user?.fullName}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          Hồ sơ nhân sự
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained-tonal"
          icon="chart-bar"
          onPress={() => router.navigate("/screen/history")}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
        >
          Lịch sử
        </Button>
        <Button
          mode="text"
          icon="arrow-right"
          contentStyle={{ flexDirection: "row-reverse" }}
          labelStyle={styles.profileButtonLabel}
          onPress={() => router.navigate("/screen/employee-profile")}
        >
          Hồ sơ nhân sự
        </Button>
      </View>

      <Card mode="outlined" style={styles.infoCard}>
        <Card.Content style={styles.infoContent}>
          <View style={styles.sectionHeading}>
            <View>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Tóm tắt nhân sự
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                Thông tin đang được sử dụng trong hệ thống
              </Text>
            </View>
            <Avatar.Icon
              icon="account-details-outline"
              size={40}
              style={{ backgroundColor: colors.primaryContainer }}
              color={colors.primary}
            />
          </View>

          <View style={styles.rankRow}>
            <InfoRow
              icon="star-outline"
              label="Bậc thợ"
              value={`${user?.currentRank ?? "—"}/${user?.rankScale ?? "—"}`}
            />
            <StarRating value={user?.currentRank ?? 0} max={user?.rankScale} />
          </View>
          <InfoRow icon="briefcase-outline" label="Chức danh" value={user?.position?.name} />
          <InfoRow icon="toolbox-outline" label="Chuyên môn" value={user?.area?.name} />
          <InfoRow icon="office-building-outline" label="Phòng ban" value={user?.department?.name} />
        </Card.Content>
      </Card>

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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingBottom: 28 },
  logo: {
    width: 132,
    height: 54,
    resizeMode: "contain",
    marginLeft: 16,
  },
  profile: { alignItems: "center", paddingTop: 16, paddingHorizontal: 20 },
  avatarRing: {
    padding: 5,
    borderRadius: 56,
    backgroundColor: "#E8F0FF",
  },
  fullName: { fontWeight: "700", marginTop: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
    gap: 8,
  },
  actionButton: { borderRadius: 12 },
  actionButtonContent: { height: 46 },
  profileButtonLabel: { fontWeight: "600" },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  infoContent: { gap: 18, paddingVertical: 20 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sectionTitle: { fontWeight: "700" },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcon: { backgroundColor: "#F1F4F8" },
  infoCopy: { flex: 1, gap: 2 },
  infoValue: { fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
