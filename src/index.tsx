import Cell from './components/Cell';
import Row from './components/Row';
import MainTable from './components/Table';
import Sort from './components/Sort';
import Pagination from './components/Pagination';
import ColumnManager from './components/ColumnManager';
import type { ITableComponentType } from './types/index';
export type {
  ITableProps,
  ITableCellProps,
  ITableColumn,
  ITableColumnParams,
  ITableRowProps,
  TItem,
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
  // P0+P1 新增类型导出
  IResizeConfig,
  IHeaderCell,
  THeaderLevel,
  ISpanResult,
  TSpanMethod,
  IDragSortConfig,
  IPaginationConfig,
  IEllipsisConfig,
  TEditType,
  IEditRule,
  IEditConfig,
  IValidationError,
  IValidationConfig,
  IContextMenuItem,
  IContextMenuConfig,
  IColumnVisibilityConfig,
  ISearchConfig,
  ILocale,
} from './types/index';
export {
  useTableStatic,
  useTableState,
  LocaleProvider,
  useLocale,
} from './context';
export { zhCN, enUS } from './locale';
import { SORT_STATUS_MAP } from './constant';

const CoolTable = Object.assign(MainTable, {
  Cell,
  Row,
  Sort,
  sortStatus: SORT_STATUS_MAP,
}) as ITableComponentType;

export { Cell, Row, Sort, Pagination, ColumnManager };
export default CoolTable;
