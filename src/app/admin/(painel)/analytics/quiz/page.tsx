import { QuizAnalyticsClient } from './quiz-analytics-client';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Análise do Quiz · Admin Jofi',
  robots: { index: false, follow: false },
};

export default function QuizAnalyticsPage() {
  return <QuizAnalyticsClient />;
}
