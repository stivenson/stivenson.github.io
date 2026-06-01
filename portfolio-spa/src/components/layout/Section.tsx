interface SectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Section({ children, title, className }: SectionProps) {
  return (
    <section className={`page-section ${className ?? ''}`}>
      {title && <p className="page-section-title">{title}</p>}
      {children}
    </section>
  );
}
