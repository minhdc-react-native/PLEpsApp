import { View } from "react-native";
import { Badge } from "../badge";

export function ResultStatusBadge({
  isPassed,
  score,
}: {
  isPassed?: boolean;
  score?: number;
}) {
  const variant = () => {
    switch (isPassed) {
      case true:
        return "success";
      case false:
        return "error";
      default:
        return "default";
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Badge variant={variant()}>
        {isPassed !== undefined
          ? isPassed
            ? "Đạt"
            : "Không đạt"
          : "Chưa có kết quả"}
      </Badge>
      {score !== undefined && <Badge variant={"default"}>{score}</Badge>}
    </View>
  );
}
