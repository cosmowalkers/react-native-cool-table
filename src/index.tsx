import Cell from './components/Cell';
import Row from './components/Row';
import MainTable from './components/Table';
import Sort from './components/Sort';
import type { ITableComponentType } from './types/index';
export type {
  ITableProps,
  ITableCellProps,
  ITableColumn,
  ITableColumnParams,
  ITableRowProps,
  TSortType,
  TSortState,
  TSortItem,
  TMultiSortState,
  ITableSortProps,
  ITableStaticContextValue,
  ITableStateContextValue,
  ICoolTableRef,
  // P0 新增类型导出
  TColumnType,
  ISortConfig,
  IFilterOption,
  IFilterState,
  IFilterConfig,
  ICheckboxConfig,
  IRadioConfig,
  ISeqConfig,
  IVirtualConfig,
  TBorderType,
  ILoadingConfig,
  IFooterConfig,
  IRowConfig,
} from './types/index';
export { useTableStatic, useTableState } from './context';
import { SORT_STATUS_MAP } from './constant';

const CoolTable = Object.assign(MainTable, {
  Cell,
  Row,
  Sort,
  sortStatus: SORT_STATUS_MAP,
}) as ITableComponentType;

export { Cell, Row, Sort };
export default CoolTable;
