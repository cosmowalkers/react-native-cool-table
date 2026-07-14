import { useState, useCallback, useEffect, useRef } from 'react';
import type { IResizeConfig, ITableColumn } from '../types';

interface IUseColumnResizeParams {
  resizeConfig?: IResizeConfig;
  columns: ITableColumn[];
}

interface IUseColumnResizeReturn {
  columnWidths: Map<string, number>;
  setColumnWidth: (key: string, width: number) => void;
  getColumnWidths: () => Map<string, number>;
}

export const useColumnResize = ({
  resizeConfig,
  columns,
}: IUseColumnResizeParams): IUseColumnResizeReturn => {
  const enabled = resizeConfig?.enabled === true;

  const [columnWidths, setColumnWidths] = useState<Map<string, number>>(() => {
    if (!enabled) return new Map();
    const map = new Map<string, number>();
    columns.forEach((col) => {
      if (col.width != null) {
        map.set(col.key, Number(col.width));
      }
    });
    return map;
  });

  // Keep a ref to columns for callback
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  // Keep a ref to resizeConfig for callback
  const resizeConfigRef = useRef(resizeConfig);
  resizeConfigRef.current = resizeConfig;

  // When columns change, add new columns to map (don't reset existing)
  useEffect(() => {
    if (!enabled) return;
    setColumnWidths((prev) => {
      let changed = false;
      const next = new Map(prev);
      columns.forEach((col) => {
        if (!next.has(col.key) && col.width != null) {
          next.set(col.key, Number(col.width));
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [columns, enabled]);

  const pendingResizeRef = useRef<{ key: string; width: number } | null>(null);
  const isUserResizeRef = useRef(false);

  const setColumnWidth = useCallback(
    (key: string, width: number) => {
      if (!enabled) return;

      const config = resizeConfigRef.current;
      const { minWidth, maxWidth } = config ?? {};

      let clamped = width;
      if (minWidth != null && clamped < minWidth) {
        clamped = minWidth;
      }
      if (maxWidth != null && clamped > maxWidth) {
        clamped = maxWidth;
      }

      isUserResizeRef.current = true;
      pendingResizeRef.current = { key, width: clamped };
      setColumnWidths((prev) => {
        if (prev.get(key) === clamped) {
          pendingResizeRef.current = null;
          return prev;
        }
        const next = new Map(prev);
        next.set(key, clamped);
        return next;
      });
    },
    [enabled]
  );

  // Fire onResizeEnd after state has committed
  useEffect(() => {
    const pending = pendingResizeRef.current;
    if (!pending || !isUserResizeRef.current) return;
    isUserResizeRef.current = false;
    pendingResizeRef.current = null;

    const config = resizeConfigRef.current;
    if (config?.onResizeEnd) {
      const column = columnsRef.current.find((c) => c.key === pending.key);
      if (column) {
        config.onResizeEnd({ column, width: pending.width });
      }
    }
  }, [columnWidths]);

  const getColumnWidths = useCallback(() => columnWidths, [columnWidths]);

  return { columnWidths, setColumnWidth, getColumnWidths };
};

export default useColumnResize;
