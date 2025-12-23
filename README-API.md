# 前端项目说明

## 项目结构

```
src/
├── api/              # API接口定义
│   ├── product.ts   # 产品相关API
│   ├── sale.ts      # 销售相关API
│   └── stock.ts     # 库存相关API
├── layout/          # 布局组件
│   └── index.vue    # 主布局（侧边栏+内容区）
├── router/          # 路由配置
│   └── index.ts     # 路由定义
├── types/           # TypeScript类型定义
│   └── api.ts       # API相关类型
├── utils/           # 工具函数
│   └── request.ts   # Axios封装
└── views/           # 页面组件
    ├── Product/     # 产品管理页面
    ├── Sale/        # 销售管理页面
    └── Stock/       # 库存管理页面
```

## 功能模块

### 1. 产品管理 (`/product`)
- 显示所有产品列表
- 支持按ID、名称、价格、库存等字段排序
- 显示产品状态（上架/下架）
- 库存数量颜色标识（绿色>50，黄色>10，红色≤10）

### 2. 销售管理 (`/sale`)
- 产品销售表单
- 输入产品ID、销售数量、销售员ID
- 表单验证
- 销售确认对话框

### 3. 库存管理 (`/stock`)
- 产品入库表单
- 产品出库表单
- 支持同时进行入库和出库操作
- 表单验证和确认对话框

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript
- **Element Plus** - Vue 3 UI组件库
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue状态管理
- **Axios** - HTTP客户端
- **Vite** - 下一代前端构建工具

## API接口

### 产品接口
- `GET /api/product/list` - 获取所有产品
- `GET /api/product/{id}` - 根据ID获取产品

### 销售接口
- `POST /api/sale/sell` - 销售产品
  - 参数: productId, quantity, salesmanId

### 库存接口
- `POST /api/stock/in` - 产品入库
  - 参数: productId, quantity, operatorId
- `POST /api/stock/out` - 产品出库
  - 参数: productId, quantity, operatorId

## 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 配置说明

### 代理配置
在 `vite.config.ts` 中配置了API代理：
- 前端运行在 `http://localhost:80`
- 后端API运行在 `http://localhost:8080`
- 所有 `/api` 请求会自动代理到后端

### 响应格式
所有API响应统一使用 `Result<T>` 格式：
```typescript
{
  code: number,    // 0-成功，非0-失败
  message: string, // 响应消息
  data: T         // 响应数据
}
```

## 注意事项

1. 确保后端服务已启动（端口8080）
2. 确保数据库连接正常
3. 所有表单都有完整的验证规则
4. 操作前会有确认对话框
5. 错误信息会自动通过Element Plus的Message组件显示

