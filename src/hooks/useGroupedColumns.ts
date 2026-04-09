import { useMemo } from 'react';
import { flattenColumns, getHeaderLevels } from '../utils/columnUtils';
import type { ITableColumn, THeaderLevel } from '../types';

interface IUseGroupedColumnsParams {
  columns: ITableColumn[];
}

interface IUseGroupedColumnsReturn {
  leafColumns: ITableColumn[];
  headerLevels: THeaderLevel[];
  hasGroupedHeaders: boolean;
}

export function useGroupedColumns({
  columns,
}: IUseGroupedColumnsParams): IUseGroupedColumnsReturn {
  const leafColumns = useMemo(() => flattenColumns(columns), [columns]);

  const headerLevels = useMemo(() => getHeaderLevels(columns), [columns]);

  const hasGroupedHeaders = useMemo(
    () => columns.some((col) => col.children && col.children.length > 0),
    [columns]
  );

  return { leafColumns, headerLevels, hasGroupedHeaders };
}

export default useGroupedColumns;
