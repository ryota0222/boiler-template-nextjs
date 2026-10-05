import type { ApiFailure } from '@/entities/apiFailure';

export type PresentFailure = (failure: ApiFailure) => Response;

export type PresentSuccess = (response: {
  readonly body: unknown;
  readonly status: number;
}) => Response;
