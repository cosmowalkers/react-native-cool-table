import React, { useState, useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import type { ITableColumn, TSortType } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateTransactions, sortData } from '../utils/dataUtils';
import { createThemedRenderUtils } from '../utils/renderUtils';
import { useTheme } from '../context/ThemeContext';
import { createThemedStyles } from '../styles/commonStyles';

const SortableTableDemo: React.FC = () => {
  const { theme } = useTheme();
  const themedStyles = useMemo(() => createThemedStyles(theme), [theme]);
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
  const [data, setData] = useState(() => generateTransactions(15));
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    sort: TSortType;
  } | null>(null);

  const handleSortChange = useCallback(
    ({ key, sort }: { key: string; colIndex: number; sort: TSortType }) => {
      setSortConfig({ key, sort });
      setData((prev) => sortData(prev, key, sort));
    },
    []
  );

  const renderTypeBadge = useCallback(
    (params: { val: unknown }) => {
      const type = params.val as string;
      const isIncome = type === 'income';
      const badgeBg = isIncome
        ? `rgba(16, 185, 129, 0.15)`
        : `rgba(239, 68, 68, 0.15)`;
      const badgeColor = isIncome ? theme.colors.success : theme.colors.error;
      return (
        <View
          style={{
            backgroundColor: badgeBg,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
            alignSelf: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '500',
              color: badgeColor,
            }}
          >
            {isIncome ? '收入' : '支出'}
          </Text>
        </View>
      );
    },
    [theme.colors]
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'date',
        title: '日期',
        width: 90,
        align: 'left',
      },
      {
        key: 'description',
        title: '描述',
        width: 100,
        align: 'left',
      },
      {
        key: 'type',
        title: '类型',
        width: 75,
        align: 'center',
        render: renderTypeBadge,
      },
      {
        key: 'amount',
        title: '金额',
        width: 90,
        align: 'right',
        sortable: true,
        render: themedRenders.renderSignedAmount,
      },
      {
        key: 'balance',
        title: '余额',
        width: 90,
        align: 'right',
        render: themedRenders.renderPrice,
      },
    ],
    [renderTypeBadge, themedRenders]
  );

  const sortInfo = sortConfig && (
    <Text style={themedStyles.sortInfo}>
      当前排序: {columns.find((col) => col.key === sortConfig.key)?.title} -{' '}
      {sortConfig.sort === 'asc' ? '升序' : '降序'}
    </Text>
  );

  return (
    <DemoLayout
      title="收支明细"
      description="支持按金额排序的收支流水表，点击表头切换排序方式"
      extraInfo={sortInfo}
    >
      <TableContainer
        data={data}
        columns={columns}
        keyExtractor={(item) => String(item.id)}
        onSortChange={handleSortChange}
        flex
      />
    </DemoLayout>
  );
};

export default SortableTableDemo;
