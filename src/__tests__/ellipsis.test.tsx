import { render } from '@testing-library/react-native';
import CoolTable from '../index';
import type { ITableColumn, TItem } from '../types';

describe('Ellipsis + Tooltip', () => {
  const columns: ITableColumn[] = [
    { key: 'name', title: 'Name', width: 100, ellipsis: true },
    { key: 'desc', title: 'Desc', width: 50, ellipsis: { numberOfLines: 2 } },
    { key: 'normal', title: 'Normal', width: 100 },
  ];
  const data: TItem[] = [
    {
      name: 'Very Long Name That Should Be Truncated',
      desc: 'Short',
      normal: 'Text',
    },
  ];

  it('should render text when ellipsis is true', () => {
    const { getByText } = render(<CoolTable columns={columns} data={data} />);
    expect(getByText('Very Long Name That Should Be Truncated')).toBeTruthy();
  });

  it('should render with global ellipsisConfig', () => {
    const globalColumns: ITableColumn[] = [
      { key: 'name', title: 'Name', width: 100 },
    ];
    const { getByText } = render(
      <CoolTable
        columns={globalColumns}
        data={data}
        ellipsisConfig={{ enabled: true, numberOfLines: 1 }}
      />
    );
    expect(getByText('Very Long Name That Should Be Truncated')).toBeTruthy();
  });

  it('should not crash when data is empty with ellipsis config', () => {
    const { getByText } = render(
      <CoolTable
        columns={columns}
        data={[]}
        ellipsisConfig={{ enabled: true }}
        emptyProps={{ description: '暂无数据' }}
      />
    );
    // Should render empty state without errors
    expect(getByText('暂无数据')).toBeTruthy();
  });
});
