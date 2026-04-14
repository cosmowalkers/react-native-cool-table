'use strict';

import React, { forwardRef, memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { ITableColumn } from '../../types';
import { useLocale } from '../../context';
import styles from './styles';

interface IColumnManagerProps {
  /** 是否可见 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 全部列 */
  columns: ITableColumn[];
  /** 当前隐藏列 key 列表 */
  hiddenKeys: string[];
  /** 始终可见的列 key 列表 */
  alwaysVisible?: string[];
  /** 确认回调，返回用户选择的隐藏列 */
  onConfirm: (hiddenKeys: string[]) => void;
}

const ColumnManager = (
  {
    visible,
    onClose,
    columns,
    hiddenKeys,
    alwaysVisible = [],
    onConfirm,
  }: IColumnManagerProps,
  _ref: unknown
) => {
  const locale = useLocale();
  const [localHiddenKeys, setLocalHiddenKeys] = useState<Set<string>>(
    new Set(hiddenKeys)
  );

  // Reset local state when modal opens
  const _onShow = useCallback(() => {
    setLocalHiddenKeys(new Set(hiddenKeys));
  }, [hiddenKeys]);

  const _onToggle = useCallback((key: string, value: boolean) => {
    setLocalHiddenKeys((prev) => {
      const next = new Set(prev);
      if (value) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const _onConfirm = useCallback(() => {
    onConfirm(Array.from(localHiddenKeys));
    onClose();
  }, [localHiddenKeys, onConfirm, onClose]);

  const _onCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const renderColumnRow = useCallback(
    (column: ITableColumn) => {
      const isAlwaysVisible = alwaysVisible.includes(column.key);
      const isVisible = !localHiddenKeys.has(column.key);

      return (
        <View key={column.key} style={styles.row}>
          <Text
            style={[
              styles.rowTitle,
              isAlwaysVisible && styles.rowTitleDisabled,
            ]}
            numberOfLines={1}
          >
            {column.title}
          </Text>
          <Switch
            value={isAlwaysVisible || isVisible}
            onValueChange={(val) => _onToggle(column.key, val)}
            disabled={isAlwaysVisible}
          />
        </View>
      );
    },
    [alwaysVisible, localHiddenKeys, _onToggle]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={_onShow}
      onRequestClose={_onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{locale.columnManagerTitle}</Text>
          </View>
          <ScrollView style={styles.list}>
            {columns.map(renderColumnRow)}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, styles.footerButtonDivider]}
              onPress={_onCancel}
              activeOpacity={0.6}
            >
              <Text style={styles.cancelText}>
                {locale.columnManagerCancel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={_onConfirm}
              activeOpacity={0.6}
            >
              <Text style={styles.confirmText}>
                {locale.columnManagerConfirm}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default memo(forwardRef(ColumnManager));
