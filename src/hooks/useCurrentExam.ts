import { useData } from "@/hooks/zustand/useData";
import { mapEmployeeExamHistory } from "@/mappers/employee/exam-history.mapper";
import { EXAM_STATUS } from "@/types/exam/enums/exam-status.enum";
import { api } from "@/utils/epsApi";
import { useCallback, useState } from "react";

const useCurrentExam = () => {
  const user = useData((s) => s.user);
  const setCurrentExam = useData((s) => s.setCurrentExam);
  const [loading, setLoading] = useState<boolean>(false);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setCurrentExam(null);
      return;
    }

    try {
      setLoading(true);

      // fetch exam periods for the user
      const listRes: any = await api.get({
        link: `/exams/employee/${user.id}/exam-periods`,
        setLoading: undefined,
      });

      const mappedData: any[] = (listRes?.returnData || []).map((item: any) =>
        mapEmployeeExamHistory(item)
      );

      const activeExam = mappedData.find(
        (item) =>
          item.exam.status !== EXAM_STATUS.DRAFT &&
          item.exam.status !== EXAM_STATUS.COMPLETED
      );

      if (!activeExam) {
        setCurrentExam(null);
        return;
      }

      // fetch detailed exam period (current exam)
      const detailRes: any = await api.get({
        link: `/exams/employee/${user.id}/exam-periods/${activeExam.exam.id}`,
        setLoading: undefined,
      });

      const exam = mapEmployeeExamHistory(detailRes.returnData);

      if (exam?.examinee?.topic?.file?.id) {
        try {
          const file = await api.getFile({
            fileId: exam.examinee.topic.file.id,
          });
          exam.examinee.topic.file = file;
        } catch (e) {
          // ignore file fetch errors, still set exam
        }
      }

      setCurrentExam(exam ? exam : null);
    } catch (e) {
      setCurrentExam(null);
    } finally {
      setLoading(false);
    }
  }, [user, setCurrentExam]);

  return { refetch, loading } as const;
};

export default useCurrentExam;
