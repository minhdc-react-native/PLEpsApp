import { IArea } from "../system/area.model";
import { IDepartment } from "../system/department.model";
import { IPosition } from "../system/position.model";
import { IRank } from "../system/rank.model";
import { ITeam } from "../system/team.model";
import { ContractStatus } from "./enums/contract-status.enum";
import { Ethnicity } from "./enums/ethnicity.enum";
import { Gender } from "./enums/gender.enum";
import { HighestDegree } from "./enums/highest-degree.enum";
import { HighestEducationLevel } from "./enums/highest-education-level.enum";
import { PoliticalTheoryLevel } from "./enums/political-theory-level.enum";
import { PositionCategory } from "./enums/position-category.enum";
import { Religion } from "./enums/religion.enum";
import { TrainingMode } from "./enums/training-mode.enum";

export interface IEmployee {
  id: string;
  code: string;
  timeSheetCode: string;
  fullName: string;
  gender: Gender;
  birthDate: Date;
  email: string;
  phone: string;
  imageUrl: string | null;
  status: number;
  user: Partial<IUser>;
  department: Partial<IDepartment>;
  team: Partial<ITeam>;
  position: Partial<IPosition>;
  area: Partial<IArea>;
  idNo: string;
  issuingAuthority: string;
  issueDate: Date | null;
  rank: Partial<IRank>;
  personalInfo: IPersonalInfo;
  employmentInfo: IEmploymentInfo;
  educationInfo: IEducationInfo;
  currentRank?: number;
  rankScale?: number;
}

export interface IPersonalInfo {
  permanentAddress: string | null; // Hộ khẩu thường trú
  placeOfOrigin: string | null; // Quê quán
  currentAddress: string | null; // Chỗ ở hiện nay
  ethnicity: Ethnicity | null; // Dân tộc
  religion: Religion | null; // Tôn giáo
}

export interface IEducationInfo {
  generalEducationLevel: string | null; // Trình độ văn hóa
  highestEducationLevel: HighestEducationLevel | null; // Trình độ (cao nhất)
  highestDegree: HighestDegree | null; // Học vị (cao nhất)
  trainingField: string | null; // Ngành nghề đào tạo (CMC)
  trainingMode: TrainingMode | null; // Hình thức đào tạo (cao nhất)
  trainingInstitution: string | null; // Trường đào tạo
  politicalTheoryLevel: PoliticalTheoryLevel | null; // Trình độ LLCT
}

export interface IEmploymentInfo {
  contractStatus: ContractStatus | null; // Tình trạng hợp đồng
  contractNumber: string | null; // Số HĐLĐ
  contractEffectiveDate: Date | null; // Ngày hiệu lực hợp đồng
  industryEntryDate: Date | null; // Ngày vào ngành
  organizationEntryDate: Date | null; // Ngày vào cơ quan
  recruitmentDate: Date | null; // Ngày tuyển dụng
  terminationDate: Date | null; // Ngày nghỉ việc
  retiredDate: Date | null; // Ngày nghỉ hưu
  positionCategory: PositionCategory | null; // Phân loại chức danh
  appointmentDate: Date | null; // Thời gian bổ nhiệm
  managementLevel: number | null; // Trình độ quản lý
  workHistory: string | null; // Quá trình làm việc
}
