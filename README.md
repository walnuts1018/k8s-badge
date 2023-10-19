# k8s badge

[![Last Build](https://github.com/walnuts1018/k8s-badge/actions/workflows/build.yaml/badge.svg)](https://github.com/walnuts1018/k8s-badge/actions/workflows/build.yaml/badge.svg)
[![k8s Status](https://walnuts1018.github.io/infra/k8sStatus.svg)](https://walnuts1018.github.io/infra/k8sStatus.svg)
[![Pod Status](https://walnuts1018.github.io/infra/podStatus.svg)](https://walnuts1018.github.io/infra/podStatus.svg)
[![Node Status](https://walnuts1018.github.io/infra/nodeStatus.svg)](https://walnuts1018.github.io/infra/nodeStatus.svg)

Kubernetes ステータスのバッジを作成し、Pages にデプロイする Action です。

## Inputs

| name                | required | description                             |
| ------------------- | -------- | --------------------------------------- |
| kubeconfig          | \*       | kubeconfig の中身相当の文字列           |
| github_token        | \*       | GitHub の Token ( secrets.GITHUB_TOKEN) |
| k8sStatus-SVG-text  |          | k8s Status のラベル部分の文字列         |
| podStatus-SVG-text  |          | Pod Status のラベル部分の文字列         |
| nodeStatus-SVG-text |          | Node Status のラベル部分の文字列        |

## 完成 SVG

### k8s Status

![k8s Status](./public/k8sStatus-Healthy.svg)

![k8s Status](./public/k8sStatus-Unhealthy.svg)

Kubernetes の API サーバーにアクセスできるかどうかを示します。

### Pod Status

![Pod Status](./public/podStatus-Healthy.svg)

![Pod Status](./public/podStatus-Warning.svg)

![Pod Status](./public/podStatus-Unhealthy.svg)

### Node Status

![Node Status](./public/nodeStatus-Healthy.svg)

![Node Status](./public/nodeStatus-Warning.svg)

![Node Status](./public/nodeStatus-Unhealthy.svg)

## Getting Started

### 用意するもの

- バッジの svg を置くリポジトリ
  - これは svg を置くリポジトリなので、必ずしも badge を使うリポジトリと同じである必要はありません。
  - `gh-pages`ブランチで Pages を有効にしてください。
  - 初回の workflow を動かすとブランチができるのでそのあとで設定するのがおすすめです。
- kubeconfig
  - 適切な role を設定した、Actions 専用の user を使ってください。
  - 必要な role は（たぶん）`pod, node`の`get, list`です
- Actions からクラスタへの接続方法
  - Tailscale などを使用すると楽だと思います。

### Workflow を書く

サンプル

```yaml
name: k8s badge build
on:
  workflow_dispatch:
  schedule:
    - cron: '0/10 * * * *'
# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  k8s-badge-build:
    name: k8s badge build
    runs-on: ubuntu-latest
    steps:
      - name: setup tailscale
        uses: tailscale/github-action@v2
        with:
          oauth-client-id: ${{secrets.TAILSCALE_CLIENT_ID}}
          oauth-secret: ${{secrets.TAILSCALE_SECRET}}
          tags: "tag:github"
          args: "--accept-routes"

      - name: gen svg
        uses: walnuts1018/k8s-badge@v1.1.2
        with:
          kubeconfig: ${{ secrets.Kubeconfig }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```
