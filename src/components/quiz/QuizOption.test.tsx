import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizOption } from './QuizOption';

describe('<QuizOption>', () => {
  it('calls onSelect with id when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <QuizOption
        id="cao"
        label="Cão"
        emoji="🐶"
        selected={false}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'Cão' }));
    expect(onSelect).toHaveBeenCalledWith('cao');
  });

  it('marks aria-checked true when selected', () => {
    render(
      <QuizOption
        id="cao"
        label="Cão"
        selected
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
  });

  it('does not fire onSelect when disabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <QuizOption
        id="cao"
        label="Cão"
        selected={false}
        disabled
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByRole('radio'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders checkbox role when variant is multi', () => {
    render(
      <QuizOption
        id="cao"
        label="Cão"
        selected={false}
        onSelect={() => {}}
        variant="multi"
      />,
    );
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});
