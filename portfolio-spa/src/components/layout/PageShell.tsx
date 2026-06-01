interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={`page-shell ${className ?? ''}`}>
      {children}
    </div>
  );
}
