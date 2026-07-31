import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Text, useTheme } from "react-native-paper";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  onBack,
  actions,
}: AppHeaderProps) {
  const { colors } = useTheme();

  return (
    <Appbar.Header
      mode="small"
      elevated={false}
      style={[
        styles.header,
        subtitle && styles.headerWithSubtitle,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      {onBack && <Appbar.BackAction onPress={onBack} />}
      <View style={styles.titleBlock}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.title, { color: colors.onSurface }]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.subtitle, { color: colors.onSurfaceVariant }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {actions && <View style={styles.actions}>{actions}</View>}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    borderBottomWidth: 0,
  },
  headerWithSubtitle: {
    height: 72,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 1,
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
});
