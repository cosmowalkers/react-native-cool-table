import { renderHook, render, act } from '@testing-library/react-native';
import { useTreeLazyLoad } from '../hooks/useTreeLazyLoad';
import CoolTable from '../index';
import type { ITableColumn, TItem, TExpandable } from '../types';

// ============================================================
// Test data
// ============================================================

const TEST_COLUMNS: ITableColumn[] = [
  { key: 'name', title: 'Name', width: 150 },
  { key: 'age', title: 'Age', width: 80 },
];

const TEST_DATA: TItem[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
];

const CHILD_DATA: TItem[] = [
  { id: '1-1', name: 'Alice Jr', age: 5 },
  { id: '1-2', name: 'Alice III', age: 3 },
];

// ============================================================
// useTreeLazyLoad hook - unit tests
// ============================================================

describe('useTreeLazyLoad', () => {
  it('should return initial state with nothing loading or loaded', () => {
    const { result } = renderHook(() => useTreeLazyLoad({}));

    expect(result.current.loadingKeys.size).toBe(0);
    expect(result.current.isLoading('any-key')).toBe(false);
    expect(result.current.isLoaded('any-key')).toBe(false);
    expect(result.current.getChildren('any-key')).toBeUndefined();
  });

  it('should return initial state when treeConfig has no loadChildren', () => {
    const { result } = renderHook(() =>
      useTreeLazyLoad({ treeConfig: { autoCollapseOthers: false } })
    );

    expect(result.current.loadingKeys.size).toBe(0);
    expect(result.current.isLoading('1')).toBe(false);
    expect(result.current.isLoaded('1')).toBe(false);
  });

  it('triggerLoad should call loadChildren and track loading state', async () => {
    let resolveLoad: (value: TItem[]) => void;
    const loadChildren = jest.fn(
      () =>
        new Promise<TItem[]>((resolve) => {
          resolveLoad = resolve;
        })
    );

    const treeConfig: TExpandable = { loadChildren };
    const { result } = renderHook(() => useTreeLazyLoad({ treeConfig }));

    // Start loading
    let loadPromise: Promise<void>;
    act(() => {
      loadPromise = result.current.triggerLoad('1', TEST_DATA[0]!, 0);
    });

    // Should be loading
    expect(result.current.isLoading('1')).toBe(true);
    expect(result.current.loadingKeys.has('1')).toBe(true);
    expect(loadChildren).toHaveBeenCalledWith({
      row: TEST_DATA[0],
      rowIndex: 0,
    });

    // Resolve
    await act(async () => {
      resolveLoad!(CHILD_DATA);
      await loadPromise!;
    });

    // Should be loaded, not loading
    expect(result.current.isLoading('1')).toBe(false);
    expect(result.current.isLoaded('1')).toBe(true);
    expect(result.current.getChildren('1')).toEqual(CHILD_DATA);
  });

  it('cacheChildren=true should skip load on second trigger', async () => {
    const loadChildren = jest.fn().mockResolvedValue(CHILD_DATA);
    const treeConfig: TExpandable = { loadChildren, cacheChildren: true };
    const { result } = renderHook(() => useTreeLazyLoad({ treeConfig }));

    // First load
    await act(async () => {
      await result.current.triggerLoad('1', TEST_DATA[0]!, 0);
    });

    expect(loadChildren).toHaveBeenCalledTimes(1);
    expect(result.current.isLoaded('1')).toBe(true);

    // Second load - should skip
    await act(async () => {
      await result.current.triggerLoad('1', TEST_DATA[0]!, 0);
    });

    expect(loadChildren).toHaveBeenCalledTimes(1); // Not called again
    expect(result.current.getChildren('1')).toEqual(CHILD_DATA);
  });

  it('cacheChildren=false (default) should reload on second trigger', async () => {
    const newChildren: TItem[] = [{ id: '1-3', name: 'Alice IV', age: 1 }];
    const loadChildren = jest
      .fn()
      .mockResolvedValueOnce(CHILD_DATA)
      .mockResolvedValueOnce(newChildren);

    const treeConfig: TExpandable = { loadChildren }; // cacheChildren defaults to falsy
    const { result } = renderHook(() => useTreeLazyLoad({ treeConfig }));

    // First load
    await act(async () => {
      await result.current.triggerLoad('1', TEST_DATA[0]!, 0);
    });

    expect(loadChildren).toHaveBeenCalledTimes(1);
    expect(result.current.getChildren('1')).toEqual(CHILD_DATA);

    // Second load - should reload
    await act(async () => {
      await result.current.triggerLoad('1', TEST_DATA[0]!, 0);
    });

    expect(loadChildren).toHaveBeenCalledTimes(2);
    expect(result.current.getChildren('1')).toEqual(newChildren);
  });

  it('should clear loading state on error', async () => {
    const loadChildren = jest
      .fn()
      .mockRejectedValue(new Error('Network error'));
    const treeConfig: TExpandable = { loadChildren };
    const { result } = renderHook(() => useTreeLazyLoad({ treeConfig }));

    await act(async () => {
      await result.current.triggerLoad('1', TEST_DATA[0]!, 0);
    });

    // Loading should be cleared, not loaded
    expect(result.current.isLoading('1')).toBe(false);
    expect(result.current.isLoaded('1')).toBe(false);
    expect(result.current.getChildren('1')).toBeUndefined();
  });

  it('should not call loadChildren when treeConfig is undefined', async () => {
    const { result } = renderHook(() => useTreeLazyLoad({}));

    await act(async () => {
      await result.current.triggerLoad('1', TEST_DATA[0]!, 0);
    });

    // No crash, nothing loaded
    expect(result.current.isLoading('1')).toBe(false);
    expect(result.current.isLoaded('1')).toBe(false);
  });

  it('should handle multiple concurrent loads for different keys', async () => {
    let resolveFirst: (value: TItem[]) => void;
    let resolveSecond: (value: TItem[]) => void;
    const loadChildren = jest.fn((params: { row: TItem }) => {
      if (params.row.id === '1') {
        return new Promise<TItem[]>((r) => {
          resolveFirst = r;
        });
      }
      return new Promise<TItem[]>((r) => {
        resolveSecond = r;
      });
    });

    const treeConfig: TExpandable = { loadChildren };
    const { result } = renderHook(() => useTreeLazyLoad({ treeConfig }));

    let p1: Promise<void>;
    let p2: Promise<void>;
    act(() => {
      p1 = result.current.triggerLoad('1', TEST_DATA[0]!, 0);
      p2 = result.current.triggerLoad('2', TEST_DATA[1]!, 1);
    });

    // Both should be loading
    expect(result.current.isLoading('1')).toBe(true);
    expect(result.current.isLoading('2')).toBe(true);

    // Resolve first
    await act(async () => {
      resolveFirst!(CHILD_DATA);
      await p1!;
    });

    expect(result.current.isLoading('1')).toBe(false);
    expect(result.current.isLoaded('1')).toBe(true);
    expect(result.current.isLoading('2')).toBe(true);

    // Resolve second
    const children2: TItem[] = [{ id: '2-1', name: 'Bob Jr', age: 2 }];
    await act(async () => {
      resolveSecond!(children2);
      await p2!;
    });

    expect(result.current.isLoading('2')).toBe(false);
    expect(result.current.isLoaded('2')).toBe(true);
    expect(result.current.getChildren('2')).toEqual(children2);
  });
});

// ============================================================
// Integration: CoolTable with treeConfig.loadChildren
// ============================================================

describe('CoolTable with treeConfig.loadChildren', () => {
  it('should render table without errors when loadChildren is provided', () => {
    const loadChildren = jest.fn().mockResolvedValue(CHILD_DATA);
    const treeConfig: TExpandable = { loadChildren };

    const { getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        treeConfig={treeConfig}
      />
    );

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('should render table with cacheChildren config without errors', () => {
    const loadChildren = jest.fn().mockResolvedValue(CHILD_DATA);
    const treeConfig: TExpandable = {
      loadChildren,
      cacheChildren: true,
      renderLoading: () => null,
    };

    const { getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        treeConfig={treeConfig}
      />
    );

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });
});
