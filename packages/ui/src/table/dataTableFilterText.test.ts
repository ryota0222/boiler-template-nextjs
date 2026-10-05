import { toFilterText } from '@template/ui/table/dataTableFilterText';
import { expect, it } from 'vitest';

it('文字列を渡した場合、そのまま返すこと', () => {
  const actual = toFilterText('A社');

  expect(actual).toBe('A社');
});

it('数値を渡した場合、数字の文字列にすること', () => {
  const actual = toFilterText(1000);

  expect(actual).toBe('1000');
});

it('真偽値を渡した場合、true か false の文字列にすること', () => {
  const actual = toFilterText(true);

  expect(actual).toBe('true');
});

it('オブジェクトを渡した場合、[object Object] ではなく中身の分かる文字列にすること', () => {
  const actual = toFilterText({ name: 'A社' });

  expect(actual).toBe('{"name":"A社"}');
});
