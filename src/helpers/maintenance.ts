import { isNonNullish } from 'remeda';

export type MaintenanceDecision =
  | { readonly kind: 'grantBypass'; readonly token: string }
  | { readonly kind: 'leaveMaintenancePage' }
  | { readonly kind: 'pass' }
  | { readonly kind: 'rejectApi' }
  | { readonly kind: 'showMaintenancePage' };

// メンテナンス中かどうかと、その間に通してよいリクエストを決める。
// 切り替えは環境変数で行う。デプロイし直さずに切り替えたくなったら、readMaintenanceSettings の読み先（Edge Config や DB など）だけを差し替える
export type MaintenanceSettings = {
  readonly bypassToken: null | string;
  readonly enabled: boolean;
  readonly until: Date | null;
};

type Environment = Readonly<Record<string, string | undefined>>;

export const maintenancePath = '/maintenance';

// 確かめる人は URL に ?maintenance_bypass=<トークン> を付けて 1 度開くと、Cookie に覚えて以降も通れる
export const maintenanceBypassName = 'maintenance_bypass';

const apiPathPrefix = '/api/';

// サーバーは UTC で動くことが多いため、再開の時刻は利用者の地域の時刻で出す
const displayTimeZone = 'Asia/Tokyo';

const untilFormatter = new Intl.DateTimeFormat('ja-JP', {
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  month: 'long',
  timeZone: displayTimeZone,
});

const emptyToNull = (value: string | undefined): null | string =>
  value !== '' && isNonNullish(value) ? value : null;

const parseUntil = (value: string | undefined): Date | null => {
  const text = emptyToNull(value);
  if (text === null) {
    return null;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const readMaintenanceSettings = (environment: Environment): MaintenanceSettings => ({
  bypassToken: emptyToNull(environment.MAINTENANCE_BYPASS_TOKEN),
  enabled: environment.MAINTENANCE_MODE === 'true',
  until: parseUntil(environment.MAINTENANCE_UNTIL),
});

export const decideMaintenance = ({
  bypassCookie,
  bypassQuery,
  pathname,
  settings,
}: {
  readonly bypassCookie: null | string;
  readonly bypassQuery: null | string;
  readonly pathname: string;
  readonly settings: MaintenanceSettings;
}): MaintenanceDecision => {
  if (!settings.enabled) {
    return pathname === maintenancePath ? { kind: 'leaveMaintenancePage' } : { kind: 'pass' };
  }

  const token = settings.bypassToken;
  if (token !== null && bypassQuery === token) {
    return { kind: 'grantBypass', token };
  }

  if (token !== null && bypassCookie === token) {
    return { kind: 'pass' };
  }

  return pathname.startsWith(apiPathPrefix)
    ? { kind: 'rejectApi' }
    : { kind: 'showMaintenancePage' };
};

// Retry-After は HTTP の日付の形で返す。終わりが決まっていなければ付けない
export const toRetryAfter = (until: Date | null): null | string =>
  until === null ? null : until.toUTCString();

export const formatMaintenanceUntil = (until: Date): string => untilFormatter.format(until);
