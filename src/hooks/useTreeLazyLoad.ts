import { useState, useCallback, useRef } from 'react';
import { isFunction } from 'lodash';
import type { TExpandable, TItem } from '../types';

interface IUseTreeLazyLoadParams {
  treeConfig?: TExpandable;
}

interface IUseTreeLazyLoadReturn {
  /** 当前正在加载的行 key 集合 */
  loadingKeys: Set<string>;
  /** 触发异步加载子节点 */
  triggerLoad: (rowKey: string, row: TItem, rowIndex: number) => Promise<void>;
  /** 判断指定行是否正在加载 */
  isLoading: (rowKey: string) => boolean;
  /** 判断指定行是否已完成加载 */
  isLoaded: (rowKey: string) => boolean;
  /** 获取已加载的子节点数据 */
  getChildren: (rowKey: string) => TItem[] | undefined;
}

export const useTreeLazyLoad = ({
  treeConfig,
}: IUseTreeLazyLoadParams): IUseTreeLazyLoadReturn => {
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(new Set());
  const [childrenMap, setChildrenMap] = useState<Map<string, TItem[]>>(
    new Map()
  );

  // Use ref to access latest treeConfig in callbacks without re-creating them
  const treeConfigRef = useRef(treeConfig);
  treeConfigRef.current = treeConfig;

  const triggerLoad = useCallback(
    async (rowKey: string, row: TItem, rowIndex: number): Promise<void> => {
      const config = treeConfigRef.current;
      if (!config || !isFunction(config.loadChildren)) {
        return;
      }

      // If cacheChildren is true and already loaded, skip
      if (config.cacheChildren && loadedKeys.has(rowKey)) {
        return;
      }

      // Set loading
      setLoadingKeys((prev) => {
        const next = new Set(prev);
        next.add(rowKey);
        return next;
      });

      try {
        const children = await config.loadChildren({ row, rowIndex });

        // Store children and mark as loaded
        setChildrenMap((prev) => {
          const next = new Map(prev);
          next.set(rowKey, children);
          return next;
        });
        setLoadedKeys((prev) => {
          const next = new Set(prev);
          next.add(rowKey);
          return next;
        });
      } catch (_error: unknown) {
        // On error: don't mark as loaded, just clear loading
      } finally {
        // Remove from loading
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(rowKey);
          return next;
        });
      }
    },
    [loadedKeys]
  );

  const isLoading = useCallback(
    (rowKey: string): boolean => loadingKeys.has(rowKey),
    [loadingKeys]
  );

  const isLoaded = useCallback(
    (rowKey: string): boolean => loadedKeys.has(rowKey),
    [loadedKeys]
  );

  const getChildren = useCallback(
    (rowKey: string): TItem[] | undefined => childrenMap.get(rowKey),
    [childrenMap]
  );

  return {
    loadingKeys,
    triggerLoad,
    isLoading,
    isLoaded,
    getChildren,
  };
};
