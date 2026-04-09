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

      let changed = false;
      setColumnWidths((prev) => {
        if (prev.get(key) === clamped) return prev;
        const next = new Map(prev);
        next.set(key, clamped);
        changed = true;
        return next;
      });

      // Fire onResizeEnd callback only when width actually changed
      if (changed && config?.onResizeEnd) {
        const column = columnsRef.current.find((c) => c.key === key);
        if (column) {
          config.onResizeEnd({ column, width: clamped });
        }
      }
    },
    [enabled]
  );

  const getColumnWidths = useCallback(() => columnWidths, [columnWidths]);

  return { columnWidths, setColumnWidth, getColumnWidths };
};

export default useColumnResize;
