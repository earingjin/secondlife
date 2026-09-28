import { notFound } from 'next/navigation';
import { getDiagnosisConfig } from '@/lib/constants/diagnosis-config';

/**
 * 3개 진단 공용 동적 라우트.
 * /diagnosis/life-expectancy, /diagnosis/life-design, /diagnosis/leisure-alter-ego
 * 랜딩페이지를 거치지 않고 이 URL로 직접 접근해도 진단이 시작되어야 한다 (확정 요구사항 3번).
 *
 * TODO(구현 에이전트, docs/spec/01-component-spec.md 8절 5~7단계):
 * - components/diagnosis/shared/QuestionnaireFrame 등을 이용해 실제 질문 흐름 렌더링
 * - lib/store/diagnosisStore의 reset/restoreIfExists/submit 연결
 * - 완료 시 /result/[type]/[token]으로 라우팅
 *
 * 핵심 규칙: params.type이 3개 슬러그 중 하나가 아니면 반드시 notFound()로 404 처리할 것
 * (임의 경로 접근 방지).
 */
export default function DiagnosisPage({ params }: { params: { type: string } }) {
  const config = getDiagnosisConfig(params.type);

  if (!config) {
    notFound();
  }

  return (
    <main className="wrap" style={{ paddingTop: 48, paddingBottom: 48 }}>
      <h1>{config!.label}</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
        질문지 UI는 아직 이식 전입니다 (Phase 1 스캐폴드). 라우팅과 슬러그 검증만 동작합니다.
      </p>
    </main>
  );
}
