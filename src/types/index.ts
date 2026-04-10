import type { MutableRefObject, ReactNode } from 'react';
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
  ImageStyle,
  LayoutChangeEvent,
  Animated,
  FlatListProps,
} from 'react-native';

type TAnyObject = Record<string, any>;

export type TItem = { [key: string]: any; children?: TItem[] };

export type TSortType = 'asc' | 'desc';

/** 单条排序状态 */
export type TSortItem = {
  columnKey: string;
  sort: TSortType;
};

/** 排序状态：单列排序为单对象或 null，多列排序为数组 */
export type TSortState = TSortItem | null;

/** 多列排序状态（内部使用） */
export type TMultiSortState = TSortItem[];

// ============================================================
// Column Type（特殊列类型）
// ============================================================

/** 特殊列类型 */
export type TColumnType = 'seq' | 'checkbox' | 'radio' | 'expand' | 'drag';

// ============================================================
// Sort Config
// ============================================================

export interface ISortConfig {
  /** 是否支持多列排序 */
  multiple?: boolean;
  /** 是否远程排序（不执行本地排序，仅触发回调） */
  remote?: boolean;
  /** 默认排序 */
  defaultSort?: TSortItem | TSortItem[];
}

// ============================================================
// Filter
// ============================================================

/** 筛选选项 */
export interface IFilterOption {
  label: string;
  value: string | number | boolean;
  checked?: boolean;
}

/** 筛选状态 */
export interface IFilterState {
  columnKey: string;
  values: (string | number | boolean)[];
}

/** 筛选配置 */
export interface IFilterConfig {
  /** 是否远程筛选 */
  remote?: boolean;
  /** 筛选图标样式 */
  iconStyle?: StyleProp<ViewStyle>;
}

// ============================================================
// Checkbox / Radio
// ============================================================

export interface ICheckboxConfig {
  /** header 显示全选 */
  checkAll?: boolean;
  /** 高亮选中行 */
  highlight?: boolean;
  /** 高亮颜色 */
  highlightColor?: string;
  /** 判断行是否可选 */
  checkMethod?: (params: { row: TItem; rowIndex: number }) => boolean;
  /** 选中变化回调 */
  onChange?: (params: {
    records: TItem[];
    row?: TItem;
    checked?: boolean;
  }) => void;
  /** 受控模式：选中的行 key 数组 */
  checkedRowKeys?: string[];
}

export interface IRadioConfig {
  /** 高亮选中行 */
  highlight?: boolean;
  /** 高亮颜色 */
  highlightColor?: string;
  /** 变化回调 */
  onChange?: (params: { row: TItem | null }) => void;
  /** 受控模式：选中的行 key */
  checkedRowKey?: string;
}

export interface ISeqConfig {
  /** 起始序号 */
  startIndex?: number;
}

// ============================================================
// Virtual Config
// ============================================================

export interface IVirtualConfig {
  /** 是否启用增强虚拟化 */
  enabled?: boolean;
  /** 固定行高（提供后可启用 getItemLayout 优化） */
  rowHeight?: number;
  /** 初始渲染数量 */
  initialNumToRender?: number;
  /** 每批次最大渲染数量 */
  maxToRenderPerBatch?: number;
  /** FlatList windowSize */
  windowSize?: number;
}

// ============================================================
// Border
// ============================================================

export type TBorderType = 'full' | 'outer' | 'inner' | 'none';

// ============================================================
// Loading
// ============================================================

export interface ILoadingConfig {
  /** 自定义 loading 组件 */
  render?: () => ReactNode;
  /** loading 文字 */
  text?: string;
}

// ============================================================
// Footer Row（汇总行）
// ============================================================

export interface IFooterConfig {
  /** 静态 footer 数据 */
  data?: TItem[];
  /** 动态计算 footer */
  method?: (params: { data: TItem[]; columns: ITableColumn[] }) => TItem[];
  /** footer 行样式 */
  rowStyle?: StyleProp<ViewStyle>;
}

// ============================================================
// Row Config
// ============================================================

export interface IRowConfig {
  /** 点击高亮当前行 */
  isCurrent?: boolean;
  /** 当前行高亮颜色 */
  currentColor?: string;
  /** 受控：当前行 key */
  currentRowKey?: string;
  /** 当前行变化回调 */
  onCurrentRowChange?: (params: {
    row: TItem | null;
    rowIndex: number;
  }) => void;
}

// ============================================================
// Existing Types (preserved & enhanced)
// ============================================================

export interface IEmptyProps {
  description?: string;
  style?: StyleProp<ViewStyle>;
  image?: string | { uri: string };
  imageStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface IIconProps {
  type: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  source?: string | { uri: string };
}

export interface ICommonTableProps {
  style?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  onPressRow?: (params: { item: any; rowIndex: number }) => void;
  onSortChange?: (params: {
    key: string;
    colIndex: number;
    sort: TSortType;
    /** 多列排序时返回完整排序列表 */
    sortList?: TSortItem[];
  }) => void;
}

export type TExpandable = {
  rowStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  animationDuration?: number;
  maxHeight?: number;
  autoCollapseOthers?: boolean;
  onPressRow?: (params: { item: any; rowIndex: number }) => void;
  renderItem?: (params: {
    item: TAnyObject;
    index: number;
    columns: ITableColumn[];
    depth: number;
    defaultRender: (params: { item: TItem; index: number }) => ReactNode;
  }) => ReactNode;
  renderExpand?: (params: {
    data: TItem[];
    parentData: TItem;
    index: number;
    columns: ITableColumn[];
    depth: number;
  }) => ReactNode;

  // === P0+P1 新增字段 ===

  /** 异步加载子节点 */
  loadChildren?: (params: { row: TItem; rowIndex: number }) => Promise<TItem[]>;
  /** 自定义加载中渲染 */
  renderLoading?: () => ReactNode;
  /** 是否缓存已加载的子节点 */
  cacheChildren?: boolean;
};

export interface ITableCellProps
  extends Omit<ITableColumnParams, 'defaultRender'>,
    ICommonTableProps {
  expanded?: boolean;
  onExpandChange?: () => void;
  /** 行的唯一 key（用于 checkbox/radio 状态匹配） */
  rowKeyValue?: string;
}

export interface ITableColumnParams {
  val: string | string[];
  col: ITableColumn;
  row: TItem;
  rowIndex: number;
  colIndex: number;
  defaultRender?: () => ReactNode;
  isHeader?: boolean;
}

export interface ITableColumn {
  /** 列数据 key（特殊列类型 type 存在时可省略） */
  key: string;
  /** 列标题 */
  title: string;
  /** 列宽 */
  width?: string | number;
  /** 最小列宽 */
  minWidth?: number;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 单元格样式 */
  style?: StyleProp<ViewStyle>;
  /** 单元格文字样式 */
  textStyle?: StyleProp<TextStyle>;
  /** 头部样式 */
  hStyle?: StyleProp<ViewStyle>;
  /** 头部文字样式 */
  hTextStyle?: StyleProp<TextStyle>;
  /** key 分隔符 */
  keySplitSymbol?: string;
  /** 固定列 */
  fixed?: boolean | 'left' | 'right';
  /** 第二行文本样式 */
  secondTextStyle?: StyleProp<TextStyle>;
  /** 是否显示箭头 */
  showArrow?: boolean;
  /** 点击区域样式 */
  touchStyle?: StyleProp<ViewStyle>;
  /** 点击回调 */
  onPress?: (params: Omit<ITableColumnParams, 'defaultRender'>) => void;
  /** 自定义 body 渲染 */
  render?: (params: ITableColumnParams) => ReactNode;
  /** 自定义 header 渲染 */
  renderHeader?: (params: ITableColumnParams) => ReactNode;
  /** 是否可排序 */
  sortable?: boolean;
  /** 排序回调 */
  onSort?: () => void;
  /** 默认排序方向 */
  defaultSort?: TSortType;
  /** 值转换 */
  customVal?: (
    params: Omit<ITableColumnParams, 'defaultRender'>
  ) => string | string[];

  // === P0 新增字段 ===

  /** 特殊列类型 */
  type?: TColumnType;

  /** 筛选选项列表 */
  filters?: IFilterOption[];
  /** 是否支持多选筛选（默认 true） */
  filterMultiple?: boolean;
  /** 自定义筛选方法 */
  filterMethod?: (params: {
    value: string | number | boolean;
    row: TItem;
    column: ITableColumn;
  }) => boolean;
  /** 自定义筛选面板渲染 */
  filterRender?: (params: {
    column: ITableColumn;
    filters: IFilterOption[];
    confirm: (values: (string | number | boolean)[]) => void;
    reset: () => void;
  }) => ReactNode;
  /** 自定义排序比较函数（本地排序时使用） */
  sorter?: (a: TItem, b: TItem) => number;

  // === P0+P1 新增字段 ===

  /** 子列（分组表头） */
  children?: ITableColumn[];
  /** 是否可调整列宽 */
  resizable?: boolean;
  /** 文本省略配置 */
  ellipsis?: boolean | IEllipsisConfig;
  /** 是否可编辑 */
  editable?: boolean;
  /** 编辑类型 */
  editType?: TEditType;
  /** 自定义编辑渲染 */
  editRender?: (params: {
    row: TItem;
    column: ITableColumn;
    value: unknown;
    setValue: (val: unknown) => void;
    save: () => void;
    cancel: () => void;
  }) => ReactNode;
  /** 编辑校验规则 */
  editRules?: IEditRule[];
  /** 编辑 select 类型的选项 */
  editOptions?: Array<{ label: string; value: string | number }>;
}

export interface ITableProps extends ICommonTableProps {
  data: TItem[];
  columns: ITableColumn[];
  headerRowStyle?: StyleProp<ViewStyle>;
  FooterComponent?: React.ReactNode;
  EmptyComponent?: React.ReactNode;
  flatListProps?: Partial<FlatListProps<TItem>>;
  emptyWrapperStyle?: StyleProp<ViewStyle>;
  emptyProps?: IEmptyProps;
  treeConfig?: TExpandable;
  onLayout?: (e: LayoutChangeEvent) => void;
  keyExtractor?: (item: TItem, index: number) => string;
  rowKey?: string | ((item: TItem, index: number) => string);

  // === P0 新增 props ===

  /** 排序配置 */
  sortConfig?: ISortConfig;
  /** 筛选配置 */
  filterConfig?: IFilterConfig;
  /** 筛选变化回调 */
  onFilterChange?: (params: {
    filters: IFilterState[];
    column: ITableColumn;
  }) => void;
  /** Checkbox 多选配置 */
  checkboxConfig?: ICheckboxConfig;
  /** Radio 单选配置 */
  radioConfig?: IRadioConfig;
  /** 序号列配置 */
  seqConfig?: ISeqConfig;
  /** 行条纹 */
  stripe?: boolean;
  /** 条纹颜色 */
  stripeColor?: string;
  /** 边框模式 */
  border?: TBorderType;
  /** 边框颜色 */
  borderColor?: string;
  /** 加载中 */
  loading?: boolean;
  /** 加载配置 */
  loadingConfig?: ILoadingConfig;
  /** Footer 汇总行配置 */
  footerConfig?: IFooterConfig;
  /** 虚拟化配置 */
  virtualConfig?: IVirtualConfig;
  /** 行配置 */
  rowConfig?: IRowConfig;

  // === P0+P1 新增 props ===

  /** 列宽调整配置 */
  resizeConfig?: IResizeConfig;
  /** 单元格合并方法 */
  spanMethod?: TSpanMethod;
  /** 行拖拽排序配置 */
  dragSortConfig?: IDragSortConfig;
  /** 分页配置 */
  paginationConfig?: IPaginationConfig;
  /** 省略+提示配置 */
  ellipsisConfig?: IEllipsisConfig;
  /** 行内编辑配置 */
  editConfig?: IEditConfig;
  /** 校验配置 */
  validationConfig?: IValidationConfig;
  /** 右键/长按菜单配置 */
  contextMenuConfig?: IContextMenuConfig;
  /** 列显隐配置 */
  columnVisibilityConfig?: IColumnVisibilityConfig;
  /** 搜索高亮配置 */
  searchConfig?: ISearchConfig;
}

export interface ITableRowProps {
  data: TItem;
  rowIndex: number;
  rowKeyValue: string;
  isHeader?: boolean;
  depth?: number;
  style?: StyleProp<ViewStyle>;
  onPressRow?: (params: { item: any; rowIndex: number }) => void;
}

export interface ITableSortProps {
  sortStatus?: TSortType;
  style?: StyleProp<ViewStyle>;
  ascIconProps?: IIconProps;
  descIconProps?: IIconProps;
  /** 多列排序时的优先级序号 */
  sortIndex?: number;
}

// ============================================================
// Context Value Types
// ============================================================

export interface ITableStaticContextValue {
  columns: ITableColumn[];
  positionX: Animated.Value;
  contentWidth: number;
  treeConfig?: TExpandable;
  rowStyle?: StyleProp<ViewStyle>;
  onSortChange?: ICommonTableProps['onSortChange'];
  /** P0: 排序配置 */
  sortConfig?: ISortConfig;
  /** P0: 筛选配置 */
  filterConfig?: IFilterConfig;
  onFilterChange?: ITableProps['onFilterChange'];
  /** P0: Checkbox 配置 */
  checkboxConfig?: ICheckboxConfig;
  /** P0: Radio 配置 */
  radioConfig?: IRadioConfig;
  /** P0: 序号配置 */
  seqConfig?: ISeqConfig;
  /** P0: 条纹 */
  stripe?: boolean;
  stripeColor?: string;
  /** P0: 边框 */
  border?: TBorderType;
  borderColor?: string;
  /** P0: 行配置 */
  rowConfig?: IRowConfig;

  // === P0+P1 新增 ===

  /** 列宽调整配置 */
  resizeConfig?: IResizeConfig;
  /** 分组表头层级 */
  headerLevels?: THeaderLevel[];
  /** 单元格合并方法 */
  spanMethod?: TSpanMethod;
  /** 行拖拽排序配置 */
  dragSortConfig?: IDragSortConfig;
  /** 分页配置 */
  paginationConfig?: IPaginationConfig;
  /** 省略+提示配置 */
  ellipsisConfig?: IEllipsisConfig;
  /** 行内编辑配置 */
  editConfig?: IEditConfig;
  /** 校验配置 */
  validationConfig?: IValidationConfig;
  /** 右键/长按菜单配置 */
  contextMenuConfig?: IContextMenuConfig;
  /** 搜索高亮配置 */
  searchConfig?: ISearchConfig;
}

export interface ITableStateContextValue {
  sortState: TSortState;
  setSortState: (next: TSortState) => void;
  /** 多列排序状态 */
  multiSortState: TMultiSortState;
  setMultiSortState: (next: TMultiSortState) => void;
  expandedKeys: Set<string>;
  toggleExpand: (key: string) => void;
  isExpanded: (key: string) => boolean;
  /** P0: checkbox 选中的行 key 集合 */
  checkedKeys: Set<string>;
  toggleChecked: (key: string) => void;
  toggleCheckedAll: () => void;
  isChecked: (key: string) => boolean;
  isCheckedAll: boolean;
  isIndeterminate: boolean;
  /** P0: radio 选中的行 key */
  radioKey: string | null;
  setRadioKey: (key: string | null) => void;
  /** P0: 筛选状态 */
  filterStates: IFilterState[];
  setFilterState: (
    columnKey: string,
    values: (string | number | boolean)[]
  ) => void;
  clearFilterState: (columnKey?: string) => void;
  /** P0: 当前高亮行 key */
  currentRowKey: string | null;
  setCurrentRowKey: (key: string | null) => void;

  // === P0-3: Cell Merge ===

  /** 获取单元格合并信息 */
  getCellSpan?: (rowIndex: number, colIndex: number) => ISpanResult;
  /** 判断单元格是否可见（未被 colspan 覆盖） */
  isCellVisible?: (rowIndex: number, colIndex: number) => boolean;

  // === P0+P1 新增（全部可选，避免破坏现有 Table 实现） ===

  /** 列宽映射 */
  columnWidths?: Map<string, number>;
  /** 设置列宽 */
  setColumnWidth?: (key: string, width: number) => void;
  /** 当前编辑的单元格 */
  editingCell?: { rowKey: string; columnKey: string } | null;
  /** 设置编辑单元格 */
  setEditingCell?: (cell: { rowKey: string; columnKey: string } | null) => void;
  /** 编辑值映射 */
  editValues?: Map<string, unknown>;
  /** 设置编辑值 */
  setEditValue?: (key: string, value: unknown) => void;
  /** 校验错误列表 */
  validationErrors?: IValidationError[];
  /** 异步加载中的行 key 集合 */
  loadingKeys?: Set<string>;
  /** 触发异步加载子节点 */
  triggerLoad?: (rowKey: string, row: TItem, rowIndex: number) => Promise<void>;
  /** 判断指定行是否已完成加载 */
  isLoaded?: (rowKey: string) => boolean;
  /** 获取已加载的子节点数据 */
  getChildren?: (rowKey: string) => TItem[] | undefined;
  /** 拖拽起始索引 */
  dragIndex?: number | null;
  /** 拖拽目标索引 */
  targetIndex?: number | null;
  /** 开始拖拽 */
  startDrag?: (index: number) => void;
  /** 移动拖拽 */
  moveDrag?: (index: number) => void;
  /** 结束拖拽 */
  endDrag?: () => void;
  /** 隐藏列 key 集合 */
  hiddenColumnKeys?: Set<string>;
  /** 显示 tooltip */
  showTooltip?: (text: string, x: number, y: number, width: number) => void;
  /** 隐藏 tooltip */
  hideTooltip?: () => void;
  /** 显示上下文菜单 */
  showContextMenu?: (params: {
    row: TItem;
    rowIndex: number;
    x: number;
    y: number;
    column?: ITableColumn;
  }) => void;
  /** 隐藏上下文菜单 */
  hideContextMenu?: () => void;
}

// ============================================================
// Ref API
// ============================================================

export interface ICoolTableRef {
  // Selection
  getCheckboxRecords: () => TItem[];
  setCheckboxRow: (rows: TItem[], checked: boolean) => void;
  clearCheckboxRow: () => void;
  getRadioRecord: () => TItem | null;
  setRadioRow: (row: TItem) => void;
  clearRadioRow: () => void;
  // Sort
  sort: (field: string, order?: TSortType) => void;
  clearSort: () => void;
  getSortColumns: () => TSortItem[];
  // Filter
  clearFilter: (field?: string) => void;
  getCheckedFilters: () => IFilterState[];
  // Scroll
  scrollToRow: (row: TItem) => void;
  scrollToTop: () => void;
  // Data
  getFullData: () => TItem[];
  getData: () => TItem[];
  // Expand
  setRowExpand: (rows: TItem[], expanded: boolean) => void;
  setAllRowExpand: (expanded: boolean) => void;
  /** @deprecated Use setRowExpand instead */
  setTreeExpand: (rows: TItem[], expanded: boolean) => void;
  /** @deprecated Use setAllRowExpand instead */
  setAllTreeExpand: (expanded: boolean) => void;

  // === P0+P1 新增 Ref 方法（全部可选，后续 Task 逐步实现） ===

  // Column Resize
  /** 设置指定列宽度 */
  setColumnWidth?: (field: string, width: number) => void;
  /** 获取所有列宽映射 */
  getColumnWidths?: () => Map<string, number>;

  // Pagination
  /** 设置当前页码 */
  setPage?: (page: number) => void;
  /** 设置每页条数 */
  setPageSize?: (size: number) => void;

  // Inline Edit
  /** 开始编辑指定单元格 */
  startEdit?: (rowKey: string, columnKey: string) => void;
  /** 取消编辑 */
  cancelEdit?: () => void;
  /** 获取所有编辑值 */
  getEditValues?: () => Map<string, unknown>;

  // Validation
  /** 校验全部 */
  validate?: () => Promise<IValidationError[]>;
  /** 校验指定行 */
  validateRow?: (rowKey: string) => Promise<IValidationError[]>;
  /** 清除校验状态 */
  clearValidation?: () => void;

  // Column Visibility
  /** 隐藏指定列 */
  hideColumn?: (key: string) => void;
  /** 显示指定列 */
  showColumn?: (key: string) => void;
  /** 获取隐藏列 key 列表 */
  getHiddenColumns?: () => string[];
}

// ============================================================
// P0-1: Column Resize
// ============================================================

export interface IResizeConfig {
  /** 是否启用列宽调整 */
  enabled?: boolean;
  /** 最小列宽 */
  minWidth?: number;
  /** 最大列宽 */
  maxWidth?: number;
  /** 调整结束回调 */
  onResizeEnd?: (params: { column: ITableColumn; width: number }) => void;
}

// ============================================================
// P0-2: Grouped Headers
// ============================================================

export interface IHeaderCell {
  column: ITableColumn;
  colSpan: number;
  rowSpan: number;
  isLeaf: boolean;
}

export type THeaderLevel = IHeaderCell[];

// ============================================================
// P0-3: Cell Merge（仅 colspan）
// ============================================================

export interface ISpanResult {
  rowspan: number;
  colspan: number;
}

export type TSpanMethod = (params: {
  row: TItem;
  column: ITableColumn;
  rowIndex: number;
  colIndex: number;
}) => ISpanResult;

// ============================================================
// P0-4: Row Drag Sort
// ============================================================

export interface IDragSortConfig {
  /** 拖拽结束回调 */
  onDragEnd?: (params: {
    data: TItem[];
    fromIndex: number;
    toIndex: number;
  }) => void;
  /** 自定义拖拽手柄渲染 */
  renderHandle?: () => ReactNode;
  /** 判断行是否可拖拽 */
  dragMethod?: (params: { row: TItem; rowIndex: number }) => boolean;
}

// ============================================================
// P0-5: Pagination
// ============================================================

export interface IPaginationConfig {
  /** 当前页码 */
  currentPage?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 可选的每页条数列表 */
  pageSizes?: number[];
  /** 数据总量 */
  total?: number;
  /** 页码变化回调 */
  onPageChange?: (params: { currentPage: number; pageSize: number }) => void;
  /** 每页条数变化回调 */
  onPageSizeChange?: (params: {
    currentPage: number;
    pageSize: number;
  }) => void;
  /** 自定义分页渲染 */
  render?: (params: {
    currentPage: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  }) => ReactNode;
  /** 分页容器样式 */
  style?: StyleProp<ViewStyle>;
}

// ============================================================
// P0-6: Ellipsis + Tooltip
// ============================================================

export interface IEllipsisConfig {
  /** 是否启用省略 */
  enabled?: boolean;
  /** 最大行数 */
  numberOfLines?: number;
  /** 触发方式 */
  trigger?: 'longPress' | 'press';
  /** 自定义 tooltip 渲染 */
  renderTooltip?: (params: {
    text: string;
    column: ITableColumn;
    row: TItem;
  }) => ReactNode;
}

// ============================================================
// P1-7: Inline Edit
// ============================================================

export type TEditType = 'text' | 'number' | 'select' | 'custom';

export interface IEditRule {
  /** 是否必填 */
  required?: boolean;
  /** 正则校验 */
  pattern?: RegExp;
  /** 校验失败提示 */
  message?: string;
  /** 自定义校验器 */
  validator?: (params: {
    value: unknown;
    row: TItem;
    column: ITableColumn;
  }) => boolean | string;
}

export interface IEditConfig {
  /** 编辑触发方式 */
  trigger?: 'click' | 'manual';
  /** 保存回调 */
  onEditSave?: (params: {
    row: TItem;
    column: ITableColumn;
    value: unknown;
    oldValue: unknown;
  }) => void | Promise<void>;
  /** 取消回调 */
  onEditCancel?: (params: { row: TItem; column: ITableColumn }) => void;
}

// ============================================================
// P1-8: Validation
// ============================================================

export interface IValidationError {
  rowKey: string;
  columnKey: string;
  message: string;
}

export interface IValidationConfig {
  /** 是否在行内显示校验错误 */
  showInline?: boolean;
  /** 错误样式 */
  errorStyle?: StyleProp<ViewStyle>;
  /** 错误文字样式 */
  errorTextStyle?: StyleProp<TextStyle>;
}

// ============================================================
// P1-9: Context Menu
// ============================================================

export interface IContextMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onPress?: (params: {
    row: TItem;
    rowIndex: number;
    column?: ITableColumn;
  }) => void;
}

export interface IContextMenuConfig {
  /** 静态菜单项 */
  items?: IContextMenuItem[];
  /** 动态菜单项 */
  getItems?: (params: {
    row: TItem;
    rowIndex: number;
    column?: ITableColumn;
  }) => IContextMenuItem[];
  /** 自定义菜单渲染 */
  render?: (params: { row: TItem; close: () => void }) => ReactNode;
}

// ============================================================
// P1-10: Column Visibility
// ============================================================

export interface IColumnVisibilityConfig {
  /** 非受控模式：隐藏列 key 列表 */
  hiddenKeys?: string[];
  /** 受控模式：隐藏列 key 列表 */
  controlledHiddenKeys?: string[];
  /** 隐藏列变化回调 */
  onChange?: (params: { hiddenKeys: string[] }) => void;
  /** 始终可见的列 key 列表 */
  alwaysVisible?: string[];
}

// ============================================================
// P1-12: Search Highlight
// ============================================================

export interface ISearchConfig {
  /** 搜索关键词 */
  keyword?: string;
  /** 是否区分大小写 */
  caseSensitive?: boolean;
  /** 高亮样式 */
  highlightStyle?: StyleProp<TextStyle>;
  /** 限定搜索的列 key */
  columnKeys?: string[];
}

// ============================================================
// ITableComponentType
// ============================================================

export type ITableComponentType = ((
  props: ITableProps & { ref?: MutableRefObject<ICoolTableRef> }
) => JSX.Element) & {
  Cell: React.MemoExoticComponent<
    React.ForwardRefExoticComponent<ITableCellProps & React.RefAttributes<any>>
  >;
  Row: React.MemoExoticComponent<
    React.ForwardRefExoticComponent<ITableRowProps & React.RefAttributes<any>>
  >;
  Sort: React.MemoExoticComponent<(props: ITableSortProps) => JSX.Element>;
  sortStatus: Record<string, TSortType>;
};
