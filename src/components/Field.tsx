import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { detailFieldStyles } from "./detail-fields/styles";

interface IProgs {
  label: string;
  value?: string | React.ReactElement | null | number;
  style?: StyleProp<ViewStyle>;
  layout?: "row" | "column";
}

export const Field = ({ label, value, style, layout = "row" }: IProgs) => {
  const { colors } = useTheme();
  const isColumn = layout === "column";

  const renderValue = () => {
    if (typeof value === "string" || value === null || value === undefined)
      return (
        <Text
          style={[
            detailFieldStyles.text,
            isColumn && detailFieldStyles.columnText,
            { color: colors.onSurface },
          ]}
        >
          {value ?? ""}
        </Text>
      );
    if (typeof value === "number")
      return (
        <Text
          style={[
            detailFieldStyles.text,
            isColumn && detailFieldStyles.columnText,
            { color: colors.onSurface },
          ]}
        >
          {value}
        </Text>
      );
    return value;
  };

  return (
    <View
      style={[
        detailFieldStyles.container,
        isColumn && detailFieldStyles.columnContainer,
        detailFieldStyles.divider,
        style,
      ]}
    >
      <Text
        style={[
          detailFieldStyles.label,
          isColumn && detailFieldStyles.columnLabel,
          { color: colors.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          detailFieldStyles.contentContainer,
          isColumn && detailFieldStyles.columnContentContainer,
        ]}
      >
        {renderValue()}
      </View>
    </View>
  );
};
