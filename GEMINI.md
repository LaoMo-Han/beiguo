# 呗果 (Beiguo) - Project Context

呗果是一个为《异环》设计的轻量化、静态游戏数据与资讯站。

## 项目概述 (Project Overview)

- **核心架构**: Next.js 16 (App Router) 静态生成的站点。
- **数据管理**: 无数据库设计。所有数据（角色、资讯、活动等）均以 JSON 格式存储在 `data/` 目录下，并通过 `src/lib/content.ts` 进行类型化访问。
- **视觉风格**: 模拟游戏内浏览器风格 (Discovery Page)，使用 `BrowserShell` 组件作为全局包装器。
- **技术栈**: Next.js, React 19, TypeScript, Vanilla CSS, pnpm.

## 核心指令 (Core Commands)

- `pnpm dev`: 启动本地开发服务器。
- `pnpm build`: 执行 Next.js 生产构建（输出静态资源）。
- `pnpm start`: 启动生产服务器。
- `pnpm typecheck`: 执行 TypeScript 类型检查。

## 目录结构 (Directory Structure)

- `data/`: 存放所有业务数据 JSON 文件。
  - `posts.json`: 文章、公告、攻略。
  - `characters.json`: 角色基础资料。
  - `events.json`: 游戏内活动节点。
  - `modules.json` & `module-details.json`: 页面模块配置及详情。
- `src/app/`: Next.js 路由定义。
  - `modules/[slug]/`: 模块详情页。
  - `posts/[slug]/`: 文章详情页。
- `src/components/`: 可复用的 React 组件。
  - `BrowserShell.tsx`: 核心页面框架。
- `src/lib/`: 工具函数与数据层逻辑。
  - `content.ts`: 数据导入与查询 API。
- `public/assets/`: 站点视觉素材与图标。

## 开发规范 (Development Conventions)

1. **数据驱动**: 修改内容应优先修改 `data/*.json` 文件。
2. **样式系统**: 使用 Vanilla CSS。项目采用 "Tone" 概念进行主题配色（如 `tone-cyan`, `tone-pink`），在 CSS 类中体现。
3. **类型安全**: 所有从 JSON 导入的数据在 `src/lib/content.ts` 中都有严格的 TypeScript 类型定义。
4. **无障碍**: 保持 `BrowserShell` 和核心组件的 ARIA 标签完整，模拟真实的系统界面交互。

## 维护提示 (Maintenance)

- 如果新增了数据类型，需同步更新 `src/lib/content.ts` 中的类型定义。
- 静态页面生成依赖于 `data/` 中的 slug，确保 slug 的唯一性。
