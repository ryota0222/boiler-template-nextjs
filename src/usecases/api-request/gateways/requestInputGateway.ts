import type { ApiFailure } from '@/entities/apiFailure';
import type { Result } from '@/entities/result';

export type ReadRequestInput = () => Promise<Result<RequestInput, ApiFailure>>;

export type RequestInput = {
  readonly body?: unknown;
  readonly parameters: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, string>>;
};
