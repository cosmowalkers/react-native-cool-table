import { useMemo } from 'react';
import type { ISearchConfig } from '../types';

interface IUseSearchHighlightResult {
  isActive: boolean;
  searchConfig?: ISearchConfig;
}

/**
 * Hook to check if search highlight is active.
 * Returns the active state and the search config.
 */
export function useSearchHighlight(
  searchConfig?: ISearchConfig
): IUseSearchHighlightResult {
  const isActive = useMemo(
    () => !!(searchConfig?.keyword && searchConfig.keyword.length > 0),
    [searchConfig?.keyword]
  );

  return { isActive, searchConfig };
}

export default useSearchHighlight;
