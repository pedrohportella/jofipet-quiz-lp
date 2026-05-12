import { notFound } from 'next/navigation';
import { QuizStep } from '@/components/quiz/QuizStep';
import { quizConfig } from '@/lib/quiz/loader';

export function generateStaticParams() {
  return quizConfig.questions.map((_, index) => ({ step: String(index) }));
}

interface QuizStepPageProps {
  params: { step: string };
}

export default function QuizStepPage({ params }: QuizStepPageProps) {
  const index = Number(params.step);
  if (!Number.isInteger(index) || index < 0) notFound();
  if (index >= quizConfig.questions.length) notFound();

  return <QuizStep stepIndex={index} />;
}
