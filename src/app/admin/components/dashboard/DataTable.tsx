export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  columns: ColumnDef<T>[];
  data: T[];
}

export default function DataTable<T extends { id: string | number }>({ title, subtitle, columns, data }: DataTableProps<T>) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 bg-slate-900/50 border-b border-slate-800">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-4 font-medium uppercase tracking-wider ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className={`px-6 py-4 text-slate-300 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {col.cell ? col.cell(item) : String(item[col.accessorKey as keyof T] || '')}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
