import { isArray, isFunction, isNil } from 'lodash';
import React, {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import type {
  ITableCellProps,
  IFilterOption,
  IEllipsisConfig,
} from '../../types';
import { SORT_STATUS_MAP } from '../../constant';
import Sort from '../Sort';
import HighlightText from '../HighlightText';
import EditCell from '../EditCell';
import ValidationError from '../ValidationError';
import styles from './styles';
import { useTableStatic, useTableState, useLocale } from '../../context';
import DragHandle from '../DragHandle';

const Cell = (
  {
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
    isFirstDataCol,
  }: ITableCellProps,
  _ref: any
) => {
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

  const {
    sortConfig,
    ellipsisConfig: globalEllipsisConfig,
    searchConfig,
    dragSortConfig,
    treeConfig,
    editConfig,
    validationConfig,
    contextMenuConfig,
    textColor: tableTextColor,
    headerTextColor: tableHeaderTextColor,
  } = useTableStatic();
  const locale = useLocale();
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
    showTooltip,
    startDrag,
    moveDrag,
    endDrag,
    loadingKeys,
    showContextMenu,
    editingCell,
    setEditingCell,
    editValues,
    setEditValue,
    saveEdit,
    cancelEdit,
    validationErrors,
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
  const hasLazyLoad = isFunction(treeConfig?.loadChildren);
  const isShowExpand = useMemo(
    () =>
      (!!row.children?.length || hasLazyLoad) &&
      !isHeader &&
      (isFirstDataCol ?? colIndex === 0),
    [row.children, hasLazyLoad, isHeader, isFirstDataCol, colIndex]
  );
  const isRowLoading = loadingKeys
    ? loadingKeys.has(rowKeyValue ?? String(rowIndex))
    : false;
  const isShowArrow = useMemo(
    () => !isHeader && !!showArrow && !isShowExpand,
    [isHeader, showArrow, isShowExpand]
  );

  // === Ellipsis config (merge column-level + global) ===
  const cellRef = useRef<TouchableOpacity>(null);

  const effectiveEllipsis = useMemo((): IEllipsisConfig | null => {
    if (isHeader) return null;
    const colEllipsis = col.ellipsis;
    if (colEllipsis === true) {
      // column 设置 ellipsis: true，使用全局 numberOfLines（默认 1）
      return {
        enabled: true,
        numberOfLines: globalEllipsisConfig?.numberOfLines ?? 1,
        trigger: globalEllipsisConfig?.trigger ?? 'longPress',
      };
    }
    if (colEllipsis && typeof colEllipsis === 'object') {
      // column 设置了 IEllipsisConfig 对象
      return {
        enabled: true,
        numberOfLines: colEllipsis.numberOfLines ?? 1,
        trigger:
          colEllipsis.trigger ?? globalEllipsisConfig?.trigger ?? 'longPress',
        renderTooltip:
          colEllipsis.renderTooltip ?? globalEllipsisConfig?.renderTooltip,
      };
    }
    if (globalEllipsisConfig?.enabled) {
      // 全局启用省略
      return {
        enabled: true,
        numberOfLines: globalEllipsisConfig.numberOfLines ?? 1,
        trigger: globalEllipsisConfig.trigger ?? 'longPress',
        renderTooltip: globalEllipsisConfig.renderTooltip,
      };
    }
    return null;
  }, [isHeader, col.ellipsis, globalEllipsisConfig]);

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
  const isDragType = type === 'drag';

  const _rowKey = rowKeyValue ?? String(rowIndex);

  // === Inline edit state ===
  const isEditing = useMemo(
    () =>
      !isHeader &&
      editingCell?.rowKey === _rowKey &&
      editingCell?.columnKey === key,
    [isHeader, editingCell, _rowKey, key]
  );

  const editKey = `${_rowKey}-${key}`;
  const currentEditValue = editValues?.get(editKey);

  const _onEditSave = useCallback(
    (newValue: unknown) => {
      // 优先走 hook 的 saveEdit：跑校验 → 触发 onEditSave → 清理 editValues → 退出编辑态
      if (isFunction(saveEdit)) {
        saveEdit({ row, column: col, value: newValue, oldValue: val });
        return;
      }
      // 回退：至少写入编辑值并退出编辑态，避免卡在编辑态
      setEditValue?.(editKey, newValue);
      setEditingCell?.(null);
    },
    [saveEdit, row, col, val, editKey, setEditValue, setEditingCell]
  );

  const _onEditCancel = useCallback(() => {
    // 优先走 hook 的 cancelEdit：清理 editValues 僵尸条目 + 触发 onEditCancel
    if (isFunction(cancelEdit)) {
      cancelEdit();
      return;
    }
    setEditingCell?.(null);
  }, [cancelEdit, setEditingCell]);

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
    // === Click-trigger inline edit ===
    if (
      editConfig?.trigger === 'click' &&
      col.editable &&
      !isHeader &&
      setEditingCell
    ) {
      setEditingCell({ rowKey: _rowKey, columnKey: key });
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
    editConfig?.trigger,
    setEditingCell,
  ]);

  // === Tooltip long-press handler ===
  const _onTooltipLongPress = useCallback(() => {
    if (!effectiveEllipsis || !showTooltip) return;
    const textVal = isArray(val) ? val.join(', ') : String(val ?? '');
    if (!textVal) return;
    cellRef.current?.measure(
      (
        _fx: number,
        _fy: number,
        _w: number,
        _h: number,
        px: number,
        py: number
      ) => {
        showTooltip(textVal, px, py, _w);
      }
    );
  }, [effectiveEllipsis, showTooltip, val]);

  // === Context menu long-press handler ===
  const _onContextMenu = useCallback(() => {
    if (!contextMenuConfig || !showContextMenu || isHeader) return;
    cellRef.current?.measure(
      (
        _fx: number,
        _fy: number,
        _w: number,
        _h: number,
        px: number,
        py: number
      ) => {
        showContextMenu({ row, rowIndex, x: px, y: py + _h, column: col });
      }
    );
  }, [contextMenuConfig, showContextMenu, isHeader, row, rowIndex, col]);

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
        <View
          style={styles.checkbox}
          accessible
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: isCheckedAll ? true : isIndeterminate ? 'mixed' : false,
          }}
          accessibilityLabel="Select all"
        >
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
      <View
        style={styles.checkbox}
        accessible
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
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
      <View
        style={styles.radio}
        accessible
        accessibilityRole="radio"
        accessibilityState={{ selected }}
      >
        <View style={[styles.radioOuter, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    );
  };

  // === Search highlight scope check ===
  const isSearchActive = useMemo(() => {
    if (isHeader) return false;
    if (!searchConfig?.keyword || searchConfig.keyword.length === 0)
      return false;
    // If columnKeys is specified, only highlight those columns
    if (searchConfig.columnKeys && searchConfig.columnKeys.length > 0) {
      return searchConfig.columnKeys.includes(key);
    }
    return true;
  }, [isHeader, searchConfig?.keyword, searchConfig?.columnKeys, key]);

  // === Render drag handle ===
  const renderDragHandle = () => {
    if (!isDragType || isHeader) return null;
    const isDragDisabled = isFunction(dragSortConfig?.dragMethod)
      ? !dragSortConfig!.dragMethod({ row, rowIndex })
      : false;
    return (
      <DragHandle
        rowIndex={rowIndex}
        startDrag={startDrag ?? (() => {})}
        moveDrag={moveDrag ?? (() => {})}
        endDrag={endDrag ?? (() => {})}
        disabled={isDragDisabled}
      />
    );
  };

  // === Render default cell text ===
  const renderCell = () => {
    if (isDragType) return renderDragHandle();
    if (isCheckboxType) return renderCheckbox();
    if (isRadioType) {
      if (isHeader) return null;
      return renderRadio();
    }
    if (isNil(val)) return null;
    const vals = isArray(val) ? val : [val];
    const ellipsisLines = effectiveEllipsis?.numberOfLines ?? undefined;
    return vals.map((item, index) => {
      const textVal = String(item);
      // 仅左固定列强制左对齐；右固定/普通列尊重 col.align（与 Row 容器对齐逻辑一致）
      const isFixedLeftCol = fixed === true || fixed === 'left';
      const textAlign = isFixedLeftCol
        ? ('left' as const)
        : col.align ?? 'left';
      const cellStyle = [
        styles.text,
        {
          textAlign,
          color: isHeader
            ? tableHeaderTextColor ?? '#929AA6'
            : tableTextColor ?? '#1F2733',
        },
        isHeader ? hTextStyle : textStyle,
        index >= 1 && styles.second_text,
        index >= 1 && secondTextStyle,
      ];

      if (isSearchActive) {
        return (
          <HighlightText
            key={`table-cell-${key}-${textVal}-${index}`}
            text={textVal}
            keyword={searchConfig!.keyword}
            caseSensitive={searchConfig!.caseSensitive}
            highlightStyle={searchConfig!.highlightStyle}
            style={cellStyle}
            numberOfLines={ellipsisLines ?? 2}
          />
        );
      }

      return (
        <Text
          key={`table-cell-${key}-${textVal}-${index}`}
          numberOfLines={ellipsisLines ?? 2}
          ellipsizeMode={ellipsisLines ? 'tail' : undefined}
          style={cellStyle}
        >
          {item}
        </Text>
      );
    });
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

  const renderExpand = () => {
    if (!isShowExpand) return null;
    if (isRowLoading) {
      return (
        <View style={styles.expand_icon}>
          <ActivityIndicator size="small" color="#1890ff" />
        </View>
      );
    }
    return (
      <View
        style={[
          styles.expand_icon,
          { transform: [{ rotate: expanded ? '90deg' : '0deg' }] },
        ]}
      >
        <View style={styles.expandTriangle} />
      </View>
    );
  };

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
                <Text style={styles.filterResetText}>
                  {locale?.filterReset}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterConfirmBtn}
                onPress={() => confirmFilter(tempFilterValues)}
              >
                <Text style={styles.filterConfirmText}>
                  {locale?.filterConfirm}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const hasTooltip = !!effectiveEllipsis && !!showTooltip;
  const tooltipTrigger = effectiveEllipsis?.trigger ?? 'longPress';
  const hasContextMenu = !!contextMenuConfig && !isHeader;

  // Determine which long-press handler to use:
  // 1. If tooltip is configured with longPress trigger → tooltip takes priority
  // 2. Else if contextMenuConfig exists → context menu
  // 3. Else → undefined
  const _onLongPress = useMemo(() => {
    if (hasTooltip && tooltipTrigger === 'longPress')
      return _onTooltipLongPress;
    if (hasContextMenu) return _onContextMenu;
    return undefined;
  }, [
    hasTooltip,
    tooltipTrigger,
    _onTooltipLongPress,
    hasContextMenu,
    _onContextMenu,
  ]);

  // === Inline edit mode: render EditCell instead of normal content ===
  if (isEditing) {
    const cellValue = currentEditValue !== undefined ? currentEditValue : val;
    return (
      <View style={[styles.content, style]}>
        <EditCell
          row={row}
          column={col}
          value={cellValue}
          rowKey={_rowKey}
          onSave={_onEditSave}
          onCancel={_onEditCancel}
        />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        ref={cellRef}
        style={[styles.content, style, touchStyle]}
        onPress={_onPress}
        onLongPress={_onLongPress}
        disabled={
          !onPress &&
          !isShowSort &&
          !isShowExpand &&
          !isCheckboxType &&
          !isRadioType &&
          !hasTooltip &&
          !hasContextMenu &&
          !(editConfig?.trigger === 'click' && col.editable)
        }
      >
        {renderExpand()}
        <View>{renderCell()}</View>
        {renderArrow()}
        {renderSort()}
        {renderFilterIcon()}
      </TouchableOpacity>
      {renderFilterModal()}
      {validationConfig?.showInline &&
        (() => {
          const cellErrors =
            validationErrors?.filter(
              (e) => e.rowKey === _rowKey && e.columnKey === key
            ) ?? [];
          return cellErrors.length > 0 ? (
            <ValidationError
              errors={cellErrors}
              style={validationConfig.errorStyle}
              textStyle={validationConfig.errorTextStyle}
            />
          ) : null;
        })()}
    </>
  );
};

export default memo(forwardRef(Cell));
