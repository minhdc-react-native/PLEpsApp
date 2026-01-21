import { ReactNode } from "react";
import { Card, useTheme } from "react-native-paper";

interface Props {
  children: ReactNode;
}

export const ListFields = ({ children }: Props) => {
  const { colors } = useTheme();
  return (
    <Card
      style={{
        padding: 20,
        backgroundColor: colors.background,
      }}
    >
      {children}
    </Card>
  );
};
