import VcSelector from "@/components/vcSelector";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

export interface DetailTab {
  id: string | number;
  value: string;
}

interface DetailTabBarProps {
  data: DetailTab[];
  value?: string | number | null;
  onChange: (value: DetailTab) => void;
  mode?: "fit" | "full";
}

export default function DetailTabBar({
  data,
  value,
  onChange,
  mode = "full",
}: DetailTabBarProps) {
  const { colors } = useTheme();

  return (
    <VcSelector
      data={data}
      value={value}
      onChange={onChange}
      type="line"
      mode={mode}
      containerStyle={[
        styles.container,
        {
          backgroundColor: colors.primaryContainer,
          borderColor: colors.outlineVariant,
        },
      ]}
      itemStyle={styles.item}
      tabBackgroundColor={colors.primaryContainer}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
});
