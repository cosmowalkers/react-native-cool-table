import React, { forwardRef, memo, useCallback, useMemo } from 'react';
import {
  Animated,
  View,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ScrollView,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import type { ITableRowProps, TItem, ITableColumn } from '../../types';
import { isArray, isEmpty, isFunction } from 'lodash';
import { ALIGN_MAP } from '../../constant';
import Cell from '../Cell';
import styles from './styles';
import { useTableStatic, useTableState } from '../../context';

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
  const {
    columns,
    positionX,
    contentWidth,
    treeConfig,
    rowStyle,
    stripe,
    stripeColor,
    border,
    borderColor: borderColorProp,
    checkboxConfig,
    radioConfig,
    seqConfig,
    rowConfig,
  } = useTableStatic();
  const {
    isExpanded,
    toggleExpand,
    isChecked,
    radioKey,
    currentRowKey,
    setCurrentRowKey,
  } = useTableState();

  const expanded = isExpanded(rowKeyValue);

  const effectiveStyle = style ?? rowStyle;

  // === Stripe ===
  const stripeStyle = useMemo<ViewStyle | undefined>(() => {
    if (!stripe || isHeader) return undefined;
    if (rowIndex % 2 === 1) {
      return { backgroundColor: stripeColor ?? '#FAFAFA' };
    }
    return undefined;
  }, [stripe, stripeColor, isHeader, rowIndex]);

  // === Inner border ===
  const innerBorderStyle = useMemo<ViewStyle | undefined>(() => {
    if (!border || border === 'none' || border === 'outer') return undefined;
    if (border === 'full' || border === 'inner') {
      const color = borderColorProp ?? '#E8E8E8';
      return {
        borderBottomWidth: 0.5,
        borderBottomColor: color,
      };
    }
    return undefined;
  }, [border, borderColorProp]);

  // === Current row highlight ===
  const currentRowStyle = useMemo<ViewStyle | undefined>(() => {
    if (isHeader || !rowConfig?.isCurrent) return undefined;
    if (currentRowKey === rowKeyValue) {
      return {
        backgroundColor: rowConfig.currentColor ?? '#E6F7FF',
      };
    }
    return undefined;
  }, [isHeader, rowConfig, currentRowKey, rowKeyValue]);

  // === Checkbox highlight ===
  const checkboxHighlightStyle = useMemo<ViewStyle | undefined>(() => {
    if (isHeader || !checkboxConfig?.highlight) return undefined;
    if (isChecked(rowKeyValue)) {
      return {
        backgroundColor: checkboxConfig.highlightColor ?? '#E6F7FF',
      };
    }
    return undefined;
  }, [isHeader, checkboxConfig, isChecked, rowKeyValue]);

  // === Radio highlight ===
  const radioHighlightStyle = useMemo<ViewStyle | undefined>(() => {
    if (isHeader || !radioConfig?.highlight) return undefined;
    if (radioKey === rowKeyValue) {
      return {
        backgroundColor: radioConfig.highlightColor ?? '#E6F7FF',
      };
    }
    return undefined;
  }, [isHeader, radioConfig, radioKey, rowKeyValue]);

  const nextExpandable = useMemo(() => {
    return !isEmpty(data?.children) && treeConfig ? treeConfig : undefined;
  }, [treeConfig, data?.children]);

  const hasHeaderMultipleLine = useMemo(() => {
    return isHeader && Object.keys(data).some((item) => item.includes('/'));
  }, [isHeader, data]);

  const _onPressRow = useCallback(() => {
    onPressRow?.({ item: data, rowIndex });
    // Current row highlight
    if (rowConfig?.isCurrent && !isHeader) {
      setCurrentRowKey(rowKeyValue);
      rowConfig.onCurrentRowChange?.({ row: data, rowIndex });
    }
  }, [
    onPressRow,
    data,
    rowIndex,
    rowConfig,
    isHeader,
    setCurrentRowKey,
    rowKeyValue,
  ]);

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

  // === Cached right-fixed column translateX ===
  const rightTranslateX = useMemo(() => {
    const rightFixedWidth = columns
      .filter((c) => c.fixed === 'right')
      .reduce((sum, c) => sum + (Number(c.width) || 0), 0);
    if (rightFixedWidth === 0) return null;
    return Animated.add(positionX, contentWidth - rightFixedWidth);
  }, [columns, positionX, contentWidth]);

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
        type,
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

      // === Handle special column types ===
      let value: string | string[];
      if (type === 'seq') {
        value = isHeader
          ? column.title || '#'
          : String((seqConfig?.startIndex ?? 0) + rowIndex + 1);
      } else if (type === 'checkbox' || type === 'radio') {
        value = '';
      } else {
        const keys = isHeader ? [key] : key.split(keySplitSymbol);
        const values = keys.map((k: string) => data[k as keyof typeof data]);
        value = values.length <= 1 ? values?.[0] : values;

        if (isFunction(customVal)) {
          value = customVal({ val: value, ...commonParams });
        }
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

      // Inner border for cells (vertical separator)
      if (border === 'full' || border === 'inner') {
        const bColor = borderColorProp ?? '#E8E8E8';
        if (!isLast) {
          _cellStyle.push({
            borderRightWidth: 0.5,
            borderRightColor: bColor,
          } as ViewStyle);
        }
      }

      const defaultRender = () => (
        <Cell
          val={value}
          onExpandChange={_onExpandChange}
          expanded={expanded}
          rowKeyValue={rowKeyValue}
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

      if (isFixedRight(fixed) && rightTranslateX) {
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
    rightTranslateX,
    _onExpandChange,
    expanded,
    seqConfig,
    border,
    borderColorProp,
    rowKeyValue,
  ]);

  const renderSeparator = () => {
    // Skip separator when using inner/full border (already handled)
    if (border === 'full' || border === 'inner') return null;
    return !isHeader ? <View style={styles.separator} /> : null;
  };

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
      disabled={!isFunction(onPressRow) && !rowConfig?.isCurrent}
    >
      <>
        {renderSeparator()}
        <View
          style={[
            styles.row,
            effectiveStyle,
            stripeStyle,
            innerBorderStyle,
            currentRowStyle,
            checkboxHighlightStyle,
            radioHighlightStyle,
          ]}
        >
          {renderColumns()}
        </View>
        {renderExpand()}
      </>
    </TouchableWithoutFeedback>
  );
};

export default memo(forwardRef(Row));
