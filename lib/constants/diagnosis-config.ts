import type { DiagnosisConfig, DiagnosisType } from '../types/diagnosis';

/**
 * 3개 진단의 단일 진입점(single source of truth).
 * 새 진단을 추가할 때는 이 배열에 항목을 추가하고
 * components/diagnosis/{slug}/ 폴더를 만들면 된다.
 */
export const DIAGNOSIS_CONFIGS: Record<DiagnosisType, DiagnosisConfig> = {
  'life-expectancy': {
    type: 'life-expectancy',
    label: '기대수명 진단',
    slug: 'life-expectancy',
    ogImage: '/og-images/life-expectancy.png',
  },
  'life-design': {
    type: 'life-design',
    label: '생애설계 진단',
    slug: 'life-design',
    ogImage: '/og-images/life-design.png',
  },
  'leisure-alter-ego': {
    type: 'leisure-alter-ego',
    label: '여가 부캐 진단',
    slug: 'leisure-alter-ego',
    ogImage: '/og-images/leisure-alter-ego.png',
  },
};

export const DIAGNOSIS_TYPE_LIST: DiagnosisType[] = Object.keys(
  DIAGNOSIS_CONFIGS
) as DiagnosisType[];

/**
 * URL 파라미터(문자열)를 검증된 DiagnosisType으로 변환.
 * app/diagnosis/[type]/page.tsx, app/result/[type]/[token]/page.tsx에서
 * 반드시 이 함수를 거쳐 invalid slug를 notFound() 처리할 것.
 */
export function validateDiagnosisType(value: string): DiagnosisType | null {
  return (DIAGNOSIS_TYPE_LIST as string[]).includes(value)
    ? (value as DiagnosisType)
    : null;
}

export function getDiagnosisConfig(value: string): DiagnosisConfig | null {
  const type = validateDiagnosisType(value);
  return type ? DIAGNOSIS_CONFIGS[type] : null;
}
