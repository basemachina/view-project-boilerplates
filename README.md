# view-project-boilerplates

* BaseMachinaのビューのプロジェクト構成のボイラープレートを集めたリポジトリです。
* 例えば、ビューのコードをTSX / JSXで記述し、複数ファイルからバンドルした結果をGCSにアップロードするといったボイラープレートが含まれています。
  - バンドルした結果は、[「ビューのコード取得設定」](https://docs.basemachina.com/view/git_management/)の機能をご利用いただくことで、アクション経由で取得したうえでビューとして表示することができます。

## 使用方法

### 1. シェルスクリプトによるインストール（推奨）

以下のコマンドを実行してボイラープレートをインストールできます：

```bash
# ワンライナーでの実行
curl -fsSL https://raw.githubusercontent.com/basemachina/view-project-boilerplates/main/install.sh | bash -s -- gcs-boilerplate my-project

# または、スクリプトをダウンロードして実行
curl -fsSL https://raw.githubusercontent.com/basemachina/view-project-boilerplates/main/install.sh -o install.sh
chmod +x install.sh
./install.sh gcs-boilerplate my-project
```

### 2. NPMパッケージによるインストール

NPMパッケージを使用してインストールすることもできます：

```bash
# npxを使用した実行
npx @basemachina/view-boilerplate init gcs-boilerplate my-project

# または、グローバルインストール後に実行
npm install -g @basemachina/view-boilerplate
view-boilerplate init gcs-boilerplate my-project
```

### 3. 手動でのコピー

* ボイラープレートのディレクトリをコピーし、名前を付ける
* 各ディレクトリ内のREADMEに記載された内容に従って設定を行う

## ボイラープレート一覧

現在、以下のボイラープレートが利用可能です：

* **gcs-boilerplate**: ビューのソースコードを GitHub で管理し、GCS にデプロイするボイラープレート

## License

MIT
