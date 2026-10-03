import type { FieldExample } from './types';

/** Usos del algoritmo en otras ingenierías (pestaña «Ejemplo real»). */
export function InYourField({ items }: { items: FieldExample[] }) {
  return (
    <section className="mlx-field" aria-label="En tu área">
      <h4>En tu área</h4>
      <ul>
        {items.map((item) => (
          <li key={item.area}>
            <b>{item.area}:</b> {item.example}
          </li>
        ))}
      </ul>
    </section>
  );
}
