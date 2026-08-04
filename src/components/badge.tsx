import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

interface BadgeProps {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "default"
    | "success"
    | "warning"
    | "error";
  children: ReactNode;
}

export const Badge = ({ variant = "default", children }: BadgeProps) => {
  const { colors } = useTheme();

  const colorMap = {
    default: { backgroundColor: colors.surfaceVariant, color: colors.onSurfaceVariant },
    primary: { backgroundColor: colors.primaryContainer, color: colors.onPrimaryContainer },
    secondary: { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
    tertiary: { backgroundColor: colors.tertiaryContainer, color: colors.onTertiaryContainer },
    success: { backgroundColor: "#E8F6EE", color: "#176B3A" },
    warning: { backgroundColor: "#FFF4CC", color: "#7A4A00" },
    error: { backgroundColor: colors.errorContainer, color: colors.onErrorContainer },
  };

  const renderContent = () => {
    if (typeof children === "string" || typeof children === "number") {
      return (
        <Text style={[badgeStyles.text, { color: colorMap[variant].color }]}>
          {children}
        </Text>
      );
    }
    return children;
  };

  return (
    <View style={[badgeStyles.container, colorMap[variant]]}>
      {renderContent()}
    </View>
  );
};

export const badgeStyles = StyleSheet.create({
  // Container styles
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  // Text styles
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});
