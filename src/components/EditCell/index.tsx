import { isFunction } from 'lodash';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ITableColumn, TItem } from '../../types';
import styles from './styles';

interface IEditCellProps {
  row: TItem;
  column: ITableColumn;
  value: unknown;
  rowKey: string;
  onSave: (value: unknown) => void;
  onCancel: () => void;
}

const EditCell = (
  { row, column, value, rowKey: _rowKey, onSave, onCancel }: IEditCellProps,
  _ref: unknown
) => {
  const editType = column.editType ?? 'text';

  // === Text / Number input ===
  if (editType === 'text' || editType === 'number') {
    return (
      <EditTextInput
        value={value}
        keyboardType={editType === 'number' ? 'numeric' : 'default'}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // === Select ===
  if (editType === 'select') {
    return (
      <EditSelect
        value={value}
        options={column.editOptions ?? []}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // === Custom ===
  if (editType === 'custom' && isFunction(column.editRender)) {
    return (
      <EditCustom
        row={row}
        column={column}
        value={value}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return null;
};

// ============================================================
// EditTextInput sub-component
// ============================================================

interface IEditTextInputProps {
  value: unknown;
  keyboardType: 'default' | 'numeric';
  onSave: (value: unknown) => void;
  onCancel: () => void;
}

const EditTextInput = ({
  value,
  keyboardType,
  onSave,
  onCancel: _onCancel,
}: IEditTextInputProps) => {
  const [text, setText] = useState(String(value ?? ''));
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const _onBlur = useCallback(() => {
    onSave(keyboardType === 'numeric' ? Number(text) : text);
  }, [text, onSave, keyboardType]);

  const _onSubmitEditing = useCallback(() => {
    onSave(keyboardType === 'numeric' ? Number(text) : text);
  }, [text, onSave, keyboardType]);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        testID="edit-cell-input"
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        keyboardType={keyboardType}
        onBlur={_onBlur}
        onSubmitEditing={_onSubmitEditing}
        returnKeyType="done"
        selectTextOnFocus
      />
    </View>
  );
};

// ============================================================
// EditSelect sub-component
// ============================================================

interface IEditSelectProps {
  value: unknown;
  options: Array<{ label: string; value: string | number }>;
  onSave: (value: unknown) => void;
  onCancel: () => void;
}

const EditSelect = ({ value, options, onSave, onCancel }: IEditSelectProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = options.find((opt) => opt.value === value)?.label ?? '';

  const _onSelect = useCallback(
    (optValue: string | number) => {
      setModalVisible(false);
      onSave(optValue);
    },
    [onSave]
  );

  const _onClose = useCallback(() => {
    setModalVisible(false);
    onCancel();
  }, [onCancel]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="edit-cell-select"
        style={styles.selectTrigger}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={selectedLabel ? styles.selectText : styles.selectPlaceholder}
        >
          {selectedLabel || 'Select...'}
        </Text>
        <View style={styles.selectArrow} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={_onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={_onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={() => {}}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item: opt }) => {
                const selected = opt.value === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      selected && styles.optionItemSelected,
                    ]}
                    onPress={() => _onSelect(opt.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ============================================================
// EditCustom sub-component
// ============================================================

interface IEditCustomProps {
  row: TItem;
  column: ITableColumn;
  value: unknown;
  onSave: (value: unknown) => void;
  onCancel: () => void;
}

const EditCustom = ({
  row,
  column,
  value,
  onSave,
  onCancel,
}: IEditCustomProps) => {
  const [localValue, setLocalValue] = useState(value);

  const _setValue = useCallback((val: unknown) => {
    setLocalValue(val);
  }, []);

  const _save = useCallback(() => {
    onSave(localValue);
  }, [localValue, onSave]);

  if (!isFunction(column.editRender)) return null;

  return (
    <View style={styles.container}>
      {column.editRender({
        row,
        column,
        value: localValue,
        setValue: _setValue,
        save: _save,
        cancel: onCancel,
      })}
    </View>
  );
};

export default memo(forwardRef(EditCell));
