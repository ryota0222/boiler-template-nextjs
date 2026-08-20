import { z } from 'zod';

export const schema = z
  .object({
    createdAt: z.iso.datetime(),
    id: z.uuid(),
    isCompleted: z.boolean(),
    title: z.string().min(1),
  })
  .readonly();

export type Todo = z.infer<typeof schema>;
