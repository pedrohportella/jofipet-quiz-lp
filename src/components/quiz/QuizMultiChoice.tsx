'use client';

import { QuizOption } from './QuizOption';
import type { MultiChoiceQuestion } from '@/lib/quiz/types';

export interface QuizMultiChoiceProps {
  question: MultiChoiceQuestion;
  selected: string[];
  onChange: (next: string[]) => void;
}

export function QuizMultiChoice({
  question,
  selected,
  onChange,
}: QuizMultiChoiceProps) {
  const toggle = (id: string) => {
    const exists = selected.includes(id);
    const next = exists
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(next);
  };

  return (
    <div
      role="group"
      aria-label={question.text}
      className="flex w-full flex-col gap-3"
    >
      {question.options.map((option) => (
        <QuizOption
          key={option.id}
          id={option.id}
          label={option.label}
          emoji={option.emoji}
          selected={selected.includes(option.id)}
          onSelect={toggle}
          variant="multi"
        />
      ))}
    </div>
  );
}
