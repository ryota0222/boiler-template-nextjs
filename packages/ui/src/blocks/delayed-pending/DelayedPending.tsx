'use client';

import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';

// 速い応答で待ちの表示が一瞬だけ光るのはノイズになるため、この時間を超えて待つときだけ出す（design-feedback.md）
export const pendingDelayMs = 300;

export const DelayedPending = ({
  children,
}: {
  readonly children: ReactNode;
}): null | React.JSX.Element => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, pendingDelayMs);
    return (): void => {
      clearTimeout(timer);
    };
  }, []);

  return isVisible ? <>{children}</> : null;
};
