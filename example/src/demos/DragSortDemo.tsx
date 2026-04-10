import React, { useState } from 'react';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';

const INITIAL_DATA = [
  { id: '1', rank: 1, name: 'React Native', stars: 11500 },
  { id: '2', rank: 2, name: 'Flutter', stars: 16200 },
  { id: '3', rank: 3, name: 'SwiftUI', stars: 8700 },
  { id: '4', rank: 4, name: 'Jetpack Compose', stars: 7300 },
  { id: '5', rank: 5, name: 'Kotlin Multiplatform', stars: 5100 },
  { id: '6', rank: 6, name: 'Expo', stars: 3200 },
];

const COLUMNS: ITableColumn[] = [
  { key: '_drag', title: '', width: 50, type: 'drag' },
  { key: 'rank', title: '#', width: 50 },
  { key: 'name', title: '框架', width: 160, align: 'left' },
  { key: 'stars', title: 'Stars', width: 80, align: 'right' },
];

const DragSortDemo: React.FC = () => {
  const [data, setData] = useState<Record<string, unknown>[]>(INITIAL_DATA);

  return (
    <DemoLayout
      title="行拖拽排序"
      description="拖拽行排序，长按拖拽手柄上下移动"
    >
      <TableContainer
        data={data}
        columns={COLUMNS}
        rowKey="id"
        dragSortConfig={{
          onDragEnd: (params) => {
            setData(params.data);
          },
        }}
      />
    </DemoLayout>
  );
};

export default DragSortDemo;
