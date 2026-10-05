export const printErrorLog = (error: Error): void => {
  // サーバーの障害をホスティング先のログに残すため、標準エラー出力に書く
  // eslint-disable-next-line no-console
  console.error(error);
};
