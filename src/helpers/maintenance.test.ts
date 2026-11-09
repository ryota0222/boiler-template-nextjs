import { describe, expect, it } from 'vitest';

import type { MaintenanceSettings } from '@/helpers/maintenance';

import {
  decideMaintenance,
  formatMaintenanceUntil,
  readMaintenanceSettings,
  toRetryAfter,
} from '@/helpers/maintenance';

const enabledSettings: MaintenanceSettings = {
  bypassToken: 'secret',
  enabled: true,
  until: null,
};

describe('readMaintenanceSettings', () => {
  it('MAINTENANCE_MODEがtrueの場合、オンとして読むこと', () => {
    const actual = readMaintenanceSettings({
      MAINTENANCE_BYPASS_TOKEN: 'secret',
      MAINTENANCE_MODE: 'true',
      MAINTENANCE_UNTIL: '2026-11-10T06:00:00+09:00',
    });

    expect(actual).toStrictEqual({
      bypassToken: 'secret',
      enabled: true,
      until: new Date('2026-11-10T06:00:00+09:00'),
    });
  });

  it('値が空や不正の場合、オフで予定もトークンもないとして読むこと', () => {
    const actual = readMaintenanceSettings({
      MAINTENANCE_BYPASS_TOKEN: '',
      MAINTENANCE_MODE: '1',
      MAINTENANCE_UNTIL: 'あした',
    });

    expect(actual).toStrictEqual({ bypassToken: null, enabled: false, until: null });
  });
});

describe('decideMaintenance', () => {
  it('オフの場合、そのまま通すこと', () => {
    const actual = decideMaintenance({
      bypassCookie: null,
      bypassQuery: null,
      pathname: '/',
      settings: { ...enabledSettings, enabled: false },
    });

    expect(actual).toStrictEqual({ kind: 'pass' });
  });

  it('オフのときにお知らせの画面を開いた場合、トップへ戻すこと', () => {
    const actual = decideMaintenance({
      bypassCookie: null,
      bypassQuery: null,
      pathname: '/maintenance',
      settings: { ...enabledSettings, enabled: false },
    });

    expect(actual).toStrictEqual({ kind: 'leaveMaintenancePage' });
  });

  it('オンの場合、画面をお知らせに差し替えること', () => {
    const actual = decideMaintenance({
      bypassCookie: null,
      bypassQuery: null,
      pathname: '/todos',
      settings: enabledSettings,
    });

    expect(actual).toStrictEqual({ kind: 'showMaintenancePage' });
  });

  it('オンのときにAPIを呼んだ場合、断ること', () => {
    const actual = decideMaintenance({
      bypassCookie: null,
      bypassQuery: null,
      pathname: '/api/todos',
      settings: enabledSettings,
    });

    expect(actual).toStrictEqual({ kind: 'rejectApi' });
  });

  it('正しいトークンをURLに付けた場合、Cookieに覚えさせること', () => {
    const actual = decideMaintenance({
      bypassCookie: null,
      bypassQuery: 'secret',
      pathname: '/',
      settings: enabledSettings,
    });

    expect(actual).toStrictEqual({ kind: 'grantBypass', token: 'secret' });
  });

  it('正しいトークンのCookieがある場合、通すこと', () => {
    const actual = decideMaintenance({
      bypassCookie: 'secret',
      bypassQuery: null,
      pathname: '/api/todos',
      settings: enabledSettings,
    });

    expect(actual).toStrictEqual({ kind: 'pass' });
  });

  it('トークンが設定されていない場合、何を付けても通さないこと', () => {
    const actual = decideMaintenance({
      bypassCookie: null,
      bypassQuery: null,
      pathname: '/',
      settings: { ...enabledSettings, bypassToken: null },
    });

    expect(actual).toStrictEqual({ kind: 'showMaintenancePage' });
  });
});

describe('toRetryAfter', () => {
  it('再開の予定がある場合、HTTPの日付の形で返すこと', () => {
    const actual = toRetryAfter(new Date('2026-11-09T21:00:00Z'));

    expect(actual).toBe('Mon, 09 Nov 2026 21:00:00 GMT');
  });
});

describe('formatMaintenanceUntil', () => {
  it('日本の時刻で出すこと', () => {
    const actual = formatMaintenanceUntil(new Date('2026-11-09T21:00:00Z'));

    expect(actual).toBe('11月10日 6:00');
  });
});
