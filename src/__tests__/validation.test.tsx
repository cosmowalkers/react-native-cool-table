import React from 'react';
import type { MutableRefObject } from 'react';
import { renderHook, render, act } from '@testing-library/react-native';
import { useValidation } from '../hooks/useValidation';
import CoolTable from '../index';
import type {
  ITableColumn,
  TItem,
  ICoolTableRef,
  IValidationError,
} from '../types';

/** Helper to create a ref compatible with CoolTable's expected MutableRefObject type */
const createTableRef = (): MutableRefObject<ICoolTableRef> =>
  React.createRef<ICoolTableRef>() as MutableRefObject<ICoolTableRef>;

// ============================================================
// Test data
// ============================================================

const TEST_COLUMNS: ITableColumn[] = [
  {
    key: 'name',
    title: 'Name',
    width: 120,
    editable: true,
    editType: 'text',
    editRules: [{ required: true, message: 'Name is required' }],
  },
  {
    key: 'email',
    title: 'Email',
    width: 200,
    editable: true,
    editType: 'text',
    editRules: [
      { pattern: /^[^@]+@[^@]+\.[^@]+$/, message: 'Invalid email format' },
    ],
  },
  {
    key: 'age',
    title: 'Age',
    width: 80,
    editable: true,
    editType: 'number',
    editRules: [
      {
        validator: ({ value }) => {
          const num = Number(value);
          if (num < 0 || num > 150) return 'Age must be between 0 and 150';
          return true;
        },
      },
    ],
  },
  { key: 'note', title: 'Note', width: 120 },
];

const TEST_DATA: TItem[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', age: 30, note: 'N/A' },
  { id: '2', name: 'Bob', email: 'bob@example.com', age: 25, note: 'N/A' },
];

// ============================================================
// useValidation hook - unit tests
// ============================================================

describe('useValidation', () => {
  it('should start with no validation errors', () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    expect(result.current.validationErrors).toEqual([]);
  });

  it('should validate required field (empty value fails)', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validateCell(
        '1',
        'name',
        '',
        TEST_DATA[0]!
      );
    });

    expect(errors.length).toBe(1);
    expect(errors[0]!.message).toBe('Name is required');
    expect(errors[0]!.rowKey).toBe('1');
    expect(errors[0]!.columnKey).toBe('name');
  });

  it('should validate required field (null value fails)', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validateCell(
        '1',
        'name',
        null,
        TEST_DATA[0]!
      );
    });

    expect(errors.length).toBe(1);
    expect(errors[0]!.message).toBe('Name is required');
  });

  it('should validate required field (non-empty passes)', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validateCell(
        '1',
        'name',
        'Alice',
        TEST_DATA[0]!
      );
    });

    expect(errors).toEqual([]);
  });

  it('should validate pattern (non-matching fails)', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validateCell(
        '1',
        'email',
        'not-an-email',
        TEST_DATA[0]!
      );
    });

    expect(errors.length).toBe(1);
    expect(errors[0]!.message).toBe('Invalid email format');
  });

  it('should validate pattern (matching passes)', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validateCell(
        '1',
        'email',
        'alice@example.com',
        TEST_DATA[0]!
      );
    });

    expect(errors).toEqual([]);
  });

  it('should validate custom validator (returns false → fails with default message)', async () => {
    const columnsWithFalseValidator: ITableColumn[] = [
      {
        key: 'score',
        title: 'Score',
        width: 80,
        editable: true,
        editRules: [{ validator: () => false }],
      },
    ];

    const { result } = renderHook(() =>
      useValidation({
        columns: columnsWithFalseValidator,
        data: [{ score: -1 }],
      })
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validateCell('0', 'score', -1, {
        score: -1,
      });
    });

    expect(errors.length).toBe(1);
    expect(errors[0]!.message).toBe('Validation failed');
  });

  it('should validate custom validator (returns string → fails with that string message)', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validateCell(
        '1',
        'age',
        200,
        TEST_DATA[0]!
      );
    });

    expect(errors.length).toBe(1);
    expect(errors[0]!.message).toBe('Age must be between 0 and 150');
  });

  it('should validate custom validator (returns true → passes)', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validateCell('1', 'age', 30, TEST_DATA[0]!);
    });

    expect(errors).toEqual([]);
  });

  it('should validateRow checking all editable columns with rules', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    const badRow: TItem = { id: '1', name: '', email: 'bad', age: 200 };

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validateRow('1', badRow);
    });

    // name: required fails, email: pattern fails, age: validator fails
    expect(errors.length).toBe(3);
    expect(errors.find((e) => e.columnKey === 'name')).toBeTruthy();
    expect(errors.find((e) => e.columnKey === 'email')).toBeTruthy();
    expect(errors.find((e) => e.columnKey === 'age')).toBeTruthy();
  });

  it('should validate all data rows', async () => {
    const badData: TItem[] = [
      { id: '1', name: '', email: 'alice@example.com', age: 30 },
      { id: '2', name: 'Bob', email: 'bad', age: 25 },
    ];

    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: badData, rowKey: 'id' })
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = await result.current.validate(badData);
    });

    // row 1: name required fails; row 2: email pattern fails
    expect(errors.length).toBe(2);
    expect(
      errors.find((e) => e.rowKey === '1' && e.columnKey === 'name')
    ).toBeTruthy();
    expect(
      errors.find((e) => e.rowKey === '2' && e.columnKey === 'email')
    ).toBeTruthy();
  });

  it('should clearValidation resetting all errors', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA })
    );

    // Generate some errors first
    await act(async () => {
      await result.current.validateCell('1', 'name', '', TEST_DATA[0]!);
    });

    expect(result.current.validationErrors.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearValidation();
    });

    expect(result.current.validationErrors).toEqual([]);
  });

  it('should getErrors filtering by rowKey and columnKey', async () => {
    const badData: TItem[] = [{ id: '1', name: '', email: 'bad', age: 30 }];

    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: badData, rowKey: 'id' })
    );

    await act(async () => {
      await result.current.validateRow('1', badData[0]!);
    });

    const nameErrors = result.current.getErrors('1', 'name');
    expect(nameErrors.length).toBe(1);
    expect(nameErrors[0]!.columnKey).toBe('name');

    const emailErrors = result.current.getErrors('1', 'email');
    expect(emailErrors.length).toBe(1);
    expect(emailErrors[0]!.columnKey).toBe('email');

    const noteErrors = result.current.getErrors('1', 'note');
    expect(noteErrors.length).toBe(0);
  });

  it('should replace errors for affected rows on re-validate', async () => {
    const { result } = renderHook(() =>
      useValidation({ columns: TEST_COLUMNS, data: TEST_DATA, rowKey: 'id' })
    );

    // First validate with bad data
    await act(async () => {
      await result.current.validateCell('1', 'name', '', TEST_DATA[0]!);
    });

    expect(result.current.validationErrors.length).toBe(1);

    // Re-validate same cell with good data → should replace that row+col errors
    await act(async () => {
      await result.current.validateCell('1', 'name', 'Alice', TEST_DATA[0]!);
    });

    expect(result.current.validationErrors.length).toBe(0);
  });
});

// ============================================================
// Integration: CoolTable with validationConfig
// ============================================================

describe('CoolTable with validationConfig', () => {
  it('should expose validate/validateRow/clearValidation via ref', () => {
    const tableRef = createTableRef();
    render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={TEST_DATA}
        rowKey="id"
        validationConfig={{ showInline: true }}
        ref={tableRef}
      />
    );

    expect(tableRef.current?.validate).toBeDefined();
    expect(tableRef.current?.validateRow).toBeDefined();
    expect(tableRef.current?.clearValidation).toBeDefined();
  });

  it('should validate all rows via ref and return errors', async () => {
    const badData: TItem[] = [
      { id: '1', name: '', email: 'alice@example.com', age: 30, note: 'N/A' },
      { id: '2', name: 'Bob', email: 'bad', age: 25, note: 'N/A' },
    ];

    const tableRef = createTableRef();
    render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={badData}
        rowKey="id"
        validationConfig={{ showInline: true }}
        ref={tableRef}
      />
    );

    let errors: IValidationError[] = [];
    await act(async () => {
      errors = (await tableRef.current?.validate?.()) ?? [];
    });

    expect(errors.length).toBe(2);
  });

  it('should clearValidation via ref', async () => {
    const badData: TItem[] = [
      { id: '1', name: '', email: 'bad', age: 30, note: 'N/A' },
    ];

    const tableRef = createTableRef();
    render(
      <CoolTable
        columns={TEST_COLUMNS}
        data={badData}
        rowKey="id"
        validationConfig={{ showInline: true }}
        ref={tableRef}
      />
    );

    await act(async () => {
      await tableRef.current?.validate?.();
    });

    act(() => {
      tableRef.current?.clearValidation?.();
    });

    // After clearing, validate again should start fresh
    let errors: IValidationError[] = [];
    await act(async () => {
      errors = (await tableRef.current?.validate?.()) ?? [];
    });

    // Same bad data, so errors should come back
    expect(errors.length).toBeGreaterThan(0);
  });
});
