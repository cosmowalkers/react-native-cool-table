import React, { useMemo } from 'react';
import type {
  ITableColumn,
  TSpanMethod,
  ISpanResult,
} from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';

/**
 * colspan demo data:
 * - Row with role === '负责人' spans name+role into one cell (colspan: 2).
 * - Other rows render name and role separately.
 */
const DATA = [
  { id: '1', dept: '研发部', name: '张三', role: '前端工程师', salary: 15000 },
  {
    id: '2',
    dept: '研发部',
    name: '李四（负责人）',
    role: '负责人',
    salary: 18000,
  },
  { id: '3', dept: '产品部', name: '赵六', role: '产品经理', salary: 16000 },
  {
    id: '4',
    dept: '产品部',
    name: '孙七（负责人）',
    role: '负责人',
    salary: 17000,
  },
  { id: '5', dept: '市场部', name: '周八', role: '运营专员', salary: 13000 },
  {
    id: '6',
    dept: '市场部',
    name: '吴九（负责人）',
    role: '负责人',
    salary: 15000,
  },
];

const CellMergeDemo: React.FC = () => {
  const columns: ITableColumn[] = useMemo(
    () => [
      { key: 'dept', title: '部门', width: 100 },
      { key: 'name', title: '姓名', width: 120 },
      { key: 'role', title: '岗位', width: 100 },
      { key: 'salary', title: '薪资', width: 100, align: 'right' },
    ],
    []
  );

  /**
   * When role is '负责人', the name cell spans 2 columns (name + role).
   * The role cell for that row is hidden (colspan: 0).
   */
  const spanMethod: TSpanMethod = useMemo(
    () =>
      ({ rowIndex, colIndex }): ISpanResult => {
        const row = DATA[rowIndex];
        if (!row) return { rowspan: 1, colspan: 1 };

        if (row.role === '负责人') {
          // name column: span across name + role
          if (colIndex === 1) {
            return { rowspan: 1, colspan: 2 };
          }
          // role column: hidden (merged into name)
          if (colIndex === 2) {
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
      description="列合并（colspan）：负责人的姓名横跨两列"
    >
      <TableContainer
        data={DATA}
        columns={columns}
        rowKey="id"
        spanMethod={spanMethod}
        flex
      />
    </DemoLayout>
  );
};

export default CellMergeDemo;
