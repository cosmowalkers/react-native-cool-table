import {
  flattenColumns,
  getHeaderLevels,
  getLeafColumns,
} from '../utils/columnUtils';
import type { ITableColumn } from '../types';

describe('columnUtils', () => {
  const simpleColumns: ITableColumn[] = [
    { key: 'name', title: 'Name', width: 100 },
    { key: 'age', title: 'Age', width: 80 },
  ];

  const groupedColumns: ITableColumn[] = [
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

  const deepGroupedColumns: ITableColumn[] = [
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

  describe('flattenColumns', () => {
    it('should return same columns when no children', () => {
      expect(flattenColumns(simpleColumns)).toEqual(simpleColumns);
    });

    it('should flatten one level of grouped columns', () => {
      const result = flattenColumns(groupedColumns);
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.key)).toEqual(['name', 'age', 'gender']);
    });

    it('should flatten deep grouped columns', () => {
      const result = flattenColumns(deepGroupedColumns);
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.key)).toEqual(['name', 'age', 'gender']);
    });
  });

  describe('getLeafColumns', () => {
    it('should return all columns when no children', () => {
      expect(getLeafColumns(simpleColumns)).toEqual(simpleColumns);
    });

    it('should return only leaf columns from grouped', () => {
      const result = getLeafColumns(groupedColumns);
      expect(result).toHaveLength(3);
    });
  });

  describe('getHeaderLevels', () => {
    it('should return single level for simple columns', () => {
      const levels = getHeaderLevels(simpleColumns);
      expect(levels).toHaveLength(1);
      expect(levels[0]).toHaveLength(2);
      expect(levels[0][0].colSpan).toBe(1);
      expect(levels[0][0].rowSpan).toBe(1);
    });

    it('should return two levels for one-level grouping', () => {
      const levels = getHeaderLevels(groupedColumns);
      expect(levels).toHaveLength(2);
      // Level 0: Name (rowSpan=2), Info (colSpan=2)
      expect(levels[0]).toHaveLength(2);
      expect(levels[0][0].column.key).toBe('name');
      expect(levels[0][0].rowSpan).toBe(2);
      expect(levels[0][0].colSpan).toBe(1);
      expect(levels[0][1].column.key).toBe('info');
      expect(levels[0][1].rowSpan).toBe(1);
      expect(levels[0][1].colSpan).toBe(2);
      // Level 1: Age, Gender
      expect(levels[1]).toHaveLength(2);
      expect(levels[1][0].column.key).toBe('age');
      expect(levels[1][1].column.key).toBe('gender');
    });

    it('should return three levels for two-level grouping', () => {
      const levels = getHeaderLevels(deepGroupedColumns);
      expect(levels).toHaveLength(3);
    });
  });
});
