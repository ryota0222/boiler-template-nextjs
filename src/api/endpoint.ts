import { isDefined } from 'remeda';
import { z } from 'zod';

import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';

export type ApiInput = {
  readonly body?: unknown;
  readonly parameters?: Readonly<Record<string, string>>;
  readonly query?: Readonly<Record<string, string>>;
};

export type Endpoint<Input extends ApiInput, Output> = {
  readonly buildPath: (input: Input) => string;
  readonly method: HttpMethod;
  readonly parseInput: (raw: unknown) => Result<Input, ApiFailure>;
  readonly parseOutput: (raw: unknown) => Result<Output>;
  readonly path: string;
  readonly successStatus: number;
};

type BodylessMethod = 'DELETE' | 'GET';

// parameters のキーが path の区切りと過不足なく一致しないときは never にして、inputSchema を型エラーにする。
// 名前が食い違うと、buildPath が区切りを埋められないパスを作り、Route Handler の params とも合わなくなるため
type ExactParameters<Input extends ApiInput, Path extends string> = Input extends {
  readonly parameters: infer Parameters;
}
  ? [Exclude<keyof Parameters, PathParameterName<Path>>] extends [never]
    ? [PathParameterName<Path>] extends [keyof Parameters]
      ? Input
      : never
    : never
  : [PathParameterName<Path>] extends [never]
    ? Input
    : never;

type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

// GET/DELETE は仕様上 body を持てないため、fetch が実行時に失敗して
// network-failed という誤解を招く失敗になる前に、型エラーとして防ぐ
type InputForMethod<Method extends HttpMethod> = Method extends BodylessMethod
  ? ApiInput & { readonly body?: never }
  : ApiInput;

type PathParameterName<Path extends string> = Path extends `${string}{${infer Name}}${infer Rest}`
  ? Name | PathParameterName<Rest>
  : never;

// 置き換える値を関数で返すのは、文字列で渡すと $& などが置換のパターンとして解釈されるため
export const buildPathFromTemplate = ({
  input,
  path,
}: {
  readonly input: ApiInput;
  readonly path: string;
}): string => {
  if (!isDefined(input.parameters)) {
    return path;
  }

  let builtPath = path;
  for (const [name, value] of Object.entries(input.parameters)) {
    builtPath = builtPath.replaceAll(`{${name}}`, () => encodeURIComponent(value));
  }

  return builtPath;
};

export const defineEndpoint = <
  Method extends HttpMethod,
  Path extends `/api/${string}`,
  Input extends InputForMethod<Method>,
  Output,
>({
  inputSchema,
  method,
  outputSchema,
  path,
  successStatus,
}: {
  readonly inputSchema: z.ZodType<ExactParameters<Input, Path> & Input>;
  readonly method: Method;
  readonly outputSchema: z.ZodType<Output>;
  readonly path: Path;
  readonly successStatus: number;
}): Endpoint<Input, Output> => ({
  buildPath: (input): string => buildPathFromTemplate({ input, path }),
  method,
  parseInput: (raw): Result<Input, ApiFailure> => {
    const parsed = inputSchema.safeParse(raw);
    return parsed.success
      ? { ok: true, value: parsed.data }
      : { error: { kind: 'invalid-input', message: z.prettifyError(parsed.error) }, ok: false };
  },
  parseOutput: (raw): Result<Output> => {
    const parsed = outputSchema.safeParse(raw);
    return parsed.success
      ? { ok: true, value: parsed.data }
      : { error: new Error('API の応答の形式が不正です', { cause: parsed.error }), ok: false };
  },
  path,
  successStatus,
});
