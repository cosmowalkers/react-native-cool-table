import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateCartItems } from '../utils/dataUtils';
import { colors } from '../styles/commonStyles';

const InteractiveDemo: React.FC = () => {
  const [data, setData] = useState(() => generateCartItems(6));

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

  const renderProduct = useCallback((params: any) => {
    const { row } = params;
    return (
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {row.name}
        </Text>
        <Text style={styles.productSpec} numberOfLines={1}>
          {row.spec}
        </Text>
      </View>
    );
  }, []);

  const renderUnitPrice = useCallback((params: any) => {
    const { row } = params;
    return (
      <Text style={styles.priceText}>
        ¥{(row.price as number).toLocaleString()}
      </Text>
    );
  }, []);

  const renderQuantity = useCallback(
    (params: any) => {
      const { row } = params;
      return (
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(row.id, -1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{row.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(row.id, 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [handleQuantityChange]
  );

  const renderSubtotal = useCallback((params: any) => {
    const { row } = params;
    const subtotal = (row.price as number) * (row.quantity as number);
    return (
      <Text style={styles.subtotalText}>¥{subtotal.toLocaleString()}</Text>
    );
  }, []);

  const renderDeleteAction = useCallback(
    (params: any) => {
      const { row } = params;
      return (
        <TouchableOpacity onPress={() => handleDelete(row.id)}>
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      );
    },
    [handleDelete]
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
    <View style={styles.summaryBar}>
      <Text style={styles.summaryLabel}>
        合计: <Text style={styles.summaryTotal}>¥{total.toLocaleString()}</Text>
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
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  productSpec: {
    fontSize: 12,
    color: colors.textLight,
  },
  priceText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.error,
    textAlign: 'right',
  },
  deleteText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  summaryBar: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fffbe6',
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
  },
});

export default InteractiveDemo;
