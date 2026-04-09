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

/**
 * 递归过滤列：隐藏指定 key 的列，并移除所有子列都被隐藏的分组父列。
 */
function filterColumnsRecursive(
  columns: ITableColumn[],
  hiddenKeys: Set<string>
): ITableColumn[] {
  const result: ITableColumn[] = [];

  for (const col of columns) {
    // 如果该列直接被隐藏，跳过
    if (hiddenKeys.has(col.key)) continue;

    if (col.children && col.children.length > 0) {
      // 递归过滤子列
      const filteredChildren = filterColumnsRecursive(col.children, hiddenKeys);
      // 如果过滤后没有剩余子列，移除整个分组父列
      if (filteredChildren.length === 0) continue;
      // 保留父列，更新 children
      result.push({ ...col, children: filteredChildren });
    } else {
      result.push(col);
    }
  }

  return result;
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
    () => filterColumnsRecursive(columns, hiddenColumnKeys),
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
