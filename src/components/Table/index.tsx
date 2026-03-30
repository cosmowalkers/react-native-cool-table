'use strict';

import React, {
  isValidElement,
  forwardRef,
  memo,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Animated,
  UIManager,
  Platform,
  FlatList,
  LayoutChangeEvent,
} from 'react-native';

import styles from './styles';
import Empty from '../Empty';
import type {
  ITableProps,
  TItem,
  ITableColumn,
  TSortState,
  ITableStaticContextValue,
  ITableStateContextValue,
} from '../../types';
import { isFunction } from 'lodash';
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
  }: ITableProps,
  _ref: any
) => {
  const [_columns, setColumns] = useState<ITableColumn[]>(columns);
  const [contentWidth, setContentWidth] = useState(0);
  const [positionX] = useState(new Animated.Value(0));

  const [sortState, setSortState] = useState<TSortState>(() => {
    const col = columns.find((c) => c.defaultSort);
    return col?.defaultSort
      ? { columnKey: col.key, sort: col.defaultSort }
      : null;
  });
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    if (sortState) {
      const colIndex = _columns.findIndex((c) => c.key === sortState.columnKey);
      onSortChange?.({
        key: sortState.columnKey,
        colIndex,
        sort: sortState.sort,
      });
    }
  }, [sortState, _columns, onSortChange]);

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

  const staticValue = useMemo<ITableStaticContextValue>(
    () => ({
      columns: _columns,
      positionX,
      contentWidth,
      treeConfig,
      rowStyle,
      onSortChange,
    }),
    [_columns, positionX, contentWidth, treeConfig, rowStyle, onSortChange]
  );

  const stateValue = useMemo<ITableStateContextValue>(
    () => ({
      sortState,
      setSortState,
      expandedKeys,
      toggleExpand,
      isExpanded,
    }),
    [sortState, expandedKeys, toggleExpand, isExpanded]
  );

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

  const renderFooter = useCallback(() => {
    if (!FooterComponent) return null;
    return (
      <Animated.View
        style={{ width: contentWidth, transform: [{ translateX: positionX }] }}
      >
        {isValidElement(FooterComponent) ? (
          FooterComponent
        ) : isFunction(FooterComponent) ? (
          <FooterComponent />
        ) : null}
      </Animated.View>
    );
  }, [FooterComponent, contentWidth, positionX]);

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

  return (
    <TableStaticContext.Provider value={staticValue}>
      <TableStateContext.Provider value={stateValue}>
        <View style={[styles.content, style]} onLayout={_onLayout}>
          <Animated.ScrollView
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            onScroll={onScroll}
          >
            <View>
              {data?.length ? (
                <FlatList
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={getListKey}
                  stickyHeaderIndices={[0]}
                  initialNumToRender={25}
                  ListHeaderComponent={renderHeader}
                  ListFooterComponent={renderFooter}
                  {...flatListProps}
                  data={data}
                  renderItem={renderItem}
                />
              ) : (
                renderEmpty()
              )}
            </View>
          </Animated.ScrollView>
        </View>
      </TableStateContext.Provider>
    </TableStaticContext.Provider>
  );
};

export default memo(forwardRef(Table));
