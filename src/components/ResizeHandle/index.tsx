'use strict';

import { forwardRef, memo, useRef, useState, useMemo } from 'react';
import { View, PanResponder } from 'react-native';
import styles from './styles';

interface IResizeHandleProps {
  columnKey: string;
  initialWidth: number;
  onResize: (key: string, width: number) => void;
}

/**
 * ResizeHandle - 列宽调整拖拽手柄
 *
 * 放置在 header cell 右侧边缘，通过 PanResponder 监听水平拖拽
 * 拖拽结束后将新宽度（initialWidth + dx）回调给父组件
 */
const ResizeHandle = (
  { columnKey, initialWidth, onResize }: IResizeHandleProps,
  _ref: unknown
) => {
  const [isDragging, setIsDragging] = useState(false);
  const startWidthRef = useRef(initialWidth);

  // Update startWidthRef when initialWidth changes (between drags)
  startWidthRef.current = initialWidth;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => true,
        onPanResponderGrant: () => {
          setIsDragging(true);
        },
        onPanResponderRelease: (_evt, gestureState) => {
          setIsDragging(false);
          const newWidth = Math.max(0, startWidthRef.current + gestureState.dx);
          onResize(columnKey, newWidth);
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
        },
      }),
    [columnKey, onResize]
  );

  return (
    <View
      {...panResponder.panHandlers}
      style={styles.container}
      hitSlop={{ left: 8, right: 8, top: 0, bottom: 0 }}
    >
      <View style={[styles.line, isDragging ? styles.lineActive : undefined]} />
    </View>
  );
};

export default memo(forwardRef(ResizeHandle));
