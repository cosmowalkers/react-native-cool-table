import { createRef } from 'react';
import { render, renderHook, act } from '@testing-library/react-native';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import CoolTable from '../index';
import type { ITableColumn, ICoolTableRef } from '../types';

// ============================================================
// Test data
// ============================================================

const TEST_COLUMNS: ITableColumn[] = [
  { key: 'name', title: 'Name', width: 100 },
  { key: 'age', title: 'Age', width: 80 },
  { key: 'email', title: 'Email', width: 150 },
];

const TEST_DATA = [
  { name: 'Alice', age: 30, email: 'a@test.com' },
  { name: 'Bob', age: 25, email: 'b@test.com' },
];

// ============================================================
// 1. useColumnVisibility hook
// ============================================================

describe('useColumnVisibility', () => {
  it('should return all columns when no config', () => {
    const { result } = renderHook(() =>
      useColumnVisibility({ columns: TEST_COLUMNS })
    );
    expect(result.current.visibleColumns).toHaveLength(3);
  });

  it('should hide columns by initial hiddenKeys', () => {
    const { result } = renderHook(() =>
      useColumnVisibility({
        columns: TEST_COLUMNS,
        columnVisibilityConfig: { hiddenKeys: ['age'] },
      })
    );
    expect(result.current.visibleColumns).toHaveLength(2);
    expect(
      result.current.visibleColumns.map((c: ITableColumn) => c.key)
    ).toEqual(['name', 'email']);
  });

  it('should hide/show columns via methods', () => {
    const { result } = renderHook(() =>
      useColumnVisibility({ columns: TEST_COLUMNS })
    );
    act(() => result.current.hideColumn('age'));
    expect(result.current.visibleColumns).toHaveLength(2);
    act(() => result.current.showColumn('age'));
    expect(result.current.visibleColumns).toHaveLength(3);
  });

  it('should respect alwaysVisible', () => {
    const { result } = renderHook(() =>
      useColumnVisibility({
        columns: TEST_COLUMNS,
        columnVisibilityConfig: { alwaysVisible: ['name'] },
      })
    );
    act(() => result.current.hideColumn('name'));
    expect(result.current.visibleColumns).toHaveLength(3);
  });

  it('should fire onChange callback', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useColumnVisibility({
        columns: TEST_COLUMNS,
        columnVisibilityConfig: { onChange },
      })
    );
    act(() => result.current.hideColumn('age'));
    expect(onChange).toHaveBeenCalledWith({ hiddenKeys: ['age'] });
  });

  it('should return hidden columns via getHiddenColumns', () => {
    const { result } = renderHook(() =>
      useColumnVisibility({
        columns: TEST_COLUMNS,
        columnVisibilityConfig: { hiddenKeys: ['age', 'email'] },
      })
    );
    expect(result.current.getHiddenColumns()).toEqual(['age', 'email']);
  });

  it('should sync controlledHiddenKeys on update (skip mount)', () => {
    const { result, rerender } = renderHook(
      ({ keys }) =>
        useColumnVisibility({
          columns: TEST_COLUMNS,
          columnVisibilityConfig: { controlledHiddenKeys: keys },
        }),
      { initialProps: { keys: ['age'] } }
    );

    expect(result.current.visibleColumns).toHaveLength(2);

    rerender({ keys: ['age', 'email'] });

    expect(result.current.visibleColumns).toHaveLength(1);
    expect(
      result.current.visibleColumns.map((c: ITableColumn) => c.key)
    ).toEqual(['name']);
  });

  it('should not fire onChange in controlled mode', () => {
    const onChange = jest.fn();
    const { rerender } = renderHook(
      ({ keys }) =>
        useColumnVisibility({
          columns: TEST_COLUMNS,
          columnVisibilityConfig: {
            controlledHiddenKeys: keys,
            onChange,
          },
        }),
      { initialProps: { keys: ['age'] as string[] } }
    );

    rerender({ keys: ['age', 'email'] });

    expect(onChange).not.toHaveBeenCalled();
  });
});

// ============================================================
// 2. CoolTable integration with columnVisibilityConfig
// ============================================================

describe('CoolTable with columnVisibilityConfig', () => {
  it('should hide columns specified in config', () => {
    const { queryByText, getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        columnVisibilityConfig={{ hiddenKeys: ['age'] }}
      />
    );
    expect(getByText('Name')).toBeTruthy();
    expect(queryByText('Age')).toBeNull();
    expect(getByText('Email')).toBeTruthy();
  });

  it('should render all columns when no hidden keys', () => {
    const { getByText } = render(
      <CoolTable columns={TEST_COLUMNS} data={TEST_DATA} />
    );
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Age')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
  });

  it('should expose hideColumn/showColumn/getHiddenColumns on ref', () => {
    const tableRef = createRef<ICoolTableRef>();

    const { queryByText, getByText } = render(
      <CoolTable
        ref={tableRef as any}
        columns={TEST_COLUMNS}
        data={TEST_DATA}
      />
    );

    expect(getByText('Age')).toBeTruthy();

    act(() => {
      tableRef.current?.hideColumn?.('age');
    });

    expect(queryByText('Age')).toBeNull();
    expect(tableRef.current?.getHiddenColumns?.()).toEqual(['age']);

    act(() => {
      tableRef.current?.showColumn?.('age');
    });

    expect(getByText('Age')).toBeTruthy();
    expect(tableRef.current?.getHiddenColumns?.()).toEqual([]);
  });
});
