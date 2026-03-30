import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateSearchProducts } from '../utils/dataUtils';
import { renderPrice, renderStock } from '../utils/renderUtils';
import { colors } from '../styles/commonStyles';

const EmptyStateDemo: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const fullData = useMemo(() => generateSearchProducts(20), []);

  const filteredData = useMemo(() => {
    if (!keyword.trim()) {
      return fullData;
    }
    const lower = keyword.trim().toLowerCase();
    return fullData.filter((item) => item.name.toLowerCase().includes(lower));
  }, [fullData, keyword]);

  const clearSearch = useCallback(() => {
    setKeyword('');
  }, []);

  const customEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>未找到相关商品</Text>
        <Text style={styles.emptyDesc}>
          没有匹配"{keyword}"的商品，请尝试其他关键词
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={clearSearch}>
          <Text style={styles.emptyButtonText}>清除搜索</Text>
        </TouchableOpacity>
      </View>
    ),
    [keyword, clearSearch]
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'name',
        title: '商品名',
        width: 140,
        align: 'left',
      },
      {
        key: 'category',
        title: '分类',
        width: 80,
        align: 'center',
      },
      {
        key: 'price',
        title: '价格',
        width: 80,
        align: 'right',
        render: renderPrice,
      },
      {
        key: 'stock',
        title: '库存',
        width: 60,
        align: 'right',
        render: renderStock,
      },
    ],
    []
  );

  return (
    <DemoLayout
      title="商品搜索"
      description="输入关键词搜索商品，无匹配结果时展示自定义空状态"
    >
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索商品名称..."
            placeholderTextColor={colors.textLight}
            value={keyword}
            onChangeText={setKeyword}
          />
          {keyword.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <TableContainer
        data={filteredData}
        columns={columns}
        keyExtractor={(item) => String(item.id)}
        EmptyComponent={keyword.trim().length > 0 ? customEmpty : undefined}
        flex
      />
    </DemoLayout>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    padding: 12,
    backgroundColor: colors.white,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  clearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EmptyStateDemo;
