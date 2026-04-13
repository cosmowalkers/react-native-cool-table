import React, { useState, useMemo } from 'react';
import { Text } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { commonStyles } from '../styles/commonStyles';
import { useTheme } from '../context/ThemeContext';

const DATA = [
  {
    id: '1',
    name: 'iPhone 15',
    category: '手机',
    price: 5999,
    sales: 1200,
    stock: 350,
  },
  {
    id: '2',
    name: 'MacBook Pro',
    category: '电脑',
    price: 14999,
    sales: 560,
    stock: 120,
  },
  {
    id: '3',
    name: 'AirPods Pro',
    category: '配件',
    price: 1899,
    sales: 3400,
    stock: 800,
  },
  {
    id: '4',
    name: 'iPad Air',
    category: '平板',
    price: 4799,
    sales: 890,
    stock: 230,
  },
  {
    id: '5',
    name: 'Apple Watch',
    category: '穿戴',
    price: 2999,
    sales: 1560,
    stock: 450,
  },
  {
    id: '6',
    name: 'MacBook Air',
    category: '电脑',
    price: 8999,
    sales: 780,
    stock: 200,
  },
  {
    id: '7',
    name: 'AirTag',
    category: '配件',
    price: 229,
    sales: 5600,
    stock: 1500,
  },
  {
    id: '8',
    name: 'iPhone 14',
    category: '手机',
    price: 4999,
    sales: 2100,
    stock: 600,
  },
];

const COLUMNS: ITableColumn[] = [
  { key: 'name', title: '商品', width: 120, align: 'left' },
  { key: 'category', title: '分类', width: 80 },
  { key: 'price', title: '价格', width: 90, sortable: true },
  { key: 'sales', title: '销量', width: 90, sortable: true },
  { key: 'stock', title: '库存', width: 90, sortable: true },
];

const MultiSortDemo: React.FC = () => {
  const { theme } = useTheme();
  const [sortInfo, setSortInfo] = useState('');

  const extraInfo = useMemo(
    () => (
      <Text style={[commonStyles.sortInfo, { color: theme.colors.primary }]}>
        {sortInfo || '点击表头排序，支持多列排序（优先级序号显示）'}
      </Text>
    ),
    [sortInfo, theme.colors.primary]
  );

  return (
    <DemoLayout
      title="多列排序"
      description="支持多列排序，显示排序优先级"
      extraInfo={extraInfo}
    >
      <TableContainer
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        flex
        sortConfig={{ multiple: true }}
        onSortChange={({ key, sort, sortList }) => {
          if (sortList && sortList.length > 0) {
            const info = sortList
              .map((s, i) => `${i + 1}.${s.columnKey}(${s.sort})`)
              .join(' → ');
            setSortInfo(`排序: ${info}`);
          } else {
            setSortInfo(`排序: ${key} ${sort}`);
          }
        }}
      />
    </DemoLayout>
  );
};

export default MultiSortDemo;
