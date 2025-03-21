# @basemachina/view-boilerplate

ベースマキナのビュープロジェクトボイラープレートを簡単に使用するためのCLIツールです。

## 概要

このパッケージは、ベースマキナのビュープロジェクトのための様々なボイラープレートをすばやく選択して新しいプロジェクトを作成するためのコマンドラインツールを提供します。

現在サポートされているボイラープレート:
- **gcs-boilerplate**: ビューのソースコードを GitHub で管理し、GCS にデプロイするボイラープレート

## インストール

```bash
# グローバルインストール
npm install -g @basemachina/view-boilerplate

# または直接npxでも実行可能
npx @basemachina/view-boilerplate init
```

## 使用方法

### インタラクティブモード

引数なしで `init` コマンドを実行すると、インタラクティブにテンプレートを選択できます。

```bash
npx @basemachina/view-boilerplate init
```

### 特定のテンプレートを直接指定

テンプレート名を直接指定することもできます。

```bash
npx @basemachina/view-boilerplate init gcs-boilerplate
```

### 出力ディレクトリの指定

デフォルトでは現在のディレクトリにプロジェクトが作成されますが、`--target` または `-t` オプションを使用して出力先を指定できます。

```bash
npx @basemachina/view-boilerplate init gcs-boilerplate --target my-view-project
```

### 既存ディレクトリの上書き

既存のディレクトリを上書きする場合は、`--force` または `-f` オプションを使用します。

```bash
npx @basemachina/view-boilerplate init gcs-boilerplate -t my-view-project --force
```

## 開発

開発者向けの情報は以下の通りです。

### 依存関係のインストール

```bash
cd package
npm install
```

### ビルド

```bash
npm run build
```

### ローカルでの実行

```bash
node bin/view-boilerplate.js init
```

## ライセンス

MIT