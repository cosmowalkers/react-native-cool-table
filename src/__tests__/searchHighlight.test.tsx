import { render } from '@testing-library/react-native';
import { HighlightText } from '../components/HighlightText';
import CoolTable from '../index';
import type { ITableColumn, TItem } from '../types';

describe('HighlightText', () => {
  it('should render plain text when no keyword', () => {
    const { getByText } = render(<HighlightText text="Hello World" />);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('should highlight matching text', () => {
    const { getByText } = render(
      <HighlightText text="Hello World" keyword="World" />
    );
    expect(getByText('World')).toBeTruthy();
  });

  it('should be case insensitive by default', () => {
    const { getByText } = render(
      <HighlightText text="Hello World" keyword="world" />
    );
    // Should find "World" highlighted even though keyword is lowercase
    expect(getByText('World')).toBeTruthy();
  });

  it('should handle special regex characters in keyword', () => {
    const { getByText } = render(
      <HighlightText text="Price is $100.00" keyword="$100" />
    );
    expect(getByText('$100')).toBeTruthy();
  });

  it('should render plain text when keyword is empty string', () => {
    const { getByText } = render(
      <HighlightText text="Hello World" keyword="" />
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('should render plain text when keyword does not match', () => {
    const { getByText } = render(
      <HighlightText text="Hello World" keyword="xyz" />
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('should respect caseSensitive option', () => {
    const { queryByText } = render(
      <HighlightText text="Hello World" keyword="hello" caseSensitive />
    );
    // "hello" (lowercase) should not match "Hello" (uppercase) in case-sensitive mode
    // The full text should still render
    expect(queryByText('Hello World')).toBeTruthy();
  });
});

describe('Search Highlight in CoolTable', () => {
  const columns: ITableColumn[] = [
    { key: 'name', title: 'Name', width: 100 },
    { key: 'city', title: 'City', width: 100 },
  ];
  const data: TItem[] = [
    { name: 'Alice', city: 'Beijing' },
    { name: 'Bob', city: 'Shanghai' },
  ];

  it('should render table with searchConfig without crash', () => {
    const { getByText } = render(
      <CoolTable
        columns={columns}
        data={data}
        searchConfig={{ keyword: 'Alice' }}
      />
    );
    expect(getByText('Alice')).toBeTruthy();
  });

  it('should render table without searchConfig normally', () => {
    const { getByText } = render(<CoolTable columns={columns} data={data} />);
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('should render table with columnKeys restriction', () => {
    const { getByText } = render(
      <CoolTable
        columns={columns}
        data={data}
        searchConfig={{ keyword: 'Alice', columnKeys: ['name'] }}
      />
    );
    expect(getByText('Alice')).toBeTruthy();
  });

  it('should render table with empty keyword normally', () => {
    const { getByText } = render(
      <CoolTable columns={columns} data={data} searchConfig={{ keyword: '' }} />
    );
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });
});
