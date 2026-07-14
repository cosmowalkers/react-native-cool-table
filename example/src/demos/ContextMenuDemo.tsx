import React, { useMemo, useState } from 'react';
import { Text, Alert } from 'react-native';
import type {
  ITableColumn,
  IContextMenuConfig,
  IContextMenuItem,
} from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { createThemedStyles } from '../styles/commonStyles';
import { useTheme } from '../context/ThemeContext';

const DATA = [
  { id: '1', name: 'iPhone 15', category: '手机', stock: 42 },
  { id: '2', name: 'MacBook Pro', category: '电脑', stock: 8 },
  { id: '3', name: 'AirPods Pro', category: '配件', stock: 156 },
  { id: '4', name: 'iPad Air', category: '平板', stock: 23 },
  { id: '5', name: 'Apple Watch', category: '穿戴', stock: 0 },
];

const COLUMNS: ITableColumn[] = [
  { key: 'name', title: '商品', width: 140, align: 'left' },
  { key: 'category', title: '分类', width: 90, align: 'center' },
  { key: 'stock', title: '库存', width: 80, align: 'right' },
];

const ContextMenuDemo: React.FC = () => {
  const { theme } = useTheme();
  const themedStyles = useMemo(() => createThemedStyles(theme), [theme]);
  const [lastAction, setLastAction] = useState('长按任意行唤起操作菜单');

  const contextMenuConfig: IContextMenuConfig = useMemo(
    () => ({
      // 动态菜单：库存为 0 时禁用「减库存」，并追加「补货」项
      getItems: ({ row }) => {
        const base: IContextMenuItem[] = [
          {
            key: 'detail',
            label: '查看详情',
            onPress: () =>
              Alert.alert('详情', `${row.name}\n库存：${row.stock}`),
          },
          {
            key: 'minus',
            label: '减库存',
            disabled: row.stock === 0,
            onPress: () => setLastAction(`对「${row.name}」执行了减库存`),
          },
        ];
        if (row.stock === 0) {
          base.push({
            key: 'restock',
            label: '补货',
            onPress: () => setLastAction(`对「${row.name}」发起了补货`),
          });
        }
        base.push({
          key: 'delete',
          label: '删除',
          danger: true,
          onPress: () => setLastAction(`删除了「${row.name}」`),
        });
        return base;
      },
    }),
    []
  );

  return (
    <DemoLayout
      title="长按菜单"
      description="长按行唤起上下文操作菜单，菜单项可按行数据动态生成（库存为 0 时禁用减库存并追加补货）"
      extraInfo={<Text style={themedStyles.sortInfo}>{lastAction}</Text>}
    >
      <TableContainer
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        contextMenuConfig={contextMenuConfig}
        flex
      />
    </DemoLayout>
  );
};

export default ContextMenuDemo;
