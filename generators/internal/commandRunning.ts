import { spawn } from 'node:child_process';

// generator のテストは Vitest の中から Vitest を子プロセスで動かすため、親の Vitest が設定した環境変数を子に渡さない
const childEnvironment: NodeJS.ProcessEnv = {
  ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('VITEST'))),
  NODE_ENV: process.env.NODE_ENV,
};

export const runCommand = ({
  command,
  commandArguments,
  directory,
}: {
  readonly command: string;
  readonly commandArguments: readonly string[];
  readonly directory: string;
}): Promise<{ readonly exitCode: number; readonly output: string }> =>
  new Promise((resolveCommand) => {
    const outputChunks: string[] = [];
    const child = spawn(command, commandArguments, { cwd: directory, env: childEnvironment });
    child.stdout.on('data', (chunk: Buffer) => {
      outputChunks.push(chunk.toString());
    });
    child.stderr.on('data', (chunk: Buffer) => {
      outputChunks.push(chunk.toString());
    });
    child.on('error', (error) => {
      resolveCommand({ exitCode: -1, output: error.message });
    });
    // シグナルで止まったときは終了コードが null になるため、失敗として -1 にする
    child.on('close', (exitCode) => {
      resolveCommand({ exitCode: exitCode ?? -1, output: outputChunks.join('') });
    });
  });
