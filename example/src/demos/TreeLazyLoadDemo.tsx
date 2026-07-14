import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import type { ITableColumn, TItem } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { useTheme } from '../context/ThemeContext';

// 根节点无 children：展开时通过 loadChildren 异步拉取
const ROOT_DATA = [
  { id: 'dept-1', name: '研发中心', count: 3 },
  { id: 'dept-2', name: '市场中心', count: 2 },
  { id: 'dept-3', name: '职能中心', count: 4 },
];

const CHILDREN_MAP: Record<string, TItem[]> = {
  'dept-1': [
    { id: 'dept-1-1', name: '前端组', count: 8 },
    { id: 'dept-1-2', name: '后端组', count: 12 },
    { id: 'dept-1-3', name: '测试组', count: 5 },
  ],
  'dept-2': [
    { id: 'dept-2-1', name: '品牌组', count: 6 },
    { id: 'dept-2-2', name: '增长组', count: 4 },
  ],
  'dept-3': [
    { id: 'dept-3-1', name: '人力', count: 3 },
    { id: 'dept-3-2', name: '财务', count: 3 },
    { id: 'dept-3-3', name: '法务', count: 2 },
    { id: 'dept-3-4', name: '行政', count: 4 },
  ],
};

const TreeLazyLoadDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  // 统计 loadChildren 实际触发次数：验证「快速连点/反复展开」不会重复加载
  const [loadCount, setLoadCount] = useState(0);
  const loadCountRef = useRef(0);

  const loadChildren = useCallback(
    ({ row }: { row: TItem }): Promise<TItem[]> => {
      loadCountRef.current += 1;
      setLoadCount(loadCountRef.current);
      return new Promise((resolve) => {
        setTimeout(() => resolve(CHILDREN_MAP[row.id] ?? []), 800);
      });
    },
    []
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      { key: 'name', title: '部门', width: 160, align: 'left' },
      { key: 'count', title: '人数', width: 100, align: 'right' },
    ],
    []
  );

  const treeConfig = useMemo(
    () => ({
      loadChildren,
      cacheChildren: true,
      animationDuration: 250,
      maxHeight: 260,
    }),
    [loadChildren]
  );

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        info: {
          marginTop: 10,
          fontSize: 13,
          color: colors.primary,
        },
      }),
    [colors]
  );

  return (
    <DemoLayout
      title="异步懒加载子节点"
      description="展开时通过 loadChildren 异步拉取子部门（800ms）。快速连点或反复展开不会重复请求"
      extraInfo={
        <Text style={dynamicStyles.info}>
          loadChildren 已触发 {loadCount} 次（并发/重复展开会被去重）
        </Text>
      }
    >
      <TableContainer
        data={ROOT_DATA}
        columns={columns}
        rowKey="id"
        treeConfig={treeConfig}
        flex
      />
    </DemoLayout>
  );
};

export default TreeLazyLoadDemo;
