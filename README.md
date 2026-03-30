# react-native-cool-table

A high-performance, feature-rich table component for React Native. Built as a compound component with strict TypeScript support.

## Features

- Horizontal scrolling with fixed (pinned) columns — left and right
- Sortable columns with asc/desc cycling
- Expandable / tree rows with animated collapse
- Custom cell and header rendering
- Empty state with custom image and text
- FlatList-based rendering for large datasets
- Two-context architecture for minimal re-renders

## Installation

```sh
npm install react-native-cool-table
# or
yarn add react-native-cool-table
```

## Basic Usage

```tsx
import CoolTable from 'react-native-cool-table';
import type { ITableColumn } from 'react-native-cool-table';

const columns: ITableColumn[] = [
  { key: 'name',  title: 'Name',   width: 140, align: 'left' },
  { key: 'price', title: 'Price',  width: 80,  align: 'right' },
  { key: 'sales', title: 'Sales',  width: 70,  align: 'right' },
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

## Column Config (`ITableColumn`)

| Prop | Type | Description |
|------|------|-------------|
| `key` | `string` | Required. Maps to the data field. Supports dot notation via `keySplitSymbol`. |
| `title` | `string` | Header label. |
| `width` | `string \| number` | Column width. |
| `align` | `'left' \| 'center' \| 'right'` | Cell alignment. |
| `fixed` | `boolean \| 'left' \| 'right'` | Pin column to left or right edge. |
| `sortable` | `boolean` | Enable sort cycling on header tap. |
| `defaultSort` | `'asc' \| 'desc'` | Initial sort direction. |
| `render` | `(params: ITableColumnParams) => ReactNode` | Custom cell renderer. |
| `renderHeader` | `(params: ITableColumnParams) => ReactNode` | Custom header renderer. |
| `customVal` | `(params) => string \| string[]` | Transform the raw cell value. |
| `onPress` | `(params) => void` | Cell tap handler. |
| `style` | `StyleProp<ViewStyle>` | Cell container style. |
| `textStyle` | `StyleProp<TextStyle>` | Cell text style. |
| `hStyle` | `StyleProp<ViewStyle>` | Header cell style. |
| `hTextStyle` | `StyleProp<TextStyle>` | Header text style. |
| `secondTextStyle` | `StyleProp<TextStyle>` | Second-line text style (when `val` is a string array). |
| `showArrow` | `boolean` | Show an expand arrow in the cell. |

## Table Props (`ITableProps`)

| Prop | Type | Description |
|------|------|-------------|
| `data` | `TItem[]` | Required. Row data. |
| `columns` | `ITableColumn[]` | Required. Column definitions. |
| `rowKey` | `string \| ((item, index) => string)` | Row key field or getter. |
| `keyExtractor` | `(item, index) => string` | FlatList key extractor. |
| `style` | `StyleProp<ViewStyle>` | Outer container style. |
| `rowStyle` | `StyleProp<ViewStyle>` | Style applied to every data row. |
| `headerRowStyle` | `StyleProp<ViewStyle>` | Header row style. |
| `onPressRow` | `({ item, rowIndex }) => void` | Row tap handler. |
| `onSortChange` | `({ key, colIndex, sort }) => void` | Called when sort changes. |
| `treeConfig` | `TExpandable` | Enable tree / expandable rows. |
| `EmptyComponent` | `ReactNode` | Replaces the default empty state. |
| `emptyProps` | `IEmptyProps` | Customize the default empty state. |
| `FooterComponent` | `ReactNode` | Rendered below the last row. |
| `flatListProps` | `Partial<FlatListProps<TItem>>` | Pass-through props to the inner FlatList. |
| `onLayout` | `(e: LayoutChangeEvent) => void` | Layout event callback. |

## Sortable Columns

```tsx
const columns: ITableColumn[] = [
  {
    key: 'price',
    title: 'Price',
    width: 100,
    sortable: true,
    defaultSort: 'desc',
  },
];

<CoolTable
  data={data}
  columns={columns}
  onSortChange={({ key, sort }) => {
    console.log(`Sort by ${key}: ${sort}`);
    // fetch sorted data...
  }}
/>
```

Tapping a sortable header cycles: `asc → desc → asc → ...`

## Fixed (Pinned) Columns

```tsx
const columns: ITableColumn[] = [
  { key: 'name',    title: 'Name',    width: 120, fixed: true },   // pin left
  { key: 'sku',     title: 'SKU',     width: 100 },
  { key: 'stock',   title: 'Stock',   width: 80 },
  { key: 'action',  title: 'Action',  width: 80,  fixed: 'right' }, // pin right
];
```

Fixed columns counteract horizontal scroll via an `Animated.Value` translateX, so they always stay visible.

## Tree / Expandable Rows

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

### `TExpandable` options

| Prop | Type | Description |
|------|------|-------------|
| `animationDuration` | `number` | Collapse animation duration (ms). |
| `maxHeight` | `number` | Max height of the expanded area. |
| `autoCollapseOthers` | `boolean` | Collapse other rows when one expands. |
| `rowStyle` | `StyleProp<ViewStyle>` | Style for child rows. |
| `renderItem` | `(params) => ReactNode` | Custom child row renderer. |
| `renderExpand` | `(params) => ReactNode` | Fully custom expanded area renderer. |

## Custom Cell Rendering

```tsx
import type { ITableColumnParams } from 'react-native-cool-table';
import { Text, View } from 'react-native';

function renderStatus({ val }: ITableColumnParams) {
  const color = val === 'active' ? 'green' : 'gray';
  return (
    <View style={{ backgroundColor: color, borderRadius: 4, padding: 4 }}>
      <Text style={{ color: '#fff' }}>{String(val)}</Text>
    </View>
  );
}

const columns: ITableColumn[] = [
  { key: 'status', title: 'Status', width: 90, render: renderStatus },
];
```

## Empty State

```tsx
// Custom component
<CoolTable data={[]} columns={columns} EmptyComponent={<MyEmpty />} />

// Built-in empty props
<CoolTable
  data={[]}
  columns={columns}
  emptyProps={{
    description: 'No results found',
    image: require('./assets/empty.png'),
  }}
/>
```

## Contexts (Advanced)

The table exposes two contexts for deeply nested custom components:

```tsx
import { useTableStatic, useTableState } from 'react-native-cool-table';

// Rarely-changing: columns, positionX, treeConfig, rowStyle, onSortChange
const { columns, positionX } = useTableStatic();

// Frequently-changing: sortState, expandedKeys, toggleExpand, isExpanded
const { sortState, isExpanded, toggleExpand } = useTableState();
```

## Compound Components

```tsx
import CoolTable, { Cell, Row, Sort } from 'react-native-cool-table';

CoolTable.Cell   // Cell component
CoolTable.Row    // Row component
CoolTable.Sort   // Sort indicator
CoolTable.sortStatus  // { asc: 'asc', desc: 'desc' }
```

## Example App

The `example/` directory contains a full demo app with scenarios covering:

- Basic product listing
- Sortable pricing tables
- Fixed column financial reports
- Custom cell rendering (badges, progress bars, avatars)
- Expandable category trees
- Large dataset performance
- Empty states

```sh
cd example
yarn install
yarn ios   # or yarn android
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
