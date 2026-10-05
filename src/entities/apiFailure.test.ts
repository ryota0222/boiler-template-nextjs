import { describe, expect, it } from 'vitest';

import { parseFailureResponseBody } from '@/entities/apiFailure';

describe('parseFailureResponseBody', () => {
  it('bodyが失敗の本文の形の場合、その失敗を返すこと', () => {
    const actual = parseFailureResponseBody({ error: { kind: 'conflict', message: '重複' } });

    const expected = { ok: true, value: { kind: 'conflict', message: '重複' } };
    expect(actual).toEqual(expected);
  });

  it('bodyが失敗の本文の形でない場合、okではないResultを返すこと', () => {
    const actual = parseFailureResponseBody({ message: '重複' }).ok;

    const expected = false;
    expect(actual).toBe(expected);
  });
});
