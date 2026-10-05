import { describe, expect, it } from 'vitest';

import { createReadingRequestInput } from '@/gateways/requestInputGateway';

describe('createReadingRequestInput', () => {
  it('requestが本文を持たない場合、parametersとqueryだけを持つ値を返すこと', async () => {
    const actual = await createReadingRequestInput({
      parameters: Promise.resolve({ id: 'todo-1' }),
      request: new Request('http://localhost/api/todos/todo-1?sort=asc'),
    })();

    const expected = { ok: true, value: { parameters: { id: 'todo-1' }, query: { sort: 'asc' } } };
    expect(actual).toEqual(expected);
  });

  it('requestがJSONの本文を持つ場合、その本文をbodyに入れた値を返すこと', async () => {
    const actual = await createReadingRequestInput({
      parameters: Promise.resolve({}),
      request: new Request('http://localhost/api/todos', {
        body: JSON.stringify({ title: '買い物' }),
        method: 'POST',
      }),
    })();

    const expected = { ok: true, value: { body: { title: '買い物' }, parameters: {}, query: {} } };
    expect(actual).toEqual(expected);
  });

  it('requestの本文が壊れたJSONの場合、invalid-inputの失敗を返すこと', async () => {
    const inputResult = await createReadingRequestInput({
      parameters: Promise.resolve({}),
      request: new Request('http://localhost/api/todos', { body: '{', method: 'POST' }),
    })();
    const actual = inputResult.ok ? null : inputResult.error.kind;

    const expected = 'invalid-input';
    expect(actual).toBe(expected);
  });
});
