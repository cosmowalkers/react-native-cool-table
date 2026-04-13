import React, { useState, useMemo } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { useTheme } from '../context/ThemeContext';

const DATA = [
  { id: '1', name: 'iPhone 15 Pro', brand: 'Apple', os: 'iOS 17' },
  { id: '2', name: 'Galaxy S24 Ultra', brand: 'Samsung', os: 'Android 14' },
  { id: '3', name: 'Pixel 8 Pro', brand: 'Google', os: 'Android 14' },
  { id: '4', name: 'Xiaomi 14 Pro', brand: 'Xiaomi', os: 'Android 14' },
  { id: '5', name: 'OnePlus 12', brand: 'OnePlus', os: 'Android 14' },
  { id: '6', name: 'iPad Pro M4', brand: 'Apple', os: 'iPadOS 17' },
];

const COLUMNS: ITableColumn[] = [
  { key: 'name', title: '型号', width: 140, align: 'left' },
  { key: 'brand', title: '品牌', width: 80 },
  { key: 'os', title: '系统', width: 100 },
];

const SearchDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [keyword, setKeyword] = useState('');

  const searchConfig = useMemo(
    () => ({ keyword, caseSensitive: false }),
    [keyword]
  );

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        input: {
          height: 40,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          fontSize: 14,
          color: colors.text,
          backgroundColor: colors.surface,
        },
      }),
    [colors]
  );

  return (
    <DemoLayout title="搜索高亮" description="输入关键词高亮匹配的单元格文本">
      <View style={styles.searchBar}>
        <TextInput
          style={dynamicStyles.input}
          placeholder="输入关键词搜索..."
          placeholderTextColor={colors.textMuted}
          value={keyword}
          onChangeText={setKeyword}
          clearButtonMode="while-editing"
        />
      </View>
      <TableContainer
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        flex
        searchConfig={searchConfig}
      />
    </DemoLayout>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
});

export default SearchDemo;
