import { ReactNode } from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface RichTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
}

export function RichTable<T>({ columns, data, keyField }: RichTableProps<T>) {
  return (
    <table className="rf-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={String(col.key)} style={{ width: col.width }}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={String(item[keyField])}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.render 
                  ? col.render(item) 
                  : String((item as Record<string, unknown>)[col.key as string] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

