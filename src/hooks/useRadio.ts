import { useState, useEffect, useRef } from 'react';
import { isNil } from 'lodash';
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
  useEffect(() => {
    if (!isNil(radioConfig?.checkedRowKey)) {
      setRadioKey(radioConfig!.checkedRowKey!);
    }
  }, [radioConfig]);

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
