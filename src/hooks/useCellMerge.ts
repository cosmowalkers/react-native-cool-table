import { useMemo } from 'react';
import type { TItem, ITableColumn, TSpanMethod, ISpanResult } from '../types';

interface IUseCellMergeParams {
  data: TItem[];
  columns: ITableColumn[];
  spanMethod?: TSpanMethod;
}

interface IUseCellMergeReturn {
  getCellSpan: (rowIndex: number, colIndex: number) => ISpanResult;
  isCellVisible: (rowIndex: number, colIndex: number) => boolean;
}

const DEFAULT_SPAN: ISpanResult = { rowspan: 1, colspan: 1 };

export const useCellMerge = ({
  data,
  columns,
  spanMethod,
}: IUseCellMergeParams): IUseCellMergeReturn => {
  /**
   * 预计算合并映射表和隐藏单元格集合。
   * spanMap: "rowIndex,colIndex" → ISpanResult
   * hiddenSet: 被 colspan 覆盖的单元格 key 集合
   */
  const { spanMap, hiddenSet } = useMemo(() => {
    const map = new Map<string, ISpanResult>();
    const hidden = new Set<string>();

    if (!spanMethod) {
      return { spanMap: map, hiddenSet: hidden };
    }

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const key = `${rowIndex},${colIndex}`;

        // 如果该单元格已经被前面的 colspan 覆盖，跳过
        if (hidden.has(key)) continue;

        const result = spanMethod({
          row: data[rowIndex]!,
          column: columns[colIndex]!,
          rowIndex,
          colIndex,
        });

        if (__DEV__ && result.rowspan > 1) {
          console.warn(
            '[CoolTable] spanMethod returned rowspan > 1, but rowspan is not implemented. Only colspan is supported.'
          );
        }

        // colspan=0 表示隐藏该单元格（与 vxe-table 行为一致）
        if (result.colspan === 0) {
          hidden.add(key);
          continue;
        }

        // 将 colspan 限制在剩余列数范围内
        const maxColspan = columns.length - colIndex;
        const clampedColspan = Math.min(
          Math.max(result.colspan, 1),
          maxColspan
        );

        const span: ISpanResult = {
          rowspan: result.rowspan,
          colspan: clampedColspan,
        };
        map.set(key, span);

        // 标记被该 colspan 覆盖的后续单元格为隐藏
        for (let offset = 1; offset < clampedColspan; offset++) {
          hidden.add(`${rowIndex},${colIndex + offset}`);
        }
      }
    }

    return { spanMap: map, hiddenSet: hidden };
  }, [data, columns, spanMethod]);

  const getCellSpan = useMemo(() => {
    return (rowIndex: number, colIndex: number): ISpanResult => {
      if (!spanMethod) return DEFAULT_SPAN;
      const key = `${rowIndex},${colIndex}`;
      return spanMap.get(key) ?? DEFAULT_SPAN;
    };
  }, [spanMethod, spanMap]);

  const isCellVisible = useMemo(() => {
    return (rowIndex: number, colIndex: number): boolean => {
      if (!spanMethod) return true;
      const key = `${rowIndex},${colIndex}`;
      return !hiddenSet.has(key);
    };
  }, [spanMethod, hiddenSet]);

  return { getCellSpan, isCellVisible };
};

export default useCellMerge;
