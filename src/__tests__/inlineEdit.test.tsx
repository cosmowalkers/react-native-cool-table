import React from 'react';
import type { MutableRefObject } from 'react';
import { renderHook, render, act } from '@testing-library/react-native';
import { useEditableCell } from '../hooks/useEditableCell';
import CoolTable from '../index';
import type { ITableColumn, TItem, IEditConfig, ICoolTableRef } from '../types';

/** Helper to create a ref compatible with CoolTable's expected MutableRefObject type */
const createTableRef = (): MutableRefObject<ICoolTableRef> =>
  React.createRef<ICoolTableRef>() as MutableRefObject<ICoolTableRef>;

// ============================================================
// Test data
// ============================================================

const TEST_COLUMNS: ITableColumn[] = [
  { key: 'name', title: 'Name', width: 120, editable: true, editType: 'text' },
  {
    key: 'age',
    title: 'Age',
    width: 80,
    editable: true,
    editType: 'number',
  },
  {
    key: 'status',
    title: 'Status',
    width: 100,
    editable: true,
    editType: 'select',
    editOptions: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  { key: 'note', title: 'Note', width: 120 },
];

const TEST_DATA: TItem[] = [
  { id: '1', name: 'Alice', age: 30, status: 'active', note: 'N/A' },
  { id: '2', name: 'Bob', age: 25, status: 'inactive', note: 'N/A' },
];

// ============================================================
// useEditableCell hook - unit tests
// ============================================================

describe('useEditableCell', () => {
  it('should start with no editing cell', () => {
    const { result } = renderHook(() => useEditableCell({}));

    expect(result.current.editingCell).toBeNull();
    expect(result.current.editValues.size).toBe(0);
  });

  it('should set editing cell', () => {
    const { result } = renderHook(() => useEditableCell({}));

    act(() => {
      result.current.setEditingCell({ rowKey: '1', columnKey: 'name' });
    });

    expect(result.current.editingCell).toEqual({
      rowKey: '1',
      columnKey: 'name',
    });
  });

  it('should track edit values', () => {
    const { result } = renderHook(() => useEditableCell({}));

    act(() => {
      result.current.setEditingCell({ rowKey: '1', columnKey: 'name' });
    });
    act(() => {
      result.current.setEditValue('1-name', 'Updated Alice');
    });

    expect(result.current.editValues.get('1-name')).toBe('Updated Alice');
  });

  it('should clear edit state on cancel', () => {
    const { result } = renderHook(() => useEditableCell({}));

    act(() => {
      result.current.setEditingCell({ rowKey: '1', columnKey: 'name' });
    });
    act(() => {
      result.current.setEditValue('1-name', 'Updated');
    });
    act(() => {
      result.current.cancelEdit();
    });

    expect(result.current.editingCell).toBeNull();
    expect(result.current.editValues.has('1-name')).toBe(false);
  });

  it('should call onEditCancel callback when cancelling', () => {
    const onEditCancel = jest.fn();
    const editConfig: IEditConfig = { onEditCancel };
    const { result } = renderHook(() => useEditableCell({ editConfig }));

    act(() => {
      result.current.setEditingCell({ rowKey: '1', columnKey: 'name' });
    });
    act(() => {
      result.current.cancelEdit();
    });

    expect(onEditCancel).toHaveBeenCalledTimes(1);
    expect(onEditCancel).toHaveBeenCalledWith(
      expect.objectContaining({
        row: undefined,
        column: undefined,
      })
    );
  });

  it('should call onEditSave callback when saving', async () => {
    const onEditSave = jest.fn();
    const editConfig: IEditConfig = { onEditSave };
    const { result } = renderHook(() => useEditableCell({ editConfig }));

    act(() => {
      result.current.setEditingCell({ rowKey: '1', columnKey: 'name' });
    });
    act(() => {
      result.current.setEditValue('1-name', 'Updated Alice');
    });

    await act(async () => {
      await result.current.saveEdit({
        row: TEST_DATA[0]!,
        column: TEST_COLUMNS[0]!,
        value: 'Updated Alice',
        oldValue: 'Alice',
      });
    });

    expect(onEditSave).toHaveBeenCalledTimes(1);
    expect(onEditSave).toHaveBeenCalledWith({
      row: TEST_DATA[0],
      column: TEST_COLUMNS[0],
      value: 'Updated Alice',
      oldValue: 'Alice',
    });
    // Editing state should be cleared after save
    expect(result.current.editingCell).toBeNull();
  });

  it('should not clear editing state if saveEdit validation fails (required)', async () => {
    const onEditSave = jest.fn();
    const editConfig: IEditConfig = { onEditSave };
    const columnWithRules: ITableColumn = {
      ...TEST_COLUMNS[0]!,
      editRules: [{ required: true, message: 'Name is required' }],
    };
    const { result } = renderHook(() => useEditableCell({ editConfig }));

    act(() => {
      result.current.setEditingCell({ rowKey: '1', columnKey: 'name' });
    });
    act(() => {
      result.current.setEditValue('1-name', '');
    });

    let saveResult: boolean | undefined;
    await act(async () => {
      saveResult = await result.current.saveEdit({
        row: TEST_DATA[0]!,
        column: columnWithRules,
        value: '',
        oldValue: 'Alice',
      });
    });

    expect(onEditSave).not.toHaveBeenCalled();
    expect(saveResult).toBe(false);
    // Editing state should NOT be cleared
    expect(result.current.editingCell).toEqual({
      rowKey: '1',
      columnKey: 'name',
    });
  });

  it('should not clear editing state if saveEdit validation fails (pattern)', async () => {
    const onEditSave = jest.fn();
    const editConfig: IEditConfig = { onEditSave };
    const columnWithRules: ITableColumn = {
      ...TEST_COLUMNS[0]!,
      editRules: [{ pattern: /^[A-Z]/, message: 'Must start with uppercase' }],
    };
    const { result } = renderHook(() => useEditableCell({ editConfig }));

    act(() => {
      result.current.setEditingCell({ rowKey: '1', columnKey: 'name' });
    });
    act(() => {
      result.current.setEditValue('1-name', 'alice');
    });

    let saveResult: boolean | undefined;
    await act(async () => {
      saveResult = await result.current.saveEdit({
        row: TEST_DATA[0]!,
        column: columnWithRules,
        value: 'alice',
        oldValue: 'Alice',
      });
    });

    expect(onEditSave).not.toHaveBeenCalled();
    expect(saveResult).toBe(false);
  });
});

// ============================================================
// Integration: CoolTable with editConfig
// ============================================================

describe('CoolTable with editConfig', () => {
  it('should render editable cells normally when not editing', () => {
    const { getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        editConfig={{ trigger: 'click' }}
      />
    );

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('should render EditCell when editing (after startEdit via ref)', () => {
    const tableRef = createTableRef();
    const { getByTestId } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        editConfig={{ trigger: 'manual' }}
        ref={tableRef}
      />
    );

    act(() => {
      tableRef.current?.startEdit?.('1', 'name');
    });

    expect(getByTestId('edit-cell-input')).toBeTruthy();
  });

  it('should render text input for text editType', () => {
    const tableRef = createTableRef();
    const { getByTestId } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        editConfig={{ trigger: 'manual' }}
        ref={tableRef}
      />
    );

    act(() => {
      tableRef.current?.startEdit?.('1', 'name');
    });

    const input = getByTestId('edit-cell-input');
    expect(input).toBeTruthy();
    expect(input.props.keyboardType).toBe('default');
  });

  it('should render select for select editType with editOptions', () => {
    const tableRef = createTableRef();
    const { getByTestId } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        editConfig={{ trigger: 'manual' }}
        ref={tableRef}
      />
    );

    act(() => {
      tableRef.current?.startEdit?.('1', 'status');
    });

    expect(getByTestId('edit-cell-select')).toBeTruthy();
  });

  it('should expose cancelEdit and getEditValues via ref', () => {
    const tableRef = createTableRef();
    render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        editConfig={{ trigger: 'manual' }}
        ref={tableRef}
      />
    );

    expect(tableRef.current?.cancelEdit).toBeDefined();
    expect(tableRef.current?.getEditValues).toBeDefined();

    act(() => {
      tableRef.current?.startEdit?.('1', 'name');
    });

    act(() => {
      tableRef.current?.cancelEdit?.();
    });

    const editValues = tableRef.current?.getEditValues?.();
    expect(editValues).toBeDefined();
  });
});
