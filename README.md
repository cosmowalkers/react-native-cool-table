# react-native-cool-table

A high-performance, feature-rich table component for React Native. Built as a compound component with strict TypeScript support, two-context architecture for minimal re-renders, and 27+ features out of the box.

## Features

- **Basic table** -- FlatList-based rendering with sticky header
- **Fixed columns** -- Pin columns to the left or right edge during horizontal scroll
- **Sortable columns** -- Single-column and multi-column sort, custom sorter functions
- **Column filters** -- Built-in filter panel or fully custom `filterRender`
- **Expandable / tree rows** -- Static `children`, async `loadChildren`, `cacheChildren`
- **Checkbox multi-select** -- Check-all, indeterminate state, highlight, controlled mode
- **Radio single-select** -- Highlight selected row, controlled mode
- **Sequence number column** -- Auto-generated row numbers via `type: 'seq'`
- **Grouped (multi-level) headers** -- Nest columns with `column.children`
- **Cell merge** -- Horizontal colspan via `spanMethod`
- **Column resize** -- Drag header edge to adjust width
- **Row drag sort** -- Reorder rows with PanResponder
- **Pagination** -- Built-in UI with page size selector and custom render
- **Inline edit** -- Text, number, select, or custom editor; validation with `editRules`
- **Ellipsis + tooltip** -- Truncate long text with long-press or press tooltip
- **Search highlight** -- Keyword highlighting with case sensitivity and column scope
- **Context menu** -- Long-press menu with static items, dynamic `getItems`, or custom render
- **Column visibility** -- `ColumnManager` modal, controlled and uncontrolled modes
- **Stripe rows & border modes** -- Alternating row colors; full / outer / inner / none borders
- **Loading overlay** -- Customizable spinner overlay
- **Footer summary rows** -- Static data or computed via `method`
- **Virtual rendering** -- `getItemLayout`, `windowSize`, `initialNumToRender`, etc.
- **Row current highlight** -- Click to highlight the active row
- **i18n / locale** -- Fully customizable text via the `locale` prop
- **Custom cell & header rendering** -- `render` and `renderHeader` per column
- **Empty state** -- Custom component or built-in with configurable image and text
- **Two-context architecture** -- Static and state contexts split to minimize re-renders

## Installation

```sh
npm install react-native-cool-table
# or
yarn add react-native-cool-table
```

### Peer Dependencies

| Package | Version |
|---------|---------|
| `react` | `>=16.8.0` |
| `react-native` | `>=0.60.0` |

`lodash` is a direct dependency and will be installed automatically.

## Quick Start

```tsx
import CoolTable from 'react-native-cool-table';
import type { ITableColumn } from 'react-native-cool-table';

const columns: ITableColumn[] = [
  { key: 'name',  title: 'Name',  width: 140, align: 'left' },
  { key: 'price', title: 'Price', width: 100, align: 'right' },
  { key: 'sales', title: 'Sales', width: 80,  align: 'right' },
];

const data = [
  { name: 'Product A', price: 99,  sales: 320 },
  { name: 'Product B', price: 199, sales: 150 },
];

export default function App() {
  return (
    <CoolTable
      data={data}
      columns={columns}
      keyExtractor={(item) => item.name}
    />
  );
}
```

---

## Fixed (Pinned) Columns

Pin columns to the left or right edge. Fixed columns counteract horizontal scroll via `Animated.Value` translateX so they always stay visible.

```tsx
const columns: ITableColumn[] = [
  { key: 'name',   title: 'Name',   width: 120, fixed: 'left' },
  { key: 'sku',    title: 'SKU',    width: 100 },
  { key: 'stock',  title: 'Stock',  width: 80 },
  { key: 'price',  title: 'Price',  width: 80 },
  { key: 'action', title: 'Action', width: 80,  fixed: 'right' },
];
```

`fixed: true` is equivalent to `fixed: 'left'`.

---

## Sortable Columns

### Single-column Sort

Tapping a sortable header cycles: `asc -> desc -> asc -> ...`

```tsx
const columns: ITableColumn[] = [
  { key: 'price', title: 'Price', width: 100, sortable: true, defaultSort: 'desc' },
  { key: 'sales', title: 'Sales', width: 80,  sortable: true },
];

<CoolTable
  data={data}
  columns={columns}
  onSortChange={({ key, sort }) => {
    console.log(`Sort by ${key}: ${sort}`);
  }}
/>
```

### Multi-column Sort

Enable multi-column sort with `sortConfig`:

```tsx
<CoolTable
  data={data}
  columns={columns}
  sortConfig={{ multiple: true }}
  onSortChange={({ key, sort, sortList }) => {
    console.log('Active sorts:', sortList);
  }}
/>
```

### Remote Sort

When sorting is handled server-side, set `remote: true` to skip local sorting:

```tsx
<CoolTable
  data={data}
  columns={columns}
  sortConfig={{ remote: true }}
  onSortChange={({ key, sort }) => {
    fetchSortedData(key, sort);
  }}
/>
```

### Custom Sorter

Provide a `sorter` function on a column for custom comparison logic:

```tsx
const columns: ITableColumn[] = [
  {
    key: 'date',
    title: 'Date',
    width: 120,
    sortable: true,
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  },
];
```

---

## Column Filters

Add `filters` to a column to enable a built-in filter panel:

```tsx
const columns: ITableColumn[] = [
  {
    key: 'status',
    title: 'Status',
    width: 100,
    filters: [
      { label: 'Active',   value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
    filterMultiple: true, // default: true
    filterMethod: ({ value, row }) => row.status === value,
  },
];

<CoolTable
  data={data}
  columns={columns}
  onFilterChange={({ filters, column }) => {
    console.log('Filter changed:', filters);
  }}
/>
```

### Custom Filter Panel

Use `filterRender` for a fully custom filter UI:

```tsx
{
  key: 'price',
  title: 'Price',
  width: 100,
  filters: [],
  filterRender: ({ confirm, reset }) => (
    <View>
      <Button title="Cheap" onPress={() => confirm(['cheap'])} />
      <Button title="Reset" onPress={reset} />
    </View>
  ),
}
```

### Remote Filter

```tsx
<CoolTable
  data={data}
  columns={columns}
  filterConfig={{ remote: true }}
  onFilterChange={({ filters }) => {
    fetchFilteredData(filters);
  }}
/>
```

---

## Expandable / Tree Rows

### Static Children

Supply rows with a `children` array and pass `treeConfig`:

```tsx
const data = [
  {
    id: '1',
    name: 'Electronics',
    children: [
      { id: '1-1', name: 'Phones' },
      { id: '1-2', name: 'Laptops' },
    ],
  },
];

<CoolTable
  data={data}
  columns={columns}
  rowKey="id"
  treeConfig={{
    animationDuration: 200,
    autoCollapseOthers: true,
  }}
/>
```

### Async Load Children

Load children on demand with `loadChildren`:

```tsx
<CoolTable
  data={data}
  columns={columns}
  rowKey="id"
  treeConfig={{
    loadChildren: async ({ row }) => {
      const children = await fetchChildren(row.id);
      return children;
    },
    cacheChildren: true,
    renderLoading: () => <ActivityIndicator size="small" />,
    onLoadError: ({ row, error }) => {
      console.error(`Failed to load children for ${row.id}`, error);
    },
  }}
/>
```

---

## Checkbox Multi-Select

Add a checkbox column with `type: 'checkbox'`:

```tsx
const columns: ITableColumn[] = [
  { key: 'checkbox', title: '', width: 50, type: 'checkbox' },
  { key: 'name', title: 'Name', width: 140 },
];

<CoolTable
  data={data}
  columns={columns}
  rowKey="id"
  checkboxConfig={{
    checkAll: true,
    highlight: true,
    highlightColor: '#e6f7ff',
    checkMethod: ({ row }) => row.status !== 'disabled',
    onChange: ({ records, row, checked }) => {
      console.log('Selected:', records);
    },
  }}
/>
```

### Controlled Mode

```tsx
const [checkedKeys, setCheckedKeys] = useState<string[]>(['1', '3']);

<CoolTable
  data={data}
  columns={columns}
  rowKey="id"
  checkboxConfig={{
    checkAll: true,
    checkedRowKeys: checkedKeys,
    onChange: ({ records }) => {
      setCheckedKeys(records.map((r) => r.id));
    },
  }}
/>
```

---

## Radio Single-Select

Add a radio column with `type: 'radio'`:

```tsx
const columns: ITableColumn[] = [
  { key: 'radio', title: '', width: 50, type: 'radio' },
  { key: 'name', title: 'Name', width: 140 },
];

<CoolTable
  data={data}
  columns={columns}
  rowKey="id"
  radioConfig={{
    highlight: true,
    highlightColor: '#e6f7ff',
    onChange: ({ row }) => {
      console.log('Selected:', row);
    },
  }}
/>
```

### Controlled Mode

```tsx
<CoolTable
  radioConfig={{
    checkedRowKey: selectedKey,
    onChange: ({ row }) => setSelectedKey(row?.id ?? null),
  }}
/>
```

---

## Sequence Number Column

Automatically generate row numbers:

```tsx
const columns: ITableColumn[] = [
  { key: 'seq', title: '#', width: 50, type: 'seq' },
  { key: 'name', title: 'Name', width: 140 },
];

<CoolTable
  data={data}
  columns={columns}
  seqConfig={{ startIndex: 1 }}
/>
```

---

## Grouped (Multi-Level) Headers

Nest columns to create multi-level headers:

```tsx
const columns: ITableColumn[] = [
  { key: 'name', title: 'Name', width: 140 },
  {
    key: 'metrics',
    title: 'Metrics',
    children: [
      { key: 'price', title: 'Price', width: 100 },
      { key: 'sales', title: 'Sales', width: 80 },
      { key: 'profit', title: 'Profit', width: 80 },
    ],
  },
];
```

The library automatically computes `colSpan` and `rowSpan` for each header cell.

---

## Cell Merge (Colspan)

Use `spanMethod` to merge cells horizontally:

```tsx
<CoolTable
  data={data}
  columns={columns}
  spanMethod={({ row, column, rowIndex, colIndex }) => {
    if (rowIndex === 0 && colIndex === 0) {
      return { rowspan: 1, colspan: 2 };
    }
    return { rowspan: 1, colspan: 1 };
  }}
/>
```

> Note: Currently only `colspan` is implemented. `rowspan` is reserved for future use.

---

## Column Resize

Allow users to drag the header edge to resize columns:

```tsx
const columns: ITableColumn[] = [
  { key: 'name', title: 'Name', width: 140, resizable: true },
  { key: 'desc', title: 'Description', width: 200, resizable: true },
];

<CoolTable
  data={data}
  columns={columns}
  resizeConfig={{
    enabled: true,
    minWidth: 60,
    maxWidth: 400,
    onResizeEnd: ({ column, width }) => {
      console.log(`${column.key} resized to ${width}`);
    },
  }}
/>
```

---

## Row Drag Sort

Enable row reordering by drag-and-drop. Add a `type: 'drag'` column for the handle:

```tsx
const columns: ITableColumn[] = [
  { key: 'drag', title: '', width: 40, type: 'drag' },
  { key: 'name', title: 'Name', width: 140 },
];

<CoolTable
  data={data}
  columns={columns}
  rowKey="id"
  dragSortConfig={{
    onDragEnd: ({ data: newData, fromIndex, toIndex }) => {
      setData(newData);
    },
    dragMethod: ({ row }) => row.draggable !== false,
    renderHandle: () => <Text>&#9776;</Text>,
  }}
/>
```

---

## Pagination

### Built-in Pagination UI

```tsx
<CoolTable
  data={data}
  columns={columns}
  paginationConfig={{
    currentPage: 1,
    pageSize: 10,
    total: 100,
    pageSizes: [10, 20, 50],
    onPageChange: ({ currentPage, pageSize }) => {
      fetchPage(currentPage, pageSize);
    },
    onPageSizeChange: ({ currentPage, pageSize }) => {
      fetchPage(currentPage, pageSize);
    },
  }}
/>
```

### Custom Pagination Render

```tsx
<CoolTable
  paginationConfig={{
    currentPage: page,
    pageSize: 10,
    total: 100,
    render: ({ currentPage, total, onPageChange }) => (
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Button title="Prev" onPress={() => onPageChange(currentPage - 1)} />
        <Text>{currentPage} / {Math.ceil(total / 10)}</Text>
        <Button title="Next" onPress={() => onPageChange(currentPage + 1)} />
      </View>
    ),
  }}
/>
```

You can also use the standalone `Pagination` component:

```tsx
import { Pagination } from 'react-native-cool-table';
```

---

## Inline Edit

Enable cell editing with `editable` on columns:

```tsx
const columns: ITableColumn[] = [
  {
    key: 'name',
    title: 'Name',
    width: 140,
    editable: true,
    editType: 'text',
    editRules: [
      { required: true, message: 'Name is required' },
      { pattern: /^[A-Za-z\s]+$/, message: 'Letters only' },
    ],
  },
  {
    key: 'price',
    title: 'Price',
    width: 100,
    editable: true,
    editType: 'number',
  },
  {
    key: 'category',
    title: 'Category',
    width: 120,
    editable: true,
    editType: 'select',
    editOptions: [
      { label: 'Electronics', value: 'electronics' },
      { label: 'Clothing', value: 'clothing' },
    ],
  },
];

<CoolTable
  data={data}
  columns={columns}
  rowKey="id"
  editConfig={{
    trigger: 'click', // or 'manual' (trigger via ref.startEdit)
    onEditSave: async ({ row, column, value, oldValue }) => {
      await saveToServer(row.id, column.key, value);
    },
    onEditCancel: ({ row, column }) => {
      console.log('Edit cancelled');
    },
  }}
/>
```

### Custom Edit Render

```tsx
{
  key: 'color',
  title: 'Color',
  width: 100,
  editable: true,
  editType: 'custom',
  editRender: ({ value, setValue, save, cancel }) => (
    <View>
      <ColorPicker value={value as string} onChange={setValue} />
      <Button title="OK" onPress={save} />
      <Button title="Cancel" onPress={cancel} />
    </View>
  ),
}
```

### Validation

Display inline validation errors with `validationConfig`:

```tsx
<CoolTable
  data={data}
  columns={columns}
  editConfig={{ trigger: 'click' }}
  validationConfig={{
    showInline: true,
    errorStyle: { borderColor: 'red' },
    errorTextStyle: { color: 'red', fontSize: 11 },
  }}
/>
```

---

## Ellipsis + Tooltip

Truncate long text and show a tooltip on press or long-press:

```tsx
const columns: ITableColumn[] = [
  {
    key: 'description',
    title: 'Description',
    width: 120,
    ellipsis: true, // use default config
  },
  {
    key: 'notes',
    title: 'Notes',
    width: 100,
    ellipsis: { enabled: true, numberOfLines: 2, trigger: 'press' },
  },
];

// Global config applies to all columns
<CoolTable
  data={data}
  columns={columns}
  ellipsisConfig={{
    enabled: true,
    numberOfLines: 1,
    trigger: 'longPress',
  }}
/>
```

### Custom Tooltip

```tsx
ellipsisConfig={{
  enabled: true,
  renderTooltip: ({ text, column, row }) => (
    <View style={{ backgroundColor: '#333', padding: 8, borderRadius: 4 }}>
      <Text style={{ color: '#fff' }}>{text}</Text>
    </View>
  ),
}}
```

---

## Search Highlight

Highlight matching text in cells:

```tsx
const [keyword, setKeyword] = useState('');

<TextInput value={keyword} onChangeText={setKeyword} placeholder="Search..." />

<CoolTable
  data={data}
  columns={columns}
  searchConfig={{
    keyword,
    caseSensitive: false,
    highlightStyle: { backgroundColor: 'yellow', color: '#000' },
    columnKeys: ['name', 'description'], // limit to specific columns
  }}
/>
```

---

## Context Menu

Show a menu on long-press:

```tsx
<CoolTable
  data={data}
  columns={columns}
  contextMenuConfig={{
    items: [
      {
        key: 'edit',
        label: 'Edit',
        onPress: ({ row }) => navigateToEdit(row.id),
      },
      {
        key: 'delete',
        label: 'Delete',
        danger: true,
        onPress: ({ row }) => deleteRow(row.id),
      },
    ],
  }}
/>
```

### Dynamic Items

```tsx
contextMenuConfig={{
  getItems: ({ row, rowIndex }) => [
    { key: 'copy', label: `Copy ${row.name}`, onPress: () => copyRow(row) },
    ...(row.editable
      ? [{ key: 'edit', label: 'Edit', onPress: () => editRow(row) }]
      : []),
  ],
}}
```

### Custom Render

```tsx
contextMenuConfig={{
  render: ({ row, close }) => (
    <View style={{ padding: 12 }}>
      <Text>{row.name}</Text>
      <Button title="Close" onPress={close} />
    </View>
  ),
}}
```

---

## Column Visibility

### With ColumnManager Component

```tsx
import CoolTable, { ColumnManager } from 'react-native-cool-table';

<CoolTable
  ref={tableRef}
  data={data}
  columns={columns}
  columnVisibilityConfig={{
    hiddenKeys: ['sku'],          // initially hidden (uncontrolled)
    alwaysVisible: ['name'],      // cannot be hidden
    onChange: ({ hiddenKeys }) => {
      console.log('Hidden columns:', hiddenKeys);
    },
  }}
/>

// Render the column manager modal elsewhere
<ColumnManager tableRef={tableRef} />
```

### Controlled Mode

```tsx
const [hidden, setHidden] = useState<string[]>([]);

<CoolTable
  columnVisibilityConfig={{
    controlledHiddenKeys: hidden,
    onChange: ({ hiddenKeys }) => setHidden(hiddenKeys),
  }}
/>
```

---

## Stripe Rows & Border Modes

```tsx
<CoolTable
  data={data}
  columns={columns}
  stripe={true}
  stripeColor="#fafafa"
  border="full"       // 'full' | 'outer' | 'inner' | 'none'
  borderColor="#e8e8e8"
/>
```

---

## Loading Overlay

```tsx
<CoolTable
  data={data}
  columns={columns}
  loading={isLoading}
  loadingConfig={{
    text: 'Loading...',
    overlayStyle: { backgroundColor: 'rgba(255,255,255,0.8)' },
    render: () => <ActivityIndicator size="large" color="#1890ff" />,
  }}
/>
```

---

## Footer Summary Rows

### Static Footer Data

```tsx
<CoolTable
  data={data}
  columns={columns}
  footerConfig={{
    data: [{ name: 'Total', price: 298, sales: 470 }],
    rowStyle: { backgroundColor: '#fafafa' },
  }}
/>
```

### Computed Footer

```tsx
<CoolTable
  footerConfig={{
    method: ({ data: tableData, columns: cols }) => {
      const totalSales = tableData.reduce((sum, row) => sum + row.sales, 0);
      return [{ name: 'Total', sales: totalSales }];
    },
  }}
/>
```

---

## Virtual Rendering

Optimize large datasets with virtual scrolling configuration:

```tsx
<CoolTable
  data={largeDataset}
  columns={columns}
  virtualConfig={{
    enabled: true,
    rowHeight: 48,         // fixed height enables getItemLayout
    initialNumToRender: 20,
    maxToRenderPerBatch: 10,
    windowSize: 5,
  }}
/>
```

When `rowHeight` is provided, the library generates `getItemLayout` for the FlatList, significantly improving scroll-to-index performance and initial render time.

---

## Row Current Highlight

Click a row to highlight it:

```tsx
<CoolTable
  data={data}
  columns={columns}
  rowKey="id"
  rowConfig={{
    isCurrent: true,
    currentColor: '#e6f7ff',
    onCurrentRowChange: ({ row, rowIndex }) => {
      console.log('Current row:', row);
    },
  }}
/>
```

### Controlled Mode

```tsx
<CoolTable
  rowConfig={{
    isCurrent: true,
    currentRowKey: activeRowKey,
    onCurrentRowChange: ({ row }) => setActiveRowKey(row?.id ?? null),
  }}
/>
```

---

## i18n / Locale

The default locale is **Chinese**. Override any text via the `locale` prop:

```tsx
import CoolTable, { DEFAULT_LOCALE } from 'react-native-cool-table';

// English locale example
const EN_LOCALE = {
  filterReset: 'Reset',
  filterConfirm: 'OK',
  paginationPrev: 'Prev',
  paginationNext: 'Next',
  paginationTotal: '{total} items',
  paginationPerPage: '',
  paginationPerPageSuffix: '/ page',
  columnManagerTitle: 'Column Settings',
  columnManagerCancel: 'Cancel',
  columnManagerConfirm: 'OK',
  emptyText: 'No data',
};

<CoolTable
  data={data}
  columns={columns}
  locale={EN_LOCALE}
/>
```

### Default Locale Values (Chinese)

| Key | Default |
|-----|---------|
| `filterReset` | `'重置'` |
| `filterConfirm` | `'确认'` |
| `paginationPrev` | `'上一页'` |
| `paginationNext` | `'下一页'` |
| `paginationTotal` | `'共 {total} 条'` |
| `paginationPerPage` | `'每页'` |
| `paginationPerPageSuffix` | `'条'` |
| `columnManagerTitle` | `'列显示设置'` |
| `columnManagerCancel` | `'取消'` |
| `columnManagerConfirm` | `'确认'` |
| `emptyText` | `'暂无数据'` |

---

## Custom Cell & Header Rendering

```tsx
import type { ITableColumnParams } from 'react-native-cool-table';

const columns: ITableColumn[] = [
  {
    key: 'status',
    title: 'Status',
    width: 90,
    render: ({ val, row }: ITableColumnParams) => {
      const color = val === 'active' ? 'green' : 'gray';
      return (
        <View style={{ backgroundColor: color, borderRadius: 4, padding: 4 }}>
          <Text style={{ color: '#fff' }}>{String(val)}</Text>
        </View>
      );
    },
    renderHeader: ({ col }: ITableColumnParams) => (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>{col.title}</Text>
        <Text style={{ fontSize: 10, color: '#999' }}> (live)</Text>
      </View>
    ),
  },
];
```

### Value Transform

Use `customVal` to transform the raw value before rendering:

```tsx
{
  key: 'price',
  title: 'Price',
  width: 100,
  customVal: ({ val }) => `$${Number(val).toFixed(2)}`,
}
```

---

## Empty State

```tsx
// Custom component
<CoolTable data={[]} columns={columns} EmptyComponent={<MyCustomEmpty />} />

// Built-in with customization
<CoolTable
  data={[]}
  columns={columns}
  emptyProps={{
    description: 'No results found',
    image: require('./assets/empty.png'),
    textStyle: { color: '#999', fontSize: 14 },
  }}
/>
```

---

## Dark Mode Support

The default cell background is white. Override it with the `cellStyle` prop for dark mode:

```tsx
<CoolTable
  data={data}
  columns={columns}
  cellStyle={{ backgroundColor: '#1a1a1a' }}
  textColor="#e0e0e0"
  headerTextColor="#ffffff"
  rowStyle={{ borderBottomColor: '#333' }}
/>
```

---

## Table Props (`ITableProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TItem[]` | **required** | Row data array. |
| `columns` | `ITableColumn[]` | **required** | Column definitions. |
| `rowKey` | `string \| ((item, index) => string)` | -- | Row key field name or getter function. |
| `keyExtractor` | `(item, index) => string` | -- | FlatList key extractor. |
| `style` | `StyleProp<ViewStyle>` | -- | Outer container style. |
| `rowStyle` | `StyleProp<ViewStyle>` | -- | Style applied to every data row. |
| `cellStyle` | `StyleProp<ViewStyle>` | -- | Style applied to every cell (override default white bg). |
| `textColor` | `string` | -- | Default cell text color. |
| `headerTextColor` | `string` | -- | Header text color. |
| `headerRowStyle` | `StyleProp<ViewStyle>` | -- | Header row style. |
| `onPressRow` | `({ item, rowIndex }) => void` | -- | Row tap handler. |
| `onSortChange` | `({ key, colIndex, sort, sortList? }) => void` | -- | Called when sort changes. |
| `onFilterChange` | `({ filters, column }) => void` | -- | Called when filter changes. |
| `treeConfig` | `TExpandable` | -- | Enable tree / expandable rows. |
| `sortConfig` | `ISortConfig` | -- | Sort behavior configuration. |
| `filterConfig` | `IFilterConfig` | -- | Filter behavior configuration. |
| `checkboxConfig` | `ICheckboxConfig` | -- | Checkbox multi-select configuration. |
| `radioConfig` | `IRadioConfig` | -- | Radio single-select configuration. |
| `seqConfig` | `ISeqConfig` | -- | Sequence number column configuration. |
| `stripe` | `boolean` | `false` | Enable alternating row colors. |
| `stripeColor` | `string` | -- | Stripe row background color. |
| `border` | `TBorderType` | -- | Border mode: `'full'` \| `'outer'` \| `'inner'` \| `'none'`. |
| `borderColor` | `string` | -- | Border color. |
| `loading` | `boolean` | `false` | Show loading overlay. |
| `loadingConfig` | `ILoadingConfig` | -- | Loading overlay configuration. |
| `footerConfig` | `IFooterConfig` | -- | Footer summary row configuration. |
| `virtualConfig` | `IVirtualConfig` | -- | Virtual rendering configuration. |
| `rowConfig` | `IRowConfig` | -- | Row highlight/current configuration. |
| `resizeConfig` | `IResizeConfig` | -- | Column resize configuration. |
| `spanMethod` | `TSpanMethod` | -- | Cell merge function. |
| `dragSortConfig` | `IDragSortConfig` | -- | Row drag sort configuration. |
| `paginationConfig` | `IPaginationConfig` | -- | Pagination configuration. |
| `ellipsisConfig` | `IEllipsisConfig` | -- | Global ellipsis + tooltip configuration. |
| `editConfig` | `IEditConfig` | -- | Inline edit configuration. |
| `validationConfig` | `IValidationConfig` | -- | Validation display configuration. |
| `contextMenuConfig` | `IContextMenuConfig` | -- | Context menu configuration. |
| `columnVisibilityConfig` | `IColumnVisibilityConfig` | -- | Column visibility configuration. |
| `searchConfig` | `ISearchConfig` | -- | Search highlight configuration. |
| `locale` | `ILocale` | Chinese | i18n text overrides. |
| `EmptyComponent` | `ReactNode` | -- | Replaces the default empty state. |
| `emptyProps` | `IEmptyProps` | -- | Customize the built-in empty state. |
| `emptyWrapperStyle` | `StyleProp<ViewStyle>` | -- | Empty wrapper style. |
| `FooterComponent` | `ReactNode` | -- | Rendered below the last row. |
| `flatListProps` | `Partial<FlatListProps<TItem>>` | -- | Pass-through props to the inner FlatList. |
| `onLayout` | `(e: LayoutChangeEvent) => void` | -- | Layout event callback. |

---

## Column Config (`ITableColumn`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `key` | `string` | **required** | Data field key. Supports dot notation via `keySplitSymbol`. |
| `title` | `string` | **required** | Header label. |
| `width` | `string \| number` | -- | Column width. |
| `minWidth` | `number` | -- | Minimum column width (used with resize). |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Cell alignment. |
| `fixed` | `boolean \| 'left' \| 'right'` | -- | Pin column to left or right edge. |
| `type` | `TColumnType` | -- | Special column type: `'seq'` \| `'checkbox'` \| `'radio'` \| `'expand'` \| `'drag'`. |
| `sortable` | `boolean` | `false` | Enable sort on header tap. |
| `defaultSort` | `TSortType` | -- | Initial sort direction: `'asc'` \| `'desc'`. |
| `sorter` | `(a: TItem, b: TItem) => number` | -- | Custom sort comparator for local sorting. |
| `filters` | `IFilterOption[]` | -- | Filter option list. |
| `filterMultiple` | `boolean` | `true` | Allow multi-select in filter. |
| `filterMethod` | `({ value, row, column }) => boolean` | -- | Custom filter logic. |
| `filterRender` | `({ column, filters, confirm, reset }) => ReactNode` | -- | Custom filter panel. |
| `children` | `ITableColumn[]` | -- | Child columns for grouped headers. |
| `resizable` | `boolean` | `false` | Enable column resize. |
| `ellipsis` | `boolean \| IEllipsisConfig` | -- | Text ellipsis + tooltip. |
| `editable` | `boolean` | `false` | Enable inline edit. |
| `editType` | `TEditType` | -- | Edit mode: `'text'` \| `'number'` \| `'select'` \| `'custom'`. |
| `editRender` | `({ row, column, value, setValue, save, cancel }) => ReactNode` | -- | Custom edit renderer. |
| `editRules` | `IEditRule[]` | -- | Validation rules for editing. |
| `editOptions` | `Array<{ label, value }>` | -- | Options for `editType: 'select'`. |
| `render` | `(params: ITableColumnParams) => ReactNode` | -- | Custom cell renderer. |
| `renderHeader` | `(params: ITableColumnParams) => ReactNode` | -- | Custom header renderer. |
| `customVal` | `(params) => string \| string[]` | -- | Transform raw cell value. |
| `onPress` | `(params) => void` | -- | Cell tap handler. |
| `style` | `StyleProp<ViewStyle>` | -- | Cell container style. |
| `textStyle` | `StyleProp<TextStyle>` | -- | Cell text style. |
| `hStyle` | `StyleProp<ViewStyle>` | -- | Header cell style. |
| `hTextStyle` | `StyleProp<TextStyle>` | -- | Header text style. |
| `touchStyle` | `StyleProp<ViewStyle>` | -- | Tap area style. |
| `secondTextStyle` | `StyleProp<TextStyle>` | -- | Second-line text style (when `val` is a string array). |
| `showArrow` | `boolean` | -- | Show an expand arrow in the cell. |
| `keySplitSymbol` | `string` | -- | Dot-notation separator for nested key access. |

---

## Ref API (`ICoolTableRef`)

Access imperative methods via a ref:

```tsx
import type { ICoolTableRef } from 'react-native-cool-table';

const tableRef = useRef<ICoolTableRef>(null);

<CoolTable ref={tableRef} data={data} columns={columns} rowKey="id" />

// Usage
tableRef.current?.scrollToTop();
```

### Selection

| Method | Signature | Description |
|--------|-----------|-------------|
| `getCheckboxRecords` | `() => TItem[]` | Get all checkbox-selected rows. |
| `setCheckboxRow` | `(rows: TItem[], checked: boolean) => void` | Set checkbox state for specific rows. |
| `clearCheckboxRow` | `() => void` | Clear all checkbox selections. |
| `getRadioRecord` | `() => TItem \| null` | Get the radio-selected row. |
| `setRadioRow` | `(row: TItem) => void` | Set the radio selection. |
| `clearRadioRow` | `() => void` | Clear radio selection. |

### Sort

| Method | Signature | Description |
|--------|-----------|-------------|
| `sort` | `(field: string, order?: TSortType) => void` | Programmatically sort by a field. |
| `clearSort` | `() => void` | Clear all sort state. |
| `getSortColumns` | `() => TSortItem[]` | Get current sort columns and directions. |

### Filter

| Method | Signature | Description |
|--------|-----------|-------------|
| `clearFilter` | `(field?: string) => void` | Clear filter for a field, or all filters. |
| `getCheckedFilters` | `() => IFilterState[]` | Get current active filter states. |

### Scroll

| Method | Signature | Description |
|--------|-----------|-------------|
| `scrollToRow` | `(row: TItem) => void` | Scroll to bring a specific row into view. |
| `scrollToTop` | `() => void` | Scroll to the top of the table. |

### Data

| Method | Signature | Description |
|--------|-----------|-------------|
| `getFullData` | `() => TItem[]` | Get the full original dataset. |
| `getData` | `() => TItem[]` | Get the currently displayed data (after filter/sort/page). |

### Expand

| Method | Signature | Description |
|--------|-----------|-------------|
| `setRowExpand` | `(rows: TItem[], expanded: boolean) => void` | Expand or collapse specific rows. |
| `setAllRowExpand` | `(expanded: boolean) => void` | Expand or collapse all rows. |

### Pagination

| Method | Signature | Description |
|--------|-----------|-------------|
| `setPage` | `(page: number) => void` | Navigate to a page. |
| `setPageSize` | `(size: number) => void` | Change the page size. |

### Column Visibility

| Method | Signature | Description |
|--------|-----------|-------------|
| `hideColumn` | `(key: string) => void` | Hide a column. |
| `showColumn` | `(key: string) => void` | Show a hidden column. |
| `getHiddenColumns` | `() => string[]` | Get hidden column keys. |

### Column Resize

| Method | Signature | Description |
|--------|-----------|-------------|
| `setColumnWidth` | `(field: string, width: number) => void` | Set a column's width programmatically. |
| `getColumnWidths` | `() => Map<string, number>` | Get all column widths. |

### Inline Edit

| Method | Signature | Description |
|--------|-----------|-------------|
| `startEdit` | `(rowKey: string, columnKey: string) => void` | Start editing a specific cell. |
| `cancelEdit` | `() => void` | Cancel the current edit. |
| `getEditValues` | `() => Map<string, unknown>` | Get all pending edit values. |

### Validation

| Method | Signature | Description |
|--------|-----------|-------------|
| `validate` | `() => Promise<IValidationError[]>` | Validate all editable cells. |
| `validateRow` | `(rowKey: string) => Promise<IValidationError[]>` | Validate a specific row. |
| `clearValidation` | `() => void` | Clear all validation errors. |

---

## Contexts (Advanced)

The table uses a two-context architecture for performance. Static values (columns, config) are separated from frequently-changing state (sort, selection, expand) to minimize re-renders.

```tsx
import { useTableStatic, useTableState } from 'react-native-cool-table';

function CustomCell() {
  // Rarely changes: columns, positionX, treeConfig, rowStyle, configs...
  const { columns, positionX, searchConfig, locale } = useTableStatic();

  // Changes often: sortState, checkedKeys, expandedKeys...
  const { sortState, isExpanded, toggleExpand, checkedKeys } = useTableState();

  return <View>...</View>;
}
```

Use these hooks inside custom cell or header renderers that need access to table state.

---

## Compound Components

The library exports sub-components for advanced use:

```tsx
import CoolTable, {
  Cell,
  Row,
  Sort,
  Pagination,
  ColumnManager,
  DEFAULT_LOCALE,
} from 'react-native-cool-table';

// Compound component access
CoolTable.Cell        // Cell component
CoolTable.Row         // Row component
CoolTable.Sort        // Sort indicator
CoolTable.sortStatus  // { asc: 'asc', desc: 'desc' }
```

---

## Exported Types

All types are importable for building typed wrappers:

```tsx
import type {
  // Core
  ITableProps,
  ITableColumn,
  ITableColumnParams,
  ICoolTableRef,
  TItem,
  // Sort
  TSortType,
  TSortState,
  TSortItem,
  TMultiSortState,
  ISortConfig,
  // Filter
  IFilterOption,
  IFilterState,
  IFilterConfig,
  // Selection
  ICheckboxConfig,
  IRadioConfig,
  ISeqConfig,
  // Layout
  TBorderType,
  IResizeConfig,
  IHeaderCell,
  THeaderLevel,
  ISpanResult,
  TSpanMethod,
  // Features
  IDragSortConfig,
  IPaginationConfig,
  IEllipsisConfig,
  ILoadingConfig,
  IFooterConfig,
  IVirtualConfig,
  IRowConfig,
  // Edit & Validation
  TEditType,
  IEditRule,
  IEditConfig,
  IValidationError,
  IValidationConfig,
  // Advanced
  IContextMenuItem,
  IContextMenuConfig,
  IColumnVisibilityConfig,
  ISearchConfig,
  ILocale,
  // Column type
  TColumnType,
  // Context values
  ITableStaticContextValue,
  ITableStateContextValue,
} from 'react-native-cool-table';
```

---

## Performance Tips

1. **Provide `rowKey`** -- Always provide a stable `rowKey` or `keyExtractor` so the FlatList can efficiently diff rows.

2. **Use `virtualConfig`** -- For large datasets (500+ rows), enable virtual rendering with a fixed `rowHeight` for optimal scroll performance.

3. **Use `sortConfig.remote` and `filterConfig.remote`** -- For server-side data, set `remote: true` to avoid unnecessary local processing.

4. **Memoize callbacks** -- Wrap `onSortChange`, `onFilterChange`, `onPressRow`, etc. in `useCallback` to prevent unnecessary re-renders.

5. **Memoize `render` functions** -- Column `render` and `renderHeader` functions should be defined outside the component or wrapped in `useCallback`.

6. **Leverage the two-context split** -- Custom components using `useTableStatic()` will not re-render when sort/selection state changes, and vice versa.

7. **FlatList pass-through** -- Use `flatListProps` to pass performance-related props like `removeClippedSubviews`, `maxToRenderPerBatch`, etc.

---

## Example App

The `example/` directory contains a full demo app covering all features:

```sh
cd example
yarn install
yarn ios   # or yarn android
```

Or from the project root:

```sh
yarn bootstrap   # first-time setup
yarn example ios
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, commit conventions, and how to run the example app.

## License

MIT
