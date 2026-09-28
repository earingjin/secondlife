import Link from 'next/link';
import { DIAGNOSIS_TYPE_LIST, DIAGNOSIS_CONFIGS } from '@/lib/constants/diagnosis-config';

/**
 * 랜딩 페이지 — 현재는 라우팅 배선만 확인하는 임시 스텁.
 *
 * TODO(구현 에이전트, docs/spec/01-component-spec.md 8절 3단계):
 * docs/reference/second-life-design-v2.html의 실제 마크업(hero, feat-grid, how 섹션 등)을
 * components/landing/{Hero,DiagnosisCards,HowItWorks,Footer}.tsx로 그대로 이식하고
 * 이 페이지에서 조립할 것. 지금의 카드 3개 링크(href="/diagnosis/{slug}")는
 * 원본 카드의 href를 교체할 때 반드시 유지해야 하는 유일한 실제 동작 변경점이다.
 */
export default function LandingPage() {
  return (
    <main className="wrap" style={{ paddingTop: 48, paddingBottom: 48 }}>
      <h1>세컨라이프 디자인</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
        랜딩 UI는 아직 이식 전입니다 (Phase 1 스캐폴드). 아래 링크로 각 진단 라우팅이 정상
        동작하는지만 확인할 수 있습니다.
      </p>

      <ul style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        {DIAGNOSIS_TYPE_LIST.map((type) => {
          const config = DIAGNOSIS_CONFIGS[type];
          return (
            <li key={type}>
              <Link href={`/diagnosis/${config.slug}`} style={{ color: 'var(--coral-deep)' }}>
                {config.label} 시작하기 →
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
