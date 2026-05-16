# 呗果 - 异环游戏数据与资讯

呗果是一个轻量化异环游戏站，面向公告、攻略、活动、角色资料和社区精选内容。

## 特点

- Next.js App Router 静态站
- 无数据库，内容来自仓库内 JSON 文件
- 首页为游戏内浏览器风格发现页
- 详情页和数据页均可静态生成

## 内容维护

- `data/posts.json`：资讯、攻略、公告、社区内容
- `data/characters.json`：角色资料
- `data/events.json`：活动节点
- `public/assets/`：站内视觉素材

## 本地开发

```bash
pnpm install
pnpm dev
```

## 验证

```bash
pnpm typecheck
pnpm build
```
