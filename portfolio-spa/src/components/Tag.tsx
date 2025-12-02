interface TagProps {
  children: string;
  electric?: boolean;
}

export function Tag({ children, electric = false }: TagProps) {
  return (
    <span className={`rf-tag ${electric ? 'electric' : ''}`}>
      {children}
    </span>
  );
}

interface TagListProps {
  tags: string[];
  electric?: boolean;
}

export function TagList({ tags, electric = false }: TagListProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {tags.map(tag => (
        <Tag key={tag} electric={electric}>{tag}</Tag>
      ))}
    </div>
  );
}

