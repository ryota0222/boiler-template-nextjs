import { queryOptions } from '@tanstack/react-query';

import { requestEndpoint } from '@/api/client';
import { listTodoEndpoint } from '@/api/todo/endpoints';

export const todoListQueryKey = ['todos'] as const;

export const todoListQueryOptions = queryOptions({
  queryFn: () => requestEndpoint({ endpoint: listTodoEndpoint, input: {} }),
  queryKey: todoListQueryKey,
});
