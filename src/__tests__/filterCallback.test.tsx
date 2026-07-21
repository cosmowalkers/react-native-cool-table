import { renderHook, act } from '@testing-library/react-native';
import useFilter from '../hooks/useFilter';
import type { ITableColumn, TItem } from '../types';

const COLS: ITableColumn[] = [
  { key: 'a', title: 'A' },
  { key: 'b', title: 'B' },
];
const DATA: TItem[] = [{ id: '1', a: 1, b: 2 }];

it('reports onFilterChange for every column changed in the same tick (React 18 batching)', () => {
  const onFilterChange = jest.fn();
  const { result } = renderHook(() =>
    useFilter({ columns: COLS, data: DATA, onFilterChange })
  );

  act(() => {
    result.current.setFilterState('a', [1]);
    result.current.setFilterState('b', [2]);
  });

  const reportedColumns = onFilterChange.mock.calls.map((c) => c[0].column.key);
  expect(reportedColumns).toContain('a');
  expect(reportedColumns).toContain('b');
});
