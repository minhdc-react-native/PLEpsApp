import ExamDetailTabLayout from "@/app/screen/exam-detail/exam-detail-tab-layout";
import { useData } from "@/hooks/zustand/useData";
import { IEmployeeExam } from "@/types/exam/exam.model";
import CurrentExamOverview from "./overview";

export default function CurrentExamScreen() {
  const currentExam = useData((state) => state.currentExam) as IEmployeeExam | null;

  if (!currentExam) return null;

  return (
    <ExamDetailTabLayout
      exam={currentExam.exam}
      overview={CurrentExamOverview}
      initialTab="overview"
    />
  );
}
