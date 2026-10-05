import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { buildRequestUrl, requestEndpoint } from '@/api/client';
import { defineEndpoint } from '@/api/endpoint';

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;
const notFoundStatus = 404;

const itemSchema = z.object({ id: z.string(), name: z.string() }).readonly();

// Todo の参考実装を消してもこのテストが残るように、エンドポイントはテストの中で定める
const listItemEndpoint = defineEndpoint({
  inputSchema: z.object({}).readonly(),
  method: 'GET',
  outputSchema: z.array(itemSchema).readonly(),
  path: '/api/items',
  successStatus: okStatus,
});

const createItemEndpoint = defineEndpoint({
  inputSchema: z.object({ body: z.object({ name: z.string() }).readonly() }).readonly(),
  method: 'POST',
  outputSchema: itemSchema,
  path: '/api/items',
  successStatus: createdStatus,
});

const item = { id: 'item-1', name: 'タスク' };

const pathOnlyEndpoint = { buildPath: (): string => '/api/items' };

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
    const actual = buildRequestUrl({ endpoint: pathOnlyEndpoint, input: {} });

    const expected = '/api/items';
    expect(actual).toBe(expected);
  });

  it('queryがある場合、クエリ文字列を付けること', () => {
    const actual = buildRequestUrl({
      endpoint: pathOnlyEndpoint,
      input: { query: { title: '買い物' } },
    });

    const expected = '/api/items?title=%E8%B2%B7%E3%81%84%E7%89%A9';
    expect(actual).toBe(expected);
  });

  it('パスがすでに?を含む場合、&でつなぐこと', () => {
    const actual = buildRequestUrl({
      endpoint: { buildPath: () => '/api/items?sort=asc' },
      input: { query: { title: 'a' } },
    });

    const expected = '/api/items?sort=asc&title=a';
    expect(actual).toBe(expected);
  });
});

describe('requestEndpoint', () => {
  it('応答が成功で形が合う場合、その値のResultを返すこと', async () => {
    stubFetch(() => Promise.resolve(Response.json([item], { status: okStatus })));

    const actual = await requestEndpoint({ endpoint: listItemEndpoint, input: {} });

    const expected = { ok: true, value: [item] };
    expect(actual).toEqual(expected);
  });

  it('bodyを渡した場合、JSONとして送ること', async () => {
    const fetchMock = stubFetch(() =>
      Promise.resolve(new Response(null, { status: noContentStatus }))
    );

    await requestEndpoint({ endpoint: createItemEndpoint, input: { body: { name: 'タスク' } } });
    const actual = fetchMock.mock.calls[0]?.[1];

    const expected = {
      body: '{"name":"タスク"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    };
    expect(actual).toEqual(expected);
  });

  it('応答が204で出力のスキーマが本文を求める場合、invalid-responseの失敗を返すこと', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: noContentStatus })));

    const result = await requestEndpoint({
      endpoint: createItemEndpoint,
      input: { body: { name: 'タスク' } },
    });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'invalid-response';
    expect(actual).toEqual(expected);
  });

  it('応答の本文が空文字で出力のスキーマが本文を求める場合、invalid-responseの失敗を返すこと', async () => {
    stubFetch(() => Promise.resolve(new Response('', { status: createdStatus })));

    const result = await requestEndpoint({
      endpoint: createItemEndpoint,
      input: { body: { name: 'タスク' } },
    });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'invalid-response';
    expect(actual).toEqual(expected);
  });

  it('fetchが失敗した場合、network-failedの失敗を返すこと', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));

    const result = await requestEndpoint({ endpoint: listItemEndpoint, input: {} });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'network-failed';
    expect(actual).toBe(expected);
  });

  it('応答の本文がJSONでない場合、invalid-responseの失敗を返すこと', async () => {
    stubFetch(() => Promise.resolve(new Response('<html>', { status: okStatus })));

    const result = await requestEndpoint({ endpoint: listItemEndpoint, input: {} });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'invalid-response';
    expect(actual).toBe(expected);
  });

  it('応答が失敗で失敗の本文の形が合う場合、その失敗を返すこと', async () => {
    stubFetch(() =>
      Promise.resolve(
        Response.json(
          { error: { kind: 'not-found', message: '見つかりません' } },
          { status: notFoundStatus }
        )
      )
    );

    const actual = await requestEndpoint({ endpoint: listItemEndpoint, input: {} });

    const expected = { error: { kind: 'not-found', message: '見つかりません' }, ok: false };
    expect(actual).toEqual(expected);
  });

  it('応答が失敗で失敗の本文の形が合わない場合、invalid-responseの失敗を返すこと', async () => {
    stubFetch(() => Promise.resolve(Response.json({}, { status: notFoundStatus })));

    const result = await requestEndpoint({ endpoint: listItemEndpoint, input: {} });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'invalid-response';
    expect(actual).toBe(expected);
  });

  it('応答が成功で形が合わない場合、invalid-responseの失敗を返すこと', async () => {
    stubFetch(() => Promise.resolve(Response.json([{ ...item, name: 1 }], { status: okStatus })));

    const result = await requestEndpoint({ endpoint: listItemEndpoint, input: {} });
    const actual = result.ok ? null : result.error.kind;

    const expected = 'invalid-response';
    expect(actual).toBe(expected);
  });
});
