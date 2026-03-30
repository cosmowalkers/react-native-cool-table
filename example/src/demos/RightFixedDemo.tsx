import React, { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateAfterSales } from '../utils/dataUtils';
import { renderStatusBadge, renderActionButtons } from '../utils/renderUtils';

const afterSaleStatusConfig = {
  待处理: { color: '#fa8c16', bgColor: '#fff7e6' },
  处理中: { color: '#1890ff', bgColor: '#e6f7ff' },
  已退款: { color: '#52c41a', bgColor: '#f6ffed' },
  已换货: { color: '#13c2c2', bgColor: '#e6fffb' },
  已关闭: { color: '#999', bgColor: '#f5f5f5' },
};

const RightFixedDemo: React.FC = () => {
  const data = useMemo(() => generateAfterSales(12), []);

  const renderAfterSaleStatus = useCallback(
    (params: any) => renderStatusBadge(params, afterSaleStatusConfig),
    []
  );

  const renderActions = useCallback((params: any) => {
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
        style: { backgroundColor: '#999' },
      },
    ];
    return renderActionButtons(params, actions);
  }, []);

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
        key: 'actions',
        title: '操作',
        width: 110,
        fixed: 'right',
        align: 'center',
        render: renderActions,
      },
    ],
    [renderAfterSaleStatus, renderActions]
  );

  return (
    <DemoLayout
      title="售后工单"
      description="工单号左固定，操作列右固定，中间区域可水平滚动"
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
