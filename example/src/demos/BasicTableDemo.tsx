import React, { useMemo } from 'react';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateProductList } from '../utils/dataUtils';
import { renderPrice } from '../utils/renderUtils';

const BasicTableDemo: React.FC = () => {
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
        render: renderPrice,
      },
      {
        key: 'sales',
        title: '月销量',
        width: 70,
        align: 'right',
      },
    ],
    []
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
      />
    </DemoLayout>
  );
};

export default BasicTableDemo;
