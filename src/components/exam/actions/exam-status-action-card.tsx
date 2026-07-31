import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

interface Props {
  title: string;
  action?: ReactNode;
  info?: ReactNode;
  children?: ReactNode;
  active?: boolean;
  onPress?: () => void;
}

export function ExamStatusActionCard({
  title,
  info,
  action,
  active,
  onPress,
  children,
}: Props) {
  const { colors } = useTheme();
  return (
      <Card
        mode="outlined"
        style={{
          padding: 16,
          borderRadius: 18,
          borderColor: colors.outlineVariant,
          backgroundColor: colors.surface,
        }}
        onPress={onPress}
      >
      <View style={{ flexDirection: "column", gap: 8 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            variant="titleMedium"
            style={{
              fontWeight: "bold",
              color: active ? colors.primary : colors.onSurface,
            }}
          >
            {title}
          </Text>
          {!active && info}
        </View>
        {active && (
          <>
            {children}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingTop: 8,
              }}
            >
              {info && <View style={{ flex: 1 }}>{info}</View>}
              {action}
            </View>
          </>
        )}
      </View>
    </Card>
  );
}

export const ExamStatusActionCardStyles = StyleSheet.create({
  actionBtnLabel: {
    fontSize: 11,
  },
});
