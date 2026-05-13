'use client';

export function AttendantCard() {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl bg-cream px-4 py-3 text-left">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
        N
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-sm font-bold text-neutral-900">Nicole</p>
        <p className="text-xs text-neutral-700">Especialista pet Jofi · responde em minutos</p>
      </div>
      <span className="h-2.5 w-2.5 rounded-full bg-success-500" aria-label="online" />
    </div>
  );
}
