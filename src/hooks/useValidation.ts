'use strict';

import { useState, useCallback, useRef } from 'react';
import { isNil } from 'lodash';
import type {
  ITableColumn,
  TItem,
  IValidationError,
  ITableProps,
} from '../types';
import { buildRowKey } from '../utils';

interface IUseValidationParams {
  columns: ITableColumn[];
  data: TItem[];
  rowKey?: ITableProps['rowKey'];
}

interface IUseValidationReturn {
  validationErrors: IValidationError[];
  validateCell: (
    rowKey: string,
    columnKey: string,
    value: unknown,
    row: TItem
  ) => Promise<IValidationError[]>;
  validateRow: (rowKey: string, row: TItem) => Promise<IValidationError[]>;
  validate: (allData: TItem[]) => Promise<IValidationError[]>;
  clearValidation: () => void;
  getErrors: (rowKey: string, columnKey: string) => IValidationError[];
}

export function useValidation({
  columns,
  data: _data,
  rowKey: rowKeyProp,
}: IUseValidationParams): IUseValidationReturn {
  const [validationErrors, setValidationErrors] = useState<IValidationError[]>(
    []
  );

  // Keep a ref to errors so callbacks can read the latest value
  const errorsRef = useRef(validationErrors);
  errorsRef.current = validationErrors;

  // Keep a ref to columns to avoid stale closures
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const validateCell = useCallback(
    async (
      rk: string,
      columnKey: string,
      value: unknown,
      row: TItem
    ): Promise<IValidationError[]> => {
      const column = columnsRef.current.find((c) => c.key === columnKey);
      const rules = column?.editRules;
      const cellErrors: IValidationError[] = [];

      if (rules) {
        for (const rule of rules) {
          // Required check
          if (rule.required) {
            if (isNil(value) || value === '') {
              cellErrors.push({
                rowKey: rk,
                columnKey,
                message: rule.message ?? 'This field is required',
              });
              continue;
            }
          }

          // Pattern check
          if (rule.pattern && typeof value === 'string') {
            if (!rule.pattern.test(value)) {
              cellErrors.push({
                rowKey: rk,
                columnKey,
                message: rule.message ?? 'Pattern validation failed',
              });
              continue;
            }
          }

          // Custom validator
          if (rule.validator) {
            const result = rule.validator({ value, row, column: column! });
            if (result === false) {
              cellErrors.push({
                rowKey: rk,
                columnKey,
                message: rule.message ?? 'Validation failed',
              });
            } else if (typeof result === 'string') {
              cellErrors.push({
                rowKey: rk,
                columnKey,
                message: result,
              });
            }
            // result === true means passed
          }
        }
      }

      // Replace errors for this specific rowKey + columnKey
      setValidationErrors((prev) => {
        const kept = prev.filter(
          (e) => !(e.rowKey === rk && e.columnKey === columnKey)
        );
        return [...kept, ...cellErrors];
      });

      return cellErrors;
    },
    []
  );

  const validateRow = useCallback(
    async (rk: string, row: TItem): Promise<IValidationError[]> => {
      const cols = columnsRef.current;
      const rowErrors: IValidationError[] = [];

      for (const col of cols) {
        if (!col.editRules || col.editRules.length === 0) continue;
        const value = row[col.key];
        const cellErrors = await _validateCellSync(
          rk,
          col.key,
          value,
          row,
          col
        );
        rowErrors.push(...cellErrors);
      }

      // Replace all errors for this row
      setValidationErrors((prev) => {
        const kept = prev.filter((e) => e.rowKey !== rk);
        return [...kept, ...rowErrors];
      });

      return rowErrors;
    },
    []
  );

  const validate = useCallback(
    async (allData: TItem[]): Promise<IValidationError[]> => {
      const cols = columnsRef.current;
      const allErrors: IValidationError[] = [];

      for (let i = 0; i < allData.length; i++) {
        const item = allData[i]!;
        const rk = buildRowKey(rowKeyProp, item, i);

        for (const col of cols) {
          if (!col.editRules || col.editRules.length === 0) continue;
          const value = item[col.key];
          const cellErrors = await _validateCellSync(
            rk,
            col.key,
            value,
            item,
            col
          );
          allErrors.push(...cellErrors);
        }
      }

      // Replace all errors
      setValidationErrors(allErrors);
      return allErrors;
    },
    [rowKeyProp]
  );

  const clearValidation = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const getErrors = useCallback(
    (rk: string, columnKey: string): IValidationError[] => {
      return errorsRef.current.filter(
        (e) => e.rowKey === rk && e.columnKey === columnKey
      );
    },
    []
  );

  return {
    validationErrors,
    validateCell,
    validateRow,
    validate,
    clearValidation,
    getErrors,
  };
}

/**
 * Internal pure validation logic (no state update).
 * Used by validateRow and validate to collect errors before a single setState.
 */
function _validateCellSync(
  rk: string,
  columnKey: string,
  value: unknown,
  row: TItem,
  column: ITableColumn
): IValidationError[] {
  const rules = column.editRules;
  const cellErrors: IValidationError[] = [];

  if (!rules) return cellErrors;

  for (const rule of rules) {
    if (rule.required) {
      if (isNil(value) || value === '') {
        cellErrors.push({
          rowKey: rk,
          columnKey,
          message: rule.message ?? 'This field is required',
        });
        continue;
      }
    }

    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        cellErrors.push({
          rowKey: rk,
          columnKey,
          message: rule.message ?? 'Pattern validation failed',
        });
        continue;
      }
    }

    if (rule.validator) {
      const result = rule.validator({ value, row, column });
      if (result === false) {
        cellErrors.push({
          rowKey: rk,
          columnKey,
          message: rule.message ?? 'Validation failed',
        });
      } else if (typeof result === 'string') {
        cellErrors.push({
          rowKey: rk,
          columnKey,
          message: result,
        });
      }
    }
  }

  return cellErrors;
}

export default useValidation;
