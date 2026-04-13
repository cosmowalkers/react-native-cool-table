import React, { useMemo } from 'react';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';

const DATA = [
  {
    id: '1',
    title: 'React Native 性能优化实战指南：从原理到落地的完整方案',
    author: '张三',
    views: 12300,
  },
  {
    id: '2',
    title: '深入理解 JavaScript 异步编程模型及其在大型应用中的最佳实践',
    author: '李四',
    views: 8900,
  },
  {
    id: '3',
    title: 'TypeScript 5.0 新特性全面解析与项目迁移实录',
    author: '王五',
    views: 6700,
  },
  {
    id: '4',
    title: '从零搭建企业级 React 组件库：设计系统、文档与发布全流程',
    author: '赵六',
    views: 15200,
  },
  {
    id: '5',
    title: 'CSS Container Queries 实战：响应式设计的下一个范式转变',
    author: '孙七',
    views: 4300,
  },
];

const EllipsisDemo: React.FC = () => {
  const columns: ITableColumn[] = useMemo(
    () => [
      { key: 'title', title: '标题', width: 180, ellipsis: true },
      { key: 'author', title: '作者', width: 80 },
      { key: 'views', title: '阅读量', width: 80, align: 'right' },
    ],
    []
  );

  return (
    <DemoLayout title="省略 + 提示" description="文本省略 + 长按显示完整内容">
      <TableContainer
        data={DATA}
        columns={columns}
        rowKey="id"
        flex
        ellipsisConfig={{
          enabled: true,
          numberOfLines: 1,
          trigger: 'longPress',
        }}
      />
    </DemoLayout>
  );
};

export default EllipsisDemo;
