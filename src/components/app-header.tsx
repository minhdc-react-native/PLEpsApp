import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Text, useTheme } from "react-native-paper";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  bottom?: ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  onBack,
  actions,
  bottom,
}: AppHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant,
        },
      ]}
    >
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
      {bottom}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
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
