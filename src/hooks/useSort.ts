import { useState, useRef } from 'react';
import type {
  ISortConfig,
  ITableColumn,
  TSortState,
  TMultiSortState,
  TSortType,
  TSortItem,
} from '../types';
import useUpdateEffect from './useUpdateEffect';

interface IUseSortParams {
  sortConfig?: ISortConfig;
  columns: ITableColumn[];
  onSortChange?: (params: {
    key: string;
    colIndex: number;
    sort: TSortType;
    sortList?: TSortItem[];
  }) => void;
}

interface IUseSortReturn {
  sortState: TSortState;
  setSortState: React.Dispatch<React.SetStateAction<TSortState>>;
  multiSortState: TMultiSortState;
  setMultiSortState: React.Dispatch<React.SetStateAction<TMultiSortState>>;
}

const useSort = ({
  sortConfig,
  columns,
  onSortChange,
}: IUseSortParams): IUseSortReturn => {
  const [sortState, setSortState] = useState<TSortState>(() => {
    if (sortConfig?.defaultSort) {
      const ds = sortConfig.defaultSort;
      if (Array.isArray(ds)) {
        return ds.length > 0 ? ds[0]! : null;
      }
      return ds;
    }
    const col = columns.find((c) => c.defaultSort);
    return col?.defaultSort
      ? { columnKey: col.key, sort: col.defaultSort }
      : null;
  });

  const [multiSortState, setMultiSortState] = useState<TMultiSortState>(() => {
    if (sortConfig?.defaultSort) {
      const ds = sortConfig.defaultSort;
      return Array.isArray(ds) ? ds : [ds];
    }
    const col = columns.find((c) => c.defaultSort);
    return col?.defaultSort
      ? [{ columnKey: col.key, sort: col.defaultSort }]
      : [];
  });

  const onSortChangeRef = useRef(onSortChange);
  onSortChangeRef.current = onSortChange;

  useUpdateEffect(() => {
    if (sortConfig?.multiple) {
      if (multiSortState.length > 0) {
        const last = multiSortState[multiSortState.length - 1]!;
        const colIndex = columns.findIndex((c) => c.key === last.columnKey);
        onSortChangeRef.current?.({
          key: last.columnKey,
          colIndex,
          sort: last.sort,
          sortList: multiSortState,
        });
      }
    } else if (sortState) {
      const colIndex = columns.findIndex((c) => c.key === sortState.columnKey);
      onSortChangeRef.current?.({
        key: sortState.columnKey,
        colIndex,
        sort: sortState.sort,
      });
    }
  }, [sortState, multiSortState]);

  return { sortState, setSortState, multiSortState, setMultiSortState };
};

export default useSort;
