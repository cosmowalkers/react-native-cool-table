'use strict';

import React, { forwardRef, memo, useMemo } from 'react';
import { View, PanResponder } from 'react-native';
import styles from './styles';

interface IDragHandleProps {
  rowIndex: number;
  startDrag: (index: number) => void;
  moveDrag: (index: number) => void;
  endDrag: () => void;
  disabled?: boolean;
  rowHeight?: number;
}

/**
 * DragHandle - 行拖拽排序手柄
 *
 * 渲染三条横线作为拖拽图标，通过 PanResponder 监听垂直拖拽手势。
 * 拖拽开始时调用 startDrag，移动时根据 dy 计算目标行并调用 moveDrag，
 * 释放时调用 endDrag 完成排序。
 */
const DragHandle = (
  {
    rowIndex,
    startDrag,
    moveDrag,
    endDrag,
    disabled = false,
    rowHeight = 44,
  }: IDragHandleProps,
  _ref: unknown
) => {
  const panResponder = useMemo(() => {
    if (disabled) return null;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => true,
      onPanResponderGrant: () => {
        startDrag(rowIndex);
      },
      onPanResponderMove: (_evt, gestureState) => {
        const offset = Math.round(gestureState.dy / rowHeight);
        const target = Math.max(0, rowIndex + offset);
        moveDrag(target);
      },
      onPanResponderRelease: () => {
        endDrag();
      },
      onPanResponderTerminate: () => {
        endDrag();
      },
    });
  }, [disabled, rowIndex, startDrag, moveDrag, endDrag, rowHeight]);

  return (
    <View
      testID="drag-handle"
      {...(panResponder ? panResponder.panHandlers : {})}
      style={[styles.container, disabled ? styles.disabled : undefined]}
    >
      <View style={styles.line} />
      <View style={styles.line} />
      <View style={styles.line} />
    </View>
  );
};

export default memo(forwardRef(DragHandle));
