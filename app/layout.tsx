import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '세컨라이프 디자인 | 나에게 맞는 진단부터 시작하세요',
  description: '기대수명, 생애설계, 여가 부캐 진단으로 나의 세컨라이프를 그려보세요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
