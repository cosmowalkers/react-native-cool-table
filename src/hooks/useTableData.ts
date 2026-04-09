import { useMemo } from 'react';
import type {
  ISortConfig,
  ITableColumn,
  TSortState,
  TMultiSortState,
  TItem,
} from '../types';

interface IUseTableDataParams {
  filteredData: TItem[];
  sortState: TSortState;
  multiSortState: TMultiSortState;
  sortConfig?: ISortConfig;
  columns: ITableColumn[];
}

const useTableData = ({
  filteredData,
  sortState,
  multiSortState,
  sortConfig,
  columns,
}: IUseTableDataParams): TItem[] => {
  const processedData = useMemo(() => {
    if (sortConfig?.remote) return filteredData;

    if (sortConfig?.multiple && multiSortState.length > 0) {
      const sorted = [...filteredData];
      sorted.sort((a, b) => {
        for (const s of multiSortState) {
          const column = columns.find((c) => c.key === s.columnKey);
          if (column?.sorter) {
            const cmp = column.sorter(a, b);
            if (cmp !== 0) return s.sort === 'asc' ? cmp : -cmp;
            continue;
          }
          const aVal = a[s.columnKey];
          const bVal = b[s.columnKey];
          if (aVal === bVal) continue;
          const cmp = aVal < bVal ? -1 : 1;
          return s.sort === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
      return sorted;
    }

    if (!sortConfig?.remote && sortState) {
      const sorted = [...filteredData];
      const column = columns.find((c) => c.key === sortState.columnKey);
      sorted.sort((a, b) => {
        if (column?.sorter) {
          const cmp = column.sorter(a, b);
          return sortState.sort === 'asc' ? cmp : -cmp;
        }
        const aVal = a[sortState.columnKey];
        const bVal = b[sortState.columnKey];
        if (aVal === bVal) return 0;
        const cmp = aVal < bVal ? -1 : 1;
        return sortState.sort === 'asc' ? cmp : -cmp;
      });
      return sorted;
    }

    return filteredData;
  }, [
    filteredData,
    sortState,
    multiSortState,
    sortConfig?.remote,
    sortConfig?.multiple,
    columns,
  ]);

  return processedData;
};

export default useTableData;
