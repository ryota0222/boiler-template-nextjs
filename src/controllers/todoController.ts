import { createTodoEndpoint, listTodoEndpoint, updateTodoEndpoint } from '@/api/todo/endpoints';
import { printErrorLog } from '@/gateways/errorLogGateway';
import { createReadingRequestInput } from '@/gateways/requestInputGateway';
import { createTodo, listTodos, updateTodo } from '@/gateways/todoGateway';
import { presentFailure, presentSuccess } from '@/presenters/apiResponsePresenter';
import { createApiRequestUsecase } from '@/usecases/api-request/usecase';
import { createTodoUsecase } from '@/usecases/todo/usecase';

const createRequestUsecase = ({
  parameters,
  request,
}: {
  readonly parameters: Promise<Readonly<Record<string, string>>>;
  readonly request: Request;
}): ReturnType<typeof createApiRequestUsecase> =>
  createApiRequestUsecase({
    gateways: {
      printErrorLog,
      readRequestInput: createReadingRequestInput({ parameters, request }),
    },
    presenters: { presentFailure, presentSuccess },
  });

const todoUsecase = createTodoUsecase({
  gateways: { createTodo, listTodos, printErrorLog, updateTodo },
});

export const handleListTodoRequest = (request: Request): Promise<Response> =>
  createRequestUsecase({ parameters: Promise.resolve({}), request }).handle({
    endpoint: listTodoEndpoint,
    execute: todoUsecase.list,
  });

export const handleCreateTodoRequest = (request: Request): Promise<Response> =>
  createRequestUsecase({ parameters: Promise.resolve({}), request }).handle({
    endpoint: createTodoEndpoint,
    execute: todoUsecase.create,
  });

// 動的な区切りを持つ Route Handler は、Next.js が区切りの値を第 2 引数で渡すため、controller だけが引数を 2 つ取る
export const handleUpdateTodoRequest = (
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> }
): Promise<Response> =>
  createRequestUsecase({ parameters: context.params, request }).handle({
    endpoint: updateTodoEndpoint,
    execute: todoUsecase.update,
  });
