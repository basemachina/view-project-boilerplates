#!/bin/bash

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# リポジトリ情報
REPO_URL="https://github.com/basemachina/view-project-boilerplates"
REPO_BRANCH="main"

# 利用可能なテンプレート
TEMPLATES=("gcs-boilerplate")
DEFAULT_TEMPLATE="gcs-boilerplate"
DEFAULT_TARGET_DIR="."

# ロゴ表示
print_logo() {
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║                                                          ║${NC}"
  echo -e "${BLUE}║  ${BOLD}BaseMachina View Boilerplate Installer${NC}${BLUE}                ║${NC}"
  echo -e "${BLUE}║                                                          ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# メッセージ表示関数
log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# ヘルプメッセージ表示
print_help() {
  echo "使用方法: $0 [オプション] [テンプレート名] [ターゲットディレクトリ]"
  echo ""
  echo "オプション:"
  echo "  --help, -h     このヘルプメッセージを表示"
  echo "  --list, -l     利用可能なテンプレート一覧を表示"
  echo ""
  echo "テンプレート:"
  for template in "${TEMPLATES[@]}"; do
    echo "  $template"
  done
  echo ""
  echo "例:"
  echo "  $0 gcs-boilerplate my-project"
  echo "  $0 --list"
  echo ""
  echo "ワンライナーでの実行:"
  echo "  curl -fsSL https://raw.githubusercontent.com/basemachina/view-project-boilerplates/main/install.sh | bash -s -- gcs-boilerplate my-project"
  echo ""
}

# テンプレート一覧表示
list_templates() {
  echo "利用可能なテンプレート:"
  for template in "${TEMPLATES[@]}"; do
    if [ "$template" == "$DEFAULT_TEMPLATE" ]; then
      echo "  $template (デフォルト)"
    else
      echo "  $template"
    fi
  done
  echo ""
}

# テンプレート検証
validate_template() {
  local template=$1
  for t in "${TEMPLATES[@]}"; do
    if [ "$t" == "$template" ]; then
      return 0
    fi
  done
  return 1
}

# 必要なコマンドの存在チェック
check_dependencies() {
  local missing_deps=()
  
  if ! command -v curl &> /dev/null; then
    missing_deps+=("curl")
  fi
  
  if ! command -v unzip &> /dev/null; then
    missing_deps+=("unzip")
  fi
  
  if [ ${#missing_deps[@]} -ne 0 ]; then
    log_error "以下の必要なコマンドが見つかりません:"
    for dep in "${missing_deps[@]}"; do
      echo "  - $dep"
    done
    echo ""
    log_info "インストール方法:"
    echo "  Debian/Ubuntu: sudo apt-get install ${missing_deps[*]}"
    echo "  RHEL/CentOS/Fedora: sudo dnf install ${missing_deps[*]}"
    echo "  macOS: brew install ${missing_deps[*]}"
    exit 1
  fi
}

# インタラクティブにテンプレートを選択
select_template() {
  echo "テンプレートを選択してください:"
  select template in "${TEMPLATES[@]}"; do
    if [ -n "$template" ]; then
      echo "$template"
      return 0
    else
      log_error "無効な選択です。再度お試しください。"
    fi
  done
}

# 相対パスを計算（OSに依存しない実装）
get_relative_path() {
  local from="$1"
  local to="$2"
  
  # 絶対パスに変換
  from="$(cd "$from" && pwd)"
  to="$(cd "$to" && pwd)"
  
  # 同じディレクトリの場合は空文字列を返す
  if [ "$from" = "$to" ]; then
    echo ""
    return
  fi
  
  # カレントディレクトリからの相対パスを計算
  # macOSとLinuxどちらでも動作する方法
  local path="$to"
  local result=""
  
  while [ "$path" != "$from" ] && [ "$path" != "/" ]; do
    local name=$(basename "$path")
    result="$name/$result"
    path=$(dirname "$path")
  done
  
  if [ "$path" != "$from" ]; then
    # パスが親ディレクトリにある場合
    local common="$path"
    local up_count=0
    
    path="$from"
    while [ "$path" != "$common" ] && [ "$path" != "/" ]; do
      ((up_count++))
      path=$(dirname "$path")
    done
    
    local up_dirs=""
    for ((i=0; i<up_count; i++)); do
      up_dirs="../$up_dirs"
    done
    
    result="$up_dirs$result"
  fi
  
  # 末尾のスラッシュを削除
  result="${result%/}"
  
  echo "$result"
}

# テンプレートのダウンロードと展開
download_and_extract() {
  local template=$1
  local target_dir=$2
  local temp_dir
  temp_dir=$(mktemp -d)
  local zip_url="$REPO_URL/archive/$REPO_BRANCH.zip"
  
  log_info "テンプレートをダウンロードしています..."
  
  # リポジトリのZIPファイルをダウンロード
  if ! curl -sSL "$zip_url" -o "$temp_dir/repo.zip"; then
    log_error "リポジトリのダウンロードに失敗しました"
    rm -rf "$temp_dir"
    exit 1
  fi
  
  # ZIPファイルを展開
  if ! unzip -q "$temp_dir/repo.zip" -d "$temp_dir"; then
    log_error "アーカイブの展開に失敗しました"
    rm -rf "$temp_dir"
    exit 1
  fi
  
  # 展開されたディレクトリ名を取得
  local extracted_dir
  extracted_dir=$(find "$temp_dir" -mindepth 1 -maxdepth 1 -type d | head -n 1)
  
  # 指定されたテンプレートディレクトリが存在するか確認
  if [ ! -d "$extracted_dir/$template" ]; then
    log_error "テンプレート '$template' がリポジトリに見つかりません"
    rm -rf "$temp_dir"
    exit 1
  fi
  
  # ターゲットディレクトリの準備
  mkdir -p "$target_dir"
  
  # テンプレートをターゲットディレクトリにコピー
  cp -r "$extracted_dir/$template/"* "$target_dir/"
  
  # 一時ディレクトリをクリーンアップ
  rm -rf "$temp_dir"
  
  log_success "テンプレートのダウンロードと展開が完了しました"
}

# package.jsonの更新処理
update_package_json() {
  local target_dir=$1
  local package_json="$target_dir/package.json"
  
  if [ -f "$package_json" ]; then
    local dir_name
    dir_name=$(basename "$(cd "$target_dir" && pwd)")
    
    if [ "$dir_name" != "." ]; then
      # package.jsonのname属性を更新（シンプルな置換、実際の本番環境ではより堅牢な方法が必要）
      # macOSのsedは-iオプションにバックアップ拡張子が必要
      if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"name\": \".*\"/\"name\": \"$dir_name\"/" "$package_json"
      else
        sed -i "s/\"name\": \".*\"/\"name\": \"$dir_name\"/" "$package_json"
      fi
      log_info "package.jsonを更新しました"
    fi
  fi
}

# 次のステップを表示
print_next_steps() {
  local target_dir=$1
  
  echo ""
  log_success "プロジェクトの初期化が完了しました！"
  echo ""
  log_info "次のステップ:"
  
  # ターゲットディレクトリが現在のディレクトリでない場合
  if [ "$(cd "$target_dir" && pwd)" != "$(pwd)" ]; then
    local relative_dir
    relative_dir=$(basename "$target_dir")
    echo "  cd $relative_dir"
  fi
  
  echo "  npm install"
  echo "  npm run dev"
  echo ""
  log_info "詳細はREADME.mdを参照してください。"
}

# メイン処理
main() {
  print_logo
  check_dependencies
  
  local template=""
  local target_dir="$DEFAULT_TARGET_DIR"
  
  # 引数の解析
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --help|-h)
        print_help
        exit 0
        ;;
      --list|-l)
        list_templates
        exit 0
        ;;
      *)
        if [ -z "$template" ]; then
          template="$1"
        elif [ -z "$target_dir" ] || [ "$target_dir" == "$DEFAULT_TARGET_DIR" ]; then
          target_dir="$1"
        else
          log_error "無効な引数: $1"
          print_help
          exit 1
        fi
        ;;
    esac
    shift
  done
  
  # テンプレートが指定されていない場合はインタラクティブに選択
  if [ -z "$template" ]; then
    template=$(select_template)
  fi
  
  # テンプレート検証
  if ! validate_template "$template"; then
    log_error "無効なテンプレート: $template"
    list_templates
    exit 1
  fi
  
  log_info "テンプレート: $template"
  log_info "ターゲットディレクトリ: $target_dir"
  
  # ターゲットディレクトリのチェック
  if [ -d "$target_dir" ] && [ "$(ls -A "$target_dir" 2> /dev/null)" ]; then
    log_warn "ディレクトリ '$target_dir' は既に存在し、ファイルが含まれています"
    read -rp "既存のファイルを上書きしますか？ (y/N) " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
      log_info "インストールを中止しました"
      exit 0
    fi
  fi
  
  # テンプレートのダウンロードと展開
  download_and_extract "$template" "$target_dir"
  
  # package.jsonの更新
  update_package_json "$target_dir"
  
  # 次のステップを表示
  print_next_steps "$target_dir"
}

# スクリプト実行
main "$@"