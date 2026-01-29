# Pomodoro Sync - 多端同步番茄钟应用

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)
![Vite](https://img.shields.io/badge/Vite-4-646CFF.svg)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E.svg)

**Pomodoro Sync** 是一个现代化的、支持多端实时同步的番茄工作法应用。无论是在电脑、平板还是手机上，您的专注时间和任务列表都能保持秒级同步。应用支持 PWA，可直接安装到设备，提供原生应用般的流畅体验。

## ✨ 核心特性

- **⏱️ 多端实时同步**：基于 Supabase Realtime，一个设备开始计时，所有设备同步倒数。
- **👤 灵活的账户体系**：
  - **游客模式**：无需注册即可使用，数据存储在本地。
  - **用户登录**：支持邮箱/密码登录，数据云端存储，多设备漫游。
- **📝 任务管理**：轻量级任务列表，支持增删改查及完成状态标记。
- **🌍 多语言支持**：内置国际化 (i18n)，支持中文和英文一键切换。
- **📱 PWA 支持**：
  - 可安装到桌面或手机主屏幕。
  - 支持离线访问静态资源。
- **🎨 响应式设计**：基于 Tailwind CSS，完美适配各种屏幕尺寸。
- **🛡️ 隐私安全**：完善的 RLS (Row Level Security) 策略，确保用户数据隔离。

## 🛠️ 技术栈

- **前端框架**：[React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**：[Vite](https://vitejs.dev/)
- **样式方案**：[Tailwind CSS](https://tailwindcss.com/) + [lucide-react](https://lucide.dev/) (图标)
- **后端服务**：[Supabase](https://supabase.com/) (Auth, Database, Realtime)
- **状态管理**：[Zustand](https://github.com/pmndrs/zustand) (支持中间件持久化)
- **国际化**：[i18next](https://www.i18next.com/)
- **PWA**：[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

## 🚀 快速开始

### 1. 环境准备
确保您的本地已安装 [Node.js](https://nodejs.org/) (推荐 v16+) 和 [Git](https://git-scm.com/)。

### 2. 克隆项目
```bash
git clone https://github.com/dylmhai2026/P2-Pomodoro.git
cd TraeP2_pomodoro
```

### 3. 安装依赖
```bash
npm install
```

### 4. 配置环境变量
在项目根目录创建 `.env.local` 文件，并填入您的 Supabase 配置信息：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **注意**：您需要先在 Supabase 上创建一个项目。

### 5. 初始化数据库
登录 Supabase 控制台，进入 SQL Editor，执行项目目录下的 `supabase/schema.sql` 文件内容，以创建必要的表结构和安全策略。

### 6. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 `http://localhost:5173` 即可看到应用。

## 📂 项目结构

```
/
├── public/              # 静态资源 (PWA icons, manifest)
├── src/
│   ├── components/      # UI 组件 (Auth, Timer, TaskList...)
│   ├── lib/             # 工具库 (supabase client, i18n)
│   ├── pages/           # 页面组件 (Dashboard)
│   ├── store/           # Zustand 状态管理 (auth, timer, task)
│   ├── App.tsx          # 根组件
│   └── main.tsx         # 入口文件
├── supabase/
│   └── schema.sql       # 数据库初始化 SQL
├── .env.local           # 环境变量 (需自行创建)
├── index.html           # HTML 入口
├── tailwind.config.js   # Tailwind 配置
├── vite.config.ts       # Vite & PWA 配置
└── package.json         # 项目依赖
```

## 📦 构建与部署

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

### 部署
本项目可以轻松部署到 [Vercel](https://vercel.com) 或 [Netlify](https://www.netlify.com)。
1. 将代码推送到 GitHub。
2. 在 Vercel/Netlify 导入项目。
3. 在部署设置中添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 环境变量。
4. 点击部署！

## 🤝 贡献指南
欢迎提交 Issue 和 Pull Request 来改进这个项目！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议
本项目采用 [MIT](LICENSE) 协议开源。
