import React, { createRef } from 'react';
import { Text } from 'react-native';
import {
  render,
  renderHook,
  fireEvent,
  act,
} from '@testing-library/react-native';
import CoolTable from '../index';
import usePagination from '../hooks/usePagination';
import type { ITableColumn, TItem, ICoolTableRef } from '../types';

// ============================================================
// Test data
// ============================================================

const TEST_COLUMNS: ITableColumn[] = [
  { key: 'name', title: 'Name', width: 100 },
  { key: 'age', title: 'Age', width: 80 },
];

const makeData = (count: number): TItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `User${i + 1}`,
    age: 20 + i,
  }));

const TEST_DATA = makeData(25);

// ============================================================
// 1. usePagination hook
// ============================================================

describe('usePagination hook', () => {
  it('slices data by default page size (10)', () => {
    const { result } = renderHook(() =>
      usePagination({ paginationConfig: {}, data: TEST_DATA })
    );

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.total).toBe(25);
    expect(result.current.maxPage).toBe(3);
    expect(result.current.paginatedData).toHaveLength(10);
    expect(result.current.paginatedData[0]!.name).toBe('User1');
  });

  it('navigates to next page', () => {
    const { result } = renderHook(() =>
      usePagination({ paginationConfig: {}, data: TEST_DATA })
    );

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedData).toHaveLength(10);
    expect(result.current.paginatedData[0]!.name).toBe('User11');
  });

  it('last page returns remaining items', () => {
    const { result } = renderHook(() =>
      usePagination({ paginationConfig: {}, data: TEST_DATA })
    );

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.paginatedData).toHaveLength(5);
    expect(result.current.paginatedData[0]!.name).toBe('User21');
  });

  it('change page size resets to page 1', () => {
    const { result } = renderHook(() =>
      usePagination({ paginationConfig: {}, data: TEST_DATA })
    );

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.setPageSize(5);
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(5);
    expect(result.current.paginatedData).toHaveLength(5);
    expect(result.current.maxPage).toBe(5);
  });

  it('remote mode: returns data as-is, total from config', () => {
    const remoteData = makeData(10);
    const { result } = renderHook(() =>
      usePagination({
        paginationConfig: { total: 100, pageSize: 10 },
        data: remoteData,
      })
    );

    expect(result.current.total).toBe(100);
    expect(result.current.maxPage).toBe(10);
    // Remote mode: no slicing, all data passed through
    expect(result.current.paginatedData).toHaveLength(10);
    expect(result.current.paginatedData).toBe(remoteData);
  });

  it('auto-fixes page when data shrinks', () => {
    const { result, rerender } = renderHook(
      ({ data }) => usePagination({ data, paginationConfig: { pageSize: 10 } }),
      { initialProps: { data: TEST_DATA } }
    );

    // Go to last page
    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.currentPage).toBe(3);

    // Data shrinks to 10 items (maxPage = 1)
    rerender({ data: makeData(10) });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.maxPage).toBe(1);
  });

  it('fires onPageChange callback', () => {
    const onPageChange = jest.fn();
    const { result } = renderHook(() =>
      usePagination({
        paginationConfig: { onPageChange },
        data: TEST_DATA,
      })
    );

    act(() => {
      result.current.setPage(2);
    });

    expect(onPageChange).toHaveBeenCalledWith({
      currentPage: 2,
      pageSize: 10,
    });
  });

  it('fires onPageSizeChange callback', () => {
    const onPageSizeChange = jest.fn();
    const { result } = renderHook(() =>
      usePagination({
        paginationConfig: { onPageSizeChange },
        data: TEST_DATA,
      })
    );

    act(() => {
      result.current.setPageSize(20);
    });

    expect(onPageSizeChange).toHaveBeenCalledWith({
      currentPage: 1,
      pageSize: 20,
    });
  });

  it('controlled mode: syncs currentPage from config', () => {
    const { result, rerender } = renderHook(
      ({ page }) =>
        usePagination({
          paginationConfig: { currentPage: page },
          data: TEST_DATA,
        }),
      { initialProps: { page: 1 } }
    );

    expect(result.current.currentPage).toBe(1);

    rerender({ page: 3 });

    expect(result.current.currentPage).toBe(3);
  });

  it('uses custom pageSize from config', () => {
    const { result } = renderHook(() =>
      usePagination({
        paginationConfig: { pageSize: 5 },
        data: TEST_DATA,
      })
    );

    expect(result.current.pageSize).toBe(5);
    expect(result.current.paginatedData).toHaveLength(5);
    expect(result.current.maxPage).toBe(5);
  });

  it('clamps setPage to valid range', () => {
    const { result } = renderHook(() =>
      usePagination({ paginationConfig: {}, data: TEST_DATA })
    );

    act(() => {
      result.current.setPage(0);
    });
    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.setPage(999);
    });
    expect(result.current.currentPage).toBe(3);
  });

  it('returns all data when paginationConfig is undefined', () => {
    const { result } = renderHook(() => usePagination({ data: TEST_DATA }));

    expect(result.current.paginatedData).toHaveLength(25);
    expect(result.current.paginatedData).toBe(TEST_DATA);
  });
});

// ============================================================
// 2. Pagination integration with CoolTable
// ============================================================

describe('CoolTable with pagination', () => {
  it('renders pagination controls', () => {
    const { getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        paginationConfig={{ pageSize: 10 }}
      />
    );

    // Should show total text
    expect(getByText(/共 25 条/)).toBeTruthy();
    // Should show page buttons
    expect(getByText('1')).toBeTruthy();
  });

  it('paginates data correctly', () => {
    const { getByText, queryByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        paginationConfig={{ pageSize: 5 }}
      />
    );

    // First page: User1-User5 visible
    expect(getByText('User1')).toBeTruthy();
    expect(getByText('User5')).toBeTruthy();
    // User6 should NOT be visible on first page
    expect(queryByText('User6')).toBeNull();
  });

  it('navigates pages via next button', () => {
    const { getByText, queryByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        paginationConfig={{ pageSize: 5 }}
      />
    );

    // Go to page 2
    fireEvent.press(getByText('下一页'));

    expect(getByText('User6')).toBeTruthy();
    expect(queryByText('User1')).toBeNull();
  });

  it('exposes setPage and setPageSize on ref', () => {
    const tableRef = createRef<ICoolTableRef>();

    const { getByText, queryByText } = render(
      <CoolTable
        ref={tableRef as any}
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        paginationConfig={{ pageSize: 5 }}
      />
    );

    expect(getByText('User1')).toBeTruthy();

    act(() => {
      tableRef.current?.setPage?.(2);
    });

    expect(getByText('User6')).toBeTruthy();
    expect(queryByText('User1')).toBeNull();
  });

  it('does not render pagination without paginationConfig', () => {
    const { queryByText } = render(
      <CoolTable columns={TEST_COLUMNS} data={TEST_DATA} rowKey="id" />
    );

    expect(queryByText('上一页')).toBeNull();
    expect(queryByText('下一页')).toBeNull();
  });

  it('supports custom render for pagination', () => {
    const { getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        paginationConfig={{
          pageSize: 10,
          render: ({ currentPage, total }) => (
            <Text>{`CustomPager: ${currentPage}/${total}`}</Text>
          ),
        }}
      />
    );

    expect(getByText('CustomPager: 1/25')).toBeTruthy();
  });
});
