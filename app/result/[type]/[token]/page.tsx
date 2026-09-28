import { notFound } from 'next/navigation';
import { validateDiagnosisType } from '@/lib/constants/diagnosis-config';

/**
 * 결과 재조회/공유 페이지.
 *
 * TODO(구현 에이전트, docs/spec/02-api-spec.md GET /api/result/[token] 참고):
 * - 서버 컴포넌트에서 fetch로 결과 조회 (service role key는 API 라우트 안에서만 사용)
 * - 존재하지 않는 토큰이면 404
 * - components/diagnosis/shared/ResultCard로 렌더링
 */
export default function ResultPage({
  params,
}: {
  params: { type: string; token: string };
}) {
  const type = validateDiagnosisType(params.type);
  if (!type) {
    notFound();
  }

  return (
    <main className="wrap" style={{ paddingTop: 48, paddingBottom: 48 }}>
      <h1>결과 조회</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
        토큰 {params.token}에 대한 결과 조회는 아직 구현 전입니다 (Phase 1 스캐폴드).
      </p>
    </main>
  );
}
