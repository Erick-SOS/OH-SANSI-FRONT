import React from 'react';

interface OlimpiaItem {
  id: number;
  numero: number;
  nombre: string;
  areaCompetencia: string;
  nivel: string;
  modalidad: string;
  estado: string;
  nota: number;
  distincion: string;
}

interface Column {
  key: keyof OlimpiaItem | 'certificado';
  title: string;
  align: 'left' | 'center';
  sortable?: boolean;
  render?: (value: unknown, row: OlimpiaItem) => React.ReactNode;
}

interface TablaOlimpiasPremiosProps {
  datos: OlimpiaItem[];
  conOrdenamiento?: boolean;
  onOrdenar?: (column: string, direction: 'asc' | 'desc') => void;
  onDescargarCertificado?: (id: number) => void;
  edits: Record<number, Partial<OlimpiaItem>>;
  onValueChange: (id: number, field: keyof OlimpiaItem, value: string | number) => void;
  savedEdits: Record<number, Partial<OlimpiaItem>>;
}

const TablaOlimpiasPremios: React.FC<TablaOlimpiasPremiosProps> = ({
  datos,
  conOrdenamiento,
  onOrdenar,
  onDescargarCertificado,
  edits,
  onValueChange,
  savedEdits
}) => {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (!conOrdenamiento || !onOrdenar) return;
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onOrdenar(column, newDirection);
  };

  const columns: Column[] = [
    { key: 'numero', title: '#', align: 'center', sortable: true },
    { key: 'nombre', title: 'Nombre Completo', align: 'left', sortable: true },
    { key: 'areaCompetencia', title: 'Área', align: 'left', sortable: true },
    { key: 'nivel', title: 'Nivel', align: 'left', sortable: true },
    { key: 'modalidad', title: 'Modalidad', align: 'center', sortable: true },
    { key: 'estado', title: 'Estado', align: 'center', sortable: true },
    {
      key: 'nota',
      title: 'Nota',
      align: 'center',
      render: (valor: unknown, fila: OlimpiaItem) => {
        const notaActual = edits[fila.id]?.nota ?? (valor as number);
        return (
          <input
            type="text"
            value={notaActual}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                onValueChange(fila.id, 'nota', val === '' ? 0 : Number(val));
              }
            }}
            className={`w-16 text-center border rounded-lg px-2 py-1 text-sm
              ${edits[fila.id]?.nota !== undefined && edits[fila.id]?.nota !== (valor as number)
                ? 'border-red-500 bg-red-50'
                : savedEdits[fila.id]?.nota !== undefined
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
          />
        );
      }
    },
    { key: 'distincion', title: 'Distinción', align: 'center', sortable: true },
    {
      key: 'certificado',
      title: 'Certificado',
      align: 'center',
      render: (_: unknown, fila: OlimpiaItem) => (
        <button
          onClick={() => onDescargarCertificado?.(fila.id)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xl"
          title="Descargar certificado"
        >
          Download
        </button>
      )
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-${col.align} cursor-${col.sortable ? 'pointer' : 'default'}`}
              >
                <div className={`flex items-center justify-${col.align === 'center' ? 'center' : 'start'}`}>
                  {col.title}
                  {conOrdenamiento && col.sortable && sortColumn === col.key && (
                    <span className="ml-1">{sortDirection === 'asc' ? 'Up' : 'Down'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {datos.map((fila) => (
            <tr key={fila.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {columns.map(col => {
                const valor = col.key === 'certificado' ? null : fila[col.key as keyof OlimpiaItem];
                return (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-${col.align === 'center' ? 'center' : 'left'} text-gray-900 dark:text-gray-100`}
                  >
                    {col.render ? col.render(valor, fila) : valor}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaOlimpiasPremios;