'use strict';

import { useMemo } from 'react';
import type { Animated } from 'react-native';
import type {
  ITableColumn,
  ITableStaticContextValue,
  ITableStateContextValue,
  TExpandable,
  ISortConfig,
  IFilterConfig,
  ICheckboxConfig,
  IRadioConfig,
  ISeqConfig,
  IResizeConfig,
  IDragSortConfig,
  IPaginationConfig,
  IEllipsisConfig,
  IEditConfig,
  IValidationConfig,
  IContextMenuConfig,
  ISearchConfig,
  IRowConfig,
  TBorderType,
  THeaderLevel,
  TSpanMethod,
  TSortState,
  TMultiSortState,
  IFilterState,
  ISpanResult,
  IValidationError,
  TItem,
} from '../types';
import type { StyleProp, ViewStyle } from 'react-native';

// ─── Static context params ───────────────────────────────────

interface IStaticParams {
  columns: ITableColumn[];
  positionX: Animated.Value;
  contentWidth: number;
  treeConfig?: TExpandable;
  rowStyle?: StyleProp<ViewStyle>;
  cellStyle?: StyleProp<ViewStyle>;
  textColor?: string;
  headerTextColor?: string;
  onSortChange?: ITableStaticContextValue['onSortChange'];
  sortConfig?: ISortConfig;
  filterConfig?: IFilterConfig;
  onFilterChange?: ITableStaticContextValue['onFilterChange'];
  checkboxConfig?: ICheckboxConfig;
  radioConfig?: IRadioConfig;
  seqConfig?: ISeqConfig;
  stripe?: boolean;
  stripeColor?: string;
  border?: TBorderType;
  borderColor?: string;
  rowConfig?: IRowConfig;
  ellipsisConfig?: IEllipsisConfig;
  paginationConfig?: IPaginationConfig;
  searchConfig?: ISearchConfig;
  headerLevels?: THeaderLevel[];
  resizeConfig?: IResizeConfig;
  spanMethod?: TSpanMethod;
  dragSortConfig?: IDragSortConfig;
  editConfig?: IEditConfig;
  validationConfig?: IValidationConfig;
  contextMenuConfig?: IContextMenuConfig;
}

// ─── State context params ────────────────────────────────────

interface IStateParams {
  sortState: TSortState;
  setSortState: (next: TSortState) => void;
  multiSortState: TMultiSortState;
  setMultiSortState: (next: TMultiSortState) => void;
  expandedKeys: Set<string>;
  toggleExpand: (key: string) => void;
  isExpanded: (key: string) => boolean;
  checkedKeys: Set<string>;
  toggleChecked: (key: string) => void;
  toggleCheckedAll: () => void;
  isChecked: (key: string) => boolean;
  isCheckedAll: boolean;
  isIndeterminate: boolean;
  radioKey: string | null;
  setRadioKey: (key: string | null) => void;
  filterStates: IFilterState[];
  setFilterState: (
    columnKey: string,
    values: (string | number | boolean)[]
  ) => void;
  clearFilterState: (columnKey?: string) => void;
  currentRowKey: string | null;
  setCurrentRowKey: (key: string | null) => void;
  showTooltip: (text: string, x: number, y: number, width: number) => void;
  hideTooltip: () => void;
  columnWidths: Map<string, number>;
  setColumnWidth: (key: string, width: number) => void;
  getCellSpan: (rowIndex: number, colIndex: number) => ISpanResult;
  isCellVisible: (rowIndex: number, colIndex: number) => boolean;
  loadingKeys: Set<string>;
  triggerLoad: (rowKey: string, row: TItem, rowIndex: number) => Promise<void>;
  isLoaded: (rowKey: string) => boolean;
  getChildren: (rowKey: string) => TItem[] | undefined;
  dragIndex: number | null;
  targetIndex: number | null;
  startDrag: (index: number) => void;
  moveDrag: (index: number) => void;
  endDrag: () => void;
  editingCell: { rowKey: string; columnKey: string } | null;
  setEditingCell: (cell: { rowKey: string; columnKey: string } | null) => void;
  editValues: Map<string, unknown>;
  setEditValue: (key: string, value: unknown) => void;
  validationErrors: IValidationError[];
  showContextMenu: (params: {
    row: TItem;
    rowIndex: number;
    x: number;
    y: number;
    column?: ITableColumn;
  }) => void;
  hideContextMenu: () => void;
}

// ─── Combined params ─────────────────────────────────────────

export type TUseTableContextValuesParams = IStaticParams & IStateParams;

// ─── Return type ─────────────────────────────────────────────

interface IUseTableContextValuesReturn {
  staticValue: ITableStaticContextValue;
  stateValue: ITableStateContextValue;
}

// ─── Hook ────────────────────────────────────────────────────

export const useTableContextValues = (
  params: TUseTableContextValuesParams
): IUseTableContextValuesReturn => {
  const staticValue = useMemo<ITableStaticContextValue>(
    () => ({
      columns: params.columns,
      positionX: params.positionX,
      contentWidth: params.contentWidth,
      treeConfig: params.treeConfig,
      rowStyle: params.rowStyle,
      cellStyle: params.cellStyle,
      textColor: params.textColor,
      headerTextColor: params.headerTextColor,
      onSortChange: params.onSortChange,
      sortConfig: params.sortConfig,
      filterConfig: params.filterConfig,
      onFilterChange: params.onFilterChange,
      checkboxConfig: params.checkboxConfig,
      radioConfig: params.radioConfig,
      seqConfig: params.seqConfig,
      stripe: params.stripe,
      stripeColor: params.stripeColor,
      border: params.border,
      borderColor: params.borderColor,
      rowConfig: params.rowConfig,
      ellipsisConfig: params.ellipsisConfig,
      paginationConfig: params.paginationConfig,
      searchConfig: params.searchConfig,
      headerLevels: params.headerLevels,
      resizeConfig: params.resizeConfig,
      spanMethod: params.spanMethod,
      dragSortConfig: params.dragSortConfig,
      editConfig: params.editConfig,
      validationConfig: params.validationConfig,
      contextMenuConfig: params.contextMenuConfig,
    }),
    [
      params.columns,
      params.positionX,
      params.contentWidth,
      params.treeConfig,
      params.rowStyle,
      params.cellStyle,
      params.textColor,
      params.headerTextColor,
      params.onSortChange,
      params.sortConfig,
      params.filterConfig,
      params.onFilterChange,
      params.checkboxConfig,
      params.radioConfig,
      params.seqConfig,
      params.stripe,
      params.stripeColor,
      params.border,
      params.borderColor,
      params.rowConfig,
      params.ellipsisConfig,
      params.paginationConfig,
      params.searchConfig,
      params.headerLevels,
      params.resizeConfig,
      params.spanMethod,
      params.dragSortConfig,
      params.editConfig,
      params.validationConfig,
      params.contextMenuConfig,
    ]
  );

  const stateValue = useMemo<ITableStateContextValue>(
    () => ({
      sortState: params.sortState,
      setSortState: params.setSortState,
      multiSortState: params.multiSortState,
      setMultiSortState: params.setMultiSortState,
      expandedKeys: params.expandedKeys,
      toggleExpand: params.toggleExpand,
      isExpanded: params.isExpanded,
      checkedKeys: params.checkedKeys,
      toggleChecked: params.toggleChecked,
      toggleCheckedAll: params.toggleCheckedAll,
      isChecked: params.isChecked,
      isCheckedAll: params.isCheckedAll,
      isIndeterminate: params.isIndeterminate,
      radioKey: params.radioKey,
      setRadioKey: params.setRadioKey,
      filterStates: params.filterStates,
      setFilterState: params.setFilterState,
      clearFilterState: params.clearFilterState,
      currentRowKey: params.currentRowKey,
      setCurrentRowKey: params.setCurrentRowKey,
      showTooltip: params.showTooltip,
      hideTooltip: params.hideTooltip,
      columnWidths: params.columnWidths,
      setColumnWidth: params.setColumnWidth,
      getCellSpan: params.getCellSpan,
      isCellVisible: params.isCellVisible,
      loadingKeys: params.loadingKeys,
      triggerLoad: params.triggerLoad,
      isLoaded: params.isLoaded,
      getChildren: params.getChildren,
      dragIndex: params.dragIndex,
      targetIndex: params.targetIndex,
      startDrag: params.startDrag,
      moveDrag: params.moveDrag,
      endDrag: params.endDrag,
      editingCell: params.editingCell,
      setEditingCell: params.setEditingCell,
      editValues: params.editValues,
      setEditValue: params.setEditValue,
      validationErrors: params.validationErrors,
      showContextMenu: params.showContextMenu,
      hideContextMenu: params.hideContextMenu,
    }),
    [
      params.sortState,
      params.setSortState,
      params.multiSortState,
      params.setMultiSortState,
      params.expandedKeys,
      params.toggleExpand,
      params.isExpanded,
      params.checkedKeys,
      params.toggleChecked,
      params.toggleCheckedAll,
      params.isChecked,
      params.isCheckedAll,
      params.isIndeterminate,
      params.radioKey,
      params.setRadioKey,
      params.filterStates,
      params.setFilterState,
      params.clearFilterState,
      params.currentRowKey,
      params.setCurrentRowKey,
      params.showTooltip,
      params.hideTooltip,
      params.columnWidths,
      params.setColumnWidth,
      params.getCellSpan,
      params.isCellVisible,
      params.loadingKeys,
      params.triggerLoad,
      params.isLoaded,
      params.getChildren,
      params.dragIndex,
      params.targetIndex,
      params.startDrag,
      params.moveDrag,
      params.endDrag,
      params.editingCell,
      params.setEditingCell,
      params.editValues,
      params.setEditValue,
      params.validationErrors,
      params.showContextMenu,
      params.hideContextMenu,
    ]
  );

  return { staticValue, stateValue };
};
