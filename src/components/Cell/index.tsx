import { isArray, isFunction, isNil } from 'lodash';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, Modal } from 'react-native';
import type { ITableCellProps, IFilterOption } from '../../types';
import { SORT_STATUS_MAP } from '../../constant';
import Sort from '../Sort';
import styles from './styles';
import { useTableStatic, useTableState } from '../../context';

const Cell = ({
  val,
  col,
  row,
  rowIndex,
  colIndex,
  isHeader,
  onExpandChange,
  expanded,
  style,
  rowKeyValue,
}: ITableCellProps) => {
  const {
    key,
    fixed,
    hTextStyle,
    textStyle,
    secondTextStyle,
    sortable,
    showArrow,
    touchStyle,
    onPress,
    onSort,
    type,
    filters,
    filterMultiple = true,
    filterRender,
  } = col;

  const { sortConfig } = useTableStatic();
  const {
    sortState,
    setSortState,
    multiSortState,
    setMultiSortState,
    isChecked,
    toggleChecked,
    toggleCheckedAll,
    isCheckedAll,
    isIndeterminate,
    radioKey,
    setRadioKey,
    filterStates,
    setFilterState,
    clearFilterState,
  } = useTableState();

  const [filterVisible, setFilterVisible] = useState(false);
  const [tempFilterValues, setTempFilterValues] = useState<
    (string | number | boolean)[]
  >([]);

  const isShowSort = useMemo(() => isHeader && sortable, [isHeader, sortable]);
  const isShowFilter = useMemo(
    () => isHeader && !!filters && filters.length > 0,
    [isHeader, filters]
  );
  const isShowExpand = useMemo(
    () => !!row.children?.length && !isHeader && colIndex === 0,
    [row.children, isHeader, colIndex]
  );
  const isShowArrow = useMemo(
    () => !isHeader && !!showArrow && !isShowExpand,
    [isHeader, showArrow, isShowExpand]
  );

  // === Multi-sort support ===
  const currentSort = useMemo(() => {
    if (!isShowSort) return undefined;
    if (sortConfig?.multiple) {
      const found = multiSortState.find((s) => s.columnKey === key);
      return found?.sort;
    }
    return sortState?.columnKey === key ? sortState.sort : undefined;
  }, [isShowSort, sortState, key, sortConfig?.multiple, multiSortState]);

  const sortIndex = useMemo(() => {
    if (!sortConfig?.multiple || !isShowSort) return undefined;
    const idx = multiSortState.findIndex((s) => s.columnKey === key);
    return idx >= 0 ? idx + 1 : undefined;
  }, [sortConfig?.multiple, isShowSort, multiSortState, key]);

  // === Filter active indicator ===
  const isFilterActive = useMemo(() => {
    return filterStates.some((f) => f.columnKey === key && f.values.length > 0);
  }, [filterStates, key]);

  // === Checkbox state ===
  const isCheckboxType = type === 'checkbox';
  const isRadioType = type === 'radio';

  const _rowKey = rowKeyValue ?? String(rowIndex);

  const _onPress = useCallback(() => {
    if (isCheckboxType) {
      if (isHeader) {
        toggleCheckedAll();
      } else {
        toggleChecked(_rowKey);
      }
      return;
    }
    if (isRadioType) {
      if (!isHeader) {
        setRadioKey(_rowKey);
      }
      return;
    }
    if (isShowSort) {
      const nextSort =
        currentSort !== SORT_STATUS_MAP.asc
          ? SORT_STATUS_MAP.asc
          : SORT_STATUS_MAP.desc;

      if (sortConfig?.multiple) {
        setMultiSortState(
          multiSortState
            .filter((s) => s.columnKey !== key)
            .concat({ columnKey: key, sort: nextSort })
        );
        setSortState({ columnKey: key, sort: nextSort });
      } else {
        setSortState({ columnKey: key, sort: nextSort });
      }
      onSort?.();
      return;
    }
    if (isShowExpand) {
      onExpandChange?.();
      return;
    }
    if (isFunction(onPress)) {
      onPress({ val, col, row, rowIndex, colIndex, isHeader });
    }
  }, [
    isCheckboxType,
    isRadioType,
    isShowSort,
    isShowExpand,
    isHeader,
    currentSort,
    key,
    setSortState,
    setMultiSortState,
    multiSortState,
    sortConfig?.multiple,
    onSort,
    onExpandChange,
    onPress,
    val,
    col,
    row,
    rowIndex,
    colIndex,
    toggleChecked,
    toggleCheckedAll,
    setRadioKey,
    _rowKey,
  ]);

  // === Filter handlers ===
  const openFilter = useCallback(() => {
    const current = filterStates.find((f) => f.columnKey === key);
    setTempFilterValues(current?.values ?? []);
    setFilterVisible(true);
  }, [filterStates, key]);

  const confirmFilter = useCallback(
    (values: (string | number | boolean)[]) => {
      setFilterState(key, values);
      setFilterVisible(false);
    },
    [key, setFilterState]
  );

  const resetFilter = useCallback(() => {
    clearFilterState(key);
    setFilterVisible(false);
  }, [key, clearFilterState]);

  const toggleFilterValue = useCallback(
    (value: string | number | boolean) => {
      setTempFilterValues((prev) => {
        if (filterMultiple) {
          if (prev.includes(value)) {
            return prev.filter((v) => v !== value);
          }
          return [...prev, value];
        }
        return [value];
      });
    },
    [filterMultiple]
  );

  // === Render checkbox ===
  const renderCheckbox = () => {
    if (!isCheckboxType) return null;
    if (isHeader) {
      return (
        <View style={styles.checkbox}>
          <View
            style={[
              styles.checkboxBox,
              isCheckedAll && styles.checkboxChecked,
              isIndeterminate && styles.checkboxIndeterminate,
            ]}
          >
            {isCheckedAll && <View style={styles.checkboxTick} />}
            {isIndeterminate && !isCheckedAll && (
              <View style={styles.checkboxDash} />
            )}
          </View>
        </View>
      );
    }
    const checked = isChecked(_rowKey);
    return (
      <View style={styles.checkbox}>
        <View style={[styles.checkboxBox, checked && styles.checkboxChecked]}>
          {checked && <View style={styles.checkboxTick} />}
        </View>
      </View>
    );
  };

  // === Render radio ===
  const renderRadio = () => {
    if (!isRadioType || isHeader) return null;
    const selected = radioKey === _rowKey;
    return (
      <View style={styles.radio}>
        <View style={[styles.radioOuter, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    );
  };

  // === Render default cell text ===
  const renderCell = () => {
    if (isCheckboxType) return renderCheckbox();
    if (isRadioType) {
      if (isHeader) return null;
      return renderRadio();
    }
    if (isNil(val)) return null;
    const vals = isArray(val) ? val : [val];
    return vals.map((item, index) => (
      <Text
        key={`table-cell-${key}-${item}-${index}`}
        numberOfLines={2}
        style={[
          styles.text,
          {
            textAlign: fixed ? 'left' : 'right',
            color: isHeader ? '#929AA6' : '#1F2733',
          },
          isHeader ? hTextStyle : textStyle,
          index >= 1 && styles.second_text,
          index >= 1 && secondTextStyle,
        ]}
      >
        {item}
      </Text>
    ));
  };

  const renderArrow = () =>
    isShowArrow ? (
      <View style={styles.rightArrow}>
        <View style={styles.rightArrowTriangle} />
      </View>
    ) : null;

  const renderSort = () =>
    isShowSort ? (
      <Sort
        style={styles.sort}
        sortStatus={currentSort}
        sortIndex={sortIndex}
      />
    ) : null;

  const renderExpand = () =>
    isShowExpand ? (
      <View
        style={[
          styles.expand_icon,
          { transform: [{ rotate: expanded ? '90deg' : '0deg' }] },
        ]}
      >
        <View style={styles.expandTriangle} />
      </View>
    ) : null;

  const renderFilterIcon = () => {
    if (!isShowFilter) return null;
    return (
      <TouchableOpacity onPress={openFilter} style={styles.filterIcon}>
        <View
          style={[
            styles.filterTriangle,
            isFilterActive && styles.filterTriangleActive,
          ]}
        />
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => {
    if (!isShowFilter || !filterVisible) return null;

    // Custom filter render
    if (isFunction(filterRender)) {
      return (
        <Modal
          visible={filterVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setFilterVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.filterOverlay}
            onPress={() => setFilterVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.filterPanel}
              onPress={() => {}}
            >
              {filterRender({
                column: col,
                filters: filters!,
                confirm: confirmFilter,
                reset: resetFilter,
              })}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      );
    }

    // Default filter panel
    return (
      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.filterOverlay}
          onPress={() => setFilterVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.filterPanel}
            onPress={() => {}}
          >
            <View style={styles.filterContent}>
              {filters!.map((opt: IFilterOption) => {
                const selected = tempFilterValues.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[
                      styles.filterOption,
                      selected && styles.filterOptionSelected,
                    ]}
                    onPress={() => toggleFilterValue(opt.value)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selected && styles.filterOptionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.filterResetBtn}
                onPress={resetFilter}
              >
                <Text style={styles.filterResetText}>重置</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterConfirmBtn}
                onPress={() => confirmFilter(tempFilterValues)}
              >
                <Text style={styles.filterConfirmText}>确认</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.content, style, touchStyle]}
        onPress={_onPress}
        disabled={
          !onPress &&
          !isShowSort &&
          !isShowExpand &&
          !isCheckboxType &&
          !isRadioType
        }
      >
        {renderExpand()}
        <View>{renderCell()}</View>
        {renderArrow()}
        {renderSort()}
        {renderFilterIcon()}
      </TouchableOpacity>
      {renderFilterModal()}
    </>
  );
};

export default memo(Cell);
