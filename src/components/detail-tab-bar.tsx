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
  const normalizedData = data.map((tab) => ({
    ...tab,
    value: normalizeTabLabel(tab.value),
  }));

  return (
    <VcSelector
      data={normalizedData}
      value={value}
      onChange={onChange}
      type="line"
      mode={mode}
      containerStyle={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
      itemStyle={styles.item}
      tabBackgroundColor={colors.surface}
    />
  );
}

function normalizeTabLabel(value: string) {
  const words = value.trim().split(/\s+/);
  return words
    .map((word, index) =>
      index === 0
        ? `${word.charAt(0).toLocaleUpperCase("vi-VN")}${word.slice(1).toLocaleLowerCase("vi-VN")}`
        : word.toLocaleLowerCase("vi-VN"),
    )
    .join(" ");
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
});
