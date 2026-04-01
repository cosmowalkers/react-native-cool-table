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
  TSortState,
  TMultiSortState,
  IFilterState,
  ITableStaticContextValue,
  ITableStateContextValue,
  ICoolTableRef,
} from '../../types';
import { isFunction, isNil } from 'lodash';
import Row from '../Row';
import { TableStaticContext, TableStateContext } from '../../context';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const buildRowKey = (
  rowKeyProp: ITableProps['rowKey'],
  item: TItem,
  index: number
): string => {
  if (typeof rowKeyProp === 'function') {
    return rowKeyProp(item, index);
  }
  if (typeof rowKeyProp === 'string') {
    const v = item[rowKeyProp];
    return v !== undefined && v !== null ? String(v) : String(index);
  }
  return String(index);
};

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
    // P0 新增
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
  }: ITableProps,
  ref: any
) => {
  const [_columns, setColumns] = useState<ITableColumn[]>(columns);
  const [contentWidth, setContentWidth] = useState(0);
  const [positionX] = useState(new Animated.Value(0));
  const flatListRef = useRef<FlatList>(null);

  // === Sort State ===
  const [sortState, setSortState] = useState<TSortState>(() => {
    if (sortConfig?.defaultSort) {
      const ds = sortConfig.defaultSort;
      if (Array.isArray(ds)) {
        return ds.length > 0 ? ds[0]! : null;
      }
      return ds;
    }
    const col = columns.find((c) => c.defaultSort);
    return col?.defaultSort
      ? { columnKey: col.key, sort: col.defaultSort }
      : null;
  });

  const [multiSortState, setMultiSortState] = useState<TMultiSortState>(() => {
    if (sortConfig?.defaultSort) {
      const ds = sortConfig.defaultSort;
      return Array.isArray(ds) ? ds : [ds];
    }
    const col = columns.find((c) => c.defaultSort);
    return col?.defaultSort
      ? [{ columnKey: col.key, sort: col.defaultSort }]
      : [];
  });

  // === Expand State ===
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // === Checkbox State ===
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(() => {
    if (checkboxConfig?.checkedRowKeys) {
      return new Set(checkboxConfig.checkedRowKeys);
    }
    return new Set();
  });

  // === Radio State ===
  const [radioKey, setRadioKey] = useState<string | null>(
    radioConfig?.checkedRowKey ?? null
  );

  // === Filter State ===
  const [filterStates, setFilterStates] = useState<IFilterState[]>([]);

  // === Current Row State ===
  const [currentRowKey, setCurrentRowKey] = useState<string | null>(
    rowConfig?.currentRowKey ?? null
  );

  // Sync controlled checkbox keys
  useEffect(() => {
    if (checkboxConfig?.checkedRowKeys) {
      setCheckedKeys(new Set(checkboxConfig.checkedRowKeys));
    }
  }, [checkboxConfig?.checkedRowKeys]);

  // Sync controlled radio key
  useEffect(() => {
    if (!isNil(radioConfig?.checkedRowKey)) {
      setRadioKey(radioConfig!.checkedRowKey!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioConfig?.checkedRowKey]);

  // Sync controlled current row key
  useEffect(() => {
    if (!isNil(rowConfig?.currentRowKey)) {
      setCurrentRowKey(rowConfig!.currentRowKey!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowConfig?.currentRowKey]);

  // === Column ordering (fixed left → normal → fixed right) ===
  useEffect(() => {
    setColumns(() => {
      const fixedLeft = columns.filter(
        (c) => c.fixed === true || c.fixed === 'left'
      );
      const fixedRight = columns.filter((c) => c.fixed === 'right');
      const normal = columns.filter((c) => !c.fixed);
      return [...fixedLeft, ...normal, ...fixedRight];
    });
  }, [columns]);

  // === Sort change effect ===
  useEffect(() => {
    if (sortConfig?.multiple) {
      if (multiSortState.length > 0) {
        const last = multiSortState[multiSortState.length - 1]!;
        const colIndex = _columns.findIndex((c) => c.key === last.columnKey);
        onSortChange?.({
          key: last.columnKey,
          colIndex,
          sort: last.sort,
          sortList: multiSortState,
        });
      }
    } else if (sortState) {
      const colIndex = _columns.findIndex((c) => c.key === sortState.columnKey);
      onSortChange?.({
        key: sortState.columnKey,
        colIndex,
        sort: sortState.sort,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortState, multiSortState]);

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

  // === Checkbox ===
  const checkableData = useMemo(() => {
    if (!checkboxConfig) return data;
    if (isFunction(checkboxConfig.checkMethod)) {
      return data.filter((row, idx) =>
        checkboxConfig.checkMethod!({ row, rowIndex: idx })
      );
    }
    return data;
  }, [data, checkboxConfig]);

  const toggleChecked = useCallback((key: string) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const toggleCheckedAll = useCallback(() => {
    setCheckedKeys((prev) => {
      const allKeys = checkableData.map((item, idx) =>
        buildRowKey(rowKey, item, idx)
      );
      const allChecked = allKeys.every((k) => prev.has(k));
      if (allChecked) {
        return new Set();
      }
      return new Set(allKeys);
    });
  }, [checkableData, rowKey]);

  const isChecked = useCallback(
    (key: string) => checkedKeys.has(key),
    [checkedKeys]
  );

  const isCheckedAll = useMemo(() => {
    if (checkableData.length === 0) return false;
    const allKeys = checkableData.map((item, idx) =>
      buildRowKey(rowKey, item, idx)
    );
    return allKeys.every((k) => checkedKeys.has(k));
  }, [checkableData, checkedKeys, rowKey]);

  const isIndeterminate = useMemo(() => {
    if (checkedKeys.size === 0) return false;
    return !isCheckedAll && checkedKeys.size > 0;
  }, [checkedKeys, isCheckedAll]);

  // Checkbox onChange
  useEffect(() => {
    if (checkboxConfig?.onChange) {
      const records = data.filter((item, idx) => {
        const key = buildRowKey(rowKey, item, idx);
        return checkedKeys.has(key);
      });
      checkboxConfig.onChange({ records });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedKeys]);

  // Radio onChange
  useEffect(() => {
    if (radioConfig?.onChange) {
      if (radioKey) {
        const row = data.find((item, idx) => {
          const key = buildRowKey(rowKey, item, idx);
          return key === radioKey;
        });
        radioConfig.onChange({ row: row ?? null });
      } else {
        radioConfig.onChange({ row: null });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioKey]);

  // === Filter ===
  const setFilterState = useCallback(
    (columnKey: string, values: (string | number | boolean)[]) => {
      setFilterStates((prev) => {
        const next = prev.filter((f) => f.columnKey !== columnKey);
        if (values.length > 0) {
          next.push({ columnKey, values });
        }
        return next;
      });
    },
    []
  );

  const clearFilterState = useCallback((columnKey?: string) => {
    if (columnKey) {
      setFilterStates((prev) => prev.filter((f) => f.columnKey !== columnKey));
    } else {
      setFilterStates([]);
    }
  }, []);

  // Filter change callback
  useEffect(() => {
    // Do not fire on initial mount
    if (filterStates.length === 0) return;
    const lastFilter = filterStates[filterStates.length - 1];
    if (lastFilter && onFilterChange) {
      const column = _columns.find((c) => c.key === lastFilter.columnKey);
      if (column) {
        onFilterChange({ filters: filterStates, column });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStates]);

  // === Filtered data (local filtering) ===
  const filteredData = useMemo(() => {
    if (filterConfig?.remote) return data;
    if (filterStates.length === 0) return data;

    return data.filter((row) => {
      return filterStates.every((fs) => {
        const column = _columns.find((c) => c.key === fs.columnKey);
        if (!column) return true;
        if (isFunction(column.filterMethod)) {
          return fs.values.some((v) =>
            column.filterMethod!({ value: v, row, column })
          );
        }
        // Default: check if row value is in filter values
        return fs.values.includes(row[fs.columnKey]);
      });
    });
  }, [data, filterStates, filterConfig?.remote, _columns]);

  // === Sorted data (local sorting) ===
  const processedData = useMemo(() => {
    if (sortConfig?.remote) return filteredData;
    if (sortConfig?.multiple && multiSortState.length > 0) {
      const sorted = [...filteredData];
      sorted.sort((a, b) => {
        for (const s of multiSortState) {
          const aVal = a[s.columnKey];
          const bVal = b[s.columnKey];
          if (aVal === bVal) continue;
          const cmp = aVal < bVal ? -1 : 1;
          return s.sort === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
      return sorted;
    }
    if (!sortConfig?.remote && sortState) {
      const sorted = [...filteredData];
      sorted.sort((a, b) => {
        const aVal = a[sortState.columnKey];
        const bVal = b[sortState.columnKey];
        if (aVal === bVal) return 0;
        const cmp = aVal < bVal ? -1 : 1;
        return sortState.sort === 'asc' ? cmp : -cmp;
      });
      return sorted;
    }
    return filteredData;
  }, [
    filteredData,
    sortState,
    multiSortState,
    sortConfig?.remote,
    sortConfig?.multiple,
  ]);

  // === Context values ===
  const staticValue = useMemo<ITableStaticContextValue>(
    () => ({
      columns: _columns,
      positionX,
      contentWidth,
      treeConfig,
      rowStyle,
      onSortChange,
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
      rowConfig,
    }),
    [
      _columns,
      positionX,
      contentWidth,
      treeConfig,
      rowStyle,
      onSortChange,
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
      rowConfig,
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
    }),
    [
      sortState,
      multiSortState,
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
      filterStates,
      setFilterState,
      clearFilterState,
      currentRowKey,
    ]
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
      setRowExpand: (rows, expanded) => {
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
      setAllRowExpand: (expanded) => {
        if (expanded) {
          const allKeys = data.map((item, idx) =>
            buildRowKey(rowKey, item, idx)
          );
          setExpandedKeys(new Set(allKeys));
        } else {
          setExpandedKeys(new Set());
        }
      },
      setTreeExpand: (rows, expanded) => {
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
      setAllTreeExpand: (expanded) => {
        if (expanded) {
          const allKeys = data.map((item, idx) =>
            buildRowKey(rowKey, item, idx)
          );
          setExpandedKeys(new Set(allKeys));
        } else {
          setExpandedKeys(new Set());
        }
      },
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

  // === Header data ===
  const headerData = useMemo(() => {
    const obj: Record<string, string> = {};
    _columns.forEach((c) => {
      obj[c.key] = c.title;
    });
    return obj;
  }, [_columns]);

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
      <Row
        data={headerData}
        rowIndex={-1}
        rowKeyValue="__header__"
        isHeader
        style={headerRowStyle}
      />
    ),
    [headerData, headerRowStyle]
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

    // Footer rows from footerConfig
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

    // Legacy FooterComponent
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
    if (border === 'full') {
      return { borderWidth: 0.5, borderColor: color };
    }
    if (border === 'outer') {
      return { borderWidth: 0.5, borderColor: color };
    }
    if (border === 'inner') {
      return {};
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
              {processedData?.length ? (
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
                  data={processedData}
                  renderItem={renderItem}
                />
              ) : (
                renderEmpty()
              )}
            </View>
          </Animated.ScrollView>
          {renderLoading()}
        </View>
      </TableStateContext.Provider>
    </TableStaticContext.Provider>
  );
};

export default memo(forwardRef(Table));
