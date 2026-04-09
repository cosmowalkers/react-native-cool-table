import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { IPaginationConfig } from '../../types';
import styles from './styles';

interface IPaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  maxPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  paginationConfig?: IPaginationConfig;
  style?: StyleProp<ViewStyle>;
}

/** 页码按钮生成：首页、末页、当前页 ± 2 邻居，间隙用 '...' */
const _buildPageList = (
  currentPage: number,
  maxPage: number
): (number | 'ellipsis-left' | 'ellipsis-right')[] => {
  if (maxPage <= 7) {
    return Array.from({ length: maxPage }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
  const neighbors = 2;
  const left = Math.max(2, currentPage - neighbors);
  const right = Math.min(maxPage - 1, currentPage + neighbors);

  pages.push(1);

  if (left > 2) {
    pages.push('ellipsis-left');
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < maxPage - 1) {
    pages.push('ellipsis-right');
  }

  if (maxPage > 1) {
    pages.push(maxPage);
  }

  return pages;
};

const Pagination = memo(
  ({
    currentPage,
    pageSize,
    total,
    maxPage,
    onPageChange,
    onPageSizeChange,
    paginationConfig,
    style,
  }: IPaginationProps) => {
    // All hooks must be called before any early return
    const _onPrev = useCallback(() => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    }, [currentPage, onPageChange]);

    const _onNext = useCallback(() => {
      if (currentPage < maxPage) {
        onPageChange(currentPage + 1);
      }
    }, [currentPage, maxPage, onPageChange]);

    const pageList = useMemo(
      () => _buildPageList(currentPage, maxPage),
      [currentPage, maxPage]
    );

    // === Custom render ===
    if (paginationConfig?.render) {
      return (
        <View style={[styles.container, paginationConfig.style, style]}>
          {paginationConfig.render({
            currentPage,
            pageSize,
            total,
            onPageChange,
            onPageSizeChange,
          })}
        </View>
      );
    }

    const pageSizes = paginationConfig?.pageSizes;
    const isPrevDisabled = currentPage <= 1;
    const isNextDisabled = currentPage >= maxPage;

    return (
      <View style={[styles.container, paginationConfig?.style, style]}>
        {/* 上一页 */}
        <TouchableOpacity
          onPress={_onPrev}
          disabled={isPrevDisabled}
          style={[styles.navButton, isPrevDisabled && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>上一页</Text>
        </TouchableOpacity>

        {/* 页码按钮 */}
        {pageList.map((item) => {
          if (item === 'ellipsis-left' || item === 'ellipsis-right') {
            return (
              <View key={item} style={styles.ellipsis}>
                <Text style={styles.ellipsisText}>...</Text>
              </View>
            );
          }
          const isActive = item === currentPage;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => onPageChange(item)}
              style={[styles.pageButton, isActive && styles.pageButtonActive]}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  isActive && styles.pageButtonTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 下一页 */}
        <TouchableOpacity
          onPress={_onNext}
          disabled={isNextDisabled}
          style={[styles.navButton, isNextDisabled && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>下一页</Text>
        </TouchableOpacity>

        {/* 总数 */}
        <Text style={styles.infoText}>{`共 ${total} 条`}</Text>

        {/* 每页条数选择 */}
        {pageSizes && pageSizes.length > 0 && (
          <>
            <Text style={styles.infoText}>每页</Text>
            {pageSizes.map((size) => {
              const isActive = size === pageSize;
              return (
                <TouchableOpacity
                  key={`ps-${size}`}
                  onPress={() => onPageSizeChange(size)}
                  style={[
                    styles.pageSizeButton,
                    isActive && styles.pageSizeButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pageSizeText,
                      isActive && styles.pageSizeTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <Text style={styles.infoText}>条</Text>
          </>
        )}
      </View>
    );
  }
);

Pagination.displayName = 'Pagination';

export default Pagination;
