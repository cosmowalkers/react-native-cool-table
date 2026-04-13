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
import { createThemedRenderUtils } from '../utils/renderUtils';
import { useTheme } from '../context/ThemeContext';

const EmptyStateDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const themedRenders = useMemo(
    () => createThemedRenderUtils(colors),
    [colors]
  );
  const [keyword, setKeyword] = useState('');
  const fullData = useMemo(() => generateSearchProducts(20), []);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        searchBar: {
          padding: 12,
          backgroundColor: theme.colors.surface,
        },
        searchInputWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        searchInput: {
          flex: 1,
          height: 40,
          paddingHorizontal: 12,
          fontSize: 14,
          color: theme.colors.text,
        },
        clearButtonText: {
          fontSize: 14,
          color: theme.colors.textMuted,
          fontWeight: '600',
        },
        emptyTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.text,
          marginBottom: 8,
        },
        emptyDesc: {
          fontSize: 14,
          color: theme.colors.textMuted,
          textAlign: 'center',
          marginBottom: 20,
        },
        emptyButton: {
          backgroundColor: theme.colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 10,
          borderRadius: 20,
        },
        emptyButtonText: {
          color: theme.colors.buttonText,
          fontSize: 14,
          fontWeight: '500',
        },
      }),
    [theme]
  );

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
        <Text style={dynamicStyles.emptyTitle}>未找到相关商品</Text>
        <Text style={dynamicStyles.emptyDesc}>
          没有匹配"{keyword}"的商品，请尝试其他关键词
        </Text>
        <TouchableOpacity
          style={dynamicStyles.emptyButton}
          onPress={clearSearch}
        >
          <Text style={dynamicStyles.emptyButtonText}>清除搜索</Text>
        </TouchableOpacity>
      </View>
    ),
    [keyword, clearSearch, dynamicStyles]
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
        render: themedRenders.renderPrice,
      },
      {
        key: 'stock',
        title: '库存',
        width: 60,
        align: 'right',
        render: themedRenders.renderStock,
      },
    ],
    [themedRenders]
  );

  return (
    <DemoLayout
      title="商品搜索"
      description="输入关键词搜索商品，无匹配结果时展示自定义空状态"
    >
      <View style={dynamicStyles.searchBar}>
        <View style={dynamicStyles.searchInputWrapper}>
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="搜索商品名称..."
            placeholderTextColor={theme.colors.textMuted}
            value={keyword}
            onChangeText={setKeyword}
          />
          {keyword.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={dynamicStyles.clearButtonText}>✕</Text>
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
  clearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
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
});

export default EmptyStateDemo;
