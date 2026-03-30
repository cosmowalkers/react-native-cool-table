import React, { useState, useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import type { ITableColumn, TSortType } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateTransactions, sortData } from '../utils/dataUtils';
import { renderSignedAmount, renderPrice } from '../utils/renderUtils';
import { commonStyles } from '../styles/commonStyles';

const SortableTableDemo: React.FC = () => {
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

  const renderTypeBadge = useCallback((params: { val: unknown }) => {
    const type = params.val as string;
    const isIncome = type === 'income';
    return (
      <View
        style={{
          backgroundColor: isIncome ? '#f6ffed' : '#fff1f0',
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
            color: isIncome ? '#52c41a' : '#ff4d4f',
          }}
        >
          {isIncome ? '收入' : '支出'}
        </Text>
      </View>
    );
  }, []);

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
        width: 60,
        align: 'center',
        render: renderTypeBadge,
      },
      {
        key: 'amount',
        title: '金额',
        width: 90,
        align: 'right',
        sortable: true,
        render: renderSignedAmount,
      },
      {
        key: 'balance',
        title: '余额',
        width: 90,
        align: 'right',
        render: renderPrice,
      },
    ],
    [renderTypeBadge]
  );

  const sortInfo = sortConfig && (
    <Text style={commonStyles.sortInfo}>
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
