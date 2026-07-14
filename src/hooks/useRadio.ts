import { useState, useEffect, useRef } from 'react';
import type { IRadioConfig, ITableProps, TItem } from '../types';
import { buildRowKey } from '../utils';
import useUpdateEffect from './useUpdateEffect';

interface IUseRadioParams {
  radioConfig?: IRadioConfig;
  data: TItem[];
  rowKey?: ITableProps['rowKey'];
}

interface IUseRadioReturn {
  radioKey: string | null;
  setRadioKey: React.Dispatch<React.SetStateAction<string | null>>;
}

const useRadio = ({
  radioConfig,
  data,
  rowKey,
}: IUseRadioParams): IUseRadioReturn => {
  const [radioKey, setRadioKey] = useState<string | null>(
    radioConfig?.checkedRowKey ?? null
  );

  // Sync controlled radio key
  // 用「是否受控」标志 + 受控值共同作为依赖：
  // 避免依赖整个 radioConfig 对象导致过度触发，同时保证
  // radioConfig 从 undefined 切换到受控对象时同步仍会执行
  const isControlled = radioConfig != null && 'checkedRowKey' in radioConfig;
  const controlledRadioKey = radioConfig?.checkedRowKey;
  useEffect(() => {
    if (isControlled) {
      setRadioKey(controlledRadioKey ?? null);
    }
  }, [isControlled, controlledRadioKey]);

  const onChangeRef = useRef(radioConfig?.onChange);
  onChangeRef.current = radioConfig?.onChange;

  // Radio onChange (skip mount)
  useUpdateEffect(() => {
    if (onChangeRef.current) {
      if (radioKey) {
        const row = data.find((item, idx) => {
          const key = buildRowKey(rowKey, item, idx);
          return key === radioKey;
        });
        onChangeRef.current({ row: row ?? null });
      } else {
        onChangeRef.current({ row: null });
      }
    }
  }, [radioKey]);

  return { radioKey, setRadioKey };
};

export default useRadio;
