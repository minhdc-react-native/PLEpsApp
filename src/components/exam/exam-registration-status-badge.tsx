import {
  EXAM_REGISTRATION_STATUS,
  EXAM_REGISTRATION_STATUS_LABELS,
  ExamRegistrationStatus,
} from "@/types/exam/enums/exam-registration-status.enum";
import { Badge } from "../badge";

export const ExamRegistrationStatusBadge = ({
  status,
}: {
  status: ExamRegistrationStatus;
}) => {
  const getBadgeVariant = () => {
    switch (status) {
      case EXAM_REGISTRATION_STATUS.SIGNED:
        return "success";
      case EXAM_REGISTRATION_STATUS.POSTPONED:
      case EXAM_REGISTRATION_STATUS.REJECTED:
        return "error";
      case EXAM_REGISTRATION_STATUS.ADDED:
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Badge variant={getBadgeVariant()}>
      {EXAM_REGISTRATION_STATUS_LABELS[status]}
    </Badge>
  );
};
