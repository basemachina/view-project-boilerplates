import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { logger } from './logger';
import { directoryExists, isDirectoryEmpty } from './fs';

/**
 * 利用可能なテンプレートのリスト型
 */
export interface TemplateInfo {
  name: string;
  value: string;
  description: string;
}

/**
 * テンプレートを選択するためのプロンプトを表示します
 */
export async function promptForTemplate(
  templates: TemplateInfo[]
): Promise<string> {
  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'ボイラープレートを選択してください:',
      choices: templates.map(t => ({
        name: `${t.name} - ${t.description}`,
        value: t.value
      })),
      pageSize: 10
    }
  ]);

  return template;
}

/**
 * ターゲットディレクトリのパスを取得するためのプロンプトを表示します
 */
export async function promptForTargetDir(defaultDir: string = '.'): Promise<string> {
  const { targetDir } = await inquirer.prompt([
    {
      type: 'input',
      name: 'targetDir',
      message: 'プロジェクトディレクトリのパスを入力してください:',
      default: defaultDir,
      validate: (input: string) => {
        if (!input.trim()) {
          return 'ディレクトリパスを入力してください';
        }
        return true;
      }
    }
  ]);

  return targetDir;
}

/**
 * 既存ディレクトリを上書きするかどうかの確認プロンプトを表示します
 */
export async function promptForOverwrite(
  targetDir: string
): Promise<boolean> {
  // ディレクトリが存在しない場合は確認不要
  if (!directoryExists(targetDir)) {
    return true;
  }
  
  // 空のディレクトリなら確認不要
  if (isDirectoryEmpty(targetDir)) {
    return true;
  }

  logger.warn(`ディレクトリ '${targetDir}' は既に存在し、ファイルが含まれています`);
  
  const { shouldOverwrite } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldOverwrite',
      message: '既存のファイルを上書きしますか？',
      default: false
    }
  ]);

  return shouldOverwrite;
}

/**
 * インストール終了後のアクションを選択するプロンプトを表示します
 */
export async function promptForNextSteps(
  targetDir: string
): Promise<void> {
  logger.info('\nプロジェクトの初期化が完了しました！');
  
  const relativeDir = path.relative(process.cwd(), targetDir);
  const cdCommand = relativeDir !== '' ? `cd ${relativeDir}` : '';
  
  logger.info('\n次のステップ:');
  if (cdCommand) {
    logger.info(`  ${cdCommand}`);
  }
  logger.info('  npm install');
  logger.info('  npm run dev');
  
  logger.info('\n詳細はREADME.mdを参照してください。');
}