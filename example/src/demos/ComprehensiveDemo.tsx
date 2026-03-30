import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import type { ITableColumn, TSortType } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateInventory, sortData } from '../utils/dataUtils';
import {
  renderPrice,
  renderStock,
  renderStatusBadge,
  renderActionButtons,
} from '../utils/renderUtils';
import { colors } from '../styles/commonStyles';

const inventoryStatusConfig = {
  在售: { color: '#52c41a', bgColor: '#f6ffed' },
  缺货: { color: '#ff4d4f', bgColor: '#fff1f0' },
  预售: { color: '#1890ff', bgColor: '#e6f7ff' },
  下架: { color: '#999', bgColor: '#f5f5f5' },
};

const ComprehensiveDemo: React.FC = () => {
  const [data, setData] = useState(() => generateInventory(15));

  const handleSortChange = useCallback(
    ({ key, sort }: { key: string; colIndex: number; sort: TSortType }) => {
      setData((prev) => sortData(prev, key, sort));
    },
    []
  );

  const renderInventoryStatus = useCallback(
    (params: any) => renderStatusBadge(params, inventoryStatusConfig),
    []
  );

  const renderActions = useCallback((params: any) => {
    const actions = [
      {
        text: '编辑',
        onPress: (row: any) => Alert.alert('编辑', `编辑商品: ${row.name}`),
      },
      {
        text: '下架',
        onPress: (row: any) => Alert.alert('下架', `确认下架 ${row.name}?`),
        style: { backgroundColor: colors.warning },
      },
    ];
    return renderActionButtons(params, actions);
  }, []);

  const treeConfig = useMemo(
    () => ({
      animationDuration: 250,
      maxHeight: 300,
      autoCollapseOthers: false,
    }),
    []
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'name',
        title: '商品名',
        width: 130,
        fixed: 'left',
        align: 'left',
        textStyle: { fontWeight: 'bold' },
      },
      {
        key: 'category',
        title: '分类',
        width: 80,
        align: 'center',
      },
      {
        key: 'price',
        title: '价格',
        width: 80,
        align: 'right',
        sortable: true,
        render: renderPrice,
      },
      {
        key: 'stock',
        title: '库存',
        width: 70,
        align: 'center',
        sortable: true,
        render: renderStock,
      },
      {
        key: 'status',
        title: '状态',
        width: 70,
        align: 'center',
        render: renderInventoryStatus,
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
    [renderInventoryStatus, renderActions]
  );

  return (
    <DemoLayout
      title="商品库存管理"
      description="结合排序、左右固定列、树形展开 SKU、库存预警的综合示例"
      scrollable
    >
      <TableContainer
        data={data}
        columns={columns}
        treeConfig={treeConfig}
        keyExtractor={(item) => String(item.id)}
        onSortChange={handleSortChange}
      />
    </DemoLayout>
  );
};

export default ComprehensiveDemo;
