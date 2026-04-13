import React, { useMemo, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { commonStyles } from '../styles/commonStyles';
import { useTheme } from '../context/ThemeContext';

const INITIAL_DATA = [
  { id: '1', name: '苹果', qty: 10, unit: 'kg', category: 'fruit' },
  { id: '2', name: '牛奶', qty: 5, unit: 'L', category: 'dairy' },
  { id: '3', name: '面包', qty: 3, unit: '袋', category: 'bakery' },
  { id: '4', name: '鸡蛋', qty: 30, unit: '个', category: 'dairy' },
  { id: '5', name: '大米', qty: 2, unit: 'kg', category: 'grain' },
];

const COLUMNS: ITableColumn[] = [
  { key: 'name', title: '商品', width: 100, editable: true, editType: 'text' },
  { key: 'qty', title: '数量', width: 80, editable: true, editType: 'number' },
  { key: 'unit', title: '单位', width: 80 },
  {
    key: 'category',
    title: '分类',
    width: 100,
    editable: true,
    editType: 'select',
    editOptions: [
      { label: '水果', value: 'fruit' },
      { label: '乳制品', value: 'dairy' },
      { label: '烘焙', value: 'bakery' },
      { label: '粮食', value: 'grain' },
    ],
  },
];

const EditDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [editInfo, setEditInfo] = useState('');

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        sortInfo: {
          ...commonStyles.sortInfo,
          color: colors.primary,
        },
      }),
    [colors]
  );

  return (
    <DemoLayout
      title="单元格编辑"
      description="单击单元格进入编辑模式，支持文本/数字/下拉选择"
      extraInfo={
        <Text style={dynamicStyles.sortInfo}>
          {editInfo || '单击可编辑的单元格进入编辑'}
        </Text>
      }
    >
      <TableContainer
        data={INITIAL_DATA}
        columns={COLUMNS}
        rowKey="id"
        flex
        editConfig={{
          trigger: 'click',
          onEditSave: ({ row, column, value }) => {
            setEditInfo(
              `已保存: ${row.name} 的 ${column.title} → ${String(value)}`
            );
          },
        }}
      />
    </DemoLayout>
  );
};

export default EditDemo;
