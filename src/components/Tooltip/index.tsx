import { forwardRef, memo, useMemo } from 'react';
import {
  Modal,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ITooltipState } from '../../hooks/useTooltip';
import styles from './styles';

interface ITooltipProps {
  state: ITooltipState;
  onClose: () => void;
}

/** tooltip 与触发元素的间距 */
const TOOLTIP_GAP = 4;

/** 默认触发元素高度估算 */
const ESTIMATED_CELL_HEIGHT = 36;

const Tooltip = ({ state, onClose }: ITooltipProps, _ref: unknown) => {
  const { visible, text, x, y } = state;
  const { height: screenHeight } = useWindowDimensions();

  const screenMidY = screenHeight / 2;
  const isAbove = y > screenMidY;

  const positionStyle = useMemo(() => {
    if (isAbove) {
      return {
        left: Math.max(4, x),
        bottom: screenHeight - y + TOOLTIP_GAP,
      };
    }
    return {
      left: Math.max(4, x),
      top: y + ESTIMATED_CELL_HEIGHT + TOOLTIP_GAP,
    };
  }, [isAbove, x, y, screenHeight]);

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
