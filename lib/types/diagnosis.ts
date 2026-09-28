/**
 * 진단 관련 핵심 타입.
 * docs/spec/01-component-spec.md 4절과 동일한 정의를 유지할 것.
 */

export type DiagnosisType = 'life-expectancy' | 'life-design' | 'leisure-alter-ego';

export interface QuestionOption {
  label: string;
  value: number;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface Answer {
  questionId: string;
  value: number;
}

export interface DiagnosisResult {
  type: DiagnosisType;
  score: number;
  interpretation: string;
  /** 진단별 부가 데이터 (예: 여가부캐 유형 이름) */
  detail?: Record<string, unknown>;
}

export interface DiagnosisConfig {
  type: DiagnosisType;
  /** 랜딩/네비 등에 노출되는 한글 라벨 */
  label: string;
  /** URL 세그먼트 (/diagnosis/{slug}) */
  slug: DiagnosisType;
  /** OG 공유 이미지 경로 */
  ogImage: string;
}
