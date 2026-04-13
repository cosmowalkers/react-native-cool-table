import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateCartItems } from '../utils/dataUtils';
import { useTheme } from '../context/ThemeContext';

const InteractiveDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [data, setData] = useState(() => generateCartItems(6));

  const themedStyles = useMemo(
    () => ({
      productName: {
        fontSize: 14,
        fontWeight: '500' as const,
        color: colors.text,
        marginBottom: 2,
      },
      productSpec: {
        fontSize: 12,
        color: colors.textMuted,
      },
      priceText: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'right' as const,
      },
      quantityButton: {
        width: 26,
        height: 26,
        borderRadius: 4,
        backgroundColor: colors.border,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      },
      quantityButtonText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: colors.text,
      },
      quantityValue: {
        fontSize: 14,
        fontWeight: '500' as const,
        color: colors.text,
        marginHorizontal: 10,
        minWidth: 20,
        textAlign: 'center' as const,
      },
      subtotalText: {
        fontSize: 14,
        fontWeight: 'bold' as const,
        color: colors.error,
        textAlign: 'right' as const,
      },
      deleteText: {
        fontSize: 13,
        color: colors.error,
        fontWeight: '500' as const,
      },
      summaryBar: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: colors.surfaceElevated,
        borderRadius: 6,
        alignItems: 'flex-end' as const,
      },
      summaryLabel: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '500' as const,
      },
      summaryTotal: {
        fontSize: 18,
        fontWeight: 'bold' as const,
        color: colors.error,
      },
    }),
    [colors]
  );

  const handleQuantityChange = useCallback((itemId: number, delta: number) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  }, []);

  const handleDelete = useCallback((itemId: number) => {
    setData((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const renderProduct = useCallback(
    (params: any) => {
      const { row } = params;
      return (
        <View style={styles.productInfo}>
          <Text style={themedStyles.productName} numberOfLines={1}>
            {row.name}
          </Text>
          <Text style={themedStyles.productSpec} numberOfLines={1}>
            {row.spec}
          </Text>
        </View>
      );
    },
    [themedStyles]
  );

  const renderUnitPrice = useCallback(
    (params: any) => {
      const { row } = params;
      return (
        <Text style={themedStyles.priceText}>
          ¥{(row.price as number).toLocaleString()}
        </Text>
      );
    },
    [themedStyles]
  );

  const renderQuantity = useCallback(
    (params: any) => {
      const { row } = params;
      return (
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={themedStyles.quantityButton}
            onPress={() => handleQuantityChange(row.id, -1)}
          >
            <Text style={themedStyles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={themedStyles.quantityValue}>{row.quantity}</Text>
          <TouchableOpacity
            style={themedStyles.quantityButton}
            onPress={() => handleQuantityChange(row.id, 1)}
          >
            <Text style={themedStyles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [handleQuantityChange, themedStyles]
  );

  const renderSubtotal = useCallback(
    (params: any) => {
      const { row } = params;
      const subtotal = (row.price as number) * (row.quantity as number);
      return (
        <Text style={themedStyles.subtotalText}>
          ¥{subtotal.toLocaleString()}
        </Text>
      );
    },
    [themedStyles]
  );

  const renderDeleteAction = useCallback(
    (params: any) => {
      const { row } = params;
      return (
        <TouchableOpacity onPress={() => handleDelete(row.id)}>
          <Text style={themedStyles.deleteText}>删除</Text>
        </TouchableOpacity>
      );
    },
    [handleDelete, themedStyles]
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'name',
        title: '商品',
        width: 140,
        align: 'left',
        render: renderProduct,
      },
      {
        key: 'price',
        title: '单价',
        width: 80,
        align: 'right',
        render: renderUnitPrice,
      },
      {
        key: 'quantity',
        title: '数量',
        width: 100,
        align: 'center',
        render: renderQuantity,
      },
      {
        key: 'subtotal',
        title: '小计',
        width: 80,
        align: 'right',
        render: renderSubtotal,
      },
      {
        key: 'actions',
        title: '操作',
        width: 60,
        align: 'center',
        render: renderDeleteAction,
      },
    ],
    [
      renderProduct,
      renderUnitPrice,
      renderQuantity,
      renderSubtotal,
      renderDeleteAction,
    ]
  );

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [data]
  );

  const summaryBar = (
    <View style={themedStyles.summaryBar}>
      <Text style={themedStyles.summaryLabel}>
        合计:{' '}
        <Text style={themedStyles.summaryTotal}>¥{total.toLocaleString()}</Text>
      </Text>
    </View>
  );

  return (
    <DemoLayout
      title="购物车"
      description="支持数量加减、删除商品、实时计算合计金额"
      extraInfo={summaryBar}
    >
      <TableContainer
        data={data}
        columns={columns}
        keyExtractor={(item) => String(item.id)}
        flex
      />
    </DemoLayout>
  );
};

const styles = StyleSheet.create({
  productInfo: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InteractiveDemo;
