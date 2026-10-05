// /setup-theme が選択肢に出し、業務アプリの生成コマンドが --accent-color で名前を受け取るアクセント色。
// どれも generateAccentColors で白との対比 3:1 に届く段階を持つことをテストで確かめている
export const accentPresets = {
  blue: '#228be6',
  'blue-violet': '#4938d1',
  green: '#40c057',
  red: '#fa5252',
} as const;
