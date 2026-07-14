import React, { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateAfterSales } from '../utils/dataUtils';
import { createThemedRenderUtils } from '../utils/renderUtils';
import { useTheme } from '../context/ThemeContext';

const afterSaleStatusConfig = {
  待处理: { color: '#fa8c16', bgColor: 'rgba(250, 140, 22, 0.15)' },
  处理中: { color: '#1890ff', bgColor: 'rgba(24, 144, 255, 0.15)' },
  已退款: { color: '#52c41a', bgColor: 'rgba(82, 196, 26, 0.15)' },
  已换货: { color: '#13c2c2', bgColor: 'rgba(19, 194, 194, 0.15)' },
  已关闭: { color: '#999', bgColor: 'rgba(153, 153, 153, 0.15)' },
};

const RightFixedDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const themedRenders = useMemo(
    () => createThemedRenderUtils(colors),
    [colors]
  );
  const data = useMemo(() => generateAfterSales(12), []);

  const renderAfterSaleStatus = useCallback(
    (params: any) =>
      themedRenders.renderStatusBadge(params, afterSaleStatusConfig),
    [themedRenders]
  );

  const renderActions = useCallback(
    (params: any) => {
      const actions = [
        {
          text: '处理',
          onPress: (row: any) =>
            Alert.alert('处理工单', `工单号: ${row.id}\n商品: ${row.product}`),
        },
        {
          text: '关闭',
          onPress: (row: any) =>
            Alert.alert('关闭工单', `确认关闭工单 ${row.id}?`),
          style: { backgroundColor: colors.textMuted },
        },
      ];
      return themedRenders.renderActionButtons(params, actions);
    },
    [themedRenders, colors]
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'id',
        title: '工单号',
        width: 110,
        fixed: 'left',
        align: 'left',
        textStyle: { fontWeight: 'bold' },
      },
      {
        key: 'product',
        title: '商品',
        width: 120,
        align: 'left',
      },
      {
        key: 'issue',
        title: '问题类型',
        width: 80,
        align: 'center',
      },
      {
        key: 'date',
        title: '提交时间',
        width: 90,
        align: 'center',
      },
      {
        key: 'status',
        title: '状态',
        width: 80,
        align: 'center',
        render: renderAfterSaleStatus,
      },
      {
        key: 'amount',
        title: '退款金额',
        width: 100,
        fixed: 'right',
        align: 'right',
        customVal: ({ val }) => `¥${Number(val).toLocaleString()}`,
        textStyle: { fontWeight: 'bold', color: colors.error },
      },
      {
        key: 'actions',
        title: '操作',
        width: 110,
        fixed: 'right',
        align: 'center',
        render: renderActions,
      },
    ],
    [renderAfterSaleStatus, renderActions, colors.error]
  );

  return (
    <DemoLayout
      title="售后工单"
      description="工单号左固定，退款金额（右对齐）+ 操作列右固定，中间区域可水平滚动"
      scrollable
    >
      <TableContainer
        data={data}
        columns={columns}
        keyExtractor={(item) => String(item.id)}
      />
    </DemoLayout>
  );
};

export default RightFixedDemo;
