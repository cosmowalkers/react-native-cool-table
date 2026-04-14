import { createContext, useContext } from 'react';
import type { ITableStateContextValue } from '../types';

const TABLE_STATE_CONTEXT_ERROR =
  'useTableState must be used within a <CoolTable> component. ' +
  'Make sure you are not calling useTableState outside of the table tree.';

export const TableStateContext = createContext<ITableStateContextValue | null>(
  null
);

export const useTableState = (): ITableStateContextValue => {
  const ctx = useContext(TableStateContext);
  if (ctx === null) {
    throw new Error(TABLE_STATE_CONTEXT_ERROR);
  }
  return ctx;
};
