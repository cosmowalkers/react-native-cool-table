import React, { useMemo } from 'react';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateProductList } from '../utils/dataUtils';
import { createThemedRenderUtils } from '../utils/renderUtils';
import { useTheme } from '../context/ThemeContext';

const BasicTableDemo: React.FC = () => {
  const { theme } = useTheme();
  const themedRenders = useMemo(
    () => createThemedRenderUtils(theme.colors),
    [theme.colors]
  );
  const data = useMemo(() => generateProductList(15), []);

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'name',
        title: '商品名',
        width: 140,
        align: 'left',
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
        render: themedRenders.renderPrice,
      },
      {
        key: 'sales',
        title: '月销量',
        width: 70,
        align: 'right',
      },
    ],
    [themedRenders]
  );

  return (
    <DemoLayout
      title="商品列表"
      description="展示基础商品信息，包含名称、分类、价格和月销量"
    >
      <TableContainer
        data={data}
        columns={columns}
        keyExtractor={(item) => String(item.id)}
        flex
      />
    </DemoLayout>
  );
};

export default BasicTableDemo;
