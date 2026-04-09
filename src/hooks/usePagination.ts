import { useState, useMemo, useCallback, useRef } from 'react';
import { isNil } from 'lodash';
import type { IPaginationConfig, TItem } from '../types';
import useUpdateEffect from './useUpdateEffect';

interface IUsePaginationParams {
  paginationConfig?: IPaginationConfig;
  data: TItem[];
}

interface IUsePaginationReturn {
  paginatedData: TItem[];
  currentPage: number;
  pageSize: number;
  total: number;
  maxPage: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

const DEFAULT_PAGE_SIZE = 10;

const NOOP = () => {
  // intentionally empty
};

const usePagination = ({
  paginationConfig,
  data,
}: IUsePaginationParams): IUsePaginationReturn => {
  const enabled = !isNil(paginationConfig);

  const [currentPage, setCurrentPage] = useState<number>(
    paginationConfig?.currentPage ?? 1
  );
  const [pageSize, setPageSizeState] = useState<number>(
    paginationConfig?.pageSize ?? DEFAULT_PAGE_SIZE
  );

  // Remote mode: total provided externally; Local mode: total = data.length
  const isRemote = enabled && !isNil(paginationConfig?.total);
  const total = isRemote ? paginationConfig!.total! : data.length;
  const effectivePageSize = enabled ? pageSize : data.length || 1;
  const maxPage = Math.max(1, Math.ceil(total / effectivePageSize));

  // === Stable callback refs (same pattern as useSort) ===
  const onPageChangeRef = useRef(paginationConfig?.onPageChange);
  onPageChangeRef.current = paginationConfig?.onPageChange;

  const onPageSizeChangeRef = useRef(paginationConfig?.onPageSizeChange);
  onPageSizeChangeRef.current = paginationConfig?.onPageSizeChange;

  // === Controlled mode: sync currentPage from config ===
  useUpdateEffect(() => {
    if (enabled && !isNil(paginationConfig?.currentPage)) {
      setCurrentPage(paginationConfig!.currentPage!);
    }
  }, [paginationConfig?.currentPage]);

  // === Auto-fix page when data shrinks (local mode only) ===
  useUpdateEffect(() => {
    if (enabled && !isRemote && currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [data.length, maxPage]);

  // === setPage with clamping ===
  const setPage = useCallback(
    (page: number) => {
      if (!enabled) return;
      const clamped = Math.min(Math.max(1, page), maxPage);
      setCurrentPage(clamped);
      onPageChangeRef.current?.({ currentPage: clamped, pageSize });
    },
    [enabled, maxPage, pageSize]
  );

  // === setPageSize resets to page 1 ===
  const setPageSize = useCallback(
    (size: number) => {
      if (!enabled) return;
      setPageSizeState(size);
      setCurrentPage(1);
      onPageSizeChangeRef.current?.({ currentPage: 1, pageSize: size });
    },
    [enabled]
  );

  // === Slice data for local mode ===
  const paginatedData = useMemo(() => {
    if (!enabled) {
      return data;
    }
    if (isRemote) {
      return data;
    }
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize, isRemote, enabled]);

  // When disabled, return pass-through values
  if (!enabled) {
    return {
      paginatedData: data,
      currentPage: 1,
      pageSize: data.length || 1,
      total: data.length,
      maxPage: 1,
      setPage: NOOP,
      setPageSize: NOOP,
    };
  }

  return {
    paginatedData,
    currentPage,
    pageSize,
    total,
    maxPage,
    setPage,
    setPageSize,
  };
};

export default usePagination;
