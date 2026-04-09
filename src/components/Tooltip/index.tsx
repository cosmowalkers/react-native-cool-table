import React, { forwardRef, memo, useMemo } from 'react';
import {
  Modal,
  Text,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';
import type { ITooltipState } from '../../hooks/useTooltip';
import styles from './styles';

interface ITooltipProps {
  state: ITooltipState;
  onClose: () => void;
}

/** 屏幕中间线，用于判断 tooltip 展示在上方还是下方 */
const SCREEN_MID_Y = Dimensions.get('window').height / 2;

/** tooltip 与触发元素的间距 */
const TOOLTIP_GAP = 4;

/** 默认触发元素高度估算 */
const ESTIMATED_CELL_HEIGHT = 36;

const Tooltip = ({ state, onClose }: ITooltipProps, _ref: unknown) => {
  const { visible, text, x, y } = state;

  const isAbove = y > SCREEN_MID_Y;

  const positionStyle = useMemo(() => {
    if (isAbove) {
      // tooltip 展示在上方
      return {
        left: Math.max(4, x),
        bottom: Dimensions.get('window').height - y + TOOLTIP_GAP,
      };
    }
    // tooltip 展示在下方
    return {
      left: Math.max(4, x),
      top: y + ESTIMATED_CELL_HEIGHT + TOOLTIP_GAP,
    };
  }, [isAbove, x, y]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.tooltipContainer, positionStyle]}>
            {!isAbove && <View style={[styles.arrow, styles.arrowUp]} />}
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{text}</Text>
            </View>
            {isAbove && <View style={[styles.arrow, styles.arrowDown]} />}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default memo(forwardRef(Tooltip));
