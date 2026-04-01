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
export type TColumnType = 'seq' | 'checkbox' | 'radio' | 'expand';

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
  setTreeExpand: (rows: TItem[], expanded: boolean) => void;
  setAllTreeExpand: (expanded: boolean) => void;
}

export type ITableComponentType = ((
  props: ITableProps & { ref?: MutableRefObject<ICoolTableRef> }
) => JSX.Element) & {
  Cell: React.MemoExoticComponent<
    (props: ITableCellProps & { ref?: MutableRefObject<any> }) => JSX.Element
  >;
  Row: React.MemoExoticComponent<
    (props: ITableRowProps & { ref?: MutableRefObject<any> }) => JSX.Element
  >;
  Sort: React.MemoExoticComponent<(props: ITableSortProps) => JSX.Element>;
  sortStatus: Record<string, TSortType>;
};
