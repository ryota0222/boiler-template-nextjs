import { z } from 'zod';

import type { Result } from '@/entities/result';

// network-failed と invalid-response は画面側（src/api/）だけが作る種別。
// 画面がサーバー由来の失敗と同じ union で表示を出し分けられるよう、同じ enum に置く
const failureKindSchema = z.enum([
  'conflict',
  'external-service-failed',
  'internal',
  'invalid-input',
  'invalid-response',
  'network-failed',
  'not-found',
]);

export type FailureKind = z.infer<typeof failureKindSchema>;

export const schema = z
  .object({
    kind: failureKindSchema,
    message: z.string(),
  })
  .readonly();

export type ApiFailure = z.infer<typeof schema>;

const failureResponseBodySchema = z.object({ error: schema }).readonly();

export type FailureResponseBody = z.infer<typeof failureResponseBodySchema>;

export const parseFailureResponseBody = (body: unknown): Result<ApiFailure> => {
  const parsed = failureResponseBodySchema.safeParse(body);
  if (!parsed.success) {
    return {
      error: new Error('エラー応答の本文の形式が不正です', { cause: parsed.error }),
      ok: false,
    };
  }

  return { ok: true, value: parsed.data.error };
};
