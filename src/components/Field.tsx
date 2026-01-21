import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { detailFieldStyles } from "./detail-fields/styles";

interface IProgs {
  label: string;
  value?: string | React.ReactElement | null | number;
  style?: StyleProp<ViewStyle>;
}

export const Field = ({ label, value, style }: IProgs) => {
  const renderValue = () => {
    if (typeof value === "string" || value === null || value === undefined)
      return <Text style={detailFieldStyles.text}>{value ?? ""}</Text>;
    if (typeof value === "number")
      return <Text style={detailFieldStyles.text}>{value}</Text>;
    return value;
  };

  return (
    <View style={[detailFieldStyles.container, style]}>
      <Text style={detailFieldStyles.label}>{label}</Text>
      <View style={detailFieldStyles.contentContainer}>{renderValue()}</View>
    </View>
  );
};
