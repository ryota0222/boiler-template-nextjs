import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { buildRequestUrl, requestEndpoint } from '@/api/client';
import { defineEndpoint } from '@/api/endpoint';

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;
const notFoundStatus = 404;

const listTodoEndpoint = defineEndpoint({
  inputSchema: z
    .object({ query: z.object({ title: z.string().optional() }).readonly() })
    .readonly(),
  method: 'GET',
  outputSchema: z.array(z.object({ title: z.string() }).readonly()).readonly(),
  path: '/api/todos',
  successStatus: okStatus,
});

const createTodoEndpoint = defineEndpoint({
  inputSchema: z.object({ body: z.object({ title: z.string() }).readonly() }).readonly(),
  method: 'POST',
  outputSchema: z.null(),
  path: '/api/todos',
  successStatus: createdStatus,
});

const stubFetch = (response: () => Promise<Response>): ReturnType<typeof vi.fn> => {
  const fetchMock = vi.fn(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildRequestUrl', () => {
  it('queryが空の場合、パスだけを返すこと', () => {
    const actual = buildRequestUrl({ endpoint: listTodoEndpoint, input: { query: {} } });

    const expected = '/api/todos';
    expect(actual).toBe(expected);
  });

  it('queryがある場合、クエリ文字列を付けること', () => {
    const actual = buildRequestUrl({
      endpoint: listTodoEndpoint,
      input: { query: { title: '買い物' } },
    });

    const expected = '/api/todos?title=%E8%B2%B7%E3%81%84%E7%89%A9';
    expect(actual).toBe(expected);
  });

  it('パスがすでに?を含む場合、&でつなぐこと', () => {
    const actual = buildRequestUrl({
      endpoint: { buildPath: () => '/api/todos?sort=asc' },
      input: { query: { title: 'a' } },
    });

    const expected = '/api/todos?sort=asc&title=a';
    expect(actual).toBe(expected);
  });
});

describe('requestEndpoint', () => {
  it('応答が成功で形が合う場合、その値のResultを返すこと', async () => {
    stubFetch(() => Promise.resolve(Response.json([{ title: 'タスク' }], { status: okStatus })));

    const actual = await requestEndpoint({ endpoint: listTodoEndpoint, input: { query: {} } });

    const expected = { ok: true, value: [{ title: 'タスク' }] };
    expect(actual).toEqual(expected);
  });

  it('bodyを渡した場合、JSONとして送ること', async () => {
    const fetchMock = stubFetch(() =>
      Promise.resolve(new Response(null, { status: noContentStatus }))
    );

    await requestEndpoint({ endpoint: createTodoEndpoint, input: { body: { title: 'タスク' } } });
    const actual = fetchMock.mock.calls[0]?.[1];

    const expected = {
      body: '{"title":"タスク"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    };
    expect(actual).toEqual(expected);
  });

  it('応答が204の場合、本文なしとして読むこと', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: noContentStatus })));

    const actual = await requestEndpoint({
      endpoint: createTodoEndpoint,
      input: { body: { title: 'タスク' } },
    });

    const expected = { ok: true, value: null };
    expect(actual).toEqual(expected);
  });

  it('応答の本文が空文字の場合、本文なしとして読むこと', async () => {
    stubFetch(() => Promise.resolve(new Response('', { status: createdStatus })));

    const actual = await requestEndpoint({
      endpoint: createTodoEndpoint,
      input: { body: { title: 'タスク' } },
    });

    const expected = { ok: true, value: null };
    expect(actual).toEqual(expected);
  });

  it('fetchが失敗した場合、network-failedの失敗を返すこと', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));

    const result = await requestEndpoint({ endpoint: listTodoEndpoint, input: { query: {} } });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'network-failed';
    expect(actual).toBe(expected);
  });

  it('応答の本文がJSONでない場合、invalid-responseの失敗を返すこと', async () => {
    stubFetch(() => Promise.resolve(new Response('<html>', { status: okStatus })));

    const result = await requestEndpoint({ endpoint: listTodoEndpoint, input: { query: {} } });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'invalid-response';
    expect(actual).toBe(expected);
  });

  it('応答が失敗で失敗の本文の形が合う場合、その失敗を返すこと', async () => {
    stubFetch(() =>
      Promise.resolve(
        Response.json(
          { error: { kind: 'not-found', message: 'Todoがありません' } },
          { status: notFoundStatus }
        )
      )
    );

    const actual = await requestEndpoint({ endpoint: listTodoEndpoint, input: { query: {} } });

    const expected = { error: { kind: 'not-found', message: 'Todoがありません' }, ok: false };
    expect(actual).toEqual(expected);
  });

  it('応答が失敗で失敗の本文の形が合わない場合、invalid-responseの失敗を返すこと', async () => {
    stubFetch(() => Promise.resolve(Response.json({}, { status: notFoundStatus })));

    const result = await requestEndpoint({ endpoint: listTodoEndpoint, input: { query: {} } });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'invalid-response';
    expect(actual).toBe(expected);
  });

  it('応答が成功で形が合わない場合、invalid-responseの失敗を返すこと', async () => {
    stubFetch(() => Promise.resolve(Response.json([{ title: 1 }], { status: okStatus })));

    const result = await requestEndpoint({ endpoint: listTodoEndpoint, input: { query: {} } });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'invalid-response';
    expect(actual).toBe(expected);
  });
});
