import { renderHook, act } from '@testing-library/react-native';
import { useColumnResize } from '../hooks/useColumnResize';
import type { ITableColumn } from '../types';

// ============================================================
// Test data
// ============================================================

const TEST_COLUMNS: ITableColumn[] = [
  { key: 'name', title: 'Name', width: 100 },
  { key: 'age', title: 'Age', width: 80 },
];

// ============================================================
// useColumnResize hook
// ============================================================

describe('useColumnResize', () => {
  it('should initialize widths from columns', () => {
    const { result } = renderHook(() =>
      useColumnResize({
        resizeConfig: { enabled: true },
        columns: TEST_COLUMNS,
      })
    );
    expect(result.current.columnWidths.get('name')).toBe(100);
    expect(result.current.columnWidths.get('age')).toBe(80);
  });

  it('should update width via setColumnWidth', () => {
    const { result } = renderHook(() =>
      useColumnResize({
        resizeConfig: { enabled: true },
        columns: TEST_COLUMNS,
      })
    );
    act(() => result.current.setColumnWidth('name', 150));
    expect(result.current.columnWidths.get('name')).toBe(150);
  });

  it('should respect minWidth', () => {
    const { result } = renderHook(() =>
      useColumnResize({
        resizeConfig: { enabled: true, minWidth: 50 },
        columns: TEST_COLUMNS,
      })
    );
    act(() => result.current.setColumnWidth('name', 30));
    expect(result.current.columnWidths.get('name')).toBe(50);
  });

  it('should respect maxWidth', () => {
    const { result } = renderHook(() =>
      useColumnResize({
        resizeConfig: { enabled: true, maxWidth: 200 },
        columns: TEST_COLUMNS,
      })
    );
    act(() => result.current.setColumnWidth('name', 300));
    expect(result.current.columnWidths.get('name')).toBe(200);
  });

  it('should return empty map and no-op when config not enabled', () => {
    const { result } = renderHook(() =>
      useColumnResize({ columns: TEST_COLUMNS })
    );
    expect(result.current.columnWidths.size).toBe(0);
    // setColumnWidth should be a no-op
    act(() => result.current.setColumnWidth('name', 200));
    expect(result.current.columnWidths.size).toBe(0);
  });

  it('should fire onResizeEnd callback', () => {
    const onResizeEnd = jest.fn();
    const { result } = renderHook(() =>
      useColumnResize({
        resizeConfig: { enabled: true, onResizeEnd },
        columns: TEST_COLUMNS,
      })
    );
    act(() => result.current.setColumnWidth('name', 150));
    expect(onResizeEnd).toHaveBeenCalledWith(
      expect.objectContaining({ width: 150 })
    );
    expect(onResizeEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        column: expect.objectContaining({ key: 'name' }),
      })
    );
  });

  it('should preserve existing widths when columns change', () => {
    const { result, rerender } = renderHook(
      ({ cols }) =>
        useColumnResize({ resizeConfig: { enabled: true }, columns: cols }),
      { initialProps: { cols: TEST_COLUMNS } }
    );
    act(() => result.current.setColumnWidth('name', 200));

    const newColumns: ITableColumn[] = [
      ...TEST_COLUMNS,
      { key: 'email', title: 'Email', width: 150 },
    ];
    rerender({ cols: newColumns });

    expect(result.current.columnWidths.get('name')).toBe(200); // preserved
    expect(result.current.columnWidths.get('email')).toBe(150); // newly added
  });

  it('should clamp both min and max simultaneously', () => {
    const { result } = renderHook(() =>
      useColumnResize({
        resizeConfig: { enabled: true, minWidth: 50, maxWidth: 200 },
        columns: TEST_COLUMNS,
      })
    );
    act(() => result.current.setColumnWidth('name', 10));
    expect(result.current.columnWidths.get('name')).toBe(50);

    act(() => result.current.setColumnWidth('name', 999));
    expect(result.current.columnWidths.get('name')).toBe(200);
  });

  it('should return stable getColumnWidths reference', () => {
    const { result } = renderHook(() =>
      useColumnResize({
        resizeConfig: { enabled: true },
        columns: TEST_COLUMNS,
      })
    );
    const widths = result.current.getColumnWidths();
    expect(widths.get('name')).toBe(100);
    expect(widths.get('age')).toBe(80);
  });
});
