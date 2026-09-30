import ExamDetailTabLayout from "./exam-detail-tab-layout";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExamHistory } from "@/types/exam/exam.model";
import { useLocalSearchParams } from "expo-router";

export default function ExamDetail() {
  const itemData = useData(
    (state) => state.itemData,
  ) as IEmployeeExamHistory | null;
  const { tab } = useLocalSearchParams();

  if (!itemData) return null;

  return (
    <ExamDetailTabLayout
      exam={itemData.exam}
      initialTab={typeof tab === "string" ? tab : undefined}
    />
  );
}
