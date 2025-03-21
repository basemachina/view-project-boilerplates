import fs from 'fs-extra';
import path from 'path';
import { logger } from './logger';

/**
 * 指定されたディレクトリが存在するかチェックします
 */
export function directoryExists(dir: string): boolean {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * 指定されたディレクトリが空かチェックします
 */
export function isDirectoryEmpty(dir: string): boolean {
  try {
    const files = fs.readdirSync(dir);
    return files.length === 0;
  } catch (error) {
    return false;
  }
}

/**
 * ソースからターゲットへファイルをコピーします
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  try {
    await fs.copy(src, dest, {
      overwrite: true,
      errorOnExist: false,
    });
    logger.debug(`コピーしました: ${src} -> ${dest}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`ディレクトリのコピーに失敗しました: ${error.message}`);
    }
    throw error;
  }
}

/**
 * package.jsonファイルを更新します
 */
export async function updatePackageJson(
  packageJsonPath: string, 
  updateFn: (pkg: any) => any
): Promise<void> {
  try {
    const pkgJson = await fs.readJson(packageJsonPath);
    const updatedPkgJson = updateFn(pkgJson);
    await fs.writeJson(packageJsonPath, updatedPkgJson, { spaces: 2 });
    logger.debug(`package.jsonを更新しました: ${packageJsonPath}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`package.jsonの更新に失敗しました: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 既存ディレクトリの内容をバックアップします
 */
export async function backupDirectory(dir: string): Promise<string> {
  const backupDir = `${dir}_backup_${Date.now()}`;
  try {
    await fs.copy(dir, backupDir);
    logger.debug(`バックアップを作成しました: ${dir} -> ${backupDir}`);
    return backupDir;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`バックアップの作成に失敗しました: ${error.message}`);
    }
    throw error;
  }
}

/**
 * テンプレートディレクトリのパスを取得します
 */
export function getTemplatesDir(): string {
  return path.resolve(__dirname, '../../templates');
}

/**
 * 特定のテンプレートのパスを取得します
 */
export function getTemplatePath(templateName: string): string {
  return path.join(getTemplatesDir(), templateName);
}