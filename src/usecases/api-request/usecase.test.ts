import { describe, expect, it, vi } from 'vitest';

import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type { RequestInput } from '@/usecases/api-request/gateways/requestInputGateway';

import { createApiRequestUsecase } from '@/usecases/api-request/usecase';

const createdStatus = 201;

const requestInput: RequestInput = { body: { title: 'タスク' }, parameters: {}, query: {} };

const presentFailure = (failure: ApiFailure): Response =>
  Response.json({ error: failure }, { status: 400 });

const presentSuccess = ({ body, status }: { body: unknown; status: number }): Response =>
  Response.json(body, { status });

const handleRequest = ({
  executionResult,
  inputResult,
  printErrorLog,
  requestInputResult,
}: {
  executionResult: Result<string, ApiFailure>;
  inputResult: Result<string, ApiFailure>;
  printErrorLog: (error: Error) => void;
  requestInputResult: Result<RequestInput, ApiFailure>;
}): Promise<Response> =>
  createApiRequestUsecase({
    gateways: { printErrorLog, readRequestInput: () => Promise.resolve(requestInputResult) },
    presenters: { presentFailure, presentSuccess },
  }).handle({
    endpoint: { parseInput: () => inputResult, successStatus: createdStatus },
    execute: () => Promise.resolve(executionResult),
  });

describe('createApiRequestUsecase', () => {
  it('すべての段階が成功した場合、successStatusでexecuteの結果を返すこと', async () => {
    const response = await handleRequest({
      executionResult: { ok: true, value: '追加しました' },
      inputResult: { ok: true, value: 'input' },
      printErrorLog: vi.fn(),
      requestInputResult: { ok: true, value: requestInput },
    });
    const actual = { body: await response.json(), status: response.status };

    const expected = { body: '追加しました', status: createdStatus };
    expect(actual).toEqual(expected);
  });

  it('readRequestInputが失敗した場合、その失敗を返すこと', async () => {
    const response = await handleRequest({
      executionResult: { ok: true, value: '追加しました' },
      inputResult: { ok: true, value: 'input' },
      printErrorLog: vi.fn(),
      requestInputResult: {
        error: { kind: 'invalid-input', message: '本文を読めません' },
        ok: false,
      },
    });
    const actual = await response.json();

    const expected = { error: { kind: 'invalid-input', message: '本文を読めません' } };
    expect(actual).toEqual(expected);
  });

  it('parseInputが失敗した場合、その失敗を返すこと', async () => {
    const response = await handleRequest({
      executionResult: { ok: true, value: '追加しました' },
      inputResult: { error: { kind: 'invalid-input', message: 'title が空です' }, ok: false },
      printErrorLog: vi.fn(),
      requestInputResult: { ok: true, value: requestInput },
    });
    const actual = await response.json();

    const expected = { error: { kind: 'invalid-input', message: 'title が空です' } };
    expect(actual).toEqual(expected);
  });

  it('executeがinternalの失敗を返した場合、エラーログに記録すること', async () => {
    const printErrorLog = vi.fn();

    await handleRequest({
      executionResult: { error: { kind: 'internal', message: '保存できません' }, ok: false },
      inputResult: { ok: true, value: 'input' },
      printErrorLog,
      requestInputResult: { ok: true, value: requestInput },
    });

    expect(printErrorLog).toHaveBeenCalledOnce();
  });

  it('executeがinternal以外の失敗を返した場合、エラーログに記録しないこと', async () => {
    const printErrorLog = vi.fn();

    await handleRequest({
      executionResult: { error: { kind: 'not-found', message: 'ありません' }, ok: false },
      inputResult: { ok: true, value: 'input' },
      printErrorLog,
      requestInputResult: { ok: true, value: requestInput },
    });

    expect(printErrorLog).not.toHaveBeenCalled();
  });
});
