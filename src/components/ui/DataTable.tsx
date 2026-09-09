import { ReactNode, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Filter, Search, X } from 'lucide-react';

type SortDirection = 'asc' | 'desc';

interface SortState<T> {
  key: keyof T | string;
  direction: SortDirection;
}

export function useTableSort<T>(rows: T[], getValue: (row: T, key: string) => string | number, initialKey: string, initialDirection: SortDirection = 'desc') {
  const [sort, setSort] = useState<SortState<T>>({ key: initialKey, direction: initialDirection });

  const sortedRows = useMemo(() => [...rows].sort((a, b) => {
    const first = getValue(a, String(sort.key));
    const second = getValue(b, String(sort.key));
    const result = typeof first === 'number' && typeof second === 'number'
      ? first - second
      : String(first).localeCompare(String(second), undefined, { numeric: true, sensitivity: 'base' });
    return sort.direction === 'asc' ? result : -result;
  }), [rows, getValue, sort]);

  const toggleSort = (key: string) => setSort(current => (
    current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }
  ));

  return { sortedRows, sort, toggleSort };
}

export function SortableHeader({ label, column, sortKey, direction, onSort, className = '' }: {
  label: string;
  column: string;
  sortKey: string;
  direction: SortDirection;
  onSort: (column: string) => void;
  className?: string;
}) {
  const isActive = sortKey === column;
  const Icon = isActive ? (direction === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <th aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={`px-4 py-3 font-semibold ${className}`}>
      <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1.5 rounded-md text-left hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30">
        {label}<Icon className={`h-3.5 w-3.5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} aria-hidden="true" />
      </button>
    </th>
  );
}

export function DataTableToolbar({ search, onSearchChange, searchPlaceholder, filter, resultCount, onClear }: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filter?: ReactNode;
  resultCount: number;
  onClear?: () => void;
}) {
  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input type="search" value={search} onChange={event => onSearchChange(event.target.value)} placeholder={searchPlaceholder} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          {search && <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search" title="Clear search" className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X className="h-4 w-4" /></button>}
        </div>
        {filter && <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />{filter}</div>}
        {onClear && <button type="button" onClick={onClear} className="text-sm font-medium text-gray-600 hover:text-gray-900">Reset</button>}
      </div>
      <p className="mt-3 text-xs text-gray-500">{resultCount} result{resultCount === 1 ? '' : 's'}</p>
    </div>
  );
}

