/**
 * 卸载守卫工具：管理"组件是否仍然挂载"的状态。
 *
 * 相比直接使用 `useRef(boolean)`，这个工具将守卫逻辑内聚化，
 * 同时提供 `reactivate()` 方法，确保 StrictMode remount（cleanup → 重新 mount）
 * 之后守卫能正确恢复为 active 状态。
 *
 * 用法（在 useEffect 里）：
 *   const guard = useRef(createMountGuard()).current;
 *   useEffect(() => {
 *     guard.reactivate();
 *     return () => { guard.deactivate(); };
 *   }, []);
 *
 * BUG 历史：早期实现用 `mountedRef = useRef(true)` + effect cleanup 置 false，
 * 但缺少显式的 reactivate 语义抽象。在 React 18 StrictMode（development 模式）下，
 * 同一 fiber 会经历 mount → cleanup → remount，若 remount 时守卫未恢复，
 * 则所有 loadChildren resolve 后的 setState 都会被丢弃（spinner 永转）。
 * createMountGuard 通过显式的 reactivate() 解决这个问题，同时让守卫逻辑
 * 可被单元测试独立验证（不依赖 StrictMode double-invoke 环境）。
 */
export interface IMountGuard {
  /** 守卫当前是否处于活跃状态（组件已挂载且未卸载） */
  isActive: () => boolean;
  /** 标记组件已卸载（在 useEffect cleanup 中调用） */
  deactivate: () => void;
  /** 恢复守卫为活跃状态（在 useEffect body 中调用，用于 remount） */
  reactivate: () => void;
}

/**
 * 创建一个卸载守卫实例。每次调用返回独立实例，互不干扰。
 */
export function createMountGuard(): IMountGuard {
  let _active = true;

  return {
    isActive: () => _active,
    deactivate: () => {
      _active = false;
    },
    reactivate: () => {
      _active = true;
    },
  };
}
