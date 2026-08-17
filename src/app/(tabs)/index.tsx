import { CustomAvatar } from "@/components/avatar";
import PieLoader from "@/components/dialog/pieLoader";
import { StarRating } from "@/components/starRating";
// import useDeviceToken from "@/hooks/useDeviceToken";
import { useData } from "@/hooks/zustand/useData";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../(auth)/AuthProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type InfoRowProps = {
  icon: string;
  label: string;
  value?: string | null;
  accessory?: ReactNode;
};

const InfoRow = ({ icon, label, value, accessory }: InfoRowProps) => {
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
        {accessory && <View style={styles.infoAccessory}>{accessory}</View>}
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const logoHeight = 54;
  const heroHeight = 176 + insets.top - logoHeight;
  const avatarSize = 128;
  const heroDiameter = width * 2.2;
  if (user === null) {
    return (
      <View style={styles.overlay}>
        <PieLoader />
      </View>
    );
  }
  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <StatusBar style="light" />
      <View style={[styles.hero, { height: heroHeight, paddingTop: insets.top }]}>
        <LinearGradient
          colors={["#123B9B", colors.primary, "#347AF1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          style={[
            styles.heroShape,
            {
              width: heroDiameter,
              height: heroDiameter,
              borderRadius: heroDiameter / 2,
              left: "50%",
              transform: [{ translateX: -(heroDiameter / 2) }],
              top: heroHeight - heroDiameter,
            },
          ]}
        />
        <View style={styles.heroTop}>
          <View style={styles.logoPill}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.logo}
            />
          </View>
          <View style={styles.heroActions}>
            <View style={styles.notificationAction}>
              <IconButton
                icon="bell-outline"
                iconColor="#FFFFFF"
                size={22}
                onPress={() =>
                  router.navigate({
                    pathname: "/screen/notifications",
                    params: { limit: totalUnread },
                  })
                }
              />
              {totalUnread !== 0 && (
                <Badge size={15} style={styles.notificationBadge}>
                  {totalUnread}
                </Badge>
              )}
            </View>
            <IconButton
              icon={() => (
                <AntDesign name="logout" size={21} color="#FFFFFF" />
              )}
              onPress={() => setOpenLogout(true)}
            />
          </View>
        </View>
        <View pointerEvents="none" style={styles.dotPattern}>
          {Array.from({ length: 30 }).map((_, index) => (
            <View
              key={index}
              style={[styles.dot, { opacity: 0.1 + (index % 4) * 0.04 }]}
            />
          ))}
        </View>
        <View
          style={[
            styles.floatingAvatar,
            {
              width: avatarSize,
              height: avatarSize,
              left: "50%",
              marginLeft: -(avatarSize / 2),
              bottom: -(avatarSize / 2),
              borderRadius: avatarSize / 2,
              padding: 8,
              backgroundColor: colors.background,
            },
          ]}
        >
          {user?.imageUrl ? (
            <CustomAvatar src={user.imageUrl} size={avatarSize - 16} />
          ) : (
            <View style={[styles.avatarCore, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </View>

      <View style={[styles.profile, { paddingTop: avatarSize / 2 }]}>
        <View style={[styles.codeBadge, { backgroundColor: colors.primaryContainer }]}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>
            {user?.code}
          </Text>
        </View>
        <Text variant="headlineSmall" style={styles.fullName}>
          {user?.fullName}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="calendar-month-outline"
          onPress={() => router.navigate("/screen/history")}
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
        >
          Quá trình
        </Button>
        <Button
          mode="contained"
          icon="account-details-outline"
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          labelStyle={styles.profileButtonLabel}
          onPress={() => router.navigate("/screen/employee-profile")}
        >
          Hồ sơ nhân sự
        </Button>
      </View>

      <Card mode="outlined" style={styles.infoCard}>
        <Card.Content style={styles.infoContent}>
          <InfoRow
            icon="star-outline"
            label="Bậc thợ"
            value={`${user?.currentRank ?? "—"}/${user?.rankScale ?? "—"}`}
            accessory={
              <StarRating value={user?.currentRank ?? 0} max={user?.rankScale} />
            }
          />
          <InfoRow icon="briefcase-outline" label="Chức danh" value={user?.position?.name} />
          <InfoRow icon="toolbox-outline" label="Chuyên môn" value={user?.area?.name} />
          <InfoRow icon="office-building-outline" label="Phòng ban" value={user?.department?.name} />
        </Card.Content>
      </Card>

      </ScrollView>

      <Portal>
        <Dialog
          visible={openLogout}
          onDismiss={() => setOpenLogout(false)}
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
    </>
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
  hero: {
    position: "relative",
    overflow: "visible",
    zIndex: 2,
  },
  heroShape: {
    position: "absolute",
  },
  heroTop: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },
  logoPill: {
    width: 158,
    height: 54,
    paddingHorizontal: 7,
    paddingVertical: 4,
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "transparent",
  },
  logo: {
    width: 144,
    height: 48,
    resizeMode: "contain",
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationAction: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 0,
    backgroundColor: "#E53935",
  },
  dotPattern: {
    position: "absolute",
    right: 24,
    bottom: 54,
    width: 118,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 9,
    zIndex: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  floatingAvatar: {
    position: "absolute",
    zIndex: 3,
  },
  profile: {
    alignItems: "center",
    paddingTop: 0,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  avatarCore: {
    flex: 1,
    borderRadius: 999,
  },
  codeBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  fullName: { fontWeight: "700", marginTop: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 18,
    gap: 8,
  },
  actionButton: { flex: 1, borderRadius: 24 },
  actionButtonContent: { height: 40 },
  profileButtonLabel: { fontWeight: "600" },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  infoContent: { gap: 18, paddingVertical: 16 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sectionTitle: { fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcon: { backgroundColor: "#F1F4F8" },
  infoCopy: { flex: 1, gap: 2 },
  infoValue: { fontWeight: "600" },
  infoAccessory: { marginTop: 4, alignSelf: "flex-start" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
