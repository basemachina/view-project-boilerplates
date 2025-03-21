import { Command } from 'commander';
import { initCommand } from './commands/init';
import { logger } from './utils/logger';

/**
 * CLIプログラムを実行します
 */
export function run(): void {
  try {
    const program = new Command();

    program
      .name('view-boilerplate')
      .description('ベースマキナのビュープロジェクトボイラープレート初期化ツール')
      .version(require('../package.json').version);

    program
      .command('init')
      .description('新しいビュープロジェクトを初期化します')
      .argument('[template]', 'テンプレート名（例: gcs-boilerplate）')
      .option('-t, --target <dir>', 'ターゲットディレクトリ', '.')
      .option('-f, --force', '既存ディレクトリを強制的に上書き', false)
      .action(initCommand);

    program.parse(process.argv);

    // コマンドが指定されていない場合はヘルプを表示
    if (!process.argv.slice(2).length) {
      program.outputHelp();
    }
  } catch (error) {
    logger.error('予期しないエラーが発生しました');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}