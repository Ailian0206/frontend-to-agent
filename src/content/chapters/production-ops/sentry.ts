import type { Chapter } from "../../types";

export const sentryIssuesReleasesSourcemapsChapter: Omit<Chapter, "number"> = {
  slug: "sentry-issues-releases-sourcemaps",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P09 Sentry Issue、Event、Release 与 Source Map",
  shortTitle: "Sentry 错误与版本",
  phase: "平台中文教程",
  track: "工程上线",
  tags: ["Sentry", "Issue", "Event", "Release", "Source Map"],
  duration: "45 分钟",
  level: "基础",
  goal: "能从 Issue 进入单次 Event，按环境和 Release 判断错误是否回归，并知道 Source Map 缺失时下一步看哪里。",
  dependencies: ["P03 Vercel 核心对象与常用操作", "P04 Vercel 发布、日志、流量与回滚"],
  terms: ["Project", "Issue", "Event", "Release", "Stack Trace", "Source Map"],
  relatedResources: [
    "sentry-issues-docs",
    "sentry-events-docs",
    "sentry-releases-docs",
    "sentry-source-maps-docs",
  ],
  sections: [
    {
      id: "responsibility",
      title: "Sentry 是什么，错误观测职责到哪里",
      blocks: [
        {
          type: "paragraph",
          text: "Sentry 的职责是接收应用上报的错误和性能信号，把相似 Event 聚合为 Issue，并用 Environment、Release、Trace 等上下文帮助定位。它不替代 Vercel Runtime Logs、Supabase 数据事实或 Inngest Run，也不自动修复错误。",
        },
        {
          type: "table",
          headers: ["对象", "是什么", "不负责"],
          rows: [
            ["Project", "一组应用错误与性能事件的隔离边界", "部署、数据库或任务执行"],
            ["Issue", "按相似性聚合后的问题桶", "证明每个用户都遇到同一症状"],
            ["Event", "某一次具体错误或事务样本", "代表全部流量的统计结论"],
            ["Release", "与代码版本关联的发布标识", "自动保证 Source Map 已上传"],
            ["Stack Trace", "错误发生的调用路径", "还原被脱敏或丢失的业务正文"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "Issue 是入口，不是根因",
          text: "Issue 的数量、趋势和聚合规则帮助排优先级；真正的修复要回到 Release、代码、Vercel 请求、Supabase 数据或 Inngest Run 验证。",
        },
      ],
    },
    {
      id: "issues",
      title: "Issues 列表：先筛环境、时间和状态",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/sentry/issues.webp",
          alt: "脱敏后的 Sentry Issues 列表，标出搜索筛选、Issue 条目、时间范围、趋势列和聚合说明",
          title: "Issues 列表的五个只读检查点",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "Search / query", detail: "用环境、状态、Release 或错误类别缩小范围，不输入用户隐私。" },
            { label: "2", title: "Issue row", detail: "条目代表相似事件的聚合，不要从标题猜完整根因。" },
            { label: "3", title: "Last seen / trend", detail: "最近发生与趋势用于判断回归和持续性，需结合时间窗。" },
            { label: "4", title: "Events / Users", detail: "事件与用户数量帮助排序，脱敏后的示例不展示真实身份。" },
            { label: "5", title: "Grouping explanation", detail: "Sentry 按 Stack Trace 等因素聚合，聚合错误需要进入 Event 复核。" },
          ],
          sourceUrl: "https://docs.sentry.io/product/issues/",
        },
        {
          type: "table",
          headers: ["信号", "正常 / 可疑", "下一步"],
          rows: [
            ["New issue", "新版本后首次出现", "关联 Release、时间与关键路径"],
            ["Regression", "已解决问题重新出现", "比较修复版本与当前 Release"],
            ["Ignored / resolved", "已知低影响问题不再打扰", "若重新发生或影响扩大，重新评估"],
            ["Event / User spike", "事件或用户突然上升", "缩小 Environment、Route、Release 和时间窗"],
          ],
        },
        {
          type: "paragraph",
          text: "正常不等于零 Issue：开发错误、已知浏览器异常或被过滤的噪声都可能存在。明确异常通常是关键路径失败、同一 Release 的错误持续上升、回归或出现隐私泄漏迹象。",
        },
      ],
    },
    {
      id: "issue-detail",
      title: "Issue Detail：从聚合进入一个 Event",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/sentry/issue-detail.webp",
          alt: "脱敏后的 Sentry Issue Detail 页面，标出解决按钮、优先级、事件筛选、时间线和 Highlights 区域",
          title: "Issue Detail 的五个证据入口",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "Resolve / status", detail: "解决或归档会改变团队工作流；先确认问题是否真的消失。" },
            { label: "2", title: "Priority / assignee", detail: "优先级和负责人用于协作，不是错误严重性的自动证明。" },
            { label: "3", title: "Events in this issue", detail: "从聚合进入单次 Event，按 First / Latest 选择代表样本。" },
            { label: "4", title: "Event tabs", detail: "Highlights、Trace、Tags、Context 提供不同证据维度。" },
            { label: "5", title: "Highlights", detail: "展示环境、版本与摘要；真实正文、路径和标识已遮挡。" },
          ],
          sourceUrl: "https://docs.sentry.io/product/issues/issue-details/",
        },
        {
          type: "steps",
          items: [
            { title: "固定上下文", detail: "记录 Environment、Release、发生时间、路由类别和 Issue 链接。" },
            { title: "选择代表 Event", detail: "比较 First / Latest，确认是持续错误、回归还是单次噪声。" },
            { title: "关联外部证据", detail: "用时间、版本、request / trace 标识回到 Vercel、Supabase 或 Inngest。" },
            { title: "决定状态", detail: "记录、继续观察、修复或停止操作；不要为了清空列表而 Resolve。" },
          ],
        },
      ],
    },
    {
      id: "event-detail",
      title: "Event Detail：只读环境、版本与 Highlights",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/sentry/event-stack.webp",
          alt: "脱敏后的 Sentry Event Detail 裁剪图，展示事件元数据、环境、版本与 Highlights；Stack Trace 内容已遮挡",
          title: "Event Detail 的元数据与 Highlights",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1320,
          height: 335,
          legend: [
            { label: "1", title: "Events in this issue", detail: "当前 Event 属于哪个 Issue 聚合，时间和标识已脱敏。" },
            { label: "2", title: "Environment / Release", detail: "用环境和版本判断是否为 Production 回归，不展示真实 Release SHA。" },
            { label: "3", title: "Highlights", detail: "保留 handled、level、transaction 等教学元数据，具体值已遮挡。" },
            { label: "4", title: "Trace / URL", detail: "Trace 和请求路径只作为关联线索，具体 ID 与 URL 已遮挡。" },
          ],
          sourceUrl: "https://docs.sentry.io/product/issues/issue-details/",
        },
        {
          type: "callout",
          tone: "note",
          title: "这张图没有声称展示真实 Stack Trace",
          text: "event-stack.webp 是干净的 Event Detail 裁剪，重点是 Event metadata、Release 与 Highlights；调用栈和请求内容已遮挡，正文不要把这张图描述成可读取的真实 Stack Trace。",
        },
        {
          type: "table",
          headers: ["字段", "用途", "隐私边界"],
          rows: [
            ["Environment", "区分 Production、Preview、Development", "不公开项目或域名"],
            ["Release", "关联提交和 Source Map", "Release SHA 与内部版本可脱敏"],
            ["Transaction / URL", "判断路由和性能入口", "请求路径、参数、Token 不进入记录"],
            ["Trace", "关联性能链路", "Trace ID 只在内部证据记录中保存"],
          ],
        },
      ],
    },
    {
      id: "releases-sourcemaps",
      title: "Release 与 Source Map 决定错误是否可读",
      blocks: [
        {
          type: "table",
          headers: ["问题", "正常信号", "异常处理"],
          rows: [
            ["版本归属", "Event 有明确 Release，与 Deployment commit 对应", "核对构建注入的 release 名称和发布顺序"],
            ["前端调用栈", "函数名、文件和行号可读", "检查 Source Map 上传、版本匹配和隐藏源码配置"],
            ["回归判断", "新旧 Release 可比较", "不要只看 Issue 标题，比较 First / Latest Event"],
            ["采样与丢失", "关键错误持续上报", "检查采样、过滤、Rate Limit 与 SDK 配置"],
          ],
        },
        {
          type: "paragraph",
          text: "Release 连接的是代码版本，不是 GitHub 提交页面的截图。Source Map 只帮助 Sentry 把压缩后的前端位置还原成可读调用栈，不会恢复已经被日志脱敏或未上报的业务正文。",
        },
      ],
    },
    {
      id: "evidence-case",
      title: "脱敏案例：只读检查与风险",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "按时间与版本筛 Issue", detail: "从新 Issue 或回归开始，记录 Environment、Release、Last seen 与链接。" },
            { title: "进入代表 Event", detail: "查看元数据和 Highlights，不展开用户、请求正文、Breadcrumbs 或内部路径。" },
            { title: "串联平台事实", detail: "用时间、Release、request / trace 关联 Vercel Runtime Logs、Supabase Logs 或 Inngest Runs。" },
            { title: "形成决策", detail: "若只是已知噪声记录并结束；若关键路径回归则保全证据，转修复或回滚评估。" },
          ],
        },
        {
          type: "paragraph",
          text: "本案例只读 Issue、Event、Release 和 Highlights；所有真实项目名、域名、Issue / Event / Trace ID、请求路径与错误正文均已遮挡。",
        },
        {
          type: "table",
          headers: ["风险", "Sentry 示例", "规则"],
          rows: [
            ["只读", "筛 Issue、查看 Event、Release 和 Tags", "允许在生产执行，严格隐私过滤"],
            ["普通变更", "练习环境修改 Alert、采样或 Source Map 发布", "先用测试事件验证"],
            ["高风险", "关闭隐私过滤、导出用户数据、批量 Resolve", "停止并另行确认"],
          ],
        },
      ],
    },
    {
      id: "resources-checkpoint",
      title: "英文速查、官方资源与自检",
      blocks: [
        {
          type: "table",
          headers: ["英文", "中文", "关键判断"],
          rows: [
            ["Issue", "聚合问题", "不等于一次 Event"],
            ["Event", "单次事件", "可关联环境、版本和时间"],
            ["Release", "代码版本标识", "要与 Deployment 和 Source Map 对齐"],
            ["Regression", "回归", "已解决问题在新版本重新出现"],
            ["Source Map", "源码映射", "帮助调用栈可读，不恢复隐私正文"],
          ],
        },
        {
          type: "resources",
          title: "Sentry Issue 与版本官方文档",
          items: [
            { title: "Issues", url: "https://docs.sentry.io/product/issues/", kind: "docs", note: "Issue 聚合、状态与筛选。" },
            { title: "Issue Details", url: "https://docs.sentry.io/product/issues/issue-details/", kind: "docs", note: "从 Issue 进入 Event 和上下文。" },
            { title: "Releases", url: "https://docs.sentry.io/product/releases/", kind: "docs", note: "Release、回归和版本关联。" },
            { title: "Source Maps", url: "https://docs.sentry.io/platforms/javascript/sourcemaps/", kind: "docs", note: "前端压缩代码的 Source Map 上传与匹配。" },
          ],
        },
        {
          type: "checkpoint",
          title: "P09 自检",
          criteria: [
            "能解释 Project、Issue、Event、Release、Stack Trace 与 Source Map 的关系",
            "能从 Issues 选择代表 Event，并按 Environment、Release、时间和趋势判断回归",
            "能说明 Source Map 缺失时先查版本与上传，而不是直接换模型或回滚",
            "能把 Sentry 线索与 Vercel、Supabase、Inngest 的事实日志串联",
            "能完成一次脱敏案例只读检查，并在导出、隐私和批量状态按钮前停止",
          ],
        },
      ],
    },
  ],
};

export const sentryTracesAlertsPrivacyChapter: Omit<Chapter, "number"> = {
  slug: "sentry-traces-alerts-privacy",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P10 Sentry Trace、告警、隐私与额度",
  shortTitle: "Sentry Trace 与隐私",
  phase: "平台中文教程",
  track: "工程上线",
  tags: ["Sentry", "Trace", "Alert", "PII", "Sampling", "Usage"],
  duration: "45 分钟",
  level: "工程化",
  goal: "能用 Trace、Transaction、Span 和 Alert 判断性能趋势，配置隐私过滤与采样边界，并按用量信号控制噪声和成本。",
  dependencies: ["P09 Sentry Issue、Event、Release 与 Source Map"],
  terms: ["Trace", "Transaction", "Span", "Alert", "Sampling", "PII", "Quota"],
  relatedResources: [
    "sentry-traces-docs",
    "sentry-alerts-docs",
    "sentry-sampling-docs",
    "sentry-privacy-docs",
    "sentry-usage-docs",
  ],
  sections: [
    {
      id: "responsibility",
      title: "Trace、Alert、隐私与额度各自负责什么",
      blocks: [
        {
          type: "paragraph",
          text: "Sentry 在本课的职责是把一次请求的性能链路、错误趋势、告警触发和数据保留规则放在同一观测系统里。不负责替代 Vercel 的请求日志、Supabase 的数据库指标或 Inngest 的 Run 状态；也不负责自动决定采样会不会丢掉关键证据。",
        },
        {
          type: "table",
          headers: ["能力", "回答的问题", "不能单独证明"],
          rows: [
            ["Trace / Transaction / Span", "一次请求在哪一段耗时", "数据库内部慢查询根因"],
            ["Alert", "何时通知团队", "告警触发就等于用户受影响"],
            ["Sampling", "哪些事件被采集", "未采样事件不存在异常"],
            ["PII / Scrubbing", "哪些数据被过滤或脱敏", "已进入第三方系统的数据自动消失"],
            ["Usage / Quota", "采集量、错误量与额度趋势", "某条错误的业务严重性"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "性能线索要回事实来源",
          text: "Trace 能指出慢在哪个 Transaction 或 Span；要修复仍需回到 Vercel Route、Supabase 查询、Inngest Step 或代码版本验证，不要只调高采样或关闭告警。",
        },
      ],
    },
    {
      id: "traces",
      title: "Traces：从总时长进入 Transaction 与 Span",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/sentry/traces.webp",
          alt: "脱敏后的 Sentry Traces 页面，标出 Trace 详情、搜索、Open in Discover、Issue 关联和时间线区域",
          title: "Traces 的五个诊断入口",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "Trace detail", detail: "一次请求的全链路容器；Trace 标识已遮挡。" },
            { label: "2", title: "Search in trace", detail: "按 Transaction、Span 或脱敏属性缩小范围。" },
            { label: "3", title: "Open in Discover", detail: "转到聚合查询看趋势，查询结果可能包含敏感字段。" },
            { label: "4", title: "Issue link", detail: "性能或错误可关联 Issue；关联不是根因证明。" },
            { label: "5", title: "Timeline", detail: "比较各 Span 时长和并行关系，定位耗时段。" },
          ],
          sourceUrl: "https://docs.sentry.io/product/explore/traces/",
        },
        {
          type: "table",
          headers: ["层级", "中文理解", "先问什么"],
          rows: [
            ["Trace", "一次端到端请求链路", "时间、环境和 Release 是否匹配"],
            ["Transaction", "一个可观测入口或请求", "哪类页面 / API 慢"],
            ["Span", "调用、查询或外部依赖片段", "耗时集中在数据库、网络还是代码"],
            ["P95 / P99", "长尾延迟指标", "是全量趋势还是少量异常样本"],
          ],
        },
        {
          type: "paragraph",
          text: "正常性能需要和同一环境、同一 Release、同一时间窗的基线比较。一次冷启动或单个慢用户不一定是异常；持续的 P95 上升、同一路由长尾扩散或与新版本同时出现才值得进入故障流程。",
        },
      ],
    },
    {
      id: "alerts",
      title: "Alerts：把趋势转成可行动通知",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/sentry/alerts.webp",
          alt: "脱敏后的 Sentry Alerts 列表，标出创建告警、最近触发时间、通知方式、关联项目和监控数量",
          title: "Alerts 列表的五个检查点",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "Create Alert", detail: "创建或修改告警是普通变更，需在练习环境验证阈值和通知。" },
            { label: "2", title: "Last triggered", detail: "最近触发时间用于判断噪声、持续性和版本关联。" },
            { label: "3", title: "Actions", detail: "Email、Slack 等通知动作应遵守团队隐私与值班边界。" },
            { label: "4", title: "Monitors", detail: "监控数量和关联项目帮助发现重复规则或漏配。" },
            { label: "5", title: "Alert categories", detail: "Error、Metric、Cron 等类型回答不同问题，先选对信号。" },
          ],
          sourceUrl: "https://docs.sentry.io/product/alerts/",
        },
        {
          type: "table",
          headers: ["告警类型", "适合监控", "不适合"],
          rows: [
            ["Error alert", "新 Issue、回归、错误率", "把每个已知低影响错误都通知全员"],
            ["Metric alert", "P95、吞吐、失败率趋势", "用单个噪声样本作为阈值"],
            ["Cron / monitor", "定时任务未按时运行", "替代 Inngest Run 的步骤级诊断"],
            ["Uptime / check", "入口可达性", "证明登录、权限和数据都正确"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "告警不是行动本身",
          text: "每条告警都应有负责人、时间窗、证据入口、升级条件和关闭标准。没有明确动作的告警只会制造通知噪声；告警触发后先验证用户影响，不要直接回滚。",
        },
      ],
    },
    {
      id: "usage-privacy",
      title: "Usage、PII 清理、采样与安全隐私",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/sentry/usage-privacy.webp",
          alt: "脱敏后的 Sentry Stats & Usage 与 Security & Privacy 纵向组合页，标出用量分类、隐私设置和数据清理区域",
          title: "Usage 与 Security & Privacy 的联合巡检",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1600,
          height: 1128,
          legend: [
            { label: "1", title: "Usage time / category", detail: "按时间与 Errors、Transactions 等类别看采集趋势。" },
            { label: "2", title: "Errors overview", detail: "总量、Accepted、Filtered、Rate Limited 和 Invalid 要分开解释。" },
            { label: "3", title: "Security & Privacy", detail: "组织级隐私开关入口；当前状态已遮挡，不能从截图猜配置。" },
            { label: "4", title: "Data Scrubbing", detail: "服务端清理、默认清理和 IP 处理是数据边界，不是事后补救。" },
          ],
          sourceUrl: "https://docs.sentry.io/security-legal-pii/",
        },
        {
          type: "table",
          headers: ["控制点", "正常 / 异常", "实践"],
          rows: [
            ["PII scrubbing", "敏感字段在上报前被过滤", "默认清理 + 业务字段白名单，避免把正文送入 Sentry"],
            ["IP handling", "按组织政策处理 IP", "按需关闭或匿名化，不把 IP 当用户身份主键"],
            ["Sampling", "关键错误完整、性能按预算采样", "错误与事务采样分开设计，记录 release 和配置版本"],
            ["Rate limited / Invalid", "偶发可接受；持续上升是异常", "检查 SDK、配额、事件大小与过滤规则"],
            ["Usage / quota", "与业务量趋势相符", "异常增长先降噪和修过滤，不直接升级套餐"],
          ],
        },
        {
          type: "paragraph",
          text: "真实项目的隐私设置状态不应从截图推断，页面组合图只用于认识入口和字段。生产要在代码 SDK、服务端 scrubber、组织设置和保留策略四处共同验证；改隐私或采样属于普通变更，泄漏处置与导出数据属于高风险。",
        },
      ],
    },
    {
      id: "cross-platform",
      title: "Sentry 与 Vercel、Supabase、Inngest 的互补边界",
      blocks: [
        {
          type: "table",
          headers: ["症状", "第一个入口", "交叉验证"],
          rows: [
            ["页面 500", "Sentry Issue / Event", "Vercel Runtime Logs 与 Release"],
            ["API 403 / 数据为空", "Supabase RLS / Auth Logs", "Sentry Event 与 Vercel request"],
            ["任务无结果", "Inngest Run / Step", "Sentry Error 与 Supabase 写入"],
            ["页面变慢", "Sentry Trace", "Vercel Route、Supabase query、Inngest Step"],
            ["用量异常", "Sentry Usage", "Vercel Usage、Inngest Usage 与流量基线"],
          ],
        },
        {
          type: "diagram",
          title: "从观测线索回到事实来源",
          chart: `flowchart LR
  S[Sentry Issue / Trace] --> V[Vercel request / release]
  S --> D[Supabase Auth / DB logs]
  S --> I[Inngest Run / Step]
  V --> X[Decision: observe, fix, rollback review, stop]
  D --> X
  I --> X`,
        },
      ],
    },
    {
      id: "evidence-case",
      title: "脱敏案例：只读检查与停止条件",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "看错误趋势", detail: "按 Production、Release 和同一时间窗筛 Issue，区分新问题、回归与噪声。" },
            { title: "看性能趋势", detail: "按 Transaction / Span 观察 P95 与长尾，不复制 Trace、URL 或用户字段。" },
            { title: "看告警与隐私", detail: "只读查看规则入口、Usage 分类和隐私控制区域，不保存当前状态或导出数据。" },
            { title: "回到事实平台", detail: "按症状关联 Vercel、Supabase、Inngest，证据足够就记录结论并停止。" },
          ],
        },
        {
          type: "paragraph",
          text: "本案例只读错误、Trace、告警、用量和隐私入口；截图中的组织、项目、用户、ID、路径、Release SHA 和状态均已遮挡，不代表当前线上配置。",
        },
        {
          type: "table",
          headers: ["风险", "示例", "规则"],
          rows: [
            ["只读", "筛 Issue / Trace、查看 Alert 与 Usage", "允许在生产执行，遵守数据最小化"],
            ["普通变更", "练习环境调整采样、scrubbing、Alert", "用 fixture 事件验证覆盖与噪声"],
            ["高风险", "导出事件、关闭隐私、批量修改组织策略", "停止、保全证据并另行确认"],
          ],
        },
      ],
    },
    {
      id: "resources-checkpoint",
      title: "英文速查、官方资源与自检",
      blocks: [
        {
          type: "table",
          headers: ["英文", "中文", "关键判断"],
          rows: [
            ["Trace / Transaction / Span", "链路 / 事务 / 片段", "从总时长定位具体耗时段"],
            ["Alert", "告警", "必须绑定动作、负责人和关闭标准"],
            ["Sampling", "采样", "错误与性能采样预算分开设计"],
            ["PII scrubbing", "个人信息清理", "尽量在上报前清理，不靠事后删除"],
            ["Rate Limited / Invalid", "限流 / 无效事件", "持续上升说明 SDK、配额或过滤异常"],
          ],
        },
        {
          type: "resources",
          title: "Sentry 性能、告警、隐私与用量官方文档",
          items: [
            { title: "Traces", url: "https://docs.sentry.io/product/explore/traces/", kind: "docs", note: "Trace、Transaction、Span 与性能探索。" },
            { title: "Alerts", url: "https://docs.sentry.io/product/alerts/", kind: "docs", note: "错误、指标和定时监控告警。" },
            { title: "Sampling", url: "https://docs.sentry.io/platforms/javascript/configuration/sampling/", kind: "docs", note: "错误与性能采样配置。" },
            { title: "PII and Data Scrubbing", url: "https://docs.sentry.io/security-legal-pii/", kind: "docs", note: "隐私、PII 与数据清理边界。" },
            { title: "Quotas and Usage", url: "https://docs.sentry.io/product/accounts/quotas/", kind: "docs", note: "当前配额和用量，以官方页面为准。" },
          ],
        },
        {
          type: "checkpoint",
          title: "P10 自检",
          criteria: [
            "能解释 Trace、Transaction、Span、Alert、Sampling、PII 与 Usage 的边界",
            "能从 Trace 找到慢的 Transaction / Span，并回到 Vercel、Supabase 或 Inngest 验证",
            "能为告警写出阈值、负责人、证据入口和关闭标准",
            "能说明为什么隐私清理、采样和用量要同时在 SDK 与组织设置检查",
            "能完成一次脱敏案例只读巡检，并在导出、关闭隐私或批量修改前停止",
          ],
        },
      ],
    },
  ],
};
