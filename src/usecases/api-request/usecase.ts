import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';
import type { PrintErrorLog } from '@/usecases/api-request/gateways/errorLogGateway';
import type {
  ReadRequestInput,
  RequestInput,
} from '@/usecases/api-request/gateways/requestInputGateway';
import type {
  PresentFailure,
  PresentSuccess,
} from '@/usecases/api-request/presenters/apiResponsePresenter';

export const createApiRequestUsecase = ({
  gateways,
  presenters,
}: {
  readonly gateways: {
    readonly printErrorLog: PrintErrorLog;
    readonly readRequestInput: ReadRequestInput;
  };
  readonly presenters: {
    readonly presentFailure: PresentFailure;
    readonly presentSuccess: PresentSuccess;
  };
}): {
  readonly handle: <Input, Output>(request: {
    readonly endpoint: {
      readonly parseInput: (raw: RequestInput) => Result<Input, ApiFailure>;
      readonly successStatus: number;
    };
    readonly execute: (context: {
      readonly input: Input;
    }) => Promise<Result<NoInfer<Output>, ApiFailure>>;
  }) => Promise<Response>;
} => {
  const respondWithFailure = (failure: ApiFailure): Response => {
    // 利用者の操作では直せないサーバー側の障害だけを記録し、入力ミスでログを埋めない
    if (failure.kind === 'internal') {
      gateways.printErrorLog(new Error(`${failure.kind}: ${failure.message}`));
    }

    return presenters.presentFailure(failure);
  };

  return {
    handle: async ({ endpoint, execute }): Promise<Response> => {
      const requestInputResult = await gateways.readRequestInput();
      if (!requestInputResult.ok) {
        return respondWithFailure(requestInputResult.error);
      }

      const inputResult = endpoint.parseInput(requestInputResult.value);
      if (!inputResult.ok) {
        return respondWithFailure(inputResult.error);
      }

      const executionResult = await execute({ input: inputResult.value });
      if (!executionResult.ok) {
        return respondWithFailure(executionResult.error);
      }

      return presenters.presentSuccess({
        body: executionResult.value,
        status: endpoint.successStatus,
      });
    },
  };
};
