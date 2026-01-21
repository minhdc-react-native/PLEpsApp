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

  const getContainerStyle = () => {
    const styles = [containerVariantStyleMap[variant]];

    if (variant === "primary") {
      styles.push({
        backgroundColor: colors.primaryContainer,
      });
    } else if (variant === "secondary") {
      styles.push({
        backgroundColor: colors.secondaryContainer,
      });
    } else if (variant === "tertiary") {
      styles.push({
        backgroundColor: colors.tertiaryContainer,
      });
    }

    return styles;
  };

  const getTextStyle = () => {
    const styles = [textVariantStyleMap[variant]];
    if (variant === "primary") {
      styles.push({
        color: colors.onPrimaryContainer,
      });
    } else if (variant === "secondary") {
      styles.push({
        color: colors.onSecondaryContainer,
      });
    } else if (variant === "tertiary") {
      styles.push({
        color: colors.onTertiaryContainer,
      });
    }
    return styles;
  };

  const renderContent = () => {
    if (typeof children === "string" || typeof children === "number") {
      return (
        <Text style={[badgeStyles.text, ...getTextStyle()]}>{children}</Text>
      );
    }
    return children;
  };

  return (
    <View style={[badgeStyles.container, ...getContainerStyle()]}>
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
    backgroundColor: "#E0E0E0",
    alignSelf: "flex-start",
  },
  successContainer: {
    backgroundColor: "green",
  },
  warningContainer: {
    backgroundColor: "yellow",
  },
  errorContainer: {
    backgroundColor: "red",
  },
  // Text styles
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
  otherText: {
    color: "white",
  },
});

const containerVariantStyleMap = {
  default: badgeStyles.container,
  primary: badgeStyles.container,
  secondary: badgeStyles.container,
  tertiary: badgeStyles.container,
  success: badgeStyles.successContainer,
  warning: badgeStyles.warningContainer,
  error: badgeStyles.errorContainer,
};

const textVariantStyleMap = {
  default: badgeStyles.text,
  primary: badgeStyles.otherText,
  secondary: badgeStyles.otherText,
  tertiary: badgeStyles.otherText,
  success: badgeStyles.otherText,
  warning: badgeStyles.otherText,
  error: badgeStyles.otherText,
};
