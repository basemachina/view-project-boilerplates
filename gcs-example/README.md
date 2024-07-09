# gcs-example

- ビューのソースコードを GitHub で管理し、GCS にデプロイするサンプルです。
- ソースコードは TypeScript で記述し、ファイルを分割することもできます。
  - ※`@basemachina/view` package の型定義の配布は現状行っていません。

## 使い方

### 事前準備を行う

* プロジェクトの初期設定を行う
  - GitHub Actionsに、GCSへのデプロイ用の環境変数を登録する (詳細は後述)
  - ビューのプレビュー用ツール ([bm-view-preview](https://github.com/basemachina/bm-view-preview)) の設定ファイルを記述する
* `npm install` で依存packageをインストールする

### ビューの編集を行う

* `src/views` 配下に、ビューのエントリポイントとなる JSX / TSX ファイルを設置する
  - 以下のファイルがビルドの対象になります。
    - `src/views` 直下の `.jsx` および `.tsx` ファイル
    - `src/views` 直下のディレクトリの `index.jsx` および `index.tsx` ファイル
* `npm run dev` でビューのプレビューを行いながら編集する
  - `npm run dev` で `bm-view-preview` の起動と、Webpackのwatchが同時に走ります。
    - bm-view-previewは、Playwrightによって起動したブラウザからベースマキナへ接続し、ブラウザ上でビューのプレビューを行えるツールです。
* git branchを切り、PRをopenする
  - 各branchにpushする度に、そのbranch名のパス配下に JSX / TSX のビルド結果のJSファイルをアップロードします
* PRをマージする

### ビューのコード取得設定を行う

* ベースマキナのWebサイト上で、ビューの作成・編集に進み、GCSアクションを実行してビューのコードに使用するJSファイルを取得します
  - 詳細については、ベースマキナのドキュメントをご参照ください

## 初期設定方法

### 環境変数の登録

GitHub Actionsに、3つ環境変数を設定する必要があります。

* `WORKLOAD_IDENTITY_PROVIDER`
* `SERVICE_ACCOUNT_EMAIL`
* `BUCKET_NAME`

いずれも、 `.github/workflows/upload.yml` で使用しているものです。

#### WORKLOAD_IDENTITY_PROVIDER / SERVICE_ACCOUNT_EMAIL

* GCSへのファイルアップロードに使うサービスアカウントの認証に、[Workload Identity連携](https://cloud.google.com/iam/docs/workload-identity-federation?hl=ja)を使用する場合に設定します。
  - サービスアカウントキーを使用する場合は、 `google-github-actions/auth` のstepの設定内容を変更してください。
* サービスアカウントには、バケットに対してStorageオブジェクトユーザー (`roles/storage.objectUser`) ロールの権限が必要です。
  - https://cloud.google.com/storage/docs/access-control/iam-roles?hl=ja#standard-roles

##### 例

* WORKLOAD_IDENTITY_PROVIDER: `projects/{ProjectIDの数字}/locations/global/workloadIdentityPools/github/providers/{Provider名}`
* SERVICE_ACCOUNT_EMAIL: `{アカウントID}@{Project名}.iam.gserviceaccount.com`

#### BUCKET_NAME

* アップロード先のバケット名を指定します。
  - `google-github-actions/auth` stepで認証に使うサービスアカウントから、操作可能なバケットである必要があります。

### bm-view-previewの設定

* `bm-view-preview.config.js` の下記の部分を、使用したい企業アカウント・プロジェクト・環境のものに差し替えてください。

```js
const subdomain = "<subdomain>";
const projectId = "<projectId>";
const environmentId = "<environmentId>";
```

* subdomain, projectId, environmentIdは、それぞれベースマキナへのログイン後のURLから取得することができます。

## 開発についての詳細

### 使用しているツール

* Webpack
* Babel
  - preset-react / preset-typescript
* [bm-view-preview](https://github.com/basemachina/bm-view-preview)
* GitHub Actions
  - build結果のJavaScriptファイルを、 `gsutil rsync` を使用してGCSに同期しています
  - branchごとにパスが分かれます

### アップロード先のパス

* Webpackによってビルドされた結果の `dist` ディレクトリの内容を、以下のパスにsyncします。
  - `gs://${GCSのbucket名}/${branch名}`

例えば、

```
└── src
    └── views
        ├── multiple-files
        │   ├── UsersTable.tsx
        │   └── index.tsx
        └── single-file.tsx
```

と言うパスに対してビルドを行うと、

```
└── dist
    ├── multiple-files.js
    └── single-file.js
```

という結果を生成します。

この結果をGCSにsyncする際には、例えば `bm-view-example` と言うGCS bucketを環境変数で指定した上で `develop` branchにpushした場合、

```
└── gs://bm-view-example
    └── develop
        ├── multiple-files.js
        └── single-file.js
```

と言うパスにアップロードされるイメージとなります。

`gsutil rsync` を使っているので、削除されたファイルがあった場合はGCS上からも削除されます。
