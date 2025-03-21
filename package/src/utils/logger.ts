import chalk from 'chalk';

/**
 * ロガーユーティリティ
 * コンソール出力を整形して表示します
 */
export const logger = {
  /**
   * 情報メッセージを表示
   */
  info: (message: string): void => {
    console.log(chalk.blue('ℹ') + ' ' + message);
  },

  /**
   * 成功メッセージを表示
   */
  success: (message: string): void => {
    console.log(chalk.green('✓') + ' ' + message);
  },

  /**
   * 警告メッセージを表示
   */
  warn: (message: string): void => {
    console.log(chalk.yellow('⚠') + ' ' + message);
  },

  /**
   * エラーメッセージを表示
   */
  error: (message: string): void => {
    console.log(chalk.red('✗') + ' ' + message);
  },

  /**
   * デバッグメッセージを表示（環境変数DEBUG=trueの場合のみ）
   */
  debug: (message: string): void => {
    if (process.env.DEBUG === 'true') {
      console.log(chalk.gray('🔍') + ' ' + message);
    }
  }
};