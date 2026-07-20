import { renderHook, render } from '@testing-library/react-native';
import { useCellMerge } from '../hooks/useCellMerge';
import CoolTable from '../index';
import type { ITableColumn, TItem, TSpanMethod, ISpanResult } from '../types';

// ============================================================
// Test data
// ============================================================

const TEST_COLUMNS: ITableColumn[] = [
  { key: 'name', title: 'Name', width: 100 },
  { key: 'age', title: 'Age', width: 80 },
  { key: 'city', title: 'City', width: 120 },
  { key: 'role', title: 'Role', width: 100 },
];

const TEST_DATA: TItem[] = [
  { id: '1', name: 'Alice', age: 30, city: 'Beijing', role: 'Dev' },
  { id: '2', name: 'Bob', age: 25, city: 'Shanghai', role: 'PM' },
  { id: '3', name: 'Charlie', age: 35, city: 'Guangzhou', role: 'Dev' },
];

// ============================================================
// useCellMerge hook — unit tests
// ============================================================

describe('useCellMerge', () => {
  it('should return default span and all cells visible when no spanMethod', () => {
    const { result } = renderHook(() =>
      useCellMerge({
        data: TEST_DATA,
        columns: TEST_COLUMNS,
      })
    );

    // Every cell should be visible
    for (let r = 0; r < TEST_DATA.length; r++) {
      for (let c = 0; c < TEST_COLUMNS.length; c++) {
        expect(result.current.isCellVisible(r, c)).toBe(true);
        expect(result.current.getCellSpan(r, c)).toEqual({
          rowspan: 1,
          colspan: 1,
        });
      }
    }
  });

  it('should hide second cell when first cell has colspan=2', () => {
    const spanMethod: TSpanMethod = ({ colIndex }) => {
      if (colIndex === 0) return { rowspan: 1, colspan: 2 };
      return { rowspan: 1, colspan: 1 };
    };

    const { result } = renderHook(() =>
      useCellMerge({
        data: TEST_DATA,
        columns: TEST_COLUMNS,
        spanMethod,
      })
    );

    // Row 0: first cell spans 2, second cell hidden
    expect(result.current.getCellSpan(0, 0)).toEqual({
      rowspan: 1,
      colspan: 2,
    });
    expect(result.current.isCellVisible(0, 0)).toBe(true);
    expect(result.current.isCellVisible(0, 1)).toBe(false);
    expect(result.current.isCellVisible(0, 2)).toBe(true);
    expect(result.current.isCellVisible(0, 3)).toBe(true);
  });

  it('should hide two cells when first cell has colspan=3', () => {
    const spanMethod: TSpanMethod = ({ colIndex }) => {
      if (colIndex === 0) return { rowspan: 1, colspan: 3 };
      return { rowspan: 1, colspan: 1 };
    };

    const { result } = renderHook(() =>
      useCellMerge({
        data: TEST_DATA,
        columns: TEST_COLUMNS,
        spanMethod,
      })
    );

    expect(result.current.isCellVisible(0, 0)).toBe(true);
    expect(result.current.isCellVisible(0, 1)).toBe(false);
    expect(result.current.isCellVisible(0, 2)).toBe(false);
    expect(result.current.isCellVisible(0, 3)).toBe(true);
  });

  it('should support row-specific merge (only certain rows merge)', () => {
    const spanMethod: TSpanMethod = ({ rowIndex, colIndex }) => {
      // Only row 1 merges first two columns
      if (rowIndex === 1 && colIndex === 0) return { rowspan: 1, colspan: 2 };
      return { rowspan: 1, colspan: 1 };
    };

    const { result } = renderHook(() =>
      useCellMerge({
        data: TEST_DATA,
        columns: TEST_COLUMNS,
        spanMethod,
      })
    );

    // Row 0: no merge
    expect(result.current.isCellVisible(0, 0)).toBe(true);
    expect(result.current.isCellVisible(0, 1)).toBe(true);

    // Row 1: first cell spans 2
    expect(result.current.isCellVisible(1, 0)).toBe(true);
    expect(result.current.isCellVisible(1, 1)).toBe(false);
    expect(result.current.isCellVisible(1, 2)).toBe(true);

    // Row 2: no merge
    expect(result.current.isCellVisible(2, 0)).toBe(true);
    expect(result.current.isCellVisible(2, 1)).toBe(true);
  });

  it('should clamp colspan to not exceed remaining columns', () => {
    const spanMethod: TSpanMethod = ({ colIndex }) => {
      // Last column tries colspan=3, but should be clamped to 1
      if (colIndex === 3) return { rowspan: 1, colspan: 3 };
      return { rowspan: 1, colspan: 1 };
    };

    const { result } = renderHook(() =>
      useCellMerge({
        data: TEST_DATA,
        columns: TEST_COLUMNS,
        spanMethod,
      })
    );

    // All cells should still be visible because the last column can't span beyond itself
    expect(result.current.isCellVisible(0, 3)).toBe(true);
    expect(result.current.getCellSpan(0, 3).colspan).toBe(1);
  });

  it('should pass correct params to spanMethod', () => {
    const spanMethod = jest.fn<ISpanResult, [Parameters<TSpanMethod>[0]]>(
      () => ({ rowspan: 1, colspan: 1 })
    );

    renderHook(() =>
      useCellMerge({
        data: TEST_DATA,
        columns: TEST_COLUMNS,
        spanMethod,
      })
    );

    // Should have been called for each cell
    expect(spanMethod).toHaveBeenCalledTimes(
      TEST_DATA.length * TEST_COLUMNS.length
    );

    // Check first call params
    expect(spanMethod).toHaveBeenCalledWith(
      expect.objectContaining({
        row: TEST_DATA[0],
        column: TEST_COLUMNS[0],
        rowIndex: 0,
        colIndex: 0,
      })
    );
  });

  it('should treat colspan=0 as hidden cell', () => {
    const spanMethod: TSpanMethod = ({ colIndex }) => {
      if (colIndex === 1) return { rowspan: 1, colspan: 0 };
      return { rowspan: 1, colspan: 1 };
    };

    const { result } = renderHook(() =>
      useCellMerge({
        data: TEST_DATA,
        columns: TEST_COLUMNS,
        spanMethod,
      })
    );

    expect(result.current.isCellVisible(0, 1)).toBe(false);
  });
});

// ============================================================
// Integration: CoolTable with spanMethod
// ============================================================

describe('CoolTable with spanMethod', () => {
  it('should render merged cells (first cell visible, second hidden)', () => {
    const spanMethod: TSpanMethod = ({ rowIndex, colIndex }) => {
      // First row: merge first two columns
      if (rowIndex === 0 && colIndex === 0) return { rowspan: 1, colspan: 2 };
      return { rowspan: 1, colspan: 1 };
    };

    const { getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        spanMethod={spanMethod}
      />
    );

    // First row data should still show the merged cell content
    expect(getByText('Alice')).toBeTruthy();
    // Bob's data in row 1 should be visible (no merge on row 1)
    expect(getByText('Bob')).toBeTruthy();
  });

  it('should render table without errors when no spanMethod provided', () => {
    const { getByText } = render(
      <CoolTable columns={TEST_COLUMNS} data={TEST_DATA} rowKey="id" />
    );

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
  });
});
