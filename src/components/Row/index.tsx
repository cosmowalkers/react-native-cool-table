import React, { forwardRef, memo, useCallback, useMemo } from 'react';
import {
  Animated,
  View,
  ViewStyle,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ScrollView,
} from 'react-native';
import type { ITableRowProps, TItem } from '../../types';
import { isArray, isEmpty, isFunction } from 'lodash';
import { ALIGN_MAP } from '../../constant';
import Cell from '../Cell';
import styles from './styles';
import { useTableStatic, useTableState } from '../../context';
import type { ITableColumn } from '../../types';

const isFixedLeft = (fixed: ITableColumn['fixed']): boolean =>
  fixed === true || fixed === 'left';

const isFixedRight = (fixed: ITableColumn['fixed']): boolean =>
  fixed === 'right';

const Row = (
  {
    style,
    data,
    rowIndex,
    isHeader,
    depth = 1,
    rowKeyValue,
    onPressRow,
  }: ITableRowProps,
  _ref: any
) => {
  const { columns, positionX, contentWidth, treeConfig, rowStyle } =
    useTableStatic();
  const { isExpanded, toggleExpand } = useTableState();

  const expanded = isExpanded(rowKeyValue);

  const effectiveStyle = style ?? rowStyle;

  const nextExpandable = useMemo(() => {
    return !isEmpty(data?.children) && treeConfig ? treeConfig : undefined;
  }, [treeConfig, data?.children]);

  const hasHeaderMultipleLine = useMemo(() => {
    return isHeader && Object.keys(data).some((item) => item.includes('/'));
  }, [isHeader, data]);

  const _onPressRow = useCallback(() => {
    onPressRow?.({ item: data, rowIndex });
  }, [onPressRow, data, rowIndex]);

  const _onExpandChange = useCallback(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        treeConfig?.animationDuration ?? 200,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
    toggleExpand(rowKeyValue);
  }, [treeConfig?.animationDuration, toggleExpand, rowKeyValue]);

  const renderColumns = useCallback(() => {
    if (!isArray(columns) || isEmpty(columns)) return null;

    return columns.map((column, colIndex, arr) => {
      const {
        key = '',
        keySplitSymbol = '/',
        width,
        align = 'right',
        render,
        renderHeader,
        style: cStyle,
        hStyle,
        fixed,
        customVal,
      } = column;

      const commonParams = {
        col: column,
        row: data,
        rowIndex,
        colIndex,
        isHeader,
      };

      const isFirst = colIndex === 0;
      const isLast = colIndex === arr.length - 1;
      const cellStyle = isHeader ? hStyle : cStyle;

      const keys = isHeader ? [key] : key.split(keySplitSymbol);
      const values = keys.map((k: string) => data[k as keyof typeof data]);
      let value = values.length <= 1 ? values?.[0] : values;

      if (isFunction(customVal)) {
        value = customVal({ val: value, ...commonParams });
      }

      const alignRes =
        ALIGN_MAP[isFixedLeft(fixed) || isFirst ? 'left' : align];

      const _cellStyle: ViewStyle[] = [
        styles.cell,
        hasHeaderMultipleLine
          ? styles.cell_multiple_line
          : styles.justify_center,
        { paddingLeft: isFirst ? 0 : 16, paddingRight: isLast ? 0 : 16 },
      ];
      if (width) _cellStyle.push({ width });
      if (alignRes) _cellStyle.push({ alignItems: alignRes });

      const defaultRender = () => (
        <Cell
          val={value}
          onExpandChange={_onExpandChange}
          expanded={expanded}
          style={
            depth > 1 && colIndex === 0 ? { paddingLeft: 8 * (depth - 1) } : {}
          }
          {...commonParams}
        />
      );

      const renderer = isHeader ? renderHeader : render;
      const cell = isFunction(renderer)
        ? renderer({ val: value, defaultRender, ...commonParams })
        : defaultRender();

      if (isFixedLeft(fixed)) {
        return (
          <Animated.View
            key={`table-column-${rowIndex}-${colIndex}`}
            style={[
              styles.fixed_cell,
              { transform: [{ translateX: positionX }] },
              _cellStyle,
              cellStyle,
            ]}
          >
            {cell}
          </Animated.View>
        );
      }

      if (isFixedRight(fixed)) {
        const rightFixedWidth = columns
          .filter((c) => c.fixed === 'right')
          .reduce((sum, c) => sum + (Number(c.width) || 0), 0);
        const rightTranslateX = Animated.add(
          positionX,
          contentWidth - rightFixedWidth
        );
        return (
          <Animated.View
            key={`table-column-${rowIndex}-${colIndex}`}
            style={[
              styles.fixed_cell,
              { transform: [{ translateX: rightTranslateX }] },
              _cellStyle,
              cellStyle,
            ]}
          >
            {cell}
          </Animated.View>
        );
      }

      return (
        <View
          key={`table-column-${rowIndex}-${colIndex}`}
          style={[_cellStyle, cellStyle]}
        >
          {cell}
        </View>
      );
    });
  }, [
    columns,
    data,
    rowIndex,
    isHeader,
    depth,
    hasHeaderMultipleLine,
    positionX,
    contentWidth,
    _onExpandChange,
    expanded,
  ]);

  const renderSeparator = () =>
    !isHeader ? <View style={styles.separator} /> : null;

  const renderChildRow = ({
    item,
    index,
    parentKey,
  }: {
    item: TItem;
    index: number;
    parentKey: string;
  }) => (
    <Row
      key={`${parentKey}-${index}`}
      style={nextExpandable?.rowStyle ?? effectiveStyle}
      onPressRow={nextExpandable?.onPressRow ?? onPressRow}
      data={item}
      rowIndex={index}
      rowKeyValue={`${parentKey}.${index}`}
      isHeader={false}
      depth={depth + 1}
    />
  );

  const renderExpand = () => {
    if (isEmpty(data?.children) || !expanded) return null;

    if (isFunction(treeConfig?.renderExpand)) {
      return treeConfig?.renderExpand({
        data: data?.children!,
        parentData: data,
        index: rowIndex,
        columns,
        depth,
      });
    }

    return (
      <View
        style={[
          styles.expand,
          { maxHeight: treeConfig?.maxHeight ?? 200 },
          treeConfig?.style,
        ]}
      >
        <ScrollView nestedScrollEnabled>
          {data?.children?.map((item, index) =>
            isFunction(treeConfig?.renderItem)
              ? treeConfig?.renderItem({
                  item,
                  index,
                  columns,
                  depth,
                  defaultRender: ({
                    item: i,
                    index: idx,
                  }: {
                    item: TItem;
                    index: number;
                  }) =>
                    renderChildRow({
                      item: i,
                      index: idx,
                      parentKey: rowKeyValue,
                    }),
                })
              : renderChildRow({ item, index, parentKey: rowKeyValue })
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={_onPressRow}
      disabled={!isFunction(onPressRow)}
    >
      <>
        {renderSeparator()}
        <View style={[styles.row, effectiveStyle]}>{renderColumns()}</View>
        {renderExpand()}
      </>
    </TouchableWithoutFeedback>
  );
};

export default memo(forwardRef(Row));
