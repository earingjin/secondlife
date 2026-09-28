import { create } from 'zustand';
import type { Answer, DiagnosisResult, DiagnosisType } from '../types/diagnosis';

/**
 * 진단 진행 상태 스토어.
 *
 * 핵심 규칙 (docs/spec/01-component-spec.md 6절):
 * - localStorage 키는 반드시 진단 타입을 포함해 3개 진단이 서로 섞이지 않게 한다.
 * - reset(type)을 호출하면 해당 타입의 이전 진행 상태만 초기화한다.
 * - submit()은 실제 구현 단계(Supabase 연동, 8절)에서 /api/diagnosis/submit 호출로 채운다.
 *   지금은 타입/시그니처만 정의된 스텁 상태.
 */

function storageKey(type: DiagnosisType) {
  return `diagnosis_${type}`;
}

interface PersistedProgress {
  currentIndex: number;
  answers: Answer[];
}

function readPersisted(type: DiagnosisType): PersistedProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(type));
    return raw ? (JSON.parse(raw) as PersistedProgress) : null;
  } catch {
    return null;
  }
}

function writePersisted(type: DiagnosisType, progress: PersistedProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(type), JSON.stringify(progress));
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) — 진행 상태 저장만 실패, 진단 자체는 계속 가능
  }
}

function clearPersisted(type: DiagnosisType) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(storageKey(type));
  } catch {
    // no-op
  }
}

interface DiagnosisState {
  type: DiagnosisType | null;
  currentIndex: number;
  answers: Answer[];
  result: DiagnosisResult | null;

  reset: (type: DiagnosisType) => void;
  answer: (a: Answer) => void;
  restoreIfExists: (type: DiagnosisType) => Answer[] | null;
  setResult: (result: DiagnosisResult) => void;
  /**
   * TODO(8절 - Supabase 연동 단계): POST /api/diagnosis/submit 호출로 구현.
   * 지금은 시그니처만 정의된 스텁.
   */
  submit: () => Promise<{ token: string; shareUrl: string }>;
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  type: null,
  currentIndex: 0,
  answers: [],
  result: null,

  reset: (type) => {
    clearPersisted(type);
    set({ type, currentIndex: 0, answers: [], result: null });
  },

  answer: (a) => {
    const { type, answers, currentIndex } = get();
    if (!type) return;
    const nextAnswers = [...answers.filter((x) => x.questionId !== a.questionId), a];
    const nextIndex = currentIndex + 1;
    set({ answers: nextAnswers, currentIndex: nextIndex });
    writePersisted(type, { currentIndex: nextIndex, answers: nextAnswers });
  },

  restoreIfExists: (type) => {
    const persisted = readPersisted(type);
    if (!persisted || persisted.answers.length === 0) return null;
    set({ type, currentIndex: persisted.currentIndex, answers: persisted.answers });
    return persisted.answers;
  },

  setResult: (result) => set({ result }),

  submit: async () => {
    throw new Error(
      'Not implemented yet — docs/spec/02-api-spec.md의 POST /api/diagnosis/submit 참고해 구현할 것 (Phase: Supabase 연동 단계)'
    );
  },
}));
