'use strict';

import React, {
  isValidElement,
  forwardRef,
  memo,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  View,
  Animated,
  UIManager,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import styles from './styles';
import Empty from '../Empty';
import type {
  ITableProps,
  TItem,
  ITableColumn,
  ITableStaticContextValue,
  ITableStateContextValue,
  ICoolTableRef,
} from '../../types';
import { isFunction } from 'lodash';
import Row from '../Row';
import HeaderRow from '../HeaderRow';
import { TableStaticContext, TableStateContext } from '../../context';
import { buildRowKey } from '../../utils';
import useSort from '../../hooks/useSort';
import useFilter from '../../hooks/useFilter';
import useCheckbox from '../../hooks/useCheckbox';
import useRadio from '../../hooks/useRadio';
import useTableData from '../../hooks/useTableData';
import useUpdateEffect from '../../hooks/useUpdateEffect';
import useTooltip from '../../hooks/useTooltip';
import usePagination from '../../hooks/usePagination';
import { useColumnVisibility } from '../../hooks/useColumnVisibility';
import { useGroupedColumns } from '../../hooks/useGroupedColumns';
import { useColumnResize } from '../../hooks/useColumnResize';
import { useCellMerge } from '../../hooks/useCellMerge';
import { useRowDragSort } from '../../hooks/useRowDragSort';
import { useTreeLazyLoad } from '../../hooks/useTreeLazyLoad';
import Tooltip from '../Tooltip';
import Pagination from '../Pagination';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Table = (
  {
    data = [],
    columns = [],
    style,
    onLayout,
    flatListProps,
    onPressRow,
    rowStyle,
    onSortChange,
    headerRowStyle,
    FooterComponent,
    emptyWrapperStyle,
    emptyProps,
    treeConfig,
    EmptyComponent,
    keyExtractor,
    rowKey,
    sortConfig,
    filterConfig,
    onFilterChange,
    checkboxConfig,
    radioConfig,
    seqConfig,
    stripe,
    stripeColor,
    border,
    borderColor,
    loading,
    loadingConfig,
    footerConfig,
    virtualConfig,
    rowConfig,
    ellipsisConfig,
    paginationConfig,
    searchConfig,
    columnVisibilityConfig,
    resizeConfig,
    spanMethod,
    dragSortConfig,
  }: ITableProps,
  ref: any
) => {
  const [_columns, setColumns] = useState<ITableColumn[]>(columns);
  const [contentWidth, setContentWidth] = useState(0);
  const [positionX] = useState(new Animated.Value(0));
  const flatListRef = useRef<FlatList>(null);

  // === Column Visibility ===
  const { visibleColumns, hideColumn, showColumn, getHiddenColumns } =
    useColumnVisibility({ columns, columnVisibilityConfig });

  // === Grouped Columns ===
  const { leafColumns, headerLevels } = useGroupedColumns({
    columns: visibleColumns,
  });

  // === Column Resize ===
  const { columnWidths, setColumnWidth, getColumnWidths } = useColumnResize({
    resizeConfig,
    columns: leafColumns,
  });

  // === Sort ===
  const { sortState, setSortState, multiSortState, setMultiSortState } =
    useSort({ sortConfig, columns: _columns, onSortChange });

  // === Filter ===
  const { filterStates, setFilterState, clearFilterState, filteredData } =
    useFilter({ filterConfig, columns: _columns, data, onFilterChange });

  // === Checkbox ===
  const {
    checkedKeys,
    setCheckedKeys,
    toggleChecked,
    toggleCheckedAll,
    isChecked,
    isCheckedAll,
    isIndeterminate,
  } = useCheckbox({ checkboxConfig, data, rowKey });

  // === Radio ===
  const { radioKey, setRadioKey } = useRadio({ radioConfig, data, rowKey });

  // === Tooltip ===
  const { tooltipState, showTooltip, hideTooltip } = useTooltip();

  // === Processed data ===
  const processedData = useTableData({
    filteredData,
    sortState,
    multiSortState,
    sortConfig,
    columns: _columns,
  });

  // === Pagination ===
  const {
    paginatedData,
    currentPage: paginationPage,
    pageSize: paginationPageSize,
    total: paginationTotal,
    maxPage: paginationMaxPage,
    setPage: paginationSetPage,
    setPageSize: paginationSetPageSize,
  } = usePagination({ paginationConfig, data: processedData });

  // === Cell Merge ===
  const { getCellSpan, isCellVisible } = useCellMerge({
    data: paginatedData,
    columns: _columns,
    spanMethod,
  });

  // === Row Drag Sort ===
  const { dragIndex, targetIndex, startDrag, moveDrag, endDrag } =
    useRowDragSort({ dragSortConfig, data: paginatedData });

  // === Tree Lazy Load ===
  const { loadingKeys, triggerLoad, isLoaded, getChildren } = useTreeLazyLoad({
    treeConfig,
  });

  // === Expand State ===
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // === Current Row State ===
  const [currentRowKey, setCurrentRowKey] = useState<string | null>(
    rowConfig?.currentRowKey ?? null
  );

  // Sync controlled current row key (skip mount)
  useUpdateEffect(() => {
    if (rowConfig?.currentRowKey !== undefined) {
      setCurrentRowKey(rowConfig.currentRowKey ?? null);
    }
  }, [rowConfig?.currentRowKey]);

  // === Column ordering (fixed left → normal → fixed right) ===
  // 使用 leafColumns（扁平化后的叶子列），因为 Row/Cell 只需要叶子列
  useEffect(() => {
    setColumns(() => {
      const fixedLeft = leafColumns.filter(
        (c) => c.fixed === true || c.fixed === 'left'
      );
      const fixedRight = leafColumns.filter((c) => c.fixed === 'right');
      const normal = leafColumns.filter((c) => !c.fixed);
      return [...fixedLeft, ...normal, ...fixedRight];
    });
  }, [leafColumns]);

  // === Expand ===
  const toggleExpand = useCallback(
    (key: string) => {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
          return next;
        }
        if (treeConfig?.autoCollapseOthers) {
          next.clear();
        }
        next.add(key);
        return next;
      });
    },
    [treeConfig?.autoCollapseOthers]
  );

  const isExpanded = useCallback(
    (key: string) => expandedKeys.has(key),
    [expandedKeys]
  );

  // === Stabilize callback refs for context ===
  const onSortChangeRef = useRef(onSortChange);
  onSortChangeRef.current = onSortChange;
  const _stableOnSortChange = useCallback(
    (...args: Parameters<NonNullable<typeof onSortChange>>) =>
      onSortChangeRef.current?.(...args),
    []
  );

  const onFilterChangeRef = useRef(onFilterChange);
  onFilterChangeRef.current = onFilterChange;
  const _stableOnFilterChange = useCallback(
    (...args: Parameters<NonNullable<typeof onFilterChange>>) =>
      onFilterChangeRef.current?.(...args),
    []
  );

  // === Context values ===
  const staticValue = useMemo<ITableStaticContextValue>(
    () => ({
      columns: _columns,
      positionX,
      contentWidth,
      treeConfig,
      rowStyle,
      onSortChange: _stableOnSortChange,
      sortConfig,
      filterConfig,
      onFilterChange: _stableOnFilterChange,
      checkboxConfig,
      radioConfig,
      seqConfig,
      stripe,
      stripeColor,
      border,
      borderColor,
      rowConfig,
      ellipsisConfig,
      paginationConfig,
      searchConfig,
      headerLevels,
      resizeConfig,
      spanMethod,
      dragSortConfig,
    }),
    [
      _columns,
      positionX,
      contentWidth,
      treeConfig,
      rowStyle,
      _stableOnSortChange,
      sortConfig,
      filterConfig,
      _stableOnFilterChange,
      checkboxConfig,
      radioConfig,
      seqConfig,
      stripe,
      stripeColor,
      border,
      borderColor,
      rowConfig,
      ellipsisConfig,
      paginationConfig,
      searchConfig,
      headerLevels,
      resizeConfig,
      spanMethod,
      dragSortConfig,
    ]
  );

  const stateValue = useMemo<ITableStateContextValue>(
    () => ({
      sortState,
      setSortState,
      multiSortState,
      setMultiSortState,
      expandedKeys,
      toggleExpand,
      isExpanded,
      checkedKeys,
      toggleChecked,
      toggleCheckedAll,
      isChecked,
      isCheckedAll,
      isIndeterminate,
      radioKey,
      setRadioKey,
      filterStates,
      setFilterState,
      clearFilterState,
      currentRowKey,
      setCurrentRowKey,
      showTooltip,
      hideTooltip,
      columnWidths,
      setColumnWidth,
      getCellSpan,
      isCellVisible,
      loadingKeys,
      triggerLoad,
      isLoaded,
      getChildren,
      dragIndex,
      targetIndex,
      startDrag,
      moveDrag,
      endDrag,
    }),
    [
      sortState,
      setSortState,
      multiSortState,
      setMultiSortState,
      expandedKeys,
      toggleExpand,
      isExpanded,
      checkedKeys,
      toggleChecked,
      toggleCheckedAll,
      isChecked,
      isCheckedAll,
      isIndeterminate,
      radioKey,
      setRadioKey,
      filterStates,
      setFilterState,
      clearFilterState,
      currentRowKey,
      showTooltip,
      hideTooltip,
      columnWidths,
      setColumnWidth,
      getCellSpan,
      isCellVisible,
      loadingKeys,
      triggerLoad,
      isLoaded,
      getChildren,
      dragIndex,
      targetIndex,
      startDrag,
      moveDrag,
      endDrag,
    ]
  );

  // === Ref API helpers ===
  const _setRowExpand = useCallback(
    (rows: TItem[], expanded: boolean) => {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        rows.forEach((row, idx) => {
          const key = buildRowKey(rowKey, row, idx);
          if (expanded) {
            next.add(key);
          } else {
            next.delete(key);
          }
        });
        return next;
      });
    },
    [rowKey]
  );

  const _setAllRowExpand = useCallback(
    (expanded: boolean) => {
      if (expanded) {
        const allKeys = data.map((item, idx) => buildRowKey(rowKey, item, idx));
        setExpandedKeys(new Set(allKeys));
      } else {
        setExpandedKeys(new Set());
      }
    },
    [data, rowKey]
  );

  // === Ref API ===
  useImperativeHandle(
    ref,
    (): ICoolTableRef => ({
      getCheckboxRecords: () =>
        data.filter((item, idx) =>
          checkedKeys.has(buildRowKey(rowKey, item, idx))
        ),
      setCheckboxRow: (rows, checked) => {
        setCheckedKeys((prev) => {
          const next = new Set(prev);
          rows.forEach((row, idx) => {
            const key = buildRowKey(rowKey, row, idx);
            if (checked) {
              next.add(key);
            } else {
              next.delete(key);
            }
          });
          return next;
        });
      },
      clearCheckboxRow: () => setCheckedKeys(new Set()),
      getRadioRecord: () => {
        if (!radioKey) return null;
        return (
          data.find(
            (item, idx) => buildRowKey(rowKey, item, idx) === radioKey
          ) ?? null
        );
      },
      setRadioRow: (row) => {
        const idx = data.indexOf(row);
        setRadioKey(buildRowKey(rowKey, row, idx >= 0 ? idx : 0));
      },
      clearRadioRow: () => setRadioKey(null),
      sort: (field, order) => {
        const nextSort = order ?? 'asc';
        setSortState({ columnKey: field, sort: nextSort });
        if (sortConfig?.multiple) {
          setMultiSortState((prev) => {
            const next = prev.filter((s) => s.columnKey !== field);
            next.push({ columnKey: field, sort: nextSort });
            return next;
          });
        }
      },
      clearSort: () => {
        setSortState(null);
        setMultiSortState([]);
      },
      getSortColumns: () =>
        sortConfig?.multiple ? multiSortState : sortState ? [sortState] : [],
      clearFilter: (field) => clearFilterState(field),
      getCheckedFilters: () => filterStates,
      scrollToRow: (_row) => {
        const idx = processedData.indexOf(_row);
        if (idx >= 0) {
          flatListRef.current?.scrollToIndex({ index: idx, animated: true });
        }
      },
      scrollToTop: () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      },
      getFullData: () => data,
      getData: () => processedData,
      setRowExpand: _setRowExpand,
      setAllRowExpand: _setAllRowExpand,
      /** @deprecated Use setRowExpand instead */
      setTreeExpand: (rows, expanded) => {
        if (__DEV__) {
          console.warn(
            'CoolTable: setTreeExpand is deprecated, use setRowExpand instead.'
          );
        }
        _setRowExpand(rows, expanded);
      },
      /** @deprecated Use setAllRowExpand instead */
      setAllTreeExpand: (expanded) => {
        if (__DEV__) {
          console.warn(
            'CoolTable: setAllTreeExpand is deprecated, use setAllRowExpand instead.'
          );
        }
        _setAllRowExpand(expanded);
      },
      // Pagination
      setPage: paginationSetPage,
      setPageSize: paginationSetPageSize,
      // Column Visibility
      hideColumn,
      showColumn,
      getHiddenColumns,
      // Column Resize
      setColumnWidth: resizeConfig?.enabled ? setColumnWidth : undefined,
      getColumnWidths: resizeConfig?.enabled ? getColumnWidths : undefined,
    }),
    [
      data,
      processedData,
      checkedKeys,
      radioKey,
      sortState,
      multiSortState,
      filterStates,
      rowKey,
      sortConfig?.multiple,
      clearFilterState,
      _setRowExpand,
      _setAllRowExpand,
      setCheckedKeys,
      setRadioKey,
      setSortState,
      setMultiSortState,
      paginationSetPage,
      paginationSetPageSize,
      hideColumn,
      showColumn,
      getHiddenColumns,
      resizeConfig?.enabled,
      setColumnWidth,
      getColumnWidths,
    ]
  );

  // === Scroll ===
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: positionX } } }], {
        useNativeDriver: true,
      }),
    [positionX]
  );

  const _onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      setContentWidth(e.nativeEvent.layout.width);
      onLayout?.(e);
    },
    [onLayout]
  );

  const getListKey = useCallback(
    (item: TItem, index: number) => {
      if (keyExtractor) return keyExtractor(item, index);
      return buildRowKey(rowKey, item, index);
    },
    [keyExtractor, rowKey]
  );

  // === Virtual config ===
  const virtualProps = useMemo(() => {
    if (!virtualConfig?.enabled) return {};
    const props: Record<string, any> = {
      removeClippedSubviews: true,
      windowSize: virtualConfig.windowSize ?? 5,
      maxToRenderPerBatch: virtualConfig.maxToRenderPerBatch ?? 10,
      initialNumToRender: virtualConfig.initialNumToRender ?? 15,
      updateCellsBatchingPeriod: 50,
    };
    if (virtualConfig.rowHeight) {
      const rh = virtualConfig.rowHeight;
      props.getItemLayout = (_: any, index: number) => ({
        length: rh,
        offset: rh * index,
        index,
      });
    }
    return props;
  }, [virtualConfig]);

  // === Render helpers ===
  const renderItem = useCallback(
    ({ item, index }: { item: TItem; index: number }) => (
      <Row
        data={item}
        rowIndex={index}
        rowKeyValue={buildRowKey(rowKey, item, index)}
        onPressRow={onPressRow}
      />
    ),
    [rowKey, onPressRow]
  );

  const renderHeader = useCallback(
    () => (
      <HeaderRow headerLevels={headerLevels} headerRowStyle={headerRowStyle} />
    ),
    [headerLevels, headerRowStyle]
  );

  // === Footer rows (footerConfig) ===
  const footerRows = useMemo(() => {
    if (!footerConfig) return null;
    if (footerConfig.data) return footerConfig.data;
    if (isFunction(footerConfig.method)) {
      return footerConfig.method({ data: processedData, columns: _columns });
    }
    return null;
  }, [footerConfig, processedData, _columns]);

  const renderFooter = useCallback(() => {
    const parts: React.ReactNode[] = [];

    if (footerRows) {
      parts.push(
        <View key="__footer_rows__">
          {footerRows.map((item, index) => (
            <Row
              key={`footer-${index}`}
              data={item}
              rowIndex={processedData.length + index}
              rowKeyValue={`__footer_${index}__`}
              style={footerConfig?.rowStyle}
            />
          ))}
        </View>
      );
    }

    if (FooterComponent) {
      parts.push(
        <Animated.View
          key="__footer_component__"
          style={{
            width: contentWidth,
            transform: [{ translateX: positionX }],
          }}
        >
          {isValidElement(FooterComponent) ? (
            FooterComponent
          ) : isFunction(FooterComponent) ? (
            <FooterComponent />
          ) : null}
        </Animated.View>
      );
    }

    return parts.length > 0 ? <>{parts}</> : null;
  }, [
    footerRows,
    FooterComponent,
    contentWidth,
    positionX,
    processedData.length,
    footerConfig?.rowStyle,
  ]);

  const renderEmpty = useCallback(
    () => (
      <>
        {renderHeader()}
        <Animated.View
          style={[
            styles.empty,
            { width: contentWidth, transform: [{ translateX: positionX }] },
            emptyWrapperStyle,
          ]}
        >
          {isValidElement(EmptyComponent) ? (
            EmptyComponent
          ) : isFunction(EmptyComponent) ? (
            <EmptyComponent />
          ) : (
            <Empty {...emptyProps} />
          )}
        </Animated.View>
      </>
    ),
    [
      renderHeader,
      contentWidth,
      positionX,
      emptyWrapperStyle,
      EmptyComponent,
      emptyProps,
    ]
  );

  const renderLoading = () => {
    if (!loading) return null;
    if (isFunction(loadingConfig?.render)) {
      return (
        <View style={styles.loadingOverlay}>{loadingConfig!.render()}</View>
      );
    }
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#1890ff" />
      </View>
    );
  };

  // === Border style ===
  const borderStyle = useMemo(() => {
    if (!border || border === 'none') return {};
    const color = borderColor ?? '#E8E8E8';
    if (border === 'full' || border === 'outer') {
      return { borderWidth: 0.5, borderColor: color };
    }
    return {};
  }, [border, borderColor]);

  return (
    <TableStaticContext.Provider value={staticValue}>
      <TableStateContext.Provider value={stateValue}>
        <View style={[styles.content, borderStyle, style]} onLayout={_onLayout}>
          <Animated.ScrollView
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            onScroll={onScroll}
          >
            <View>
              {paginatedData?.length ? (
                <FlatList
                  ref={flatListRef}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={getListKey}
                  stickyHeaderIndices={[0]}
                  initialNumToRender={25}
                  ListHeaderComponent={renderHeader}
                  ListFooterComponent={renderFooter}
                  {...virtualProps}
                  {...flatListProps}
                  data={paginatedData}
                  renderItem={renderItem}
                />
              ) : (
                renderEmpty()
              )}
            </View>
          </Animated.ScrollView>
          {paginationConfig && (
            <Pagination
              currentPage={paginationPage}
              pageSize={paginationPageSize}
              total={paginationTotal}
              maxPage={paginationMaxPage}
              onPageChange={paginationSetPage}
              onPageSizeChange={paginationSetPageSize}
              paginationConfig={paginationConfig}
            />
          )}
          {renderLoading()}
          <Tooltip state={tooltipState} onClose={hideTooltip} />
        </View>
      </TableStateContext.Provider>
    </TableStaticContext.Provider>
  );
};

export default memo(forwardRef(Table));
