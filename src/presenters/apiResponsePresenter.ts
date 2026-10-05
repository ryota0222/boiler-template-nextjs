import type { ApiFailure, FailureKind, FailureResponseBody } from '@/entities/apiFailure';

const badRequestStatus = 400;
const notFoundStatus = 404;
const conflictStatus = 409;
const internalServerErrorStatus = 500;
const badGatewayStatus = 502;
const noContentStatus = 204;

const statusByFailureKind: Readonly<Record<FailureKind, number>> = {
  conflict: conflictStatus,
  'external-service-failed': badGatewayStatus,
  internal: internalServerErrorStatus,
  'invalid-input': badRequestStatus,
  'invalid-response': badGatewayStatus,
  'network-failed': badGatewayStatus,
  'not-found': notFoundStatus,
};

export const presentFailure = (failure: ApiFailure): Response =>
  Response.json({ error: failure } satisfies FailureResponseBody, {
    status: statusByFailureKind[failure.kind],
  });

export const presentSuccess = ({
  body,
  status,
}: {
  readonly body: unknown;
  readonly status: number;
}): Response =>
  status === noContentStatus ? new Response(null, { status }) : Response.json(body, { status });
