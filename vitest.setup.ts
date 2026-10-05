import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// globals を有効にしていないため Testing Library の自動クリーンアップが登録されない。
// 明示しないと 1 ファイル内の複数 render が同じ DOM に積み上がり、
// getByRole が「複数の要素が見つかった」で失敗する
afterEach(cleanup);

// Mantine の部品は jsdom にない matchMedia、ResizeObserver、scrollIntoView を呼ぶため。
// ResizeObserver は Mantine が new で生成するため、アロー関数ではなく class で置き換える
Object.defineProperties(globalThis, {
  matchMedia: {
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
    writable: true,
  },
  ResizeObserver: {
    value: class {
      disconnect = vi.fn();
      observe = vi.fn();
      unobserve = vi.fn();
    },
    writable: true,
  },
});

HTMLElement.prototype.scrollIntoView = vi.fn();

// jsdom は canvas を描けず、getContext を呼ぶたびに「Not implemented」と出す。thinking-orbs のオーブは
// canvas がなければ描かずに済ませるため、jsdom と同じく null を返して出力だけを止める
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
