/**
 * Type existence tests for P0+P1 new types.
 *
 * These tests verify that all new types/interfaces are properly exported
 * and structurally correct. They run at both compile-time (tsc) and
 * runtime (jest) to catch regressions.
 */

import type {
  // P0-1: Column Resize
  IResizeConfig,
  // P0-2: Grouped Headers
  IHeaderCell,
  THeaderLevel,
  // P0-3: Cell Merge
  ISpanResult,
  TSpanMethod,
  // P0-4: Row Drag Sort
  IDragSortConfig,
  // P0-5: Pagination
  IPaginationConfig,
  // P0-6: Ellipsis + Tooltip
  IEllipsisConfig,
  // P1-7: Inline Edit
  TEditType,
  IEditRule,
  IEditConfig,
  // P1-8: Validation
  IValidationError,
  IValidationConfig,
  // P1-9: Context Menu
  IContextMenuItem,
  IContextMenuConfig,
  // P1-10: Column Visibility
  IColumnVisibilityConfig,
  // P1-12: Search Highlight
  ISearchConfig,
  // Extended existing types
  TColumnType,
  ITableColumn,
  ITableProps,
  ITableStaticContextValue,
  ITableStateContextValue,
  ICoolTableRef,
} from '../types';

// ============================================================
// Compile-time type assertions (zero runtime cost)
// ============================================================

/**
 * Helper: asserts that a type is assignable.
 * If the type doesn't exist or is structurally wrong, tsc will fail here.
 */
function assertType<T>(_value: T): void {
  // no-op at runtime; the assertion is purely compile-time
}

// P0-1: Column Resize
assertType<IResizeConfig>({});
assertType<IResizeConfig>({
  enabled: true,
  minWidth: 50,
  maxWidth: 300,
  onResizeEnd: ({ column: _c, width: _w }) => {},
});

// P0-2: Grouped Headers
assertType<IHeaderCell>({
  column: { key: 'a', title: 'A' },
  colSpan: 1,
  rowSpan: 1,
  isLeaf: true,
});
assertType<THeaderLevel>([]);

// P0-3: Cell Merge
assertType<ISpanResult>({ rowspan: 1, colspan: 2 });
assertType<TSpanMethod>(
  ({ row: _r, column: _c, rowIndex: _ri, colIndex: _ci }) => ({
    rowspan: 1,
    colspan: 1,
  })
);

// P0-4: Row Drag Sort
assertType<IDragSortConfig>({});
assertType<IDragSortConfig>({
  onDragEnd: ({ data: _d, fromIndex: _f, toIndex: _t }) => {},
  dragMethod: ({ row: _r, rowIndex: _i }) => true,
});

// P0-5: Pagination
assertType<IPaginationConfig>({});
assertType<IPaginationConfig>({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 50],
  total: 100,
});

// P0-6: Ellipsis + Tooltip
assertType<IEllipsisConfig>({});
assertType<IEllipsisConfig>({
  enabled: true,
  numberOfLines: 1,
  trigger: 'longPress',
});

// P1-7: Inline Edit
assertType<TEditType>('text');
assertType<TEditType>('number');
assertType<TEditType>('select');
assertType<TEditType>('custom');
assertType<IEditRule>({});
assertType<IEditRule>({
  required: true,
  pattern: /^\d+$/,
  message: 'numbers only',
});
assertType<IEditConfig>({});
assertType<IEditConfig>({ trigger: 'click' });

// P1-8: Validation
assertType<IValidationError>({
  rowKey: '1',
  columnKey: 'name',
  message: 'required',
});
assertType<IValidationConfig>({});

// P1-9: Context Menu
assertType<IContextMenuItem>({ key: 'edit', label: 'Edit' });
assertType<IContextMenuItem>({
  key: 'delete',
  label: 'Delete',
  disabled: false,
  danger: true,
});
assertType<IContextMenuConfig>({});

// P1-10: Column Visibility
assertType<IColumnVisibilityConfig>({});
assertType<IColumnVisibilityConfig>({
  hiddenKeys: ['age'],
  alwaysVisible: ['name'],
});

// P1-12: Search Highlight
assertType<ISearchConfig>({});
assertType<ISearchConfig>({
  keyword: 'test',
  caseSensitive: false,
  columnKeys: ['name', 'city'],
});

// TColumnType extended with 'drag'
assertType<TColumnType>('drag');
assertType<TColumnType>('seq');
assertType<TColumnType>('checkbox');
assertType<TColumnType>('radio');
assertType<TColumnType>('expand');

// ITableColumn extended fields
assertType<ITableColumn>({
  key: 'name',
  title: 'Name',
  children: [{ key: 'first', title: 'First' }],
  resizable: true,
  ellipsis: true,
  editable: true,
  editType: 'text',
  editRules: [{ required: true }],
  editOptions: [{ label: 'A', value: 'a' }],
});

// ITableColumn ellipsis with config object
assertType<ITableColumn>({
  key: 'desc',
  title: 'Description',
  ellipsis: { enabled: true, numberOfLines: 2, trigger: 'press' },
});

// ============================================================
// Runtime existence tests
// ============================================================

describe('P0+P1 type definitions', () => {
  it('all new standalone types are importable (compile-time verified)', () => {
    // If this test file compiles, all type imports are valid.
    // This runtime assertion simply confirms the test ran.
    expect(true).toBe(true);
  });

  it('ITableColumn accepts new P0+P1 fields', () => {
    const col: ITableColumn = {
      key: 'test',
      title: 'Test',
      children: [],
      resizable: true,
      ellipsis: { enabled: true, numberOfLines: 1 },
      editable: true,
      editType: 'select',
      editRules: [{ required: true, message: 'required' }],
      editOptions: [{ label: 'Option A', value: 1 }],
    };
    expect(col.key).toBe('test');
    expect(col.children).toEqual([]);
    expect(col.resizable).toBe(true);
    expect(col.editable).toBe(true);
    expect(col.editType).toBe('select');
  });

  it('ITableProps accepts new config props', () => {
    const props: Partial<ITableProps> = {
      resizeConfig: { enabled: true },
      spanMethod: () => ({ rowspan: 1, colspan: 1 }),
      dragSortConfig: {},
      paginationConfig: { currentPage: 1, pageSize: 10 },
      ellipsisConfig: { enabled: true },
      editConfig: { trigger: 'click' },
      validationConfig: { showInline: true },
      contextMenuConfig: { items: [] },
      columnVisibilityConfig: { hiddenKeys: [] },
      searchConfig: { keyword: 'hello' },
    };
    expect(props.resizeConfig).toBeDefined();
    expect(props.paginationConfig?.currentPage).toBe(1);
  });

  it('ITableStaticContextValue accepts new fields', () => {
    const partial: Partial<ITableStaticContextValue> = {
      resizeConfig: { enabled: true },
      headerLevels: [],
      mergeMap: new Map(),
      dragSortConfig: {},
      paginationConfig: {},
      ellipsisConfig: {},
      editConfig: {},
      validationConfig: {},
      contextMenuConfig: {},
      searchConfig: {},
    };
    expect(partial.resizeConfig?.enabled).toBe(true);
  });

  it('ITableStateContextValue accepts new optional fields', () => {
    const partial: Partial<ITableStateContextValue> = {
      columnWidths: new Map([['name', 120]]),
      editingCell: null,
      editValues: new Map(),
      validationErrors: [],
      loadingKeys: new Set(),
      dragIndex: null,
      targetIndex: null,
      hiddenColumnKeys: new Set(['age']),
    };
    expect(partial.columnWidths?.get('name')).toBe(120);
    expect(partial.hiddenColumnKeys?.has('age')).toBe(true);
  });

  it('ICoolTableRef has new method signatures (optional until implemented)', () => {
    // Verify the ref interface shape via a mock object
    const mockRef: ICoolTableRef = {
      // Existing required methods
      getCheckboxRecords: () => [],
      setCheckboxRow: () => {},
      clearCheckboxRow: () => {},
      getRadioRecord: () => null,
      setRadioRow: () => {},
      clearRadioRow: () => {},
      sort: () => {},
      clearSort: () => {},
      getSortColumns: () => [],
      clearFilter: () => {},
      getCheckedFilters: () => [],
      scrollToRow: () => {},
      scrollToTop: () => {},
      getFullData: () => [],
      getData: () => [],
      setRowExpand: () => {},
      setAllRowExpand: () => {},
      setTreeExpand: () => {},
      setAllTreeExpand: () => {},
      // New optional methods
      setColumnWidth: () => {},
      getColumnWidths: () => new Map(),
      setPage: () => {},
      setPageSize: () => {},
      startEdit: () => {},
      cancelEdit: () => {},
      getEditValues: () => new Map(),
      validate: () => Promise.resolve([]),
      validateRow: () => Promise.resolve([]),
      clearValidation: () => {},
      hideColumn: () => {},
      showColumn: () => {},
      getHiddenColumns: () => [],
    };

    expect(typeof mockRef.setColumnWidth).toBe('function');
    expect(typeof mockRef.getColumnWidths).toBe('function');
    expect(typeof mockRef.setPage).toBe('function');
    expect(typeof mockRef.setPageSize).toBe('function');
    expect(typeof mockRef.startEdit).toBe('function');
    expect(typeof mockRef.cancelEdit).toBe('function');
    expect(typeof mockRef.getEditValues).toBe('function');
    expect(typeof mockRef.validate).toBe('function');
    expect(typeof mockRef.validateRow).toBe('function');
    expect(typeof mockRef.clearValidation).toBe('function');
    expect(typeof mockRef.hideColumn).toBe('function');
    expect(typeof mockRef.showColumn).toBe('function');
    expect(typeof mockRef.getHiddenColumns).toBe('function');

    // Also verify the interface works WITHOUT the new methods (backward compat)
    const minimalRef: ICoolTableRef = {
      getCheckboxRecords: () => [],
      setCheckboxRow: () => {},
      clearCheckboxRow: () => {},
      getRadioRecord: () => null,
      setRadioRow: () => {},
      clearRadioRow: () => {},
      sort: () => {},
      clearSort: () => {},
      getSortColumns: () => [],
      clearFilter: () => {},
      getCheckedFilters: () => [],
      scrollToRow: () => {},
      scrollToTop: () => {},
      getFullData: () => [],
      getData: () => [],
      setRowExpand: () => {},
      setAllRowExpand: () => {},
      setTreeExpand: () => {},
      setAllTreeExpand: () => {},
    };
    expect(minimalRef.setColumnWidth).toBeUndefined();
  });

  it('TColumnType includes drag', () => {
    const types: TColumnType[] = ['seq', 'checkbox', 'radio', 'expand', 'drag'];
    expect(types).toHaveLength(5);
    expect(types).toContain('drag');
  });
});
