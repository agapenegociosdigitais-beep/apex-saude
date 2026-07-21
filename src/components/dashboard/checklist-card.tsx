interface ChecklistCardProps {
  titulo: string;
  itens: string[];
}

export function ChecklistCard({ titulo, itens }: ChecklistCardProps) {
  return (
    <section className="bg-surface rounded-xl p-card-padding shadow-ambient border border-outline-variant/20">
      <h2 className="font-title-lg text-title-lg text-on-surface">{titulo}</h2>
      <ul className="mt-4 space-y-2.5">
        {itens.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 font-body-md text-body-md text-on-surface-variant"
          >
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
