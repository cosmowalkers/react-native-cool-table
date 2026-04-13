import React, { useMemo } from 'react';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';

const DATA = [
  {
    id: '1',
    name: '张三',
    age: 28,
    gender: '男',
    phone: '13800001111',
    email: 'zhang@test.com',
  },
  {
    id: '2',
    name: '李四',
    age: 32,
    gender: '女',
    phone: '13900002222',
    email: 'li@test.com',
  },
  {
    id: '3',
    name: '王五',
    age: 25,
    gender: '男',
    phone: '13700003333',
    email: 'wang@test.com',
  },
  {
    id: '4',
    name: '赵六',
    age: 30,
    gender: '女',
    phone: '13600004444',
    email: 'zhao@test.com',
  },
  {
    id: '5',
    name: '孙七',
    age: 27,
    gender: '男',
    phone: '13500005555',
    email: 'sun@test.com',
  },
];

const GroupedHeaderDemo: React.FC = () => {
  const columns: ITableColumn[] = useMemo(
    () => [
      { key: 'name', title: '姓名', width: 100 },
      {
        key: 'info',
        title: '基本信息',
        children: [
          { key: 'age', title: '年龄', width: 80 },
          { key: 'gender', title: '性别', width: 80 },
        ],
      },
      {
        key: 'contact',
        title: '联系方式',
        children: [
          { key: 'phone', title: '电话', width: 120 },
          { key: 'email', title: '邮箱', width: 150 },
        ],
      },
    ],
    []
  );

  return (
    <DemoLayout title="分组表头" description="多级分组表头，支持嵌套子列">
      <TableContainer data={DATA} columns={columns} rowKey="id" flex />
    </DemoLayout>
  );
};

export default GroupedHeaderDemo;
