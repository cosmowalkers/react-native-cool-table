import React, { useMemo } from 'react';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';

const PaginationDemo: React.FC = () => {
  const data = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => ({
        id: String(i + 1),
        order: `ORD-${String(i + 1).padStart(4, '0')}`,
        product: `商品 ${i + 1}`,
        amount: Math.round(Math.random() * 500 + 50),
        status: ['待发货', '已发货', '已完成'][i % 3],
      })),
    []
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      { key: 'order', title: '订单号', width: 120 },
      { key: 'product', title: '商品', width: 100 },
      { key: 'amount', title: '金额', width: 80, align: 'right' },
      { key: 'status', title: '状态', width: 80 },
    ],
    []
  );

  return (
    <DemoLayout title="分页" description="分页展示，支持翻页和切换每页条数">
      <TableContainer
        data={data}
        columns={columns}
        rowKey="id"
        flex
        paginationConfig={{
          pageSize: 10,
          pageSizes: [5, 10, 20],
        }}
      />
    </DemoLayout>
  );
};

export default PaginationDemo;
