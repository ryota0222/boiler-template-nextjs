import { QueryClient } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';

import { todoListQueryOptions } from '@/api/todo/queries';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('todoListQueryOptionsで読んだ場合、GETで一覧の要求を送ること', async () => {
  const fetchMock = vi.fn(() => Promise.resolve(Response.json([], { status: 200 })));
  vi.stubGlobal('fetch', fetchMock);

  await new QueryClient().fetchQuery(todoListQueryOptions);
  const actual = fetchMock.mock.calls[0];

  const expected = ['/api/todos', { body: null, method: 'GET' }];
  expect(actual).toEqual(expected);
});
