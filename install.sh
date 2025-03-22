#!/bin/bash

# リポジトリ情報
REPO_URL="https://github.com/basemachina/view-project-boilerplates"
REPO_BRANCH="feature/init-command"
TEMPLATES=("gcs-boilerplate")
DEFAULT_TEMPLATE="gcs-boilerplate"
DEFAULT_TARGET_DIR="."

# テンプレートのダウンロードと展開
download_template() {
  local template=$1
  local target_dir=$2
  local temp_dir=$(mktemp -d)
  local zip_url="$REPO_URL/archive/$REPO_BRANCH.zip"
  
  echo "テンプレートをダウンロードしています..."
  
  # リポジトリのZIPファイルをダウンロード
  if ! curl -sSL "$zip_url" -o "$temp_dir/repo.zip"; then
    echo "エラー: リポジトリのダウンロードに失敗しました"
    rm -rf "$temp_dir"
    exit 1
  fi
  
  # ZIPファイルを展開
  if ! unzip -q "$temp_dir/repo.zip" -d "$temp_dir"; then
    echo "エラー: アーカイブの展開に失敗しました"
    rm -rf "$temp_dir"
    exit 1
  fi
  
  # 展開されたディレクトリ名を取得
  local extracted_dir=$(find "$temp_dir" -mindepth 1 -maxdepth 1 -type d | head -n 1)

  echo "展開されたディレクトリ: $extracted_dir"
  
  # テンプレートディレクトリが存在するか確認
  if [ ! -d "$extracted_dir/templates/$template" ]; then
    echo "エラー: テンプレート '$template' が見つかりません"
    # rm -rf "$temp_dir"
    exit 1
  fi
  
  # ターゲットディレクトリの準備
  mkdir -p "$target_dir"
  
  # テンプレートをターゲットディレクトリにコピー
  cp -r "$extracted_dir/templates/$template/"* "$target_dir/"
  
  # 一時ディレクトリをクリーンアップ
  rm -rf "$temp_dir"
  
  echo "テンプレートのダウンロードと展開が完了しました"
}

# メイン処理
main() {
  local template="$DEFAULT_TEMPLATE"
  local target_dir="$DEFAULT_TARGET_DIR"
  
  # 引数の処理を修正
  if [ $# -ge 1 ]; then
    template="$1"
  fi
  
  if [ $# -ge 2 ]; then
    target_dir="$2"
  fi
  
  # テンプレートが有効か確認
  if [[ ! " ${TEMPLATES[*]} " =~ " ${template} " ]]; then
    echo "エラー: 無効なテンプレート: $template"
    list_templates
    exit 1
  fi
  
  echo "テンプレート: $template"
  echo "ターゲットディレクトリ: $target_dir"
  
  # ターゲットディレクトリが空でない場合は確認
  if [ -d "$target_dir" ] && [ "$(ls -A "$target_dir" 2> /dev/null)" ]; then
    echo "警告: ディレクトリ '$target_dir' は既に存在し、ファイルが含まれています"
    read -rp "既存のファイルを上書きしますか？ (y/N) " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
      echo "インストールを中止しました"
      exit 0
    fi
  fi
  
  # テンプレートをダウンロードして展開
  download_template "$template" "$target_dir"
}

# スクリプト実行
main "$@"