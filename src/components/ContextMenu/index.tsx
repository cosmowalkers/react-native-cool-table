import { isFunction } from 'lodash';
import { forwardRef, memo, useCallback, useMemo } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import type { IContextMenuConfig, IContextMenuItem } from '../../types';
import type { IMenuState } from '../../hooks/useContextMenu';
import styles from './styles';

interface IContextMenuProps {
  menuState: IMenuState;
  config?: IContextMenuConfig;
  onClose: () => void;
}

const ContextMenu = (
  { menuState, config, onClose }: IContextMenuProps,
  _ref: unknown
) => {
  const { visible, row, rowIndex, x, y, column } = menuState;

  const items = useMemo((): IContextMenuItem[] => {
    if (!config || !row) return [];
    if (isFunction(config.getItems)) {
      return config.getItems({ row, rowIndex, column });
    }
    return config.items ?? [];
  }, [config, row, rowIndex, column]);

  const _onItemPress = useCallback(
    (item: IContextMenuItem) => {
      if (item.disabled) return;
      item.onPress?.({ row: row!, rowIndex, column });
      onClose();
    },
    [row, rowIndex, column, onClose]
  );

  if (!visible || !row) return null;

  const positionStyle = { left: x, top: y };

  const renderCustom = () => {
    if (!config || !isFunction(config.render)) return null;
    return config.render({ row, close: onClose });
  };

  const renderItems = () => {
    return items.map((item) => (
      <TouchableOpacity
        key={item.key}
        testID="context-menu-item"
        style={[styles.menuItem, item.disabled && styles.menuItemDisabled]}
        onPress={() => _onItemPress(item)}
        disabled={item.disabled}
        activeOpacity={0.7}
      >
        {item.icon && <View style={styles.menuItemIcon}>{item.icon}</View>}
        <Text
          style={[
            styles.menuItemText,
            item.danger && styles.menuItemTextDanger,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onClose}
      >
        <View
          testID="context-menu"
          style={[styles.menuContainer, positionStyle]}
        >
          {isFunction(config?.render) ? renderCustom() : renderItems()}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default memo(forwardRef(ContextMenu));
