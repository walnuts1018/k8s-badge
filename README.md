# k8s badge

Kubernetes ステータスのバッジを作成し、Pages にデプロイする Action です。

![k8s Status](https://walnuts1018.github.io/k8s-badge/k8sStatus.svg)
![Pod Status](https://walnuts1018.github.io/k8s-badge/podStatus.svg)
![Node Status](https://walnuts1018.github.io/k8s-badge/nodeStatus.svg)

## Inputs

| name                | required | description                             |
| ------------------- | -------- | --------------------------------------- |
| kubeconfig          | \*       | kubeconfig の中身相当の文字列           |
| github_token        | \*       | GitHub の Token ( secrets.GITHUB_TOKEN) |
| k8sStatus-SVG-text  |          | k8s Status のラベル部分の文字列         |
| podStatus-SVG-text  |          | Pod Status のラベル部分の文字列         |
| nodeStatus-SVG-text |          | Node Status のラベル部分の文字列        |

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
name: k8s badge Build
on:
  workflow_dispatch:
  schedule:
    - cron: "0/10 * * * *" # 10分ごとに実行
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
        uses: walnuts1018/k8s-badge@v1
        with:
          kubeconfig: ${{ secrets.Kubeconfig }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```
