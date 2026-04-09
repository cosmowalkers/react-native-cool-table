import type { ITableProps, TItem } from '../types';

export const buildRowKey = (
  rowKeyProp: ITableProps['rowKey'],
  item: TItem,
  index: number
): string => {
  if (typeof rowKeyProp === 'function') {
    return rowKeyProp(item, index);
  }
  if (typeof rowKeyProp === 'string') {
    const v = item[rowKeyProp];
    return v !== undefined && v !== null ? String(v) : String(index);
  }
  return String(index);
};
