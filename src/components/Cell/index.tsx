import { isArray, isFunction, isNil } from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import type { ITableCellProps } from '../../types';
import { SORT_STATUS_MAP } from '../../constant';
import Sort from '../Sort';
import styles from './styles';
import { useTableState } from '../../context';

const Cell = ({
  val,
  col,
  row,
  rowIndex,
  colIndex,
  isHeader,
  onExpandChange,
  expanded,
  style,
}: ITableCellProps) => {
  const {
    key,
    fixed,
    hTextStyle,
    textStyle,
    secondTextStyle,
    sortable,
    showArrow,
    touchStyle,
    onPress,
    onSort,
  } = col;

  const { sortState, setSortState } = useTableState();

  const isShowSort = useMemo(() => isHeader && sortable, [isHeader, sortable]);
  const isShowExpand = useMemo(
    () => !!row.children?.length && !isHeader && colIndex === 0,
    [row.children, isHeader, colIndex]
  );
  const isShowArrow = useMemo(
    () => !isHeader && !!showArrow && !isShowExpand,
    [isHeader, showArrow, isShowExpand]
  );

  const currentSort = useMemo(() => {
    if (!isShowSort) return undefined;
    return sortState?.columnKey === key ? sortState.sort : undefined;
  }, [isShowSort, sortState, key]);

  const _onPress = useCallback(() => {
    if (isShowSort) {
      const nextSort =
        currentSort !== SORT_STATUS_MAP.asc
          ? SORT_STATUS_MAP.asc
          : SORT_STATUS_MAP.desc;
      setSortState({ columnKey: key, sort: nextSort });
      onSort?.();
      return;
    }
    if (isShowExpand) {
      onExpandChange?.();
      return;
    }
    if (isFunction(onPress)) {
      onPress({ val, col, row, rowIndex, colIndex, isHeader });
    }
  }, [
    isShowSort,
    isShowExpand,
    currentSort,
    key,
    setSortState,
    onSort,
    onExpandChange,
    onPress,
    val,
    col,
    row,
    rowIndex,
    colIndex,
    isHeader,
  ]);

  const renderCell = () => {
    if (isNil(val)) return null;
    const vals = isArray(val) ? val : [val];
    return vals.map((item, index) => (
      <Text
        key={`table-cell-${key}-${item}-${index}`}
        numberOfLines={2}
        style={[
          styles.text,
          {
            textAlign: fixed ? 'left' : 'right',
            color: isHeader ? '#929AA6' : '#1F2733',
          },
          isHeader ? hTextStyle : textStyle,
          index >= 1 && styles.second_text,
          index >= 1 && secondTextStyle,
        ]}
      >
        {item}
      </Text>
    ));
  };

  const renderArrow = () =>
    isShowArrow ? (
      <View style={styles.rightArrow}>
        <View style={styles.rightArrowTriangle} />
      </View>
    ) : null;

  const renderSort = () =>
    isShowSort ? <Sort style={styles.sort} sortStatus={currentSort} /> : null;

  const renderExpand = () =>
    isShowExpand ? (
      <View
        style={[
          styles.expand_icon,
          { transform: [{ rotate: expanded ? '90deg' : '0deg' }] },
        ]}
      >
        <View style={styles.expandTriangle} />
      </View>
    ) : null;

  return (
    <TouchableOpacity
      style={[styles.content, style, touchStyle]}
      onPress={_onPress}
      disabled={!onPress && !isShowSort && !isShowExpand}
    >
      {renderExpand()}
      <View>{renderCell()}</View>
      {renderArrow()}
      {renderSort()}
    </TouchableOpacity>
  );
};

export default memo(Cell);
