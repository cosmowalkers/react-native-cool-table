import React, { useState, useRef, useMemo } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import type { ITableColumn, ICoolTableRef } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { useTheme } from '../context/ThemeContext';

const DATA = [
  { id: '1', name: 'iPhone 15', price: 5999, qty: 2 },
  { id: '2', name: 'MacBook Pro', price: 14999, qty: 1 },
  { id: '3', name: 'AirPods Pro', price: 1899, qty: 3 },
  { id: '4', name: 'iPad Air', price: 4799, qty: 1 },
  { id: '5', name: 'Apple Watch', price: 2999, qty: 2 },
];

const CHECKBOX_COLUMNS: ITableColumn[] = [
  { key: '__checkbox', title: '', type: 'checkbox', width: 50 },
  { key: 'id', title: '#', type: 'seq', width: 40 },
  { key: 'name', title: '商品', width: 120, align: 'left' },
  { key: 'price', title: '价格', width: 80 },
  { key: 'qty', title: '数量', width: 60 },
];

const RADIO_COLUMNS: ITableColumn[] = [
  { key: '__radio', title: '', type: 'radio', width: 50 },
  { key: 'name', title: '商品', width: 120, align: 'left' },
  { key: 'price', title: '价格', width: 80 },
  { key: 'qty', title: '数量', width: 60 },
];

const CheckboxRadioDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const tableRef = useRef<ICoolTableRef>(null);
  const [selectedInfo, setSelectedInfo] = useState('未选择');
  const [radioInfo, setRadioInfo] = useState('未选择');

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        sectionTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 4,
        },
        info: {
          fontSize: 13,
          color: colors.primary,
        },
        btn: {
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 4,
          marginRight: 8,
        },
        btnText: {
          color: colors.buttonText,
          fontSize: 13,
        },
      }),
    [colors]
  );

  return (
    <DemoLayout
      title="多选 & 单选"
      description="Checkbox 多选（含全选）和 Radio 单选"
      scrollable
    >
      {/* Checkbox */}
      <View style={styles.sectionHeader}>
        <Text style={dynamicStyles.sectionTitle}>Checkbox 多选</Text>
        <Text style={dynamicStyles.info}>{selectedInfo}</Text>
      </View>
      <TableContainer
        ref={tableRef}
        data={DATA}
        columns={CHECKBOX_COLUMNS}
        rowKey="id"
        checkboxConfig={{
          checkAll: true,
          highlight: true,
          onChange: ({ records }) => {
            if (records.length === 0) {
              setSelectedInfo('未选择');
            } else {
              setSelectedInfo(
                `已选 ${records.length} 件: ${records
                  .map((r) => r.name)
                  .join(', ')}`
              );
            }
          },
        }}
      />
      <View style={styles.actions}>
        <TouchableOpacity
          style={dynamicStyles.btn}
          onPress={() => tableRef.current?.clearCheckboxRow()}
        >
          <Text style={dynamicStyles.btnText}>清空选择</Text>
        </TouchableOpacity>
      </View>

      {/* Radio */}
      <View style={styles.sectionHeader}>
        <Text style={dynamicStyles.sectionTitle}>Radio 单选</Text>
        <Text style={dynamicStyles.info}>{radioInfo}</Text>
      </View>
      <TableContainer
        data={DATA}
        columns={RADIO_COLUMNS}
        rowKey="id"
        radioConfig={{
          highlight: true,
          onChange: ({ row }) => {
            setRadioInfo(row ? `已选: ${row.name}` : '未选择');
          },
        }}
      />
    </DemoLayout>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 4,
  },
});

export default CheckboxRadioDemo;
