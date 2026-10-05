import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type {
  ReadRequestInput,
  RequestInput,
} from '@/usecases/api-request/gateways/requestInputGateway';

const readJsonBody = async (request: Request): Promise<Result<unknown, ApiFailure>> => {
  try {
    // Next.js の Route Handler は GET/HEAD 以外の全リクエストに非 null の本文ストリームを渡すため、
    // request.body === null では本文なしを判定できず、空文字列を明示的に判定する
    const text = await request.text();
    const body: unknown = text === '' ? null : JSON.parse(text);
    return { ok: true, value: body };
  } catch {
    return {
      error: { kind: 'invalid-input', message: 'リクエストの本文を JSON として読めません' },
      ok: false,
    };
  }
};

export const createReadingRequestInput =
  ({
    parameters,
    request,
  }: {
    readonly parameters: Promise<Readonly<Record<string, string>>>;
    readonly request: Request;
  }): ReadRequestInput =>
  async (): Promise<Result<RequestInput, ApiFailure>> => {
    const bodyResult = await readJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult;
    }

    // 本文を持たない endpoint の inputSchema は body のキーを受け付けないため、本文がなければキーごと省く
    return {
      ok: true,
      value: {
        ...(bodyResult.value !== null && { body: bodyResult.value }),
        parameters: await parameters,
        query: Object.fromEntries(new URL(request.url).searchParams),
      },
    };
  };
