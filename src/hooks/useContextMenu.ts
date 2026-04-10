import { useState, useCallback } from 'react';
import type { TItem, ITableColumn } from '../types';

export interface IMenuState {
  visible: boolean;
  row: TItem | null;
  rowIndex: number;
  x: number;
  y: number;
  column?: ITableColumn;
}

const INITIAL_STATE: IMenuState = {
  visible: false,
  row: null,
  rowIndex: -1,
  x: 0,
  y: 0,
  column: undefined,
};

export interface IUseContextMenuReturn {
  menuState: IMenuState;
  showContextMenu: (params: {
    row: TItem;
    rowIndex: number;
    x: number;
    y: number;
    column?: ITableColumn;
  }) => void;
  hideContextMenu: () => void;
}

export const useContextMenu = (): IUseContextMenuReturn => {
  const [menuState, setMenuState] = useState<IMenuState>(INITIAL_STATE);

  const showContextMenu = useCallback(
    (params: {
      row: TItem;
      rowIndex: number;
      x: number;
      y: number;
      column?: ITableColumn;
    }) => {
      setMenuState({
        visible: true,
        row: params.row,
        rowIndex: params.rowIndex,
        x: params.x,
        y: params.y,
        column: params.column,
      });
    },
    []
  );

  const hideContextMenu = useCallback(() => {
    setMenuState(INITIAL_STATE);
  }, []);

  return { menuState, showContextMenu, hideContextMenu };
};
