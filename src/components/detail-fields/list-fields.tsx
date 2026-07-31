import { ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

interface Props {
  children: ReactNode;
}

export const ListFields = ({ children }: Props) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
      }}
    >
      {children}
    </View>
  );
};
