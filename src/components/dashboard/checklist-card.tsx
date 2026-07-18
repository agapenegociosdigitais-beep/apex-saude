interface ChecklistCardProps {
  titulo: string;
  itens: string[];
}

export function ChecklistCard({ titulo, itens }: ChecklistCardProps) {
  return (
    <section className="rounded-xl border border-apex-border bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-apex-ink">{titulo}</h2>
      <ul className="mt-4 space-y-2.5">
        {itens.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-apex-text">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-apex-gold" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
