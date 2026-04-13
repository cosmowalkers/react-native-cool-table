import React, { useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateSizeChart } from '../utils/dataUtils';
import { useTheme } from '../context/ThemeContext';

const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

const FixedColumnDemo: React.FC = () => {
  const { theme } = useTheme();
  const data = useMemo(() => generateSizeChart(8), []);

  const renderSizePrice = useCallback(
    (params: { val: unknown }) => {
      const val = params.val as number;
      if (val === 0) {
        return (
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.textMuted,
              textAlign: 'right',
            }}
          >
            —
          </Text>
        );
      }
      return (
        <Text
          style={{ fontSize: 13, color: theme.colors.text, textAlign: 'right' }}
        >
          ¥{val}
        </Text>
      );
    },
    [theme.colors]
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'name',
        title: '商品名',
        width: 100,
        fixed: true,
        align: 'left',
        textStyle: { fontWeight: 'bold' },
      },
      ...sizes.map((size) => ({
        key: size,
        title: size,
        width: 70,
        align: 'right' as const,
        render: renderSizePrice,
      })),
    ],
    [renderSizePrice]
  );

  return (
    <DemoLayout
      title="多规格价格表"
      description="左侧商品名固定，左右滑动查看各尺码价格，'—'表示该尺码无货"
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

export default FixedColumnDemo;
