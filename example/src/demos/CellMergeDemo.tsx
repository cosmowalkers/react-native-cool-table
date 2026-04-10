import React, { useMemo } from 'react';
import type {
  ITableColumn,
  TSpanMethod,
  ISpanResult,
} from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';

const DATA = [
  { id: '1', dept: '研发部', name: '张三', role: '前端', salary: 15000 },
  { id: '2', dept: '研发部', name: '李四', role: '后端', salary: 18000 },
  { id: '3', dept: '研发部', name: '王五', role: '测试', salary: 12000 },
  { id: '4', dept: '产品部', name: '赵六', role: '产品', salary: 16000 },
  { id: '5', dept: '产品部', name: '孙七', role: '设计', salary: 14000 },
  { id: '6', dept: '市场部', name: '周八', role: '运营', salary: 13000 },
];

const CellMergeDemo: React.FC = () => {
  const columns: ITableColumn[] = useMemo(
    () => [
      { key: 'dept', title: '部门', width: 100 },
      { key: 'name', title: '姓名', width: 100 },
      { key: 'role', title: '岗位', width: 100 },
      { key: 'salary', title: '薪资', width: 100, align: 'right' },
    ],
    []
  );

  const spanMethod: TSpanMethod = useMemo(
    () =>
      ({ rowIndex, colIndex }): ISpanResult => {
        if (colIndex === 0) {
          if (rowIndex === 0) return { rowspan: 1, colspan: 1 };
          const prev = DATA[rowIndex - 1];
          const curr = DATA[rowIndex];
          if (prev && curr && prev.dept === curr.dept) {
            return { rowspan: 1, colspan: 0 };
          }
        }
        return { rowspan: 1, colspan: 1 };
      },
    []
  );

  return (
    <DemoLayout
      title="单元格合并"
      description="单元格列合并（colspan），相邻相同值合并"
    >
      <TableContainer
        data={DATA}
        columns={columns}
        rowKey="id"
        spanMethod={spanMethod}
      />
    </DemoLayout>
  );
};

export default CellMergeDemo;
