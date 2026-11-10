import { type NextRequest, NextResponse } from 'next/server';

import {
  decideMaintenance,
  maintenanceBypassName,
  maintenancePath,
  readMaintenanceSettings,
  toRetryAfter,
} from '@/helpers/maintenance';
import { presentFailure } from '@/presenters/apiResponsePresenter';

const serviceUnavailableStatus = 503;
const secondsPerHour = 3600;
const bypassCookieHours = 12;

const buildHeaders = (retryAfter: null | string): Headers => {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  if (retryAfter !== null) {
    headers.set('Retry-After', retryAfter);
  }

  return headers;
};

// すべてのリクエストの手前で、メンテナンス中なら画面を差し替え、API は 503 で断る
export const proxy = (request: NextRequest): Response => {
  const settings = readMaintenanceSettings(process.env);
  const decision = decideMaintenance({
    bypassCookie: request.cookies.get(maintenanceBypassName)?.value ?? null,
    bypassQuery: request.nextUrl.searchParams.get(maintenanceBypassName),
    pathname: request.nextUrl.pathname,
    settings,
  });
  const headers = buildHeaders(toRetryAfter(settings.until));

  switch (decision.kind) {
    case 'grantBypass': {
      const url = request.nextUrl.clone();
      url.searchParams.delete(maintenanceBypassName);
      const response = NextResponse.redirect(url);
      response.cookies.set(maintenanceBypassName, decision.token, {
        httpOnly: true,
        maxAge: bypassCookieHours * secondsPerHour,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }
    case 'leaveMaintenancePage': {
      return NextResponse.redirect(new URL('/', request.url));
    }
    case 'pass': {
      return NextResponse.next();
    }
    case 'rejectApi': {
      const response = presentFailure({
        kind: 'maintenance',
        message: 'メンテナンス中のため、ご利用いただけません',
      });
      for (const [name, value] of headers) {
        response.headers.set(name, value);
      }
      return response;
    }
    case 'showMaintenancePage': {
      return NextResponse.rewrite(new URL(maintenancePath, request.url), {
        headers,
        status: serviceUnavailableStatus,
      });
    }
  }
};

// 静的なファイルとアイコンは、メンテナンス中の画面を出すのにも要るため通す
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/).*)'],
};
