import { isDefined } from 'remeda';

import type { Result } from '@/entities/result';

import { type ApiInput, type Endpoint } from '@/api/endpoint';
import { type ApiFailure, parseFailureResponseBody } from '@/entities/apiFailure';

const noContentStatus = 204;

const createInvalidResponseFailure = (
  message: string
): { readonly error: ApiFailure; readonly ok: false } => ({
  error: { kind: 'invalid-response', message },
  ok: false,
});

export const buildRequestUrl = <Input extends ApiInput>({
  endpoint,
  input,
}: {
  readonly endpoint: { readonly buildPath: (input: Input) => string };
  readonly input: Input;
}): string => {
  const path = endpoint.buildPath(input);
  if (!isDefined(input.query) || Object.keys(input.query).length === 0) {
    return path;
  }

  const querySeparator = path.includes('?') ? '&' : '?';
  return `${path}${querySeparator}${new URLSearchParams(input.query).toString()}`;
};

// fetch は接続できないと例外を投げるため、ここで Result に変える
const sendRequest = async ({
  init,
  url,
}: {
  readonly init: RequestInit;
  readonly url: string;
}): Promise<Result<Response, ApiFailure>> => {
  try {
    return { ok: true, value: await fetch(url, init) };
  } catch {
    return { error: { kind: 'network-failed', message: 'サーバーに接続できません' }, ok: false };
  }
};

// ブラウザでは 204 でも response.body が null にならず空の流れが来ることがあり、そのまま JSON として読むと失敗するため、
// 状態と本文の長さで「本文なし」を決める
const readResponseBody = async (response: Response): Promise<Result<unknown, ApiFailure>> => {
  if (response.status === noContentStatus || response.body === null) {
    return { ok: true, value: null };
  }

  const text = await response.text();
  if (text === '') {
    return { ok: true, value: null };
  }

  try {
    const body: unknown = JSON.parse(text);
    return { ok: true, value: body };
  } catch {
    return createInvalidResponseFailure('サーバーの応答を JSON として読めません');
  }
};

const toFailureResult = (body: unknown): { readonly error: ApiFailure; readonly ok: false } => {
  const failureResult = parseFailureResponseBody(body);
  return failureResult.ok
    ? { error: failureResult.value, ok: false }
    : createInvalidResponseFailure(failureResult.error.message);
};

const readOutput = async <Output>({
  parseOutput,
  response,
}: {
  readonly parseOutput: (raw: unknown) => Result<Output>;
  readonly response: Response;
}): Promise<Result<Output, ApiFailure>> => {
  const bodyResult = await readResponseBody(response);
  if (!bodyResult.ok) {
    return bodyResult;
  }

  if (!response.ok) {
    return toFailureResult(bodyResult.value);
  }

  const outputResult = parseOutput(bodyResult.value);
  return outputResult.ok ? outputResult : createInvalidResponseFailure(outputResult.error.message);
};

export const requestEndpoint = async <Input extends ApiInput, Output>({
  endpoint,
  input,
}: {
  readonly endpoint: Endpoint<Input, Output>;
  readonly input: Input;
}): Promise<Result<Output, ApiFailure>> => {
  const responseResult = await sendRequest({
    init: isDefined(input.body)
      ? {
          body: JSON.stringify(input.body),
          headers: { 'Content-Type': 'application/json' },
          method: endpoint.method,
        }
      : { body: null, method: endpoint.method },
    url: buildRequestUrl({ endpoint, input }),
  });
  if (!responseResult.ok) {
    return responseResult;
  }

  return readOutput({ parseOutput: endpoint.parseOutput, response: responseResult.value });
};
