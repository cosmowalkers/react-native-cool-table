import React, { useMemo, useRef, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import type { ITableColumn, ICoolTableRef } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { useTheme } from '../context/ThemeContext';

const DATA = [
  { id: '1', name: 'iPhone 15', category: '手机', price: 5999, stock: 42 },
  { id: '2', name: 'MacBook Pro', category: '电脑', price: 14999, stock: 8 },
  { id: '3', name: 'AirPods Pro', category: '配件', price: 1899, stock: 156 },
  { id: '4', name: 'iPad Air', category: '平板', price: 4799, stock: 23 },
  { id: '5', name: 'Apple Watch', category: '穿戴', price: 2999, stock: 15 },
];

// 可切换显隐的列（name 始终可见，不在此列表）
const TOGGLEABLE = [
  { key: 'category', title: '分类' },
  { key: 'price', title: '价格' },
  { key: 'stock', title: '库存' },
];

const ColumnVisibilityDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const tableRef = useRef<ICoolTableRef>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const columns: ITableColumn[] = useMemo(
    () => [
      { key: 'name', title: '商品', width: 140, align: 'left' },
      { key: 'category', title: '分类', width: 90, align: 'center' },
      { key: 'price', title: '价格', width: 100, align: 'right' },
      { key: 'stock', title: '库存', width: 80, align: 'right' },
    ],
    []
  );

  const toggle = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        tableRef.current?.showColumn?.(key);
      } else {
        next.add(key);
        tableRef.current?.hideColumn?.(key);
      }
      return next;
    });
  };

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        toggleBar: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 12,
        },
        chip: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          marginRight: 8,
          marginBottom: 8,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          backgroundColor: colors.surfaceElevated,
        },
        chipActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        chipText: {
          fontSize: 13,
          color: colors.textSecondary,
        },
        chipTextActive: {
          color: colors.buttonText,
        },
      }),
    [colors]
  );

  const toggleBar = (
    <View style={dynamicStyles.toggleBar}>
      {TOGGLEABLE.map((col) => {
        const visible = !hidden.has(col.key);
        return (
          <TouchableOpacity
            key={col.key}
            style={[dynamicStyles.chip, visible && dynamicStyles.chipActive]}
            onPress={() => toggle(col.key)}
          >
            <Text
              style={[
                dynamicStyles.chipText,
                visible && dynamicStyles.chipTextActive,
              ]}
            >
              {visible ? '● ' : '○ '}
              {col.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <DemoLayout
      title="列显隐"
      description="通过 ref 的 hideColumn / showColumn 动态控制列的显示与隐藏（商品列始终可见）"
      extraInfo={toggleBar}
    >
      <TableContainer
        ref={tableRef}
        data={DATA}
        columns={columns}
        rowKey="id"
        columnVisibilityConfig={{ alwaysVisible: ['name'] }}
        flex
      />
    </DemoLayout>
  );
};

export default ColumnVisibilityDemo;
