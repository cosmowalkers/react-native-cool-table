import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { IPaginationConfig } from '../../types';
import { useLocale } from '../../context';
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
    const locale = useLocale();
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

    const totalText = locale.paginationTotal.replace('{total}', String(total));

    return (
      <View style={[styles.container, paginationConfig?.style, style]}>
        {/* Prev */}
        <TouchableOpacity
          onPress={_onPrev}
          disabled={isPrevDisabled}
          style={[styles.navButton, isPrevDisabled && styles.navButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={locale.paginationPrev}
          accessibilityState={{ disabled: isPrevDisabled }}
        >
          <Text style={styles.navButtonText}>{locale.paginationPrev}</Text>
        </TouchableOpacity>

        {/* Page buttons */}
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

        {/* Next */}
        <TouchableOpacity
          onPress={_onNext}
          disabled={isNextDisabled}
          style={[styles.navButton, isNextDisabled && styles.navButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={locale.paginationNext}
          accessibilityState={{ disabled: isNextDisabled }}
        >
          <Text style={styles.navButtonText}>{locale.paginationNext}</Text>
        </TouchableOpacity>

        {/* Total */}
        <Text style={styles.infoText}>{totalText}</Text>

        {/* Page size selector */}
        {pageSizes && pageSizes.length > 0 && (
          <>
            <Text style={styles.infoText}>{locale.paginationPerPage}</Text>
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
            <Text style={styles.infoText}>
              {locale.paginationPerPageSuffix}
            </Text>
          </>
        )}
      </View>
    );
  }
);

Pagination.displayName = 'Pagination';

export default Pagination;
