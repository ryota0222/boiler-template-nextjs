import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// globals を有効にしていないため Testing Library の自動クリーンアップが登録されない。
// 明示しないと 1 ファイル内の複数 render が同じ DOM に積み上がり、
// getByRole が「複数の要素が見つかった」で失敗する
afterEach(cleanup);
