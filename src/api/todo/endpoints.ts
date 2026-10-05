import { z } from 'zod';

import { defineEndpoint } from '@/api/endpoint';
import { schema as todoSchema } from '@/entities/todo';

const okStatus = 200;
const createdStatus = 201;
const maximumTitleLength = 100;

export const listTodoEndpoint = defineEndpoint({
  inputSchema: z.object({}).readonly(),
  method: 'GET',
  outputSchema: z.array(todoSchema).readonly(),
  path: '/api/todos',
  successStatus: okStatus,
});

export const createTodoEndpoint = defineEndpoint({
  inputSchema: z
    .object({
      body: z.object({ title: z.string().trim().min(1).max(maximumTitleLength) }).readonly(),
    })
    .readonly(),
  method: 'POST',
  outputSchema: todoSchema,
  path: '/api/todos',
  successStatus: createdStatus,
});

export const updateTodoEndpoint = defineEndpoint({
  inputSchema: z
    .object({
      body: z.object({ isCompleted: z.boolean() }).readonly(),
      parameters: z.object({ id: z.uuid() }).readonly(),
    })
    .readonly(),
  method: 'PATCH',
  outputSchema: todoSchema,
  path: '/api/todos/{id}',
  successStatus: okStatus,
});
