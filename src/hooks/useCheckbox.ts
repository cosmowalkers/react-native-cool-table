import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type * as React from 'react';
import { isFunction } from 'lodash';
import type { ICheckboxConfig, ITableProps, TItem } from '../types';
import { buildRowKey } from '../utils';
import useUpdateEffect from './useUpdateEffect';

interface IUseCheckboxParams {
  checkboxConfig?: ICheckboxConfig;
  data: TItem[];
  rowKey?: ITableProps['rowKey'];
}

interface IUseCheckboxReturn {
  checkedKeys: Set<string>;
  setCheckedKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleChecked: (key: string) => void;
  toggleCheckedAll: () => void;
  isChecked: (key: string) => boolean;
  isCheckedAll: boolean;
  isIndeterminate: boolean;
}

const useCheckbox = ({
  checkboxConfig,
  data,
  rowKey,
}: IUseCheckboxParams): IUseCheckboxReturn => {
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(() => {
    if (checkboxConfig?.checkedRowKeys) {
      return new Set(checkboxConfig.checkedRowKeys);
    }
    return new Set();
  });

  // Sync controlled checkbox keys
  useEffect(() => {
    if (checkboxConfig?.checkedRowKeys) {
      setCheckedKeys(new Set(checkboxConfig.checkedRowKeys));
    }
  }, [checkboxConfig?.checkedRowKeys]);

  const onChangeRef = useRef(checkboxConfig?.onChange);
  onChangeRef.current = checkboxConfig?.onChange;

  // Checkbox onChange (skip mount)
  useUpdateEffect(() => {
    if (onChangeRef.current) {
      const records = data.filter((item, idx) => {
        const key = buildRowKey(rowKey, item, idx);
        return checkedKeys.has(key);
      });
      onChangeRef.current({ records });
    }
  }, [checkedKeys]);

  const checkableData = useMemo(() => {
    if (!checkboxConfig) return data;
    if (isFunction(checkboxConfig.checkMethod)) {
      return data.filter((row, idx) =>
        checkboxConfig.checkMethod!({ row, rowIndex: idx })
      );
    }
    return data;
  }, [data, checkboxConfig]);

  const toggleChecked = useCallback((key: string) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const toggleCheckedAll = useCallback(() => {
    setCheckedKeys((prev) => {
      const allKeys = checkableData.map((item, idx) =>
        buildRowKey(rowKey, item, idx)
      );
      const allChecked = allKeys.every((k) => prev.has(k));
      if (allChecked) {
        const next = new Set(prev);
        allKeys.forEach((k) => next.delete(k));
        return next;
      }
      return new Set([...prev, ...allKeys]);
    });
  }, [checkableData, rowKey]);

  const isChecked = useCallback(
    (key: string) => checkedKeys.has(key),
    [checkedKeys]
  );

  const isCheckedAll = useMemo(() => {
    if (checkableData.length === 0) return false;
    const allKeys = checkableData.map((item, idx) =>
      buildRowKey(rowKey, item, idx)
    );
    return allKeys.every((k) => checkedKeys.has(k));
  }, [checkableData, checkedKeys, rowKey]);

  const isIndeterminate = useMemo(() => {
    if (checkedKeys.size === 0) return false;
    if (isCheckedAll) return false;
    const dataKeys = checkableData.map((item, idx) =>
      buildRowKey(rowKey, item, idx)
    );
    return dataKeys.some((k) => checkedKeys.has(k));
  }, [checkedKeys, isCheckedAll, checkableData, rowKey]);

  return {
    checkedKeys,
    setCheckedKeys,
    toggleChecked,
    toggleCheckedAll,
    isChecked,
    isCheckedAll,
    isIndeterminate,
  };
};

export default useCheckbox;
