import { describe, expect, it } from 'vitest';

import { schema } from '@/entities/todo/todo';

const validInput = {
  createdAt: '2026-01-01T00:00:00.000Z',
  id: 'db2438cb-c54c-482c-9365-2f581bdc74bd',
  isCompleted: false,
  title: 'タスク',
};

describe('schema', () => {
  it('titleが空文字の場合、パースが失敗すること', () => {
    const actual = schema.safeParse({ ...validInput, title: '' }).success;

    const expected = false;
    expect(actual).toBe(expected);
  });

  it('titleが1文字の場合、パースが成功すること', () => {
    const actual = schema.safeParse({ ...validInput, title: 'a' }).success;

    const expected = true;
    expect(actual).toBe(expected);
  });

  it('idがUUID形式でない場合、パースが失敗すること', () => {
    const actual = schema.safeParse({ ...validInput, id: 'not-a-uuid' }).success;

    const expected = false;
    expect(actual).toBe(expected);
  });

  it('idがUUID形式の場合、パースが成功すること', () => {
    const actual = schema.safeParse({
      ...validInput,
      id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    }).success;

    const expected = true;
    expect(actual).toBe(expected);
  });

  it('createdAtがISO8601形式でない場合、パースが失敗すること', () => {
    const actual = schema.safeParse({ ...validInput, createdAt: '2026-01-01' }).success;

    const expected = false;
    expect(actual).toBe(expected);
  });

  it('createdAtがISO8601形式の場合、パースが成功すること', () => {
    const actual = schema.safeParse({
      ...validInput,
      createdAt: '2026-06-15T12:34:56.000Z',
    }).success;

    const expected = true;
    expect(actual).toBe(expected);
  });
});
