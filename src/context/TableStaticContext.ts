import { createContext, useContext } from 'react';
import type { ITableStaticContextValue } from '../types';

const TABLE_STATIC_CONTEXT_ERROR =
  'useTableStatic must be used within a <CoolTable> component. ' +
  'Make sure you are not calling useTableStatic outside of the table tree.';

export const TableStaticContext =
  createContext<ITableStaticContextValue | null>(null);

export const useTableStatic = (): ITableStaticContextValue => {
  const ctx = useContext(TableStaticContext);
  if (ctx === null) {
    throw new Error(TABLE_STATIC_CONTEXT_ERROR);
  }
  return ctx;
};
