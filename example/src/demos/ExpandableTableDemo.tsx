import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateOrderList } from '../utils/dataUtils';
import { renderPrice, renderStatusBadge } from '../utils/renderUtils';
import { colors } from '../styles/commonStyles';

const orderStatusConfig: Record<string, { color: string; bgColor: string }> = {
  待付款: { color: '#fa8c16', bgColor: '#fff7e6' },
  待发货: { color: '#1890ff', bgColor: '#e6f7ff' },
  运输中: { color: '#722ed1', bgColor: '#f9f0ff' },
  已完成: { color: '#52c41a', bgColor: '#f6ffed' },
  已取消: { color: '#999', bgColor: '#f5f5f5' },
};

const ExpandableTableDemo: React.FC = () => {
  const data = useMemo(() => generateOrderList(8), []);

  const renderOrderStatus = useCallback(
    (params: any) => renderStatusBadge(params, orderStatusConfig),
    []
  );

  const renderExpandContent = useCallback(
    ({ data: children, parentData }: { data: any[]; parentData: any }) => {
      if (!children || children.length === 0) {
        return (
          <View style={styles.emptyExpand}>
            <Text style={styles.emptyExpandText}>暂无商品明细</Text>
          </View>
        );
      }

      return (
        <View style={styles.expandContainer}>
          <Text style={styles.expandTitle}>
            订单 {parentData.id} - 商品明细
          </Text>
          {children.map((item: any) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemSubtotal}>
                  ¥{item.subtotal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.itemDetail}>
                <Text style={styles.itemSpec}>{item.spec}</Text>
                <Text style={styles.itemQty}>
                  {item.quantity} x ¥{item.price}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    },
    []
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'id',
        title: '订单号',
        width: 130,
        align: 'left',
        textStyle: { fontWeight: 'bold' },
      },
      {
        key: 'date',
        title: '下单时间',
        width: 90,
        align: 'center',
      },
      {
        key: 'status',
        title: '状态',
        width: 80,
        align: 'center',
        render: renderOrderStatus,
      },
      {
        key: 'total',
        title: '金额',
        width: 90,
        align: 'right',
        render: renderPrice,
      },
    ],
    [renderOrderStatus]
  );

  const treeConfig = useMemo(
    () => ({
      animationDuration: 250,
      maxHeight: 300,
      renderExpand: renderExpandContent,
    }),
    [renderExpandContent]
  );

  return (
    <DemoLayout
      title="订单列表"
      description="点击订单行展开查看商品明细，包含规格、数量和小计"
    >
      <TableContainer
        data={data}
        columns={columns}
        treeConfig={treeConfig}
        keyExtractor={(item) => String(item.id)}
        flex
      />
    </DemoLayout>
  );
};

const styles = StyleSheet.create({
  expandContainer: {
    padding: 12,
    backgroundColor: '#fafafa',
  },
  expandTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: colors.white,
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  itemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSpec: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemQty: {
    fontSize: 12,
    color: colors.textLight,
  },
  emptyExpand: {
    padding: 20,
    alignItems: 'center',
  },
  emptyExpandText: {
    color: colors.textLight,
    fontSize: 14,
  },
});

export default ExpandableTableDemo;
