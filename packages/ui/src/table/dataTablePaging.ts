// design-collection.md は 1 ページの件数を 20 / 50 / 100 にし、全件を見渡したい表のために「すべて」を足す
export const defaultPageSize = 20;
export const pageSizeOptions = ['20', '50', '100'];
// 「すべて」は、どの件数よりも大きい 1 ページの件数として持つ
export const showAllPageSize = Number.MAX_SAFE_INTEGER;
export const showAllOptionValue = 'all';
