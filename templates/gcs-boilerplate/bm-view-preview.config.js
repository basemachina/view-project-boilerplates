// 下記の変数に、ビューのプレビューに使用する企業アカウントのサブドメイン、プロジェクトID、環境IDを設定してください
const subdomain = "<subdomain>";
const projectId = "<projectId>";
const environmentId = "<environmentId>";

export default {
  baseUrl: `https://${subdomain}.basemachina.com/projects/${projectId}/environments/${environmentId}`,
  sourceDir: "./dist",
};
