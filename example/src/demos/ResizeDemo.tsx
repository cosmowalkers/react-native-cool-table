import React, { useMemo, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { commonStyles } from '../styles/commonStyles';
import { useTheme } from '../context/ThemeContext';

const DATA = [
  { id: '1', name: 'iPhone 15', category: '手机', price: 5999, sales: 1200 },
  { id: '2', name: 'MacBook Pro', category: '电脑', price: 14999, sales: 560 },
  { id: '3', name: 'AirPods Pro', category: '配件', price: 1899, sales: 3400 },
  { id: '4', name: 'iPad Air', category: '平板', price: 4799, sales: 890 },
  { id: '5', name: 'Apple Watch', category: '穿戴', price: 2999, sales: 1560 },
];

const ResizeDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [resizeInfo, setResizeInfo] = useState('');

  const columns: ITableColumn[] = useMemo(
    () => [
      { key: 'name', title: '商品', width: 120, resizable: true },
      { key: 'category', title: '分类', width: 80, resizable: true },
      { key: 'price', title: '价格', width: 100, resizable: true },
      { key: 'sales', title: '销量', width: 80, resizable: true },
    ],
    []
  );

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        sortInfo: {
          ...commonStyles.sortInfo,
          color: colors.primary,
        },
      }),
    [colors]
  );

  const extraInfo = useMemo(
    () => (
      <Text style={dynamicStyles.sortInfo}>
        {resizeInfo || '拖拽表头右边缘调整列宽'}
      </Text>
    ),
    [resizeInfo, dynamicStyles]
  );

  return (
    <DemoLayout
      title="列宽调整"
      description="拖拽表头右边缘调整列宽"
      extraInfo={extraInfo}
    >
      <TableContainer
        data={DATA}
        columns={columns}
        rowKey="id"
        flex
        resizeConfig={{
          enabled: true,
          minWidth: 50,
          maxWidth: 300,
          onResizeEnd: ({ column, width }) => {
            setResizeInfo(`${column.title} 宽度调整为 ${Math.round(width)}px`);
          },
        }}
      />
    </DemoLayout>
  );
};

export default ResizeDemo;
