import type { ReactNode } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIndicator,
  EmptyStateTitle,
} from '@mantine/core';
import { IconFilterOff, IconInbox } from '@tabler/icons-react';

const indicatorIconSize = 24;

// 絞り込みで 0 件と本当に 0 件では、利用者の次の一歩が逆になるため出し分ける（design-states.md）。
// 絞り込みの条件を持たない一覧が、呼ばれない onClear を渡さずに済むよう、条件で 0 件のときだけ filtered を渡す
export const EmptyCollection = ({
  empty,
  filtered,
}: {
  readonly empty: {
    readonly action: ReactNode;
    readonly description: string;
    readonly title: string;
  };
  readonly filtered: null | {
    readonly clearLabel: string;
    readonly description: string;
    readonly onClear: () => void;
    readonly title: string;
  };
}): React.JSX.Element => {
  if (filtered !== null) {
    return (
      <EmptyState>
        <EmptyStateIndicator>
          <IconFilterOff aria-hidden size={indicatorIconSize} />
        </EmptyStateIndicator>
        <EmptyStateTitle order={2}>{filtered.title}</EmptyStateTitle>
        <EmptyStateDescription>{filtered.description}</EmptyStateDescription>
        <EmptyStateActions>
          <Button onClick={filtered.onClear} variant="outline">
            {filtered.clearLabel}
          </Button>
        </EmptyStateActions>
      </EmptyState>
    );
  }

  return (
    <EmptyState>
      <EmptyStateIndicator>
        <IconInbox aria-hidden size={indicatorIconSize} />
      </EmptyStateIndicator>
      <EmptyStateTitle order={2}>{empty.title}</EmptyStateTitle>
      <EmptyStateDescription>{empty.description}</EmptyStateDescription>
      <EmptyStateActions>{empty.action}</EmptyStateActions>
    </EmptyState>
  );
};
