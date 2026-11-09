// ログインまわりのフォームが送信の結果として受け取る形。失敗の文は、登録があるかどうかが分からない言い方にする（design-recipes.md）
export type AuthSubmitResult =
  { readonly message: string; readonly ok: false } | { readonly ok: true };
