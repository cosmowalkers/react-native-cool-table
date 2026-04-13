import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import type { ITableColumn, TSortType } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateInventory, sortData } from '../utils/dataUtils';
import { createThemedRenderUtils } from '../utils/renderUtils';
import { useTheme } from '../context/ThemeContext';

const ComprehensiveDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const themedRenders = useMemo(
    () => createThemedRenderUtils(colors),
    [colors]
  );
  const [data, setData] = useState(() => generateInventory(15));

  const inventoryStatusConfig = useMemo(
    () => ({
      在售: { color: colors.success, bgColor: colors.primaryLight },
      缺货: { color: colors.error, bgColor: colors.surfaceElevated },
      预售: { color: colors.primary, bgColor: colors.primaryLight },
      下架: { color: colors.textMuted, bgColor: colors.surfaceElevated },
    }),
    [colors]
  );

  const handleSortChange = useCallback(
    ({ key, sort }: { key: string; colIndex: number; sort: TSortType }) => {
      setData((prev) => sortData(prev, key, sort));
    },
    []
  );

  const renderInventoryStatus = useCallback(
    (params: any) =>
      themedRenders.renderStatusBadge(params, inventoryStatusConfig),
    [inventoryStatusConfig, themedRenders]
  );

  const renderActions = useCallback(
    (params: any) => {
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
      return themedRenders.renderActionButtons(params, actions);
    },
    [colors, themedRenders]
  );

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
        render: themedRenders.renderPrice,
      },
      {
        key: 'stock',
        title: '库存',
        width: 70,
        align: 'center',
        sortable: true,
        render: themedRenders.renderStock,
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
    [renderInventoryStatus, renderActions, themedRenders]
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
