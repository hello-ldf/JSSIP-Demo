# JSSIP 演示项目

这是一个基于 JSSIP 库的简单 SIP 客户端演示项目，使用 TypeScript 和 Vite 构建。

## 功能特性

- SIP 用户注册和注销
- 音频通话功能（呼叫和接听）
- 实时状态显示
- 现代化的用户界面
- 错误处理和用户反馈

## 技术栈

- **前端框架**: TypeScript + Vite
- **SIP 库**: JSSIP 3.10.1
- **样式**: 原生 CSS
- **构建工具**: Vite 6.3.5

## 安装和运行

### 前提条件

- Node.js 18+ (推荐使用 Node.js 18.15.0 或更高版本)
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

项目将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 配置说明

### SIP 服务器配置

项目默认配置了以下参数：

- **SIP 账号**: `sip:test10@192.168.110.5`
- **密码**: `test10`
- **服务器**: `ws://192.168.110.5:5066`
- **目标号码**: `sip:test12@192.168.110.5`

## 使用说明

1. **启动开发服务器**: 运行 `npm run dev`
2. **配置 SIP 参数**: 在网页界面中填写 SIP 账号、密码和服务器地址
3. **注册**: 点击"注册"按钮连接到 SIP 服务器
4. **呼叫**: 输入目标号码，点击"呼叫"按钮发起通话
5. **接听**: 收到来电时，点击"接听"按钮接听通话
6. **挂断**: 点击"挂断"按钮结束通话

## 项目结构

```
sipdemo/
├── src/
│   └── main.ts          # 主要 TypeScript 代码
├── public/              # 静态资源
├── index.html           # 主页面
├── opensips.cfg         # OpenSIPS 配置文件
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
└── README.md           # 项目说明
```

## 故障排除

### 网络连接问题

- 确保 SIP 服务器地址正确
- 检查防火墙设置
- 验证 WebSocket 端口是否开放
- 确保 OpenSIPS 服务器正在运行

### 浏览器兼容性

- 推荐使用 Chrome、Firefox、Safari 等现代浏览器
- 需要支持 WebRTC 和 WebSocket
- 确保浏览器允许访问麦克风权限

### 调试技巧

1. 打开浏览器开发者工具 (F12)
2. 查看控制台输出，项目已添加详细的调试日志
3. 检查网络面板中的 WebSocket 连接状态
4. 验证 SIP 服务器配置是否正确
5. 查看 edge://webrtc-internals/ 

## 许可证

本项目仅供学习和演示使用。 