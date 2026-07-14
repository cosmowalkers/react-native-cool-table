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
import type { ITableProps, TItem, ICoolTableRef } from '../../types';
import { isFunction } from 'lodash';
import Row from '../Row';
import HeaderRow from '../HeaderRow';
import {
  TableStaticContext,
  TableStateContext,
  LocaleProvider,
  useLocale,
} from '../../context';
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
import { useEditableCell } from '../../hooks/useEditableCell';
import { useValidation } from '../../hooks/useValidation';
import { useContextMenu } from '../../hooks/useContextMenu';
import { useTableContextValues } from '../../hooks/useTableContextValues';
import Tooltip from '../Tooltip';
import ContextMenu from '../ContextMenu';
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
    cellStyle,
    textColor,
    headerTextColor,
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
    editConfig,
    validationConfig,
    contextMenuConfig,
    locale: localeProp,
  }: ITableProps,
  ref: any
) => {
  const [contentWidth, setContentWidth] = useState(0);
  const [positionX] = useState(new Animated.Value(0));
  const flatListRef = useRef<FlatList>(null);

  // === DEV warnings ===
  useEffect(() => {
    if (__DEV__ && !rowKey && !keyExtractor) {
      // eslint-disable-next-line no-console
      console.warn(
        '[CoolTable] Neither "rowKey" nor "keyExtractor" is provided. ' +
          'Row keys will fall back to array indices, which may cause unexpected behavior when data changes. ' +
          'Consider providing a "rowKey" prop.'
      );
    }
    // Only warn once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Locale: prop > LocaleProvider > zhCN ===
  const locale = useLocale(localeProp);

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

  // === Column ordering (fixed left → normal → fixed right) ===
  // 使用 leafColumns（扁平化后的叶子列），因为 Row/Cell 只需要叶子列
  const _columns = useMemo(() => {
    const fixedLeft = leafColumns.filter(
      (c) => c.fixed === true || c.fixed === 'left'
    );
    const fixedRight = leafColumns.filter((c) => c.fixed === 'right');
    const normal = leafColumns.filter((c) => !c.fixed);
    return [...fixedLeft, ...normal, ...fixedRight];
  }, [leafColumns]);

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

  // === Inline Edit ===
  const {
    editingCell,
    setEditingCell,
    editValues,
    setEditValue,
    saveEdit: editSaveEdit,
    cancelEdit: editCancelEdit,
  } = useEditableCell({ editConfig, data, columns: _columns, rowKey });

  // === Validation ===
  const {
    validationErrors,
    validate: validateAll,
    validateRow: validationValidateRow,
    clearValidation,
  } = useValidation({ columns: _columns, data: paginatedData, rowKey });

  // === Context Menu ===
  const {
    menuState: contextMenuState,
    showContextMenu,
    hideContextMenu,
  } = useContextMenu();

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

  // === Context values (constructed in dedicated hook) ===
  const { staticValue, stateValue } = useTableContextValues({
    columns: _columns,
    positionX,
    contentWidth,
    treeConfig,
    rowStyle,
    cellStyle,
    textColor,
    headerTextColor,
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
    editConfig,
    validationConfig,
    contextMenuConfig,
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
    editingCell,
    setEditingCell,
    editValues,
    setEditValue,
    saveEdit: editSaveEdit,
    cancelEdit: editCancelEdit,
    validationErrors,
    showContextMenu,
    hideContextMenu,
  });

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
        const allKeys: string[] = [];
        // 键规则必须与 Row 保持一致：
        // 根行用 buildRowKey，子行用 `${parentKey}.${childIdx}`（见 Row.renderChildRow）
        const collectKeys = (items: TItem[], parentKey?: string) => {
          items.forEach((item, idx) => {
            const key =
              parentKey === undefined
                ? buildRowKey(rowKey, item, idx)
                : `${parentKey}.${idx}`;
            allKeys.push(key);
            if (item.children?.length) {
              collectKeys(item.children, key);
            }
          });
        };
        collectKeys(data);
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
      // Inline Edit
      startEdit: (rowKey_: string, columnKey: string) =>
        setEditingCell({ rowKey: rowKey_, columnKey }),
      cancelEdit: editCancelEdit,
      getEditValues: () => editValues,
      // Validation
      validate: () => validateAll(paginatedData),
      validateRow: (rk: string) => {
        const row = paginatedData.find(
          (item, idx) => buildRowKey(rowKey, item, idx) === rk
        );
        if (row) {
          return validationValidateRow(rk, row);
        }
        return Promise.resolve([]);
      },
      clearValidation,
    }),
    [
      data,
      processedData,
      paginatedData,
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
      setEditingCell,
      editCancelEdit,
      editValues,
      validateAll,
      validationValidateRow,
      clearValidation,
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
    const overlayStyle = loadingConfig?.overlayStyle;
    if (isFunction(loadingConfig?.render)) {
      return (
        <View style={[styles.loadingOverlay, overlayStyle]}>
          {loadingConfig!.render()}
        </View>
      );
    }
    return (
      <View style={[styles.loadingOverlay, overlayStyle]}>
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
    <LocaleProvider locale={locale}>
      <TableStaticContext.Provider value={staticValue}>
        <TableStateContext.Provider value={stateValue}>
          <View
            style={[styles.content, borderStyle, style]}
            onLayout={_onLayout}
          >
            <Animated.ScrollView
              horizontal
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              onScroll={onScroll}
              scrollEventThrottle={16}
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
            <ContextMenu
              menuState={contextMenuState}
              config={contextMenuConfig}
              onClose={hideContextMenu}
            />
          </View>
        </TableStateContext.Provider>
      </TableStaticContext.Provider>
    </LocaleProvider>
  );
};

export default memo(forwardRef(Table));
