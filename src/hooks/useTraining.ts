/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";

export function useTrainingResource<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void reload();
    // The caller controls loader identity with useCallback and deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, ...deps]);

  return { data, loading, error, reload } as const;
}

export function getTrainingStatusLabel(status: number) {
  const labels: Record<number, string> = {
    [-1]: "Đã hủy",
    0: "Bản nháp",
    10: "Đang đăng ký khóa",
    20: "Đang rà soát khóa",
    30: "Chờ triển khai",
    40: "Đang đăng ký lớp",
    50: "Đang rà soát lớp",
    60: "Đang dạy học",
    90: "Xác nhận kết quả",
    99: "Đã kết thúc",
  };
  return labels[status] ?? "Đang cập nhật";
}

export function getTrainingStatusVariant(status: number): "default" | "primary" | "success" | "warning" | "error" {
  if (status < 0) return "error";
  if (status === 99) return "success";
  if (status === 10 || status === 40) return "primary";
  if (status === 60) return "success";
  if (status === 30 || status === 20 || status === 50) return "warning";
  return "default";
}

export function formatTrainingDate(value: Date | string | null | undefined, fallback = "Chưa có") {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("vi-VN");
}

export function formatTrainingDateTime(value: Date | string | null | undefined, fallback = "Chưa có") {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}
