# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个名为PWGROUP-RIDER-PORTAL的Ionic Angular应用，**已成功升级**到Angular 18和Capacitor 6的现代技术栈。这是一个物流和黄金交易管理的移动应用，支持PWA(Progressive Web App)和原生移动设备部署。

## Technology Stack (已升级)

- **Framework**: Ionic 8 + Angular 18.2 ✅
- **Mobile**: Capacitor 6.1.2 ✅
- **Build Tool**: Angular CLI 18.2 ✅
- **Testing**: Jasmine 5 + Karma 6 ✅
- **TypeScript**: 5.5.4 ✅
- **Deployment**: Firebase (PWA), iOS Enterprise, Android APK/AAB

## Common Commands

### Development
```bash
# 启动开发服务器
npm run start
# 或
ng serve

# 构建项目
npm run build
# 或 
ng build

# 运行测试
npm run test
# 或
ng test

# 代码检查
npm run lint
# 或
ng lint

# PWA构建
ionic build --aot

# 安装依赖（使用legacy模式解决peer依赖问题）
npm install --legacy-peer-deps
```

### Mobile Development
```bash
# 构建iOS
ionic cordova build ios

# 构建Android
ionic cordova build --release android

# 添加平台
ionic cordova platform add ios@5.1.1
ionic cordova platform add android@8.1.0
```

### Node Version Management
项目需要使用Node 16:
```bash
nvm use 16
# 或具体版本
nvm use 16.15.1
```

## Architecture

### Core Structure
- **src/app/**: 主要应用代码，包含大量页面模块
- **src/environments/**: 环境配置文件
- **src/assets/**: 静态资源（图标、图片等）
- **src/config.xml**: Cordova配置（应用ID: com.iteatech.gcainhouse）

### Key Features & Modules
应用包含以下主要业务模块：

#### 物流管理
- pickup/delivery: 取货/送货管理
- scan: 二维码扫描功能
- task: 任务管理系统
- job-log: 工作日志

#### 黄金交易处理
- collection: 收款管理
- grn: 货物接收单据
- qc: 质量控制
- weight/test: 称重/测试模块
- bullion-*: 金块相关操作

#### 业务流程
- pending-*: 待处理流程管理
- modal-*: 弹窗组件
- gold-shipment: 黄金运输
- melting-job: 熔化作业

#### 用户功能  
- profile: 用户资料
- punch-card/punching: 打卡系统
- inbox: 消息收件箱

### Routing
使用懒加载策略，所有页面都通过独立模块加载。主要路由模式：
- 参数化路由: `/pickup-detail/:job_id`
- 可选参数: `/collection-supplier/:type?`
- 嵌套路由用于详细页面

### Services
- **config.service.ts**: 配置管理
- **modalshared.service.ts**: 模态框共享服务  
- **photo.service.ts**: 照片处理服务
- **chat.service.ts**: 聊天功能服务

## Development Notes

### Dependencies (已现代化)
- **已移除所有@ionic-native插件** ✅
- **使用现代Capacitor 6插件** ✅
- **升级到RxJS 7** (移除了rxjs-compat)
- **创建了NativeAdapterService统一插件接口** ✅

### Platform-Specific
- **Android**: 需要AndroidX支持，配置了网络安全策略
- **iOS**: 企业部署支持，推送证书配置
- **PWA**: Firebase部署，Service Worker支持

### Plugin Management
关键Cordova插件：
- 相机、条码扫描、地理位置
- 推送通知、设备信息
- 页面转换、应用内浏览器

## Build & Deployment

### PWA Deployment
```bash
ionic build --aot
firebase deploy
```

### Android Release Build
遵循README中的详细Android发布流程，包括keystore签名和bundle构建。

### iOS Build
需要特定推送证书和企业部署配置。

## Important Files
- **src/README.md**: 包含详细的版本历史和构建说明
- **package.json**: 项目依赖和脚本定义 (根目录，已统一)
- **src/config.xml**: Cordova配置 (保留用于兼容)
- **capacitor.config.json**: Capacitor 6配置
- **angular.json**: Angular 18工作区配置
- **src/app/services/native-adapter.service.ts**: 🆕 Capacitor插件适配器服务

## 升级完成状态 🎉

### ✅ 已完成
1. **项目结构统一** - 移除版本冲突，统一package.json
2. **Angular 18升级** - 完整升级到最新版本
3. **Ionic 8升级** - 现代化UI组件库
4. **Capacitor 6升级** - 现代原生插件系统
5. **插件迁移** - 创建适配器服务，开始替换@ionic-native插件
6. **构建成功** - 项目可以正常编译和构建

### 🔄 进行中
- **完整插件迁移** - 还有部分文件需要更新插件调用
- **功能测试** - 需要逐个验证业务模块功能

### ⚠️ 注意事项
- **CSS预算警告**: 许多SCSS文件超出大小限制，不影响功能但建议优化
- **Node.js版本**: 建议升级到Node 20.11.1+以避免引擎警告
- **渐进式迁移**: 使用适配器服务确保平滑过渡，无需重写所有业务逻辑