'use strict';

import { useState, useCallback, useRef } from 'react';
import { isNil } from 'lodash';
import type { IEditConfig, ITableColumn, TItem } from '../types';

interface IUseEditableCellParams {
  editConfig?: IEditConfig;
}

interface ISaveEditParams {
  row: TItem;
  column: ITableColumn;
  value: unknown;
  oldValue: unknown;
}

interface IUseEditableCellReturn {
  editingCell: { rowKey: string; columnKey: string } | null;
  setEditingCell: (cell: { rowKey: string; columnKey: string } | null) => void;
  editValues: Map<string, unknown>;
  setEditValue: (key: string, value: unknown) => void;
  cancelEdit: () => void;
  saveEdit: (params: ISaveEditParams) => Promise<boolean>;
}

export function useEditableCell({
  editConfig,
}: IUseEditableCellParams): IUseEditableCellReturn {
  const [editingCell, setEditingCell] = useState<{
    rowKey: string;
    columnKey: string;
  } | null>(null);
  const [editValues, setEditValues] = useState<Map<string, unknown>>(
    () => new Map()
  );

  // Use refs for config to avoid stale closures (same pattern as useRowDragSort)
  const configRef = useRef(editConfig);
  configRef.current = editConfig;

  const editingCellRef = useRef(editingCell);
  editingCellRef.current = editingCell;

  const setEditValue = useCallback((key: string, value: unknown) => {
    setEditValues((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const cancelEdit = useCallback(() => {
    const currentCell = editingCellRef.current;
    const config = configRef.current;

    if (currentCell) {
      const editKey = `${currentCell.rowKey}-${currentCell.columnKey}`;
      setEditValues((prev) => {
        const next = new Map(prev);
        next.delete(editKey);
        return next;
      });

      if (config?.onEditCancel) {
        config.onEditCancel({
          row: undefined as unknown as TItem,
          column: undefined as unknown as ITableColumn,
        });
      }
    }

    setEditingCell(null);
  }, []);

  const saveEdit = useCallback(
    async (params: ISaveEditParams): Promise<boolean> => {
      const { row, column, value, oldValue } = params;
      const config = configRef.current;

      // Basic validation: required + pattern
      if (column.editRules) {
        for (const rule of column.editRules) {
          if (rule.required) {
            if (isNil(value) || value === '') {
              return false;
            }
          }
          if (rule.pattern && typeof value === 'string') {
            if (!rule.pattern.test(value)) {
              return false;
            }
          }
        }
      }

      // Call onEditSave callback
      if (config?.onEditSave) {
        await config.onEditSave({ row, column, value, oldValue });
      }

      // Clear editing state on success
      const currentCell = editingCellRef.current;
      if (currentCell) {
        const editKey = `${currentCell.rowKey}-${currentCell.columnKey}`;
        setEditValues((prev) => {
          const next = new Map(prev);
          next.delete(editKey);
          return next;
        });
      }
      setEditingCell(null);

      return true;
    },
    []
  );

  return {
    editingCell,
    setEditingCell,
    editValues,
    setEditValue,
    cancelEdit,
    saveEdit,
  };
}

export default useEditableCell;
