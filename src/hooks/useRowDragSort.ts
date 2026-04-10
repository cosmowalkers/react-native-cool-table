'use strict';

import { useState, useCallback, useRef } from 'react';
import { isFunction } from 'lodash';
import type { IDragSortConfig, TItem } from '../types';

interface IUseRowDragSortParams {
  dragSortConfig?: IDragSortConfig;
  data: TItem[];
}

interface IUseRowDragSortReturn {
  dragIndex: number | null;
  targetIndex: number | null;
  startDrag: (index: number) => void;
  moveDrag: (index: number) => void;
  endDrag: () => void;
}

export function useRowDragSort({
  dragSortConfig,
  data,
}: IUseRowDragSortParams): IUseRowDragSortReturn {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  // Use refs for data to avoid stale closures in endDrag
  const dataRef = useRef(data);
  dataRef.current = data;

  const configRef = useRef(dragSortConfig);
  configRef.current = dragSortConfig;

  const startDrag = useCallback((index: number) => {
    if (!configRef.current) return;

    // Check dragMethod
    if (isFunction(configRef.current.dragMethod)) {
      const row = dataRef.current[index];
      if (row && !configRef.current.dragMethod({ row, rowIndex: index })) {
        return;
      }
    }

    setDragIndex(index);
  }, []);

  const moveDrag = useCallback((index: number) => {
    if (!configRef.current) return;
    setTargetIndex(index);
  }, []);

  const endDrag = useCallback(() => {
    const config = configRef.current;
    const currentData = dataRef.current;

    setDragIndex((prevDragIndex) => {
      setTargetIndex((prevTargetIndex) => {
        if (
          prevDragIndex === null ||
          prevTargetIndex === null ||
          prevDragIndex === prevTargetIndex
        ) {
          return null;
        }

        // Reorder: remove item at dragIndex, insert at targetIndex
        const newData = [...currentData];
        const [movedItem] = newData.splice(prevDragIndex, 1);
        if (movedItem) {
          newData.splice(prevTargetIndex, 0, movedItem);
        }

        if (isFunction(config?.onDragEnd)) {
          config!.onDragEnd({
            data: newData,
            fromIndex: prevDragIndex,
            toIndex: prevTargetIndex,
          });
        }

        return null;
      });

      return null;
    });
  }, []);

  return {
    dragIndex,
    targetIndex,
    startDrag,
    moveDrag,
    endDrag,
  };
}

export default useRowDragSort;
