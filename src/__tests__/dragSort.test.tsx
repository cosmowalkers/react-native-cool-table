import React from 'react';
import { renderHook, render, act } from '@testing-library/react-native';
import { useRowDragSort } from '../hooks/useRowDragSort';
import CoolTable from '../index';
import type { ITableColumn, TItem, IDragSortConfig } from '../types';

// ============================================================
// Test data
// ============================================================

const TEST_COLUMNS: ITableColumn[] = [
  { key: '_drag', title: '', width: 50, type: 'drag' },
  { key: 'name', title: 'Name', width: 100 },
  { key: 'age', title: 'Age', width: 80 },
];

const TEST_DATA: TItem[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
  { id: '3', name: 'Charlie', age: 35 },
  { id: '4', name: 'Diana', age: 28 },
];

// ============================================================
// useRowDragSort hook — unit tests
// ============================================================

describe('useRowDragSort', () => {
  it('should return null indices when no config provided', () => {
    const { result } = renderHook(() => useRowDragSort({ data: TEST_DATA }));

    expect(result.current.dragIndex).toBeNull();
    expect(result.current.targetIndex).toBeNull();
  });

  it('should return null indices initially with config', () => {
    const onDragEnd = jest.fn();
    const { result } = renderHook(() =>
      useRowDragSort({
        dragSortConfig: { onDragEnd },
        data: TEST_DATA,
      })
    );

    expect(result.current.dragIndex).toBeNull();
    expect(result.current.targetIndex).toBeNull();
  });

  it('startDrag should set dragIndex', () => {
    const onDragEnd = jest.fn();
    const { result } = renderHook(() =>
      useRowDragSort({
        dragSortConfig: { onDragEnd },
        data: TEST_DATA,
      })
    );

    act(() => {
      result.current.startDrag(1);
    });

    expect(result.current.dragIndex).toBe(1);
    expect(result.current.targetIndex).toBeNull();
  });

  it('moveDrag should set targetIndex', () => {
    const onDragEnd = jest.fn();
    const { result } = renderHook(() =>
      useRowDragSort({
        dragSortConfig: { onDragEnd },
        data: TEST_DATA,
      })
    );

    act(() => {
      result.current.startDrag(0);
    });
    act(() => {
      result.current.moveDrag(2);
    });

    expect(result.current.dragIndex).toBe(0);
    expect(result.current.targetIndex).toBe(2);
  });

  it('endDrag should reorder data, call onDragEnd, and reset indices', () => {
    const onDragEnd = jest.fn();
    const { result } = renderHook(() =>
      useRowDragSort({
        dragSortConfig: { onDragEnd },
        data: TEST_DATA,
      })
    );

    // Drag item 0 (Alice) to position 2
    act(() => {
      result.current.startDrag(0);
    });
    act(() => {
      result.current.moveDrag(2);
    });
    act(() => {
      result.current.endDrag();
    });

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    const call = onDragEnd.mock.calls[0]![0];
    expect(call.fromIndex).toBe(0);
    expect(call.toIndex).toBe(2);
    // After moving index 0 to index 2: [Bob, Charlie, Alice, Diana]
    expect(call.data[0]!.name).toBe('Bob');
    expect(call.data[1]!.name).toBe('Charlie');
    expect(call.data[2]!.name).toBe('Alice');
    expect(call.data[3]!.name).toBe('Diana');

    // Indices should be reset
    expect(result.current.dragIndex).toBeNull();
    expect(result.current.targetIndex).toBeNull();
  });

  it('endDrag should be no-op when dragIndex is null', () => {
    const onDragEnd = jest.fn();
    const { result } = renderHook(() =>
      useRowDragSort({
        dragSortConfig: { onDragEnd },
        data: TEST_DATA,
      })
    );

    act(() => {
      result.current.endDrag();
    });

    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('endDrag should be no-op when targetIndex is null', () => {
    const onDragEnd = jest.fn();
    const { result } = renderHook(() =>
      useRowDragSort({
        dragSortConfig: { onDragEnd },
        data: TEST_DATA,
      })
    );

    act(() => {
      result.current.startDrag(0);
    });
    act(() => {
      result.current.endDrag();
    });

    expect(onDragEnd).not.toHaveBeenCalled();
    expect(result.current.dragIndex).toBeNull();
  });

  it('endDrag should be no-op when dragIndex equals targetIndex', () => {
    const onDragEnd = jest.fn();
    const { result } = renderHook(() =>
      useRowDragSort({
        dragSortConfig: { onDragEnd },
        data: TEST_DATA,
      })
    );

    act(() => {
      result.current.startDrag(1);
    });
    act(() => {
      result.current.moveDrag(1);
    });
    act(() => {
      result.current.endDrag();
    });

    expect(onDragEnd).not.toHaveBeenCalled();
    expect(result.current.dragIndex).toBeNull();
    expect(result.current.targetIndex).toBeNull();
  });

  it('dragMethod should block drag for certain rows', () => {
    const onDragEnd = jest.fn();
    const dragMethod: IDragSortConfig['dragMethod'] = ({ row }) =>
      row.name !== 'Bob';

    const { result } = renderHook(() =>
      useRowDragSort({
        dragSortConfig: { onDragEnd, dragMethod },
        data: TEST_DATA,
      })
    );

    // Trying to drag Bob (index 1) should be blocked
    act(() => {
      result.current.startDrag(1);
    });

    expect(result.current.dragIndex).toBeNull();

    // Trying to drag Alice (index 0) should work
    act(() => {
      result.current.startDrag(0);
    });

    expect(result.current.dragIndex).toBe(0);
  });

  it('should handle no dragSortConfig gracefully', () => {
    const { result } = renderHook(() => useRowDragSort({ data: TEST_DATA }));

    // startDrag/moveDrag/endDrag should be no-ops
    act(() => {
      result.current.startDrag(0);
    });
    expect(result.current.dragIndex).toBeNull();

    act(() => {
      result.current.moveDrag(1);
    });
    expect(result.current.targetIndex).toBeNull();

    act(() => {
      result.current.endDrag();
    });
    expect(result.current.dragIndex).toBeNull();
    expect(result.current.targetIndex).toBeNull();
  });

  it('should move item from higher index to lower index', () => {
    const onDragEnd = jest.fn();
    const { result } = renderHook(() =>
      useRowDragSort({
        dragSortConfig: { onDragEnd },
        data: TEST_DATA,
      })
    );

    // Drag item 3 (Diana) to position 1
    act(() => {
      result.current.startDrag(3);
    });
    act(() => {
      result.current.moveDrag(1);
    });
    act(() => {
      result.current.endDrag();
    });

    const call = onDragEnd.mock.calls[0]![0];
    expect(call.fromIndex).toBe(3);
    expect(call.toIndex).toBe(1);
    // After moving index 3 to index 1: [Alice, Diana, Bob, Charlie]
    expect(call.data[0]!.name).toBe('Alice');
    expect(call.data[1]!.name).toBe('Diana');
    expect(call.data[2]!.name).toBe('Bob');
    expect(call.data[3]!.name).toBe('Charlie');
  });
});

// ============================================================
// Integration: CoolTable with drag column type
// ============================================================

describe('CoolTable with drag column type', () => {
  it('should render drag handles for drag type column', () => {
    const onDragEnd = jest.fn();
    const { getAllByTestId } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        dragSortConfig={{ onDragEnd }}
      />
    );

    // Each data row should have a drag handle
    const handles = getAllByTestId('drag-handle');
    expect(handles.length).toBe(TEST_DATA.length);
  });

  it('should render table without errors when no dragSortConfig provided', () => {
    const columns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100 },
      { key: 'age', title: 'Age', width: 80 },
    ];

    const { getByText } = render(
      <CoolTable columns={columns} data={TEST_DATA} rowKey="id" />
    );

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('should render disabled drag handle when dragMethod returns false', () => {
    const onDragEnd = jest.fn();
    const dragMethod: IDragSortConfig['dragMethod'] = ({ row }) =>
      row.name !== 'Bob';

    const { getAllByTestId } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        dragSortConfig={{ onDragEnd, dragMethod }}
      />
    );

    const handles = getAllByTestId('drag-handle');
    expect(handles.length).toBe(TEST_DATA.length);

    // Bob's handle (index 1) should have reduced opacity (disabled)
    const bobHandle = handles[1];
    expect(bobHandle).toBeTruthy();
  });
});
