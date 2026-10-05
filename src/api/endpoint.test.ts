import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { buildPathFromTemplate, defineEndpoint } from '@/api/endpoint';

const okStatus = 200;

const getTodoEndpoint = defineEndpoint({
  inputSchema: z.object({ parameters: z.object({ id: z.string() }).readonly() }).readonly(),
  method: 'GET',
  outputSchema: z.object({ title: z.string() }).readonly(),
  path: '/api/todos/{id}',
  successStatus: okStatus,
});

describe('buildPathFromTemplate', () => {
  it('inputにparametersがない場合、pathをそのまま返すこと', () => {
    const actual = buildPathFromTemplate({ input: {}, path: '/api/todos' });

    const expected = '/api/todos';
    expect(actual).toBe(expected);
  });

  it('parametersの値に$&や/を含む場合、置換のパターンとして解釈せずエンコードして埋めること', () => {
    const actual = buildPathFromTemplate({
      input: { parameters: { id: 'a/$&' } },
      path: '/api/todos/{id}',
    });

    const expected = '/api/todos/a%2F%24%26';
    expect(actual).toBe(expected);
  });
});

describe('defineEndpoint', () => {
  it('parseInputに形の合う入力を渡した場合、okのResultを返すこと', () => {
    const actual = getTodoEndpoint.parseInput({ parameters: { id: 'todo-1' } }).ok;

    const expected = true;
    expect(actual).toBe(expected);
  });

  it('parseInputに形の合わない入力を渡した場合、invalid-inputの失敗を返すこと', () => {
    const inputResult = getTodoEndpoint.parseInput({ parameters: {} });
    const actual = inputResult.ok ? null : inputResult.error.kind;

    const expected = 'invalid-input';
    expect(actual).toBe(expected);
  });

  it('parseOutputに形の合う応答を渡した場合、okのResultを返すこと', () => {
    const actual = getTodoEndpoint.parseOutput({ title: 'タスク' }).ok;

    const expected = true;
    expect(actual).toBe(expected);
  });

  it('parseOutputに形の合わない応答を渡した場合、okではないResultを返すこと', () => {
    const actual = getTodoEndpoint.parseOutput({ title: 1 }).ok;

    const expected = false;
    expect(actual).toBe(expected);
  });

  it('methodがGETでinputSchemaがbodyを持つ場合、型エラーになること', () => {
    defineEndpoint({
      // @ts-expect-error GET は body を持てないため、body を含む inputSchema は型エラーになるはず
      inputSchema: z.object({ body: z.object({ title: z.string() }).readonly() }).readonly(),
      method: 'GET',
      outputSchema: z.null(),
      path: '/api/todos',
      successStatus: okStatus,
    });
  });

  it('parametersのキーがpathの区切りと一致しない場合、型エラーになること', () => {
    defineEndpoint({
      // @ts-expect-error path の区切りは {id} なのに parameters が todoId を持つため型エラーになるはず
      inputSchema: z.object({ parameters: z.object({ todoId: z.string() }).readonly() }).readonly(),
      method: 'GET',
      outputSchema: z.null(),
      path: '/api/todos/{id}',
      successStatus: okStatus,
    });
  });
});
