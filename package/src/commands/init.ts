import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { 
  directoryExists, 
  isDirectoryEmpty, 
  copyDirectory, 
  updatePackageJson,
  getTemplatePath,
  backupDirectory
} from '../utils/fs';
import { 
  promptForTemplate, 
  promptForTargetDir,
  promptForOverwrite,
  promptForNextSteps,
  TemplateInfo
} from '../utils/prompt';

/**
 * 利用可能なテンプレートの定義
 */
const AVAILABLE_TEMPLATES: TemplateInfo[] = [
  {
    name: 'GCS Boilerplate',
    value: 'gcs-boilerplate',
    description: 'ビューのソースコードを GitHub で管理し、GCS にデプロイするボイラープレート'
  },
  // 将来的に他のテンプレートが追加された場合はここに追加
];

/**
 * テンプレート名からテンプレート情報を取得
 */
function getTemplateInfo(templateName: string): TemplateInfo | undefined {
  return AVAILABLE_TEMPLATES.find(t => t.value === templateName);
}

/**
 * テンプレートが存在するか検証
 */
function validateTemplate(templateName: string): boolean {
  const templateDir = getTemplatePath(templateName);
  return fs.existsSync(templateDir);
}

/**
 * initコマンドのメイン処理
 */
export async function initCommand(
  templateName: string | undefined,
  options: { target: string; force: boolean }
): Promise<void> {
  try {
    // テンプレートの選択
    let selectedTemplate = templateName;
    if (!selectedTemplate) {
      selectedTemplate = await promptForTemplate(AVAILABLE_TEMPLATES);
    } else {
      // 指定されたテンプレートが存在するか確認
      const templateInfo = getTemplateInfo(selectedTemplate);
      if (!templateInfo) {
        logger.error(`テンプレート '${selectedTemplate}' は存在しません`);
        logger.info('利用可能なテンプレート:');
        AVAILABLE_TEMPLATES.forEach(t => {
          logger.info(`  - ${t.value} (${t.name}): ${t.description}`);
        });
        process.exit(1);
      }
    }

    // テンプレートの検証
    if (!validateTemplate(selectedTemplate)) {
      logger.error(`テンプレート '${selectedTemplate}' が見つかりません`);
      process.exit(1);
    }

    // ターゲットディレクトリの取得
    let targetDir = options.target;
    if (targetDir === '.') {
      // インタラクティブモードでデフォルトターゲットの場合はプロンプト表示
      if (!templateName) {
        targetDir = await promptForTargetDir(selectedTemplate);
      }
    }

    // ターゲットパスの正規化
    const targetPath = path.resolve(targetDir);
    logger.info(`ターゲットディレクトリ: ${targetPath}`);

    // 既存ディレクトリの確認
    let shouldProceed = options.force;
    if (!shouldProceed) {
      shouldProceed = await promptForOverwrite(targetPath);
      if (!shouldProceed) {
        logger.info('インストールを中止しました');
        return;
      }
    }

    // ディレクトリの準備
    if (directoryExists(targetPath) && !isDirectoryEmpty(targetPath)) {
      if (shouldProceed) {
        logger.warn(`既存のディレクトリ '${targetPath}' の内容を上書きします`);
        const backupPath = await backupDirectory(targetPath);
        logger.info(`バックアップを作成しました: ${backupPath}`);
      }
    }

    // ディレクトリが存在しない場合は作成
    if (!directoryExists(targetPath)) {
      await fs.mkdirp(targetPath);
      logger.debug(`ディレクトリを作成しました: ${targetPath}`);
    }

    // テンプレートソースパスの取得
    const templateSource = getTemplatePath(selectedTemplate);
    logger.debug(`テンプレートソース: ${templateSource}`);

    // テンプレートのコピー
    const spinner = ora('プロジェクトを作成中...').start();
    try {
      await copyDirectory(templateSource, targetPath);
      
      // package.jsonの更新
      const packageJsonPath = path.join(targetPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        await updatePackageJson(packageJsonPath, (pkg) => {
          // プロジェクト名をターゲットディレクトリの名前に基づいて設定
          const dirName = path.basename(targetPath);
          if (dirName !== '.') {
            pkg.name = dirName;
          }
          return pkg;
        });
      }
      
      spinner.succeed('プロジェクトが正常に作成されました');
      
      // 次のステップの案内
      await promptForNextSteps(targetPath);
    } catch (error) {
      spinner.fail('プロジェクトの作成に失敗しました');
      if (error instanceof Error) {
        logger.error(error.message);
      }
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`初期化中にエラーが発生しました: ${error.message}`);
    }
    process.exit(1);
  }
}