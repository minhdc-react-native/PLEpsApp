// Tình trạng hợp đồng
export const CONTRACT_STATUS_TYPES = {
  PERMANENT_CONTRACT: 'Hợp đồng lao động không xác định thời hạn',
  CONTRACT_3_YEARS: 'Hợp đồng 3 năm',
  CONTRACT_1_YEAR: 'Hợp đồng 1 năm',
  PROBATION_CONTRACT: 'Hợp đồng thử việc',
  HDLD_PERMANENT: 'HĐLĐ Không xác định thời hạn',
  HDLD_FIXED_TERM_2: 'HĐLĐ xác định thời hạn (lần 2)',
  HDLD_FIXED_TERM_1: 'HĐLĐ xác định thời hạn (lần 1)',
  HDLD_FIXED_TERM_1YR_ANNUAL: 'HĐLĐ xác định thời hạn 1 năm (từng năm)',
  CONSULTANCY_CONTRACT: 'HĐTV',
} as const;

export type ContractStatus =
  (typeof CONTRACT_STATUS_TYPES)[keyof typeof CONTRACT_STATUS_TYPES];
