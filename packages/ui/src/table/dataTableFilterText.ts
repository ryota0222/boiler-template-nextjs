// 絞り込みの比較と表示に使う文字列。オブジェクトを String で文字列にすると "[object Object]" になるため、
// 文字列、数値、真偽値だけをそのまま文字列にし、それ以外は JSON にする
export const toFilterText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  return JSON.stringify(value);
};
