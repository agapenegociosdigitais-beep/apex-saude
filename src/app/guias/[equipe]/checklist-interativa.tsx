'use client';

import { useState, useEffect } from 'react';

interface Props {
  id: string;
  itens: string[];
}

export function CheckListInterativa({ id, itens }: Props) {
  const key = `checklist-${id}`;
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, [key]);

  function toggle(i: number) {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  const total = itens.length;
  const feito = Object.values(checked).filter(Boolean).length;
  const pct = total > 0 ? Math.round((feito / total) * 100) : 0;

  return (
    <div>
      {/* Barra de progresso */}
      <div className="mt-2 mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{feito}/{total} concluídos</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-gray-400'}`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Itens clicáveis */}
      <ul className="space-y-2">
        {itens.map((item, i) => (
          <li key={i}
            onClick={() => toggle(i)}
            className={`flex items-start gap-2.5 text-sm p-2 rounded-lg cursor-pointer transition-colors ${
              checked[i] ? 'bg-emerald-50 line-through text-gray-500' : 'hover:bg-gray-50 text-gray-700'
            }`}>
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs transition-colors ${
              checked[i] ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300'
            }`}>
              {checked[i] ? '✓' : ''}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
