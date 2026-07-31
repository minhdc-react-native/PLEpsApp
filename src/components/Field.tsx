import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { detailFieldStyles } from "./detail-fields/styles";

interface IProgs {
  label: string;
  value?: string | React.ReactElement | null | number;
  style?: StyleProp<ViewStyle>;
}

export const Field = ({ label, value, style }: IProgs) => {
  const { colors } = useTheme();

  const renderValue = () => {
    if (typeof value === "string" || value === null || value === undefined)
      return (
        <Text style={[detailFieldStyles.text, { color: colors.onSurface }]}>
          {value ?? ""}
        </Text>
      );
    if (typeof value === "number")
      return (
        <Text style={[detailFieldStyles.text, { color: colors.onSurface }]}>
          {value}
        </Text>
      );
    return value;
  };

  return (
    <View
      style={[
        detailFieldStyles.container,
        detailFieldStyles.divider,
        { borderBottomColor: colors.outlineVariant },
        style,
      ]}
    >
      <Text
        style={[detailFieldStyles.label, { color: colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <View style={detailFieldStyles.contentContainer}>{renderValue()}</View>
    </View>
  );
};
