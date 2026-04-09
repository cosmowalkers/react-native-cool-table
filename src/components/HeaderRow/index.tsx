'use strict';

import React, { forwardRef, memo, useCallback } from 'react';
import { Animated, View, Text } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import { isEmpty, isFunction } from 'lodash';
import type { THeaderLevel, ITableColumn } from '../../types';
import { ALIGN_MAP } from '../../constant';
import Cell from '../Cell';
import ResizeHandle from '../ResizeHandle';
import { useTableStatic, useTableState } from '../../context';
import styles from './styles';

interface IHeaderRowProps {
  headerLevels: THeaderLevel[];
  headerRowStyle?: StyleProp<ViewStyle>;
}

/**
 * 判断某列是否固定在左侧
 */
const isFixedLeft = (fixed: ITableColumn['fixed']): boolean =>
  fixed === true || fixed === 'left';

/**
 * HeaderRow 渲染多层分组表头。
 *
 * 每个 headerLevel 渲染为一行 <View flexDirection="row">。
 * - 叶子单元格（isLeaf）通过 Cell 组件渲染（支持 sort/filter/checkbox 等）
 * - 非叶子单元格（分组父级）仅渲染标题文字
 */
const HeaderRow = (
  { headerLevels, headerRowStyle }: IHeaderRowProps,
  _ref: unknown
) => {
  const {
    columns: leafColumns,
    positionX,
    border,
    borderColor: borderColorProp,
    resizeConfig,
  } = useTableStatic();
  const { columnWidths, setColumnWidth } = useTableState();

  /**
   * 计算每个 header cell 覆盖的宽度。
   * 通过维护一个 running index 追踪当前 cell 对应哪些 leaf columns。
   */
  const renderLevel = useCallback(
    (level: THeaderLevel, levelIndex: number) => {
      let leafIdx = 0;

      // 计算本层之前所有层级已消费的 leaf 偏移量
      // 但实际上 getHeaderLevels 的输出顺序就是按 leaf column 顺序排列的
      // 所以直接维护一个 running index 即可

      return (
        <View
          key={`header-level-${levelIndex}`}
          style={[styles.headerRow, headerRowStyle]}
        >
          {level.map((headerCell, cellIndex) => {
            const { column, colSpan, isLeaf } = headerCell;
            const startLeafIdx = leafIdx;
            leafIdx += colSpan;

            // 计算宽度：覆盖的 leaf columns 的宽度之和（优先使用动态列宽）
            const coveredLeafs = leafColumns.slice(
              startLeafIdx,
              startLeafIdx + colSpan
            );
            const cellWidth = coveredLeafs.reduce(
              (sum, c) =>
                sum + (columnWidths?.get(c.key) ?? (Number(c.width) || 0)),
              0
            );

            // 检查是否有 fixed left（覆盖的 leaf 中有任何 fixed left 即固定）
            const hasFixedLeft = coveredLeafs.some((c) => isFixedLeft(c.fixed));

            // 是否是本行最后一个 cell
            const isLast = cellIndex === level.length - 1;

            // 垂直边框
            const verticalBorderStyle: ViewStyle | undefined =
              (border === 'full' || border === 'inner') && !isLast
                ? {
                    borderRightWidth: 0.5,
                    borderRightColor: borderColorProp ?? '#E8E8E8',
                  }
                : undefined;

            // 水平边框（非最后一层时画底部边框）
            const horizontalBorderStyle: ViewStyle | undefined =
              (border === 'full' || border === 'inner') &&
              levelIndex < headerLevels.length - 1
                ? {
                    borderBottomWidth: 0.5,
                    borderBottomColor: borderColorProp ?? '#E8E8E8',
                  }
                : undefined;

            const baseCellStyle: ViewStyle[] = [
              styles.cell,
              { paddingLeft: cellIndex === 0 ? 0 : 16 },
              { paddingRight: isLast ? 0 : 16 },
            ];
            if (cellWidth > 0) {
              baseCellStyle.push({ width: cellWidth });
            }
            if (verticalBorderStyle) {
              baseCellStyle.push(verticalBorderStyle);
            }
            if (horizontalBorderStyle) {
              baseCellStyle.push(horizontalBorderStyle);
            }

            if (isLeaf) {
              // 叶子节点：使用 Cell 组件渲染（保留 sort/filter/checkbox 能力）
              const value =
                column.type === 'seq'
                  ? column.title || '#'
                  : column.type === 'checkbox' || column.type === 'radio'
                  ? ''
                  : column.title;

              const commonParams = {
                col: column,
                row: { [column.key]: column.title } as Record<string, string>,
                rowIndex: -1,
                colIndex: startLeafIdx,
                isHeader: true as const,
              };

              const alignRes =
                ALIGN_MAP[
                  isFixedLeft(column.fixed) || cellIndex === 0
                    ? 'left'
                    : column.align ?? 'right'
                ];
              if (alignRes) {
                baseCellStyle.push({ alignItems: alignRes });
              }
              if (column.hStyle) {
                baseCellStyle.push(column.hStyle as ViewStyle);
              }

              const defaultRender = () => (
                <Cell val={value} rowKeyValue="__header__" {...commonParams} />
              );

              const renderer = column.renderHeader;
              const cell = isFunction(renderer)
                ? renderer({ val: value, defaultRender, ...commonParams })
                : defaultRender();

              // 是否显示 ResizeHandle
              const showResize =
                resizeConfig?.enabled === true &&
                column.resizable !== false &&
                setColumnWidth != null;
              const resizeHandle = showResize ? (
                <ResizeHandle
                  columnKey={column.key}
                  initialWidth={
                    columnWidths?.get(column.key) ?? (Number(column.width) || 0)
                  }
                  onResize={setColumnWidth}
                />
              ) : null;

              if (hasFixedLeft) {
                return (
                  <Animated.View
                    key={`header-${levelIndex}-${cellIndex}`}
                    style={[
                      styles.fixed_cell,
                      { transform: [{ translateX: positionX }] },
                      ...baseCellStyle,
                    ]}
                  >
                    {cell}
                    {resizeHandle}
                  </Animated.View>
                );
              }

              return (
                <View
                  key={`header-${levelIndex}-${cellIndex}`}
                  style={baseCellStyle}
                >
                  {cell}
                  {resizeHandle}
                </View>
              );
            }

            // 非叶子节点（分组父级）：渲染简单的标题文字
            const groupStyle: ViewStyle[] = [styles.groupCell];
            if (cellWidth > 0) {
              groupStyle.push({ width: cellWidth });
            }
            if (verticalBorderStyle) {
              groupStyle.push(verticalBorderStyle);
            }
            if (horizontalBorderStyle) {
              groupStyle.push(horizontalBorderStyle);
            }
            if (column.hStyle) {
              groupStyle.push(column.hStyle as ViewStyle);
            }

            const groupContent = (
              <Text style={[styles.groupCellText, column.hTextStyle]}>
                {column.title}
              </Text>
            );

            if (hasFixedLeft) {
              return (
                <Animated.View
                  key={`header-${levelIndex}-${cellIndex}`}
                  style={[
                    styles.fixed_cell,
                    { transform: [{ translateX: positionX }] },
                    ...groupStyle,
                  ]}
                >
                  {groupContent}
                </Animated.View>
              );
            }

            return (
              <View
                key={`header-${levelIndex}-${cellIndex}`}
                style={groupStyle}
              >
                {groupContent}
              </View>
            );
          })}
        </View>
      );
    },
    [
      leafColumns,
      positionX,
      border,
      borderColorProp,
      headerLevels.length,
      headerRowStyle,
      resizeConfig,
      columnWidths,
      setColumnWidth,
    ]
  );

  if (isEmpty(headerLevels)) return null;

  return <>{headerLevels.map(renderLevel)}</>;
};

export default memo(forwardRef(HeaderRow));
