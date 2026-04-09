import React, { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CoolTable from '../index';
import type { ITableColumn, TItem, ICoolTableRef } from '../types';

// ============================================================
// Test data
// ============================================================

const TEST_COLUMNS: ITableColumn[] = [
  { key: 'name', title: 'Name', width: 100 },
  { key: 'age', title: 'Age', width: 80 },
  { key: 'city', title: 'City', width: 100 },
];

const TEST_DATA: TItem[] = [
  { id: '1', name: 'Alice', age: 30, city: 'Beijing' },
  { id: '2', name: 'Bob', age: 25, city: 'Shanghai' },
  { id: '3', name: 'Charlie', age: 35, city: 'Guangzhou' },
  { id: '4', name: 'Diana', age: 28, city: 'Shenzhen' },
  { id: '5', name: 'Eve', age: 22, city: 'Beijing' },
];

// ============================================================
// 1. Basic rendering
// ============================================================

describe('Basic rendering', () => {
  it('renders header titles', () => {
    const { getByText } = render(
      <CoolTable columns={TEST_COLUMNS} data={TEST_DATA} rowKey="id" />
    );

    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Age')).toBeTruthy();
    expect(getByText('City')).toBeTruthy();
  });

  it('renders data rows', () => {
    const { getByText } = render(
      <CoolTable columns={TEST_COLUMNS} data={TEST_DATA} rowKey="id" />
    );

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Charlie')).toBeTruthy();
  });
});

// ============================================================
// 2. Single sort
// ============================================================

describe('Single sort', () => {
  it('fires onSortChange when sortable header is pressed', () => {
    const onSortChange = jest.fn();
    const sortColumns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100, sortable: true },
      { key: 'age', title: 'Age', width: 80 },
    ];

    const { getByText } = render(
      <CoolTable
        columns={sortColumns}
        data={TEST_DATA}
        rowKey="id"
        onSortChange={onSortChange}
      />
    );

    fireEvent.press(getByText('Name'));
    expect(onSortChange).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'name', sort: 'asc' })
    );

    fireEvent.press(getByText('Name'));
    expect(onSortChange).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'name', sort: 'desc' })
    );
  });
});

// ============================================================
// 3. Multi sort
// ============================================================

describe('Multi sort', () => {
  it('fires onSortChange with sortList for multi-sort', () => {
    const onSortChange = jest.fn();
    const sortColumns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100, sortable: true },
      { key: 'age', title: 'Age', width: 80, sortable: true },
    ];

    const { getByText } = render(
      <CoolTable
        columns={sortColumns}
        data={TEST_DATA}
        rowKey="id"
        sortConfig={{ multiple: true }}
        onSortChange={onSortChange}
      />
    );

    fireEvent.press(getByText('Name'));
    fireEvent.press(getByText('Age'));

    const calls = onSortChange.mock.calls;
    const lastCall = calls[calls.length - 1]![0];
    expect(lastCall.sortList).toBeDefined();
    expect(lastCall.sortList!.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 4. Custom sorter
// ============================================================

describe('Custom sorter', () => {
  it('uses column sorter for local sorting', () => {
    const sorterColumns: ITableColumn[] = [
      {
        key: 'name',
        title: 'Name',
        width: 100,
        sortable: true,
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      { key: 'age', title: 'Age', width: 80 },
    ];

    const { getByText } = render(
      <CoolTable columns={sorterColumns} data={TEST_DATA} rowKey="id" />
    );

    // Sort asc
    fireEvent.press(getByText('Name'));

    // After sort, Alice should still be visible (sorted first alphabetically)
    expect(getByText('Alice')).toBeTruthy();
  });
});

// ============================================================
// 5. Checkbox
// ============================================================

describe('Checkbox', () => {
  it('supports checkbox selection via ref', () => {
    const tableRef = createRef<ICoolTableRef>();
    const checkboxColumns: ITableColumn[] = [
      { key: 'checkbox', title: '', width: 50, type: 'checkbox' },
      ...TEST_COLUMNS,
    ];

    render(
      <CoolTable
        ref={tableRef as any}
        columns={checkboxColumns}
        data={TEST_DATA}
        rowKey="id"
        checkboxConfig={{}}
      />
    );

    act(() => {
      tableRef.current?.setCheckboxRow([TEST_DATA[0]!], true);
    });

    const records = tableRef.current?.getCheckboxRecords();
    expect(records).toHaveLength(1);
    expect(records![0]!.name).toBe('Alice');
  });

  it('clears checkbox via ref', () => {
    const tableRef = createRef<ICoolTableRef>();
    const checkboxColumns: ITableColumn[] = [
      { key: 'checkbox', title: '', width: 50, type: 'checkbox' },
      ...TEST_COLUMNS,
    ];

    render(
      <CoolTable
        ref={tableRef as any}
        columns={checkboxColumns}
        data={TEST_DATA}
        rowKey="id"
        checkboxConfig={{}}
      />
    );

    act(() => {
      tableRef.current?.setCheckboxRow(TEST_DATA, true);
    });
    expect(tableRef.current?.getCheckboxRecords()).toHaveLength(5);

    act(() => {
      tableRef.current?.clearCheckboxRow();
    });
    expect(tableRef.current?.getCheckboxRecords()).toHaveLength(0);
  });
});

// ============================================================
// 6. Radio
// ============================================================

describe('Radio', () => {
  it('supports radio selection via ref', () => {
    const tableRef = createRef<ICoolTableRef>();
    const radioColumns: ITableColumn[] = [
      { key: 'radio', title: '', width: 50, type: 'radio' },
      ...TEST_COLUMNS,
    ];

    render(
      <CoolTable
        ref={tableRef as any}
        columns={radioColumns}
        data={TEST_DATA}
        rowKey="id"
        radioConfig={{}}
      />
    );

    act(() => {
      tableRef.current?.setRadioRow(TEST_DATA[1]!);
    });

    const record = tableRef.current?.getRadioRecord();
    expect(record?.name).toBe('Bob');
  });

  it('clears radio via ref', () => {
    const tableRef = createRef<ICoolTableRef>();
    const radioColumns: ITableColumn[] = [
      { key: 'radio', title: '', width: 50, type: 'radio' },
      ...TEST_COLUMNS,
    ];

    render(
      <CoolTable
        ref={tableRef as any}
        columns={radioColumns}
        data={TEST_DATA}
        rowKey="id"
        radioConfig={{}}
      />
    );

    act(() => {
      tableRef.current?.setRadioRow(TEST_DATA[0]!);
    });
    expect(tableRef.current?.getRadioRecord()).not.toBeNull();

    act(() => {
      tableRef.current?.clearRadioRow();
    });
    expect(tableRef.current?.getRadioRecord()).toBeNull();
  });
});

// ============================================================
// 7. Filter
// ============================================================

describe('Filter', () => {
  it('clears filter via ref', () => {
    const tableRef = createRef<ICoolTableRef>();
    const filterColumns: ITableColumn[] = [
      {
        key: 'city',
        title: 'City',
        width: 100,
        filters: [
          { label: 'Beijing', value: 'Beijing' },
          { label: 'Shanghai', value: 'Shanghai' },
        ],
      },
      { key: 'name', title: 'Name', width: 100 },
    ];

    render(
      <CoolTable
        ref={tableRef as any}
        columns={filterColumns}
        data={TEST_DATA}
        rowKey="id"
      />
    );

    act(() => {
      tableRef.current?.clearFilter();
    });

    expect(tableRef.current?.getCheckedFilters()).toHaveLength(0);
  });
});

// ============================================================
// 8. Fixed columns
// ============================================================

describe('Fixed columns', () => {
  it('renders with fixed left column', () => {
    const fixedColumns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100, fixed: 'left' },
      { key: 'age', title: 'Age', width: 80 },
      { key: 'city', title: 'City', width: 100 },
    ];

    const { getByText } = render(
      <CoolTable columns={fixedColumns} data={TEST_DATA} rowKey="id" />
    );

    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Alice')).toBeTruthy();
  });

  it('renders with fixed right column', () => {
    const fixedColumns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100 },
      { key: 'age', title: 'Age', width: 80 },
      { key: 'city', title: 'City', width: 100, fixed: 'right' },
    ];

    const { getByText } = render(
      <CoolTable columns={fixedColumns} data={TEST_DATA} rowKey="id" />
    );

    expect(getByText('City')).toBeTruthy();
  });
});

// ============================================================
// 9. Tree expand / collapse
// ============================================================

describe('Tree expand / collapse', () => {
  it('supports expand via ref', () => {
    const tableRef = createRef<ICoolTableRef>();
    const treeData: TItem[] = [
      {
        id: '1',
        name: 'Parent',
        age: 40,
        city: 'Beijing',
        children: [{ id: '1-1', name: 'Child', age: 10, city: 'Beijing' }],
      },
    ];

    render(
      <CoolTable
        ref={tableRef as any}
        columns={TEST_COLUMNS}
        data={treeData}
        rowKey="id"
        treeConfig={{ maxHeight: 200 }}
      />
    );

    act(() => {
      tableRef.current?.setRowExpand([treeData[0]!], true);
    });

    // Should not throw
    expect(tableRef.current).toBeTruthy();
  });

  it('collapses all via ref', () => {
    const tableRef = createRef<ICoolTableRef>();
    const treeData: TItem[] = [
      {
        id: '1',
        name: 'Parent',
        age: 40,
        city: 'Beijing',
        children: [{ id: '1-1', name: 'Child', age: 10, city: 'Beijing' }],
      },
    ];

    render(
      <CoolTable
        ref={tableRef as any}
        columns={TEST_COLUMNS}
        data={treeData}
        rowKey="id"
        treeConfig={{ maxHeight: 200 }}
      />
    );

    act(() => {
      tableRef.current?.setAllRowExpand(true);
    });
    act(() => {
      tableRef.current?.setAllRowExpand(false);
    });

    expect(tableRef.current).toBeTruthy();
  });
});

// ============================================================
// 10. Empty state
// ============================================================

describe('Empty state', () => {
  it('renders empty component when data is empty', () => {
    const { getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={[]}
        rowKey="id"
        emptyProps={{ description: 'No data available' }}
      />
    );

    expect(getByText('No data available')).toBeTruthy();
  });
});

// ============================================================
// 11. Loading state
// ============================================================

describe('Loading state', () => {
  it('renders loading overlay when loading is true', () => {
    const { UNSAFE_getAllByType } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        loading={true}
      />
    );

    // ActivityIndicator should be present
    const { ActivityIndicator } = require('react-native');
    const indicators = UNSAFE_getAllByType(ActivityIndicator);
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('does not render loading overlay when loading is false', () => {
    const { UNSAFE_queryAllByType } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        loading={false}
      />
    );

    const { ActivityIndicator } = require('react-native');
    const indicators = UNSAFE_queryAllByType(ActivityIndicator);
    expect(indicators).toHaveLength(0);
  });
});

// ============================================================
// 12. useUpdateEffect
// ============================================================

describe('useUpdateEffect', () => {
  it('does not fire on mount, fires on update', () => {
    const { default: useUpdateEffect } = require('../hooks/useUpdateEffect');
    const callback = jest.fn();

    const TestComponent = ({ value }: { value: number }) => {
      useUpdateEffect(() => {
        callback(value);
      }, [value]);
      return null;
    };

    const { rerender } = render(<TestComponent value={1} />);
    expect(callback).not.toHaveBeenCalled();

    rerender(<TestComponent value={2} />);
    expect(callback).toHaveBeenCalledWith(2);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// Ref API
// ============================================================

describe('Ref API', () => {
  it('sort and clearSort via ref', () => {
    const tableRef = createRef<ICoolTableRef>();
    const onSortChange = jest.fn();
    const sortColumns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100, sortable: true },
      { key: 'age', title: 'Age', width: 80 },
    ];

    render(
      <CoolTable
        ref={tableRef as any}
        columns={sortColumns}
        data={TEST_DATA}
        rowKey="id"
        onSortChange={onSortChange}
      />
    );

    act(() => {
      tableRef.current?.sort('name', 'desc');
    });

    expect(onSortChange).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'name', sort: 'desc' })
    );

    act(() => {
      tableRef.current?.clearSort();
    });

    expect(tableRef.current?.getSortColumns()).toHaveLength(0);
  });

  it('getData and getFullData via ref', () => {
    const tableRef = createRef<ICoolTableRef>();

    render(
      <CoolTable
        ref={tableRef as any}
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
      />
    );

    expect(tableRef.current?.getFullData()).toHaveLength(5);
    expect(tableRef.current?.getData()).toHaveLength(5);
  });

  it('deprecated setTreeExpand warns in __DEV__', () => {
    const tableRef = createRef<ICoolTableRef>();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <CoolTable
        ref={tableRef as any}
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        treeConfig={{ maxHeight: 200 }}
      />
    );

    act(() => {
      tableRef.current?.setTreeExpand([], true);
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('setTreeExpand is deprecated')
    );

    warnSpy.mockRestore();
  });
});

// ============================================================
// Stripe & Border
// ============================================================

describe('Stripe and Border', () => {
  it('renders with stripe enabled', () => {
    const { getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        stripe={true}
      />
    );

    expect(getByText('Alice')).toBeTruthy();
  });

  it('renders with border full', () => {
    const { getByText } = render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        border="full"
      />
    );

    expect(getByText('Alice')).toBeTruthy();
  });
});
