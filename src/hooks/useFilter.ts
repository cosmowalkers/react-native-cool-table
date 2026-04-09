import { useState, useCallback, useMemo, useRef } from 'react';
import { isFunction } from 'lodash';
import type {
  IFilterConfig,
  IFilterState,
  ITableColumn,
  ITableProps,
  TItem,
} from '../types';
import useUpdateEffect from './useUpdateEffect';

interface IUseFilterParams {
  filterConfig?: IFilterConfig;
  columns: ITableColumn[];
  data: TItem[];
  onFilterChange?: ITableProps['onFilterChange'];
}

interface IUseFilterReturn {
  filterStates: IFilterState[];
  setFilterState: (
    columnKey: string,
    values: (string | number | boolean)[]
  ) => void;
  clearFilterState: (columnKey?: string) => void;
  filteredData: TItem[];
}

const useFilter = ({
  filterConfig,
  columns,
  data,
  onFilterChange,
}: IUseFilterParams): IUseFilterReturn => {
  const [filterStates, setFilterStates] = useState<IFilterState[]>([]);

  const onFilterChangeRef = useRef(onFilterChange);
  onFilterChangeRef.current = onFilterChange;

  const setFilterState = useCallback(
    (columnKey: string, values: (string | number | boolean)[]) => {
      setFilterStates((prev) => {
        const next = prev.filter((f) => f.columnKey !== columnKey);
        if (values.length > 0) {
          next.push({ columnKey, values });
        }
        return next;
      });
    },
    []
  );

  const clearFilterState = useCallback((columnKey?: string) => {
    if (columnKey) {
      setFilterStates((prev) => prev.filter((f) => f.columnKey !== columnKey));
    } else {
      setFilterStates([]);
    }
  }, []);

  // Filter change callback
  useUpdateEffect(() => {
    if (filterStates.length === 0) return;
    const lastFilter = filterStates[filterStates.length - 1];
    if (lastFilter && onFilterChangeRef.current) {
      const column = columns.find((c) => c.key === lastFilter.columnKey);
      if (column) {
        onFilterChangeRef.current({ filters: filterStates, column });
      }
    }
  }, [filterStates]);

  // Filtered data (local filtering)
  const filteredData = useMemo(() => {
    if (filterConfig?.remote) return data;
    if (filterStates.length === 0) return data;

    return data.filter((row) => {
      return filterStates.every((fs) => {
        const column = columns.find((c) => c.key === fs.columnKey);
        if (!column) return true;
        if (isFunction(column.filterMethod)) {
          return fs.values.some((v) =>
            column.filterMethod!({ value: v, row, column })
          );
        }
        return fs.values.includes(row[fs.columnKey]);
      });
    });
  }, [data, filterStates, filterConfig?.remote, columns]);

  return { filterStates, setFilterState, clearFilterState, filteredData };
};

export default useFilter;
