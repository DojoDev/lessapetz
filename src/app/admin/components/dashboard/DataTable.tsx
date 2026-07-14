import { Card, CardHeader } from '../ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../ui/Table';
import { EmptyState } from '../ui/EmptyState';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  columns: ColumnDef<T>[];
  data: T[];
}

export default function DataTable<T extends { id: string | number }>({ title, subtitle, emptyTitle, emptySubtitle, columns, data }: DataTableProps<T>) {

  return (
    <Card noPadding className="flex flex-col h-full">
      <CardHeader>
        <div>
          <h3 className="text-lg font-bold text-admin-text-primary">{title}</h3>
          {subtitle && <p className="text-admin-text-muted text-sm mt-1">{subtitle}</p>}
        </div>
      </CardHeader>
      
      {data.length === 0 ? (
        <div className="p-6">
          <EmptyState 
            title={emptyTitle || "Nenhum registro"} 
            description={emptySubtitle || "Não encontramos dados para exibir aqui."}
          />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <tr>
              {columns.map((col, i) => (
                <TableHead key={i} align={col.align || 'left'}>
                  {col.header}
                </TableHead>
              ))}
            </tr>
          </TableHeader>
          <tbody className="divide-y divide-admin-border/50">
            {data.map((item) => (
              <TableRow key={item.id}>
                {columns.map((col, i) => (
                  <TableCell key={i} align={col.align || 'left'} className="text-admin-text-secondary">
                    {col.cell ? col.cell(item) : String(item[col.accessorKey as keyof T] || '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
