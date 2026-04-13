import React, { useState, useMemo } from 'react';
import { Text } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { commonStyles } from '../styles/commonStyles';
import { useTheme } from '../context/ThemeContext';

const DATA = [
  { id: '1', name: 'iPhone 15', category: '手机', price: 5999, status: '在售' },
  {
    id: '2',
    name: 'MacBook Pro',
    category: '电脑',
    price: 14999,
    status: '在售',
  },
  {
    id: '3',
    name: 'AirPods Pro',
    category: '配件',
    price: 1899,
    status: '促销',
  },
  { id: '4', name: 'iPad Air', category: '平板', price: 4799, status: '在售' },
  {
    id: '5',
    name: 'Apple Watch',
    category: '穿戴',
    price: 2999,
    status: '缺货',
  },
  {
    id: '6',
    name: 'MacBook Air',
    category: '电脑',
    price: 8999,
    status: '促销',
  },
  { id: '7', name: 'AirTag', category: '配件', price: 229, status: '在售' },
  {
    id: '8',
    name: 'Magic Mouse',
    category: '配件',
    price: 699,
    status: '缺货',
  },
];

const COLUMNS: ITableColumn[] = [
  { key: 'name', title: '商品', width: 120, align: 'left' },
  {
    key: 'category',
    title: '分类',
    width: 80,
    filters: [
      { label: '手机', value: '手机' },
      { label: '电脑', value: '电脑' },
      { label: '平板', value: '平板' },
      { label: '配件', value: '配件' },
      { label: '穿戴', value: '穿戴' },
    ],
    filterMultiple: true,
  },
  { key: 'price', title: '价格', width: 80, sortable: true },
  {
    key: 'status',
    title: '状态',
    width: 80,
    filters: [
      { label: '在售', value: '在售' },
      { label: '促销', value: '促销' },
      { label: '缺货', value: '缺货' },
    ],
    filterMultiple: false,
  },
];

const FilterDemo: React.FC = () => {
  const { theme } = useTheme();
  const [filterInfo, setFilterInfo] = useState('');

  const extraInfo = useMemo(
    () => (
      <Text style={[commonStyles.sortInfo, { color: theme.colors.primary }]}>
        {filterInfo || '点击表头筛选图标进行筛选'}
      </Text>
    ),
    [filterInfo, theme.colors.primary]
  );

  return (
    <DemoLayout
      title="列筛选"
      description="分类支持多选筛选，状态支持单选筛选"
      extraInfo={extraInfo}
    >
      <TableContainer
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        flex
        onFilterChange={({ filters }) => {
          if (filters.length === 0) {
            setFilterInfo('');
          } else {
            const info = filters
              .map((f) => `${f.columnKey}: ${f.values.join(',')}`)
              .join(' | ');
            setFilterInfo(`当前筛选: ${info}`);
          }
        }}
      />
    </DemoLayout>
  );
};

export default FilterDemo;
