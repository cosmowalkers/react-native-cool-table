import { useState, useMemo, useCallback, useRef } from 'react';
import { isNil } from 'lodash';
import type { ITableColumn, IColumnVisibilityConfig } from '../types';
import useUpdateEffect from './useUpdateEffect';

interface IUseColumnVisibilityParams {
  columns: ITableColumn[];
  columnVisibilityConfig?: IColumnVisibilityConfig;
}

interface IUseColumnVisibilityReturn {
  visibleColumns: ITableColumn[];
  hiddenColumnKeys: Set<string>;
  hideColumn: (key: string) => void;
  showColumn: (key: string) => void;
  getHiddenColumns: () => string[];
}

export const useColumnVisibility = ({
  columns,
  columnVisibilityConfig,
}: IUseColumnVisibilityParams): IUseColumnVisibilityReturn => {
  const isControlledRef = useRef(
    !isNil(columnVisibilityConfig?.controlledHiddenKeys)
  );
  isControlledRef.current = !isNil(
    columnVisibilityConfig?.controlledHiddenKeys
  );

  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<Set<string>>(
    () =>
      new Set(
        columnVisibilityConfig?.controlledHiddenKeys ??
          columnVisibilityConfig?.hiddenKeys ??
          []
      )
  );

  // Stable ref for onChange to avoid triggering effects
  const onChangeRef = useRef(columnVisibilityConfig?.onChange);
  onChangeRef.current = columnVisibilityConfig?.onChange;

  const alwaysVisibleRef = useRef(columnVisibilityConfig?.alwaysVisible);
  alwaysVisibleRef.current = columnVisibilityConfig?.alwaysVisible;

  // Controlled mode: sync from controlledHiddenKeys (skip mount)
  useUpdateEffect(() => {
    if (isControlledRef.current) {
      setHiddenColumnKeys(
        new Set(columnVisibilityConfig?.controlledHiddenKeys ?? [])
      );
    }
  }, [columnVisibilityConfig?.controlledHiddenKeys]);

  // Non-controlled mode: fire onChange when hidden keys change (skip mount)
  useUpdateEffect(() => {
    if (!isControlledRef.current) {
      onChangeRef.current?.({ hiddenKeys: Array.from(hiddenColumnKeys) });
    }
  }, [hiddenColumnKeys]);

  const hideColumn = useCallback((key: string) => {
    const alwaysVisible = alwaysVisibleRef.current ?? [];
    if (alwaysVisible.includes(key)) return;

    setHiddenColumnKeys((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const showColumn = useCallback((key: string) => {
    setHiddenColumnKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const getHiddenColumns = useCallback(
    () => Array.from(hiddenColumnKeys),
    [hiddenColumnKeys]
  );

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumnKeys.has(c.key)),
    [columns, hiddenColumnKeys]
  );

  return {
    visibleColumns,
    hiddenColumnKeys,
    hideColumn,
    showColumn,
    getHiddenColumns,
  };
};

export default useColumnVisibility;
