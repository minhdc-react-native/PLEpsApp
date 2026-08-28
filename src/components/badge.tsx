import { Children, ReactNode } from "react";
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
  size?: "default" | "large";
}

export const Badge = ({ variant = "default", children, size = "default" }: BadgeProps) => {
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
    const textChildren = Children.toArray(children);
    if (textChildren.every((child) => typeof child === "string" || typeof child === "number")) {
      return (
        <Text style={[badgeStyles.text, size === "large" && badgeStyles.largeText, { color: colorMap[variant].color }]}>
          {children}
        </Text>
      );
    }
    return children;
  };

  return (
    <View style={[badgeStyles.container, size === "large" && badgeStyles.largeContainer, colorMap[variant]]}>
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
  largeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  largeText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
