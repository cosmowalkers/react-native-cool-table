import type { ITableColumn, IHeaderCell, THeaderLevel } from '../types';

/**
 * 递归提取所有叶子列（没有 children 的列）。
 * 分组列（有 children）自身不出现在结果中。
 */
export function flattenColumns(columns: ITableColumn[]): ITableColumn[] {
  const result: ITableColumn[] = [];

  for (const col of columns) {
    if (col.children && col.children.length > 0) {
      result.push(...flattenColumns(col.children));
    } else {
      result.push(col);
    }
  }

  return result;
}

/** 语义别名：获取所有叶子列 */
export const getLeafColumns = flattenColumns;

/**
 * 计算列的最大嵌套深度。
 * 无 children 的列深度为 1，有 children 则为 1 + 子列最大深度。
 */
function getMaxDepth(columns: ITableColumn[]): number {
  let max = 1;

  for (const col of columns) {
    if (col.children && col.children.length > 0) {
      const childDepth = 1 + getMaxDepth(col.children);
      if (childDepth > max) {
        max = childDepth;
      }
    }
  }

  return max;
}

/**
 * 计算某列的叶子节点数量（用作 colSpan）。
 */
function getLeafCount(column: ITableColumn): number {
  if (!column.children || column.children.length === 0) {
    return 1;
  }

  let count = 0;
  for (const child of column.children) {
    count += getLeafCount(child);
  }
  return count;
}

/**
 * 计算分组表头的层级结构，包含每个单元格的 colSpan 和 rowSpan。
 *
 * 规则：
 * - 叶子列（无 children）：colSpan=1，rowSpan=maxDepth-currentDepth（向下跨满剩余行）
 * - 分组列（有 children）：colSpan=叶子后代数量，rowSpan=1
 */
export function getHeaderLevels(columns: ITableColumn[]): THeaderLevel[] {
  const maxDepth = getMaxDepth(columns);
  const levels: THeaderLevel[] = [];

  // 初始化每一层
  for (let i = 0; i < maxDepth; i++) {
    levels.push([]);
  }

  // 全局叶子列游标：DFS 到达每个叶子时递增，保证每个 header cell 记录到
  // 与 leafColumns 顺序一致的起始索引（跨层唯一，不随层级重置）
  let leafCursor = 0;

  function traverse(cols: ITableColumn[], depth: number): void {
    for (const col of cols) {
      const isLeaf = !col.children || col.children.length === 0;

      const cell: IHeaderCell = {
        column: col,
        colSpan: isLeaf ? 1 : getLeafCount(col),
        rowSpan: isLeaf ? maxDepth - depth : 1,
        isLeaf,
        // 该 cell 覆盖的第一个叶子列在 leafColumns 中的下标
        leafIndex: leafCursor,
      };

      levels[depth].push(cell);

      if (isLeaf) {
        leafCursor += 1;
      } else if (col.children) {
        traverse(col.children, depth + 1);
      }
    }
  }

  traverse(columns, 0);

  return levels;
}
