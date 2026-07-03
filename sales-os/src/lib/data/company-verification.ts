// 客户信息核验状态：企查查用于主体核验，腾讯地图用于地址/坐标核验
// 行数目标：≤160

export type VerificationStatus = 'verified' | 'candidate' | 'ambiguous' | 'unmatched' | 'pending';
export type LocationStatus = 'verified' | 'qcc_address_pending_geocode' | 'mock_coordinate' | 'pending';

export interface QccCandidate {
  name: string;
  creditCode?: string;
  legalPerson?: string;
  establishedAt?: string;
  status?: string;
}

export interface CompanyVerification {
  companyId: string;
  businessStatus: VerificationStatus;
  locationStatus: LocationStatus;
  source: 'qcc' | 'mock' | 'manual';
  note: string;
  qccCandidates?: QccCandidate[];
}

const DEFAULT_VERIFICATION: Omit<CompanyVerification, 'companyId'> = {
  businessStatus: 'pending',
  locationStatus: 'mock_coordinate',
  source: 'mock',
  note: '当前为销售系统 mock 客户，需通过企查查锁定工商主体后，再用注册地址进行腾讯地图 geocode。',
};

export const COMPANY_VERIFICATIONS: CompanyVerification[] = [
  {
    companyId: 'ns-01',
    businessStatus: 'candidate',
    locationStatus: 'qcc_address_pending_geocode',
    source: 'qcc',
    note: '企查查检索到近似主体，但尚未由用户确认，不能视为已核验。确认后应拉取工商注册地址并重新 geocode。',
    qccCandidates: [
      {
        name: '深圳市瀚云智联科技有限公司',
        creditCode: '91440300079849399F',
        legalPerson: '孙德愿',
        establishedAt: '2013-09-16',
        status: '存续',
      },
    ],
  },
  {
    companyId: 'ns-03',
    businessStatus: 'ambiguous',
    locationStatus: 'mock_coordinate',
    source: 'qcc',
    note: '企查查返回多个“汇金通”相关主体，需用户选择后才能锁定客户身份与注册地址。',
    qccCandidates: [
      { name: '深圳前海汇金通银金融服务有限公司', creditCode: '91440300342714433Y', legalPerson: '张建国', establishedAt: '2015-06-08', status: '存续' },
      { name: '深圳市汇金通电子科技有限公司', creditCode: '91440300MA5F3BH98G', legalPerson: '张婉霞', establishedAt: '2018-04-19', status: '存续' },
      { name: '深圳前海汇金通科技有限公司', creditCode: '9144030034987910XU', legalPerson: '张跃军', establishedAt: '2015-08-12', status: '存续' },
      { name: '深圳市汇金通成科技有限公司', creditCode: '91440300319303919P', legalPerson: '林怡鸿', establishedAt: '2014-09-25', status: '注销' },
      { name: '深圳市融汇金通科技有限公司', legalPerson: '李卫忠', establishedAt: '2013-01-14', status: '注销' },
    ],
  },
  {
    companyId: 'ns-02',
    businessStatus: 'unmatched',
    locationStatus: 'mock_coordinate',
    source: 'qcc',
    note: '企查查未匹配到“深圳深海跨境电商有限公司”，需确认企业全称或统一社会信用代码。',
  },
];

export function getCompanyVerification(companyId: string): CompanyVerification {
  return COMPANY_VERIFICATIONS.find(v => v.companyId === companyId) ?? {
    companyId,
    ...DEFAULT_VERIFICATION,
  };
}

export function verificationLabel(status: VerificationStatus) {
  const labels: Record<VerificationStatus, string> = {
    verified: '企查查已核验',
    candidate: '企查查候选',
    ambiguous: '主体待选择',
    unmatched: '企查查未匹配',
    pending: '待核验',
  };
  return labels[status];
}

export function locationLabel(status: LocationStatus) {
  const labels: Record<LocationStatus, string> = {
    verified: '坐标已核验',
    qcc_address_pending_geocode: '待地址解析',
    mock_coordinate: 'Mock 坐标',
    pending: '待定位',
  };
  return labels[status];
}
