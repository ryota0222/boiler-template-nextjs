import { describe, expect, it } from 'vitest';

import { presentFailure, presentSuccess } from '@/presenters/apiResponsePresenter';

describe('presentFailure', () => {
  it('kindがnot-foundの場合、404で失敗の本文を返すこと', async () => {
    const response = presentFailure({ kind: 'not-found', message: 'ありません' });
    const actual = { body: await response.json(), status: response.status };

    const expected = { body: { error: { kind: 'not-found', message: 'ありません' } }, status: 404 };
    expect(actual).toEqual(expected);
  });
});

describe('presentSuccess', () => {
  it('statusが204の場合、本文なしで返すこと', async () => {
    const actual = await presentSuccess({ body: null, status: 204 }).text();

    const expected = '';
    expect(actual).toBe(expected);
  });

  it('statusが204以外の場合、bodyをJSONで返すこと', async () => {
    const actual = await presentSuccess({ body: { title: 'タスク' }, status: 201 }).json();

    const expected = { title: 'タスク' };
    expect(actual).toEqual(expected);
  });
});
