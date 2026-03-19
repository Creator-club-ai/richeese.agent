export function EmptyState({
  label,
  detail,
}: {
  label: string;
  detail: string;
}): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-dashed border-chrome-200 bg-chrome-50/70 p-8 text-center">
      <p className="font-medium text-ink">{label}</p>
      <p className="mt-2 text-sm leading-6 text-chrome-600">{detail}</p>
    </div>
  );
}
