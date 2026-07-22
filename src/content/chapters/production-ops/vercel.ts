import type { Chapter } from "../../types";

export const vercelCoreOperationsChapter: Omit<Chapter, "number"> = {
  slug: "vercel-core-operations",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P03 Vercel 核心对象与常用操作",
  shortTitle: "Vercel 核心操作",
  phase: "平台中文教程",
  track: "工程上线",
  tags: ["Vercel", "Deployment", "Build Logs", "环境变量"],
  duration: "45 分钟",
  level: "基础",
  goal: "能从 Project 找到正确的 Deployment、构建日志和环境变量作用域，并判断当前版本是否已进入目标环境。",
  dependencies: ["P01 托管生产系统地图", "P02 个人项目的巡检节奏"],
  terms: [
    "Team",
    "Project",
    "Deployment",
    "Environment",
    "Domain",
    "Build Logs",
    "Environment Variables",
  ],
  relatedResources: [
    "vercel-deployments-docs",
    "vercel-environments-docs",
    "vercel-environment-variables-docs",
    "vercel-builds-docs",
  ],
  sections: [
    {
      id: "responsibility",
      title: "Vercel 是什么，职责到哪里",
      blocks: [
        {
          type: "paragraph",
          text: "Vercel 是面向 Web 应用的托管与发布平台。它的职责是把 Git 提交构建成 Deployment，并把 Web、Route Handler、Server Function、静态资源和域名交付给用户。日常运维先确认“哪个 Project、哪个 Environment、哪个 Deployment”，再看日志，不要从一个错误页面直接猜根因。",
        },
        {
          type: "table",
          headers: ["Vercel 负责", "Vercel 不负责", "需要去哪里确认"],
          rows: [
            ["Git 构建、部署状态、域名与 Web 请求", "Supabase 数据、Auth 与 RLS", "数据库或登录异常回到 Supabase"],
            ["Build Logs、Runtime Logs、流量与平台用量", "Inngest Run 的步骤、重试和并发", "后台任务异常回到 Inngest"],
            ["应用版本进入 Preview 或 Production", "Sentry Issue、Trace 与前端调用栈", "错误聚合与版本关联回到 Sentry"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "先确定作用域",
          text: "Account / Team 是权限与计费边界，Project 是应用配置边界，Deployment 是一次不可变构建结果。页面显示 Ready 只能证明该 Deployment 完成，不代表业务、数据库或后台任务都正常。",
        },
      ],
    },
    {
      id: "object-map",
      title: "Account、Project、Deployment、Environment 与 Domain",
      blocks: [
        {
          type: "diagram",
          title: "Vercel 核心对象关系",
          chart: `flowchart LR
  A[Account / Team] --> P[Project]
  G[Git Repository] --> P
  P --> D1[Preview Deployment]
  P --> D2[Production Deployment]
  E[Environment Variables] --> D1
  E --> D2
  DM[Domain] --> D2`,
        },
        {
          type: "table",
          headers: ["对象", "中文理解", "常用判断"],
          rows: [
            ["Project", "一个应用的构建、变量、域名与日志集合", "仓库和框架配置是否指向正确应用"],
            ["Deployment", "一次提交或手动动作产生的不可变发布结果", "状态、来源 commit、创建时间与目标环境是否一致"],
            ["Environment", "Development / Preview / Production 配置作用域", "变量和数据资源有没有串到错误环境"],
            ["Domain", "把访问入口映射到某个 Production Deployment", "正式域名当前解析到哪个版本"],
          ],
        },
        {
          type: "steps",
          items: [
            { title: "从 GitHub 导入", detail: "选择仓库后确认 Framework、Root Directory、Build Command 与 Output；首次导入属于普通变更，只在练习项目执行。" },
            { title: "分支生成 Preview", detail: "PR 或非生产分支通常创建 Preview Deployment，用隔离变量验收后再合并。" },
            { title: "生产分支发布", detail: "Production Branch 的新提交触发 Production Deployment，完成后还要验证正式域名与关键路径。" },
            { title: "记录版本证据", detail: "保存 Deployment 链接、commit、环境、完成时间和验收结论，不复制机密或日志正文。" },
          ],
        },
      ],
    },
    {
      id: "deployments-list",
      title: "从 Deployments 列表确认线上版本",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/vercel/deployments.webp",
          alt: "脱敏后的 Vercel Deployments 列表，标出状态、环境、时间、筛选和导航入口",
          title: "Deployments 列表的五个判断点",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1536,
          height: 682,
          legend: [
            { label: "1", title: "Status（状态）", detail: "Ready 表示构建与发布流程完成；Failed、Canceled 需要进入详情。" },
            { label: "2", title: "Environment（环境）", detail: "Production 与 Preview 的变量、域名和风险不同，先确认再操作。" },
            { label: "3", title: "Created（创建时间）", detail: "用时间把用户症状与部署关联，注意控制台时区。" },
            { label: "4", title: "Filters（筛选）", detail: "按环境、仓库、分支或状态缩小范围，避免把 Preview 当线上版本。" },
            { label: "5", title: "Deployments 导航", detail: "从项目侧栏回到所有发布记录，是发布巡检的固定入口。" },
          ],
          sourceUrl: "https://vercel.com/docs/deployments",
        },
        {
          type: "table",
          headers: ["状态", "中文含义", "下一步"],
          rows: [
            ["Ready", "构建并发布完成", "打开详情核对环境、版本，再走关键路径验收"],
            ["Building", "构建仍在执行", "等待完成；超出基线再查 Build Logs"],
            ["Queued", "等待构建资源或前序任务", "短时正常；持续积压时看并发和平台状态"],
            ["Failed / Error", "构建或部署失败", "进入 Build Logs，定位第一个有效错误"],
            ["Canceled", "构建被系统或用户终止", "确认取消原因，不直接重复触发"],
          ],
        },
      ],
    },
    {
      id: "build-logs",
      title: "Build Logs 只回答构建阶段问题",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/vercel/build-logs.webp",
          alt: "脱敏后的 Vercel 构建日志，标出日志区域、复制入口、警告和搜索",
          title: "从 Build Logs 找第一个有效信号",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1536,
          height: 682,
          legend: [
            { label: "1", title: "Logs（构建日志）", detail: "记录拉取代码、安装依赖、构建和产物上传；不包含线上请求。" },
            { label: "2", title: "Copy lines（复制行）", detail: "只复制必要且已脱敏的上下文，不整段粘贴可能含私有信息的日志。" },
            { label: "3", title: "Warning（警告）", detail: "警告不一定阻断发布，但版本不一致或弃用项应进入技术债清单。" },
            { label: "4", title: "Find in logs（搜索）", detail: "优先搜索 error、failed、exit code，再向上找触发原因。" },
          ],
          sourceUrl: "https://vercel.com/docs/deployments/builds",
        },
        {
          type: "callout",
          tone: "warning",
          title: "最后一行不一定是根因",
          text: "构建日志末尾常只是 exit code。先找到第一个明确的 TypeScript、依赖、环境变量或框架错误，再核对它前后的文件与命令；不要通过反复 Redeploy 掩盖确定性失败。",
        },
        {
          type: "table",
          headers: ["现象", "先查", "正常 / 异常判断"],
          rows: [
            ["安装依赖失败", "锁文件、Node 版本、包源", "一次网络抖动可重试；稳定复现是依赖契约异常"],
            ["TypeScript / lint 失败", "首个文件与行号", "应在本地复现并修代码，不在控制台绕过门禁"],
            ["Missing environment variable", "变量名与 Environment 作用域", "值不可进日志；缺失或作用域错误才是问题"],
            ["构建明显变慢", "缓存是否命中、依赖与产物变化", "对比历史基线，不用单次时长下结论"],
          ],
        },
      ],
    },
    {
      id: "environment-variables",
      title: "环境变量：名称、作用域与可见性",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/vercel/environment-variables.webp",
          alt: "脱敏后的 Vercel Environment Variables 页面，变量值完全遮挡，标出添加入口、环境筛选、敏感标记和作用域",
          title: "变量页面只核对名称和作用域，不读取值",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1536,
          height: 682,
          legend: [
            { label: "1", title: "Environment Variables", detail: "项目级变量入口；查看前先确认当前 Project。" },
            { label: "2", title: "Add Environment Variable", detail: "新增或修改属于普通变更，本课只解释，不在生产练习。" },
            { label: "3", title: "Environment 筛选", detail: "用 Production、Preview、Development 检查变量是否进入预期作用域。" },
            { label: "4", title: "Sensitive（敏感）", detail: "敏感标记降低误读风险，但不能替代服务端边界和密钥轮换。" },
            { label: "5", title: "变量作用域", detail: "列表中的 Production 等标签决定后续 Deployment 能否读取该变量。" },
          ],
          sourceUrl: "https://vercel.com/docs/environment-variables",
        },
        {
          type: "table",
          headers: ["变量类型", "可放什么", "绝对不要"],
          rows: [
            ["NEXT_PUBLIC_*", "浏览器可以公开读取的 URL、publishable 标识", "service role、签名密钥、Provider secret"],
            ["Server-only Secret", "数据库高权限、Webhook 签名、Provider 凭据", "输出到浏览器、日志、截图或仓库"],
            ["Environment-specific", "Preview 与 Production 各自的资源地址和回调", "让 Preview 默认连接生产写权限"],
          ],
        },
        {
          type: "paragraph",
          text: "变量保存后通常只影响新的 Deployment。仅在控制台看到变量名不代表当前线上版本已经读取它；普通变更应在练习环境修改并重新部署验证。轮换密钥、扩大权限或改生产回调属于高风险，必须准备依赖清单、验收与恢复方案。",
        },
      ],
    },
    {
      id: "evidence-graph-case",
      title: "Evidence Graph 只读检查与停止条件",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "确认当前 Production Deployment", detail: "在 Deployments 按 Production 筛选，记录 Ready 状态、时间和版本证据。" },
            { title: "查看构建结论", detail: "只读打开该 Deployment 的 Build Logs，确认完成并记录警告，不复制私有输出。" },
            { title: "核对变量作用域", detail: "只查看变量名、Sensitive 标记和 Production / Preview 标签，不展开或复制值。" },
            { title: "形成结论后停止", detail: "若版本与作用域都正确，记录 Evidence Graph 的检查时间和后台链接，不执行 Redeploy 或编辑变量。" },
          ],
        },
        {
          type: "table",
          headers: ["风险", "本课示例", "规则"],
          rows: [
            ["只读", "筛选 Deployment、查看状态与 Build Logs", "允许在生产执行并记录"],
            ["普通变更", "改 Preview 变量、重新部署练习项目", "只在独立练习环境执行"],
            ["高风险", "改生产密钥、域名、Production Branch", "停止并另行确认影响与恢复路径"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "停止条件",
          text: "看到 Add、Edit、Remove、Redeploy、Promote、Rollback、Delete 或域名配置时不要继续。无法确认 Project、Environment、变量用途或当前用户权限，也应退出并记录疑问。",
        },
      ],
    },
    {
      id: "glossary-resources",
      title: "英文速查、常见误区与官方资源",
      blocks: [
        {
          type: "table",
          headers: ["英文", "中文", "容易误解的地方"],
          rows: [
            ["Deployment", "一次发布结果", "不是 Project，也不是持续变化的服务器"],
            ["Production", "生产环境", "标签本身不能保证连接的是生产资源"],
            ["Promote", "把既有 Deployment 提升为生产", "不是重新构建；配置兼容性仍需确认"],
            ["Redeploy", "基于既有来源再构建", "会产生新 Deployment，不等于回滚"],
            ["Build Logs", "构建阶段日志", "不能解释发布后的用户请求错误"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "常见误区",
          text: "Ready 不等于业务健康；有 Production 标签不等于正式域名已指向该版本；变量存在不等于当前 Deployment 已读取；反复 Redeploy 不能修复稳定复现的代码或配置错误。",
        },
        {
          type: "resources",
          title: "Vercel 核心操作官方文档",
          items: [
            { title: "Deployments", url: "https://vercel.com/docs/deployments", kind: "docs", note: "Deployment 生命周期、状态和入口。" },
            { title: "Environments", url: "https://vercel.com/docs/deployments/environments", kind: "docs", note: "Production、Preview、Development 的官方语义。" },
            { title: "Environment Variables", url: "https://vercel.com/docs/environment-variables", kind: "docs", note: "变量作用域、敏感数据和部署生效规则。" },
            { title: "Builds", url: "https://vercel.com/docs/deployments/builds", kind: "docs", note: "构建流程、缓存和 Build Logs。" },
          ],
        },
        {
          type: "checkpoint",
          title: "P03 自检",
          criteria: [
            "能解释 Team、Project、Deployment、Environment 与 Domain 的关系",
            "能从 Deployments 判断目标环境、状态、时间和当前版本",
            "能区分 Build Logs 与 Runtime Logs 各自回答的问题",
            "能说明 NEXT_PUBLIC_* 与服务端机密的边界，并在写操作前停止",
            "能完成一次 Evidence Graph 只读检查且不展开变量值、不触发部署",
          ],
        },
      ],
    },
  ],
};

export const vercelReleaseObservabilityChapter: Omit<Chapter, "number"> = {
  slug: "vercel-release-observability",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P04 Vercel 发布、日志、流量与回滚",
  shortTitle: "Vercel 发布与回滚",
  phase: "平台中文教程",
  track: "工程上线",
  tags: ["Vercel", "发布", "Runtime Logs", "Usage", "Rollback"],
  duration: "45 分钟",
  level: "工程化",
  goal: "能完成发布后验收，区分构建失败与运行时异常，并根据版本、日志和流量证据选择观察、修复或回滚评估。",
  dependencies: ["P03 Vercel 核心对象与常用操作"],
  terms: ["Redeploy", "Promote", "Rollback", "Runtime Logs", "Analytics", "Usage"],
  relatedResources: [
    "vercel-managing-deployments-docs",
    "vercel-logs-docs",
    "vercel-observability-docs",
    "vercel-usage-docs",
  ],
  sections: [
    {
      id: "release-actions",
      title: "四种发布动作不是同一件事",
      blocks: [
        {
          type: "paragraph",
          text: "Vercel 的职责是把版本交付到目标环境并提供运行信号，不负责判断数据库迁移、后台任务副作用或业务数据是否兼容。发布动作必须与 Supabase、Inngest、Sentry 的证据一起判断，不能把控制台按钮当作万能修复。",
        },
        {
          type: "table",
          headers: ["动作", "发生什么", "适合场景", "风险"],
          rows: [
            ["Git 自动部署", "新提交触发新构建和 Deployment", "正常发布流程", "普通变更；先过 Preview 与门禁"],
            ["Redeploy", "对既有来源重新构建，产生新 Deployment", "偶发构建基础设施问题或配置已修正", "普通变更；不会修复未改的代码"],
            ["Promote", "把已验证的既有 Deployment 指向 Production", "希望避免重新构建导致产物变化", "高风险；需确认变量、数据和域名兼容"],
            ["Rollback", "让生产流量回到更早的 Deployment", "新版本导致严重且可由旧版缓解的回归", "高风险；数据库与任务副作用可能不可逆"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "回滚只回 Web 版本",
          text: "Vercel Rollback 不会自动撤销 Supabase 迁移、已发送的 Inngest Event、外部 Provider 副作用或密钥变化。旧代码若不兼容新 Schema，回滚反而可能扩大故障。",
        },
      ],
    },
    {
      id: "deployment-detail",
      title: "Deployment 详情是发布验收起点",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/vercel/deployment-detail.webp",
          alt: "脱敏后的 Vercel Deployment 详情，标出状态、环境、时长、日志入口和构建日志摘要",
          title: "Deployment 详情的五个验收入口",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1536,
          height: 682,
          legend: [
            { label: "1", title: "Status（状态）", detail: "Ready Latest 表示该版本构建完成并且是此作用域的最新结果。" },
            { label: "2", title: "Environment（环境）", detail: "Production / Preview 决定变量、域名和操作风险。" },
            { label: "3", title: "Duration（构建时长）", detail: "与历史基线比较；单次时长不能直接证明性能回归。" },
            { label: "4", title: "Logs（日志入口）", detail: "跳转查看此 Deployment 相关日志，先限定版本与时间范围。" },
            { label: "5", title: "Build Logs", detail: "展开构建阶段输出；警告数量不等于线上错误数量。" },
          ],
          sourceUrl: "https://vercel.com/docs/deployments/managing-deployments",
        },
        {
          type: "steps",
          items: [
            { title: "核对版本", detail: "记录 commit、Deployment URL、Environment 与完成时间，确认与计划发布一致。" },
            { title: "核对正式入口", detail: "从正式 Domain 访问，而不是只看 Deployment URL；验证首页、登录和一个核心只读路径。" },
            { title: "核对异步链路", detail: "若发布会触发任务，去 Inngest 查看 Run；若有错误，去 Sentry 按同一版本和时间筛选。" },
            { title: "记录结论", detail: "写下通过、继续观察、修复或回滚评估，并附后台链接；不要粘贴生产正文。" },
          ],
        },
      ],
    },
    {
      id: "runtime-logs",
      title: "Runtime Logs 解释部署后的请求",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/vercel/runtime-logs.webp",
          alt: "脱敏后的 Vercel Runtime Logs，标出时间线、状态码、搜索、筛选和请求列表",
          title: "用时间、状态码与筛选缩小 Runtime Logs",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1536,
          height: 682,
          legend: [
            { label: "1", title: "Timeline（时间线）", detail: "先围绕用户症状建立窄时间窗，避免在全部日志中搜索。" },
            { label: "2", title: "Status（状态码）", detail: "2xx 只表示请求处理完成；4xx、5xx 需结合 Route 与日志详情。" },
            { label: "3", title: "Search logs（搜索）", detail: "搜索已知 request、route 或错误类别，不输入密钥和生产正文。" },
            { label: "4", title: "Filters（筛选）", detail: "按 Environment、Route、Request Path、Console Level 逐层收窄。" },
          ],
          sourceUrl: "https://vercel.com/docs/logs",
        },
        {
          type: "table",
          headers: ["症状", "先看哪里", "排除 / 下一步"],
          rows: [
            ["构建 Failed", "Build Logs", "不查 Runtime Logs；版本尚未上线"],
            ["Ready 但页面 500", "Runtime Logs + Sentry Event", "若 Vercel 函数报错，按时间和版本修复"],
            ["登录 401 / 403", "Runtime Logs 后转 Supabase Auth / RLS", "Vercel 只提供请求入口，权限事实在 Supabase"],
            ["任务已接收但无结果", "Runtime Logs 后转 Inngest Runs", "找到 event / run 时间线，不在 Web 请求里等待长任务"],
            ["页面静态资源异常", "Deployment、浏览器 Network、Sentry", "核对资源路径、basePath、缓存和 release"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "正常与异常是趋势判断",
          text: "零星 4xx 可能是用户输入或爬虫，连续 5xx、同一路由错误上升、只在新版本出现或关键路径不可用才是明确异常。先限定 Environment、版本和时间，再判断是否需要动作。",
        },
      ],
    },
    {
      id: "analytics-usage",
      title: "Analytics、Observability 与 Usage 各回答什么",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/vercel/analytics-usage.webp",
          alt: "脱敏后的 Vercel Usage 页面，标出时间范围、套餐入口、总览和网络用量分类",
          title: "Usage 页面先看时间范围和变化趋势",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1536,
          height: 682,
          legend: [
            { label: "1", title: "Time range（时间范围）", detail: "比较同样长度的时间窗，避免把月累计与单日混看。" },
            { label: "2", title: "Plan action（套餐动作）", detail: "升级涉及费用，属于高风险，本课不点击。" },
            { label: "3", title: "Overview（用量总览）", detail: "先找相对基线突然抬升的产品项，再进入详情。" },
            { label: "4", title: "Networking（网络用量）", detail: "请求数与传输量异常时，结合 Route、CDN、爬虫和错误重试判断。" },
          ],
          sourceUrl: "https://vercel.com/docs/limits",
        },
        {
          type: "table",
          headers: ["入口", "回答的问题", "不能单独证明"],
          rows: [
            ["Web Analytics", "访问、页面和来源的变化", "后端错误根因或真实业务转化"],
            ["Observability", "请求、函数、路径与运行趋势", "数据库权限或后台 Run 的内部状态"],
            ["Runtime Logs", "某个时间窗内请求发生了什么", "长期趋势与完整用户体验"],
            ["Usage", "资源消耗、额度和异常增长", "某次请求为什么失败"],
          ],
        },
        {
          type: "paragraph",
          text: "个人项目每周比较同长度时间窗，关注请求、函数执行、传输和错误是否同步抬升。不要在教程中写死价格或免费额度；套餐会变化，以当前 Usage 与官方 Limits 页面为准。异常流量先查 Route、来源、缓存和失败重试，再考虑限流或套餐动作。",
        },
      ],
    },
    {
      id: "release-decision",
      title: "从症状到修复、观察或回滚评估",
      blocks: [
        {
          type: "table",
          headers: ["证据", "更可能的动作", "不要做什么"],
          rows: [
            ["构建稳定失败，旧版仍正常", "本地复现并修复后重新提交", "连续 Redeploy 同一份代码"],
            ["新版本关键路径 5xx，旧版兼容当前数据", "停止发布，准备高风险回滚评估", "只因一条日志就立即回滚"],
            ["Ready 且 Vercel 正常，Supabase 权限拒绝", "转到 Supabase 证据链修复", "改 Vercel 构建设置"],
            ["Inngest Run 大量失败且有副作用", "停止重放，分析幂等和下游状态", "用 Replay 制造更多重复操作"],
            ["错误率平稳，仅 Usage 短时升高", "缩小来源和时间窗，继续观察", "直接升级套餐或屏蔽全部流量"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "高风险动作前的最低条件",
          text: "执行 Promote、Rollback、改 Production 变量或套餐前，必须确认目标版本、数据库兼容性、后台任务副作用、验收路径、负责人和恢复方式。本课程只做决策练习，不操作 Evidence Graph 生产环境。",
        },
      ],
    },
    {
      id: "evidence-graph-case",
      title: "Evidence Graph 发布后只读验收",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "版本证据", detail: "只读确认 Production Deployment 为计划版本，并记录状态、时间和详情链接。" },
            { title: "关键路径", detail: "访问正式域名的首页、登录入口与一个只读业务页面，不创建或修改生产数据。" },
            { title: "运行信号", detail: "在窄时间窗查看 Vercel Runtime Logs；再核对 Sentry 新 Issue 和 Inngest 失败 Run。" },
            { title: "用量信号", detail: "查看 Usage 同长度时间窗是否有异常抬升，不展开费用和账号详情。" },
            { title: "结论与停止", detail: "信号正常就记录验收通过并停止；异常则保全时间、版本和链接，再进入相应平台。" },
          ],
        },
        {
          type: "paragraph",
          text: "Evidence Graph 案例只展示经过脱敏的真实界面。截图中的账号、项目、域名、提交、请求路径和消息均已遮挡；它用于学习入口与判断，不证明当前线上仍处于同一状态。",
        },
      ],
    },
    {
      id: "glossary-resources",
      title: "英文速查、误区、停止条件与官方资源",
      blocks: [
        {
          type: "table",
          headers: ["英文", "中文理解", "判断重点"],
          rows: [
            ["Redeploy", "重新构建并发布", "来源不变时，确定性错误通常仍会出现"],
            ["Promote", "把既有版本提升到生产", "产物不重建，但配置与数据仍要兼容"],
            ["Rollback", "切回较早的 Web Deployment", "不撤销数据库、任务或外部副作用"],
            ["Runtime Logs", "部署后的请求日志", "用 Environment、版本、时间和 Route 收窄"],
            ["Usage", "平台资源消耗", "看趋势和异常增长，不写死套餐数字"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "常见误区与停止条件",
          text: "不要把 Ready 当作验收完成，不要用 Analytics 代替错误日志，不要因单次 5xx 或流量峰值直接回滚。看到 Promote、Rollback、Upgrade、Delete、变量编辑或域名切换时停止；无法说明跨平台副作用也不要继续。",
        },
        {
          type: "resources",
          title: "Vercel 发布与观测官方文档",
          items: [
            { title: "Managing Deployments", url: "https://vercel.com/docs/deployments/managing-deployments", kind: "docs", note: "重新部署、提升和回滚的当前入口与语义。" },
            { title: "Logs", url: "https://vercel.com/docs/logs", kind: "docs", note: "Build、Runtime 与相关日志能力。" },
            { title: "Observability", url: "https://vercel.com/docs/observability", kind: "docs", note: "请求、函数和性能信号入口。" },
            { title: "Limits and Usage", url: "https://vercel.com/docs/limits", kind: "docs", note: "当前资源限制与 Usage 说明，避免依赖过期额度数字。" },
          ],
        },
        {
          type: "checkpoint",
          title: "P04 自检",
          criteria: [
            "能说明 Git 部署、Redeploy、Promote 与 Rollback 的差异和风险",
            "能用 Deployment 详情完成版本、环境、时间和关键路径验收",
            "能从 Ready 但页面异常的症状进入 Runtime Logs，并知道何时转到 Supabase、Inngest 或 Sentry",
            "能用 Analytics、Observability、Logs 与 Usage 回答不同问题",
            "能为 Evidence Graph 写出观察、修复或回滚评估结论，并在高风险按钮前停止",
          ],
        },
      ],
    },
  ],
};
