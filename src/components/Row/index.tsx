import { forwardRef, memo, useCallback, useMemo } from 'react';
import {
  Animated,
  View,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { ViewStyle, DimensionValue } from 'react-native';
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
    cellStyle: tableCellStyle,
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
    columnWidths,
    getCellSpan,
    isCellVisible,
    loadingKeys,
    triggerLoad,
    isLoaded,
    getChildren: getLazyChildren,
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

  // Check for lazy-loaded children
  const lazyChildren = getLazyChildren
    ? getLazyChildren(rowKeyValue)
    : undefined;
  const isRowLoading = loadingKeys ? loadingKeys.has(rowKeyValue) : false;

  // Consider both static children and lazy-loaded children
  const hasChildren = !isEmpty(data?.children) || !isEmpty(lazyChildren);

  const nextExpandable = useMemo(() => {
    return hasChildren && treeConfig ? treeConfig : undefined;
  }, [treeConfig, hasChildren]);

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

    // If loadChildren is configured and there are no static children, trigger lazy load
    // 已加载过的行不再重复请求（子节点缓存在 hook 的 childrenMap 中）
    if (
      isFunction(treeConfig?.loadChildren) &&
      isEmpty(data?.children) &&
      triggerLoad &&
      !(isLoaded && isLoaded(rowKeyValue))
    ) {
      triggerLoad(rowKeyValue, data, rowIndex);
    }

    toggleExpand(rowKeyValue);
  }, [
    treeConfig?.animationDuration,
    treeConfig?.loadChildren,
    toggleExpand,
    rowKeyValue,
    data,
    rowIndex,
    triggerLoad,
    isLoaded,
  ]);

  // === Cached right-fixed column translateX ===
  const rightTranslateX = useMemo(() => {
    const rightFixedWidth = columns
      .filter((c) => c.fixed === 'right')
      .reduce(
        (sum, c) => sum + (columnWidths?.get(c.key) ?? (Number(c.width) || 0)),
        0
      );
    if (rightFixedWidth === 0) return null;
    return Animated.add(positionX, contentWidth - rightFixedWidth);
  }, [columns, positionX, contentWidth, columnWidths]);

  const firstDataColIndex = useMemo(
    () =>
      columns.findIndex(
        (c) =>
          c.type !== 'checkbox' &&
          c.type !== 'radio' &&
          c.type !== 'seq' &&
          c.type !== 'drag'
      ),
    [columns]
  );

  const renderColumns = useCallback(() => {
    if (!isArray(columns) || isEmpty(columns)) return null;

    return columns.map((column, colIndex, arr) => {
      // === Cell Merge: skip hidden cells ===
      if (!isHeader && isCellVisible && !isCellVisible(rowIndex, colIndex)) {
        return null;
      }

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
        isFirstDataCol: colIndex === firstDataColIndex,
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
      // Apply table-level cellStyle (e.g. for dark theme background override)
      if (tableCellStyle) {
        const flatCellStyle = StyleSheet.flatten(tableCellStyle);
        if (flatCellStyle) _cellStyle.push(flatCellStyle);
      }
      // === Cell Merge: compute merged width for colspan > 1 ===
      const spanResult =
        !isHeader && getCellSpan ? getCellSpan(rowIndex, colIndex) : null;
      const colspanCount = spanResult ? spanResult.colspan : 1;

      let mergedWidth: DimensionValue | undefined;
      if (colspanCount > 1) {
        // Sum widths of all merged columns
        let totalWidth = 0;
        for (let offset = 0; offset < colspanCount; offset++) {
          const mergedCol = columns[colIndex + offset];
          if (mergedCol) {
            totalWidth +=
              columnWidths?.get(mergedCol.key) ??
              (Number(mergedCol.width) || 0);
          }
        }
        mergedWidth = totalWidth > 0 ? totalWidth : undefined;
      } else {
        mergedWidth =
          columnWidths?.get(column.key) ?? (width as DimensionValue);
      }
      if (mergedWidth) _cellStyle.push({ width: mergedWidth });
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
            depth > 1 && colIndex === firstDataColIndex
              ? { paddingLeft: 8 * (depth - 1) }
              : {}
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
    columnWidths,
    getCellSpan,
    isCellVisible,
    tableCellStyle,
    firstDataColIndex,
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
    if (!expanded) return null;

    // Determine children source: static children or lazy-loaded children
    const childrenData = !isEmpty(data?.children)
      ? data.children!
      : lazyChildren;

    // Show loading indicator while loading
    if (isRowLoading) {
      if (isFunction(treeConfig?.renderLoading)) {
        return (
          <View style={[styles.expand, treeConfig?.style]}>
            {treeConfig!.renderLoading!()}
          </View>
        );
      }
      return (
        <View
          style={[
            styles.expand,
            { alignItems: 'center', justifyContent: 'center', padding: 12 },
            treeConfig?.style,
          ]}
        >
          <ActivityIndicator size="small" color="#1890ff" />
        </View>
      );
    }

    if (isEmpty(childrenData)) return null;

    if (isFunction(treeConfig?.renderExpand)) {
      return treeConfig?.renderExpand({
        data: childrenData!,
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
          {childrenData?.map((item, index) =>
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
