import { Badge } from "../badge";

export function TrainingStatusBadge({
  isPassed,
}: {
  isPassed: boolean | undefined;
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
    <Badge variant={variant()}>
      {isPassed !== undefined
        ? isPassed
          ? "Đạt"
          : "Không đạt"
        : "Chưa có kết quả"}
    </Badge>
  );
}
