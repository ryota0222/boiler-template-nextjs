'use client';

import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

const hintIconSize = 16;
// 28px の ActionIcon をラベルの 1 行の高さに収め、ヒントのあるラベルだけが高くならないようにする
const iconMarginBlock = -6;

// 入力欄の説明は流れに置かず、ラベルの横の i のアイコンの後ろに置く（design-form.md）。
// 入力欄の label に渡して使う。Tooltip はマウスを載せたときとキーボードでフォーカスしたときの両方で出す
export const FieldLabel = ({
  hint,
  hintLabel,
  label,
}: {
  readonly hint: string;
  readonly hintLabel: string;
  readonly label: string;
}): React.JSX.Element => (
  // 必須の印がラベルの後ろに続けて並ぶよう、行の中に収まる幅で組む
  <Group align="center" component="span" display="inline-flex" gap="xs" wrap="nowrap">
    <span>{label}</span>
    <Tooltip events={{ focus: true, hover: true, touch: true }} label={hint} maw={280} multiline>
      <ActionIcon
        aria-label={hintLabel}
        color="gray"
        my={iconMarginBlock}
        size="md"
        variant="subtle"
      >
        <IconInfoCircle aria-hidden size={hintIconSize} />
      </ActionIcon>
    </Tooltip>
  </Group>
);
