import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateOrderList } from '../utils/dataUtils';
import { createThemedRenderUtils } from '../utils/renderUtils';
import { useTheme } from '../context/ThemeContext';

const orderStatusConfig: Record<string, { color: string; bgColor: string }> = {
  待付款: { color: '#fa8c16', bgColor: 'rgba(250, 140, 22, 0.15)' },
  待发货: { color: '#1890ff', bgColor: 'rgba(24, 144, 255, 0.15)' },
  运输中: { color: '#722ed1', bgColor: 'rgba(114, 46, 209, 0.15)' },
  已完成: { color: '#52c41a', bgColor: 'rgba(82, 196, 26, 0.15)' },
  已取消: { color: '#999', bgColor: 'rgba(153, 153, 153, 0.15)' },
};

const ExpandableTableDemo: React.FC = () => {
  const { theme } = useTheme();
  const themedRenders = useMemo(
    () =>
      createThemedRenderUtils({
        text: theme.colors.text,
        textSecondary: theme.colors.textSecondary,
        textLight: theme.colors.textMuted,
        primary: theme.colors.primary,
        success: theme.colors.success,
        warning: theme.colors.warning,
        error: theme.colors.error,
      }),
    [theme.colors]
  );
  const data = useMemo(() => generateOrderList(8), []);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        expandContainer: {
          padding: 12,
          backgroundColor: theme.colors.background,
        },
        expandTitle: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 8,
        },
        itemCard: {
          backgroundColor: theme.colors.surface,
          padding: 10,
          marginBottom: 6,
          borderRadius: 6,
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.primary,
        },
        itemName: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.text,
          flex: 1,
          marginRight: 8,
        },
        itemSubtotal: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.error,
        },
        itemSpec: {
          fontSize: 12,
          color: theme.colors.textSecondary,
        },
        itemQty: {
          fontSize: 12,
          color: theme.colors.textMuted,
        },
        emptyExpandText: {
          color: theme.colors.textMuted,
          fontSize: 14,
        },
      }),
    [theme]
  );

  const renderOrderStatus = useCallback(
    (params: any) => themedRenders.renderStatusBadge(params, orderStatusConfig),
    [themedRenders]
  );

  const renderExpandContent = useCallback(
    ({ data: children, parentData }: { data: any[]; parentData: any }) => {
      if (!children || children.length === 0) {
        return (
          <View style={styles.emptyExpand}>
            <Text style={dynamicStyles.emptyExpandText}>暂无商品明细</Text>
          </View>
        );
      }

      return (
        <View style={dynamicStyles.expandContainer}>
          <Text style={dynamicStyles.expandTitle}>
            订单 {parentData.id} - 商品明细
          </Text>
          {children.map((item: any) => (
            <View key={item.id} style={dynamicStyles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={dynamicStyles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={dynamicStyles.itemSubtotal}>
                  ¥{item.subtotal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.itemDetail}>
                <Text style={dynamicStyles.itemSpec}>{item.spec}</Text>
                <Text style={dynamicStyles.itemQty}>
                  {item.quantity} x ¥{item.price}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    },
    [dynamicStyles]
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
        render: themedRenders.renderPrice,
      },
    ],
    [renderOrderStatus, themedRenders]
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyExpand: {
    padding: 20,
    alignItems: 'center',
  },
});

export default ExpandableTableDemo;
