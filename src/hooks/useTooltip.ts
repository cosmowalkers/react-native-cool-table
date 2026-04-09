import { useState, useCallback } from 'react';

export interface ITooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
  width: number;
}

const INITIAL_STATE: ITooltipState = {
  visible: false,
  text: '',
  x: 0,
  y: 0,
  width: 0,
};

interface IUseTooltipReturn {
  tooltipState: ITooltipState;
  showTooltip: (text: string, x: number, y: number, width: number) => void;
  hideTooltip: () => void;
}

const useTooltip = (): IUseTooltipReturn => {
  const [tooltipState, setTooltipState] =
    useState<ITooltipState>(INITIAL_STATE);

  const showTooltip = useCallback(
    (text: string, x: number, y: number, width: number) => {
      setTooltipState({ visible: true, text, x, y, width });
    },
    []
  );

  const hideTooltip = useCallback(() => {
    setTooltipState(INITIAL_STATE);
  }, []);

  return { tooltipState, showTooltip, hideTooltip };
};

export default useTooltip;
