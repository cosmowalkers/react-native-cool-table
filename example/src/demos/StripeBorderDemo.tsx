import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ITableColumn, TBorderType } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { colors } from '../styles/commonStyles';

const DATA = [
  { id: '1', name: 'iPhone 15', category: '手机', price: 5999, sales: 1200 },
  { id: '2', name: 'MacBook Pro', category: '电脑', price: 14999, sales: 560 },
  { id: '3', name: 'AirPods Pro', category: '配件', price: 1899, sales: 3400 },
  { id: '4', name: 'iPad Air', category: '平板', price: 4799, sales: 890 },
  { id: '5', name: 'Apple Watch', category: '穿戴', price: 2999, sales: 1560 },
  { id: '6', name: 'MacBook Air', category: '电脑', price: 8999, sales: 780 },
];

const COLUMNS: ITableColumn[] = [
  { key: 'name', title: '商品', width: 120, align: 'left' },
  { key: 'category', title: '分类', width: 80 },
  { key: 'price', title: '价格', width: 80 },
  { key: 'sales', title: '销量', width: 80 },
];

const BORDER_OPTIONS: { label: string; value: TBorderType | undefined }[] = [
  { label: '无', value: undefined },
  { label: 'full', value: 'full' },
  { label: 'outer', value: 'outer' },
  { label: 'inner', value: 'inner' },
  { label: 'none', value: 'none' },
];

const StripeBorderDemo: React.FC = () => {
  const [stripe, setStripe] = useState(true);
  const [border, setBorder] = useState<TBorderType | undefined>('full');
  const [loading, setLoading] = useState(false);

  return (
    <DemoLayout
      title="条纹 & 边框 & Loading"
      description="行条纹、多种边框模式、加载状态"
      scrollable
    >
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.toggle, stripe && styles.toggleActive]}
          onPress={() => setStripe((v) => !v)}
        >
          <Text style={[styles.toggleText, stripe && styles.toggleTextActive]}>
            {stripe ? '条纹 ON' : '条纹 OFF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggle, loading && styles.toggleActive]}
          onPress={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
          }}
        >
          <Text style={[styles.toggleText, loading && styles.toggleTextActive]}>
            Loading 2s
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.borderRow}>
        <Text style={styles.label}>边框:</Text>
        {BORDER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={[
              styles.borderBtn,
              border === opt.value && styles.borderBtnActive,
            ]}
            onPress={() => setBorder(opt.value)}
          >
            <Text
              style={[
                styles.borderBtnText,
                border === opt.value && styles.borderBtnTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TableContainer
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        stripe={stripe}
        border={border}
        loading={loading}
        footerConfig={{
          data: [
            {
              name: '合计',
              category: '-',
              price: DATA.reduce((s, r) => s + r.price, 0),
              sales: DATA.reduce((s, r) => s + r.sales, 0),
            },
          ],
          rowStyle: { backgroundColor: '#FAFAFA', minHeight: 48 },
        }}
      />
    </DemoLayout>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,
  },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  toggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 13,
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  borderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginRight: 8,
  },
  borderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 6,
  },
  borderBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  borderBtnText: {
    fontSize: 12,
    color: '#666',
  },
  borderBtnTextActive: {
    color: '#fff',
  },
});

export default StripeBorderDemo;
