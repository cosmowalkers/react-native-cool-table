import { render } from '@testing-library/react-native';
import CoolTable from '../index';
import type { ITableColumn } from '../types';

describe('Grouped Headers', () => {
  it('should render simple columns as single header row', () => {
    const columns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100 },
      { key: 'age', title: 'Age', width: 80 },
    ];
    const { getByText } = render(
      <CoolTable
        columns={columns}
        data={[]}
        emptyProps={{ description: 'No data' }}
      />
    );
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Age')).toBeTruthy();
  });

  it('should render grouped columns with parent header', () => {
    const columns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100 },
      {
        key: 'info',
        title: 'Info',
        children: [
          { key: 'age', title: 'Age', width: 80 },
          { key: 'gender', title: 'Gender', width: 80 },
        ],
      },
    ];
    const { getByText } = render(
      <CoolTable
        columns={columns}
        data={[]}
        emptyProps={{ description: 'No data' }}
      />
    );
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Info')).toBeTruthy();
    expect(getByText('Age')).toBeTruthy();
    expect(getByText('Gender')).toBeTruthy();
  });

  it('should render data using leaf columns only', () => {
    const columns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100 },
      {
        key: 'info',
        title: 'Info',
        children: [
          { key: 'age', title: 'Age', width: 80 },
          { key: 'gender', title: 'Gender', width: 80 },
        ],
      },
    ];
    const data = [{ name: 'Alice', age: 30, gender: 'F' }];
    const { getByText } = render(<CoolTable columns={columns} data={data} />);
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
    expect(getByText('F')).toBeTruthy();
  });

  it('should work with deep nested grouped columns', () => {
    const columns: ITableColumn[] = [
      {
        key: 'person',
        title: 'Person',
        children: [
          { key: 'name', title: 'Name', width: 100 },
          {
            key: 'details',
            title: 'Details',
            children: [
              { key: 'age', title: 'Age', width: 80 },
              { key: 'gender', title: 'Gender', width: 80 },
            ],
          },
        ],
      },
    ];
    const data = [{ name: 'Bob', age: 25, gender: 'M' }];
    const { getByText } = render(<CoolTable columns={columns} data={data} />);
    expect(getByText('Person')).toBeTruthy();
    expect(getByText('Details')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('25')).toBeTruthy();
  });

  it('should support sortable leaf columns in grouped headers', () => {
    const columns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100 },
      {
        key: 'info',
        title: 'Info',
        children: [
          { key: 'age', title: 'Age', width: 80, sortable: true },
          { key: 'gender', title: 'Gender', width: 80 },
        ],
      },
    ];
    const { getByText } = render(
      <CoolTable
        columns={columns}
        data={[{ name: 'A', age: 1, gender: 'M' }]}
      />
    );
    // Sort should be available on Age
    expect(getByText('Age')).toBeTruthy();
  });

  it('should hide grouped column when all children are hidden via columnVisibilityConfig', () => {
    const columns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100 },
      {
        key: 'info',
        title: 'Info',
        children: [
          { key: 'age', title: 'Age', width: 80 },
          { key: 'gender', title: 'Gender', width: 80 },
        ],
      },
    ];
    const { queryByText, getByText } = render(
      <CoolTable
        columns={columns}
        data={[]}
        columnVisibilityConfig={{ hiddenKeys: ['age', 'gender'] }}
        emptyProps={{ description: 'No data' }}
      />
    );
    expect(getByText('Name')).toBeTruthy();
    // When all children are hidden, parent group header should also be hidden
    expect(queryByText('Info')).toBeNull();
    expect(queryByText('Age')).toBeNull();
    expect(queryByText('Gender')).toBeNull();
  });
});
