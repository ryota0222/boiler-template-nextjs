import type { FunctionComponent, ReactNode } from 'react';

// packages/ui は next に依存しないため、アプリの Link（Next.js の Link など）をこの形で受け取る。
// ブロックは aria-current などの属性も渡すので、受け取った属性はすべて a 要素に渡す部品であること
export type LinkComponent = FunctionComponent<{
  readonly children: ReactNode;
  readonly className: string;
  readonly href: string;
}>;
