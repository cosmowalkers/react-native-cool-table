import { useState, useCallback, useRef, useEffect } from 'react';
import { isFunction } from 'lodash';
import type { TExpandable, TItem } from '../types';
import { createMountGuard, type IMountGuard } from '../utils/createMountGuard';

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

  // Use refs to access latest values in callbacks without re-creating them
  const treeConfigRef = useRef(treeConfig);
  treeConfigRef.current = treeConfig;

  const loadedKeysRef = useRef(loadedKeys);
  loadedKeysRef.current = loadedKeys;

  // 正在加载中的 key（同步镜像，用于 in-flight 去重，不受 setState 异步影响）
  const inflightKeysRef = useRef<Set<string>>(new Set());

  // 卸载守卫：避免异步 loadChildren resolve 后对已卸载组件 setState。
  // 使用 createMountGuard 而非裸 useRef(boolean)，原因：
  //   1. 内聚了 deactivate + reactivate 语义，逻辑可被独立单元测试验证；
  //   2. 在 React 18 StrictMode（mount → cleanup → remount）下，
  //      cleanup 会调 deactivate，remount body 会调 reactivate 恢复守卫，
  //      确保 remount 后的 triggerLoad 不会永久被守卫拦截。
  const guardRef = useRef<IMountGuard>(createMountGuard());
  useEffect(() => {
    const guard = guardRef.current;
    guard.reactivate();
    return () => {
      guard.deactivate();
    };
  }, []);

  const triggerLoad = useCallback(
    async (rowKey: string, row: TItem, rowIndex: number): Promise<void> => {
      const config = treeConfigRef.current;
      if (!config || !isFunction(config.loadChildren)) {
        return;
      }

      // If cacheChildren is true and already loaded, skip
      if (config.cacheChildren && loadedKeysRef.current.has(rowKey)) {
        return;
      }

      // In-flight 去重：同一行正在加载时忽略重复触发（与 cacheChildren 无关）
      if (inflightKeysRef.current.has(rowKey)) {
        return;
      }
      inflightKeysRef.current.add(rowKey);

      // Set loading
      setLoadingKeys((prev) => {
        const next = new Set(prev);
        next.add(rowKey);
        return next;
      });

      try {
        const children = await config.loadChildren({ row, rowIndex });

        // 组件已卸载则不再更新状态
        if (!guardRef.current.isActive()) return;

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
      } catch (error: unknown) {
        // Notify consumer of the load failure
        if (isFunction(config.onLoadError)) {
          config.onLoadError({ row, error });
        } else if (__DEV__) {
          console.warn(
            '[CoolTable] loadChildren failed for row:',
            rowKey,
            error
          );
        }
      } finally {
        inflightKeysRef.current.delete(rowKey);
        // Remove from loading（组件已卸载则跳过）
        if (guardRef.current.isActive()) {
          setLoadingKeys((prev) => {
            const next = new Set(prev);
            next.delete(rowKey);
            return next;
          });
        }
      }
    },
    []
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
