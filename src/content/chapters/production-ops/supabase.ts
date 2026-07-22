import type { Chapter } from "../../types";

export const supabaseDatabaseMigrationsChapter: Omit<Chapter, "number"> = {
  slug: "supabase-database-migrations",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S11", "E2", "E3", "E4"],
  title: "P05 Supabase 数据库、SQL 与迁移",
  shortTitle: "Supabase 数据库与迁移",
  phase: "平台中文教程",
  track: "工程上线",
  tags: ["Supabase", "Postgres", "SQL", "Migration"],
  duration: "45 分钟",
  level: "工程化",
  goal: "能读懂 Supabase 的 Project、Schema、Table 与 SQL 入口，并坚持用仓库迁移管理生产结构变更。",
  dependencies: ["P02 个人项目的巡检节奏"],
  terms: ["Project", "Postgres", "Schema", "Table", "SQL Editor", "Migration"],
  relatedResources: [
    "supabase-database-docs",
    "supabase-tables-docs",
    "supabase-migrations-docs",
    "supabase-database-health-docs",
  ],
  sections: [
    {
      id: "responsibility",
      title: "Supabase 是什么，数据库职责到哪里",
      blocks: [
        {
          type: "paragraph",
          text: "Supabase 为项目提供托管 Postgres、Auth、Storage 和 API。P05 只聚焦数据库职责：保存事实数据、约束结构、执行查询和记录迁移。它不负责 Vercel 构建、Inngest Run 编排，也不负责像 Sentry 那样聚合应用错误。",
        },
        {
          type: "table",
          headers: ["对象", "是什么", "不负责什么", "事实来源"],
          rows: [
            ["Project", "数据库、Auth、API 与配置的隔离边界", "前端发布与域名", "Supabase 控制台与项目配置"],
            ["Postgres", "关系数据库引擎", "后台任务重试", "Schema、约束、索引与数据"],
            ["Schema / Table", "命名空间与表结构", "应用发布版本", "仓库迁移 + 远端实际结构"],
            ["SQL Editor", "交互式执行 SQL 的控制台", "替代版本化迁移", "仅代表本次执行，不是变更历史"],
            ["Migration", "可审查、可重复的结构变更记录", "自动保证旧代码兼容", "Git 仓库中的迁移文件"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "控制台不是生产结构编辑器",
          text: "能在 Table Editor 或 SQL Editor 点按钮，不代表应直接修改生产。生产 Schema 变更必须先写迁移、在本地或隔离环境验证、评估向前和向后兼容，再进入发布流程。",
        },
      ],
    },
    {
      id: "project-overview",
      title: "先用 Project Overview 判断数据库是否可用",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/supabase/project-overview.webp",
          alt: "脱敏后的 Supabase Project Overview，标出健康状态、Compute、主数据库与连接入口",
          title: "Project Overview 的四个只读检查点",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1440,
          height: 900,
          legend: [
            { label: "1", title: "Status（状态）", detail: "Healthy 是平台健康信号，不等于每条查询和业务路径都正常。" },
            { label: "2", title: "Compute", detail: "计算规格与运行状态影响连接和性能；变更规格涉及费用与风险。" },
            { label: "3", title: "Primary Database", detail: "显示主数据库区域和资源概况；项目标识与具体连接信息已遮挡。" },
            { label: "4", title: "Connect", detail: "连接方式和 API Keys 等入口可能包含敏感信息，本课不展开。" },
          ],
          sourceUrl: "https://supabase.com/docs/guides/database/overview",
        },
        {
          type: "table",
          headers: ["信号", "正常", "异常或可疑", "下一步"],
          rows: [
            ["Project Status", "Healthy 且服务入口可用", "Paused、Unavailable 或平台事件", "先查 Supabase Status 与项目事件"],
            ["Connections", "在基线内波动", "接近上限、持续堆积", "查看连接来源、池化与长事务"],
            ["CPU / Disk", "与历史趋势一致", "持续升高或突增", "缩小到查询、索引、任务或异常流量"],
            ["API success", "成功率与请求量平稳", "关键路径错误集中上升", "按时间转到 Logs，再关联 Vercel / Sentry"],
          ],
        },
      ],
    },
    {
      id: "table-editor",
      title: "Table Editor 用于认识结构，不替代迁移",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/supabase/table-editor.webp",
          alt: "脱敏后的 Supabase Table Editor，标出 Schema、New table、搜索与创建入口",
          title: "Table Editor 的读写边界",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1440,
          height: 900,
          legend: [
            { label: "1", title: "Schema", detail: "先确认 public 或其他目标 Schema，避免同名表判断错误。" },
            { label: "2", title: "New table", detail: "创建表属于结构写操作，只在迁移与练习环境执行。" },
            { label: "3", title: "Search tables", detail: "按表名定位结构；截图中的真实表名和数据已遮挡。" },
            { label: "4", title: "Create a table", detail: "空状态也提供创建入口；生产学习中不要点击。" },
          ],
          sourceUrl: "https://supabase.com/docs/guides/database/tables",
        },
        {
          type: "table",
          headers: ["只读检查", "看什么", "不要做什么"],
          rows: [
            ["表是否存在", "Schema、表名、列与约束", "为验证而创建临时表"],
            ["结构是否匹配版本", "迁移预期与远端列、索引、约束", "直接在生产补一列再忘记写迁移"],
            ["数据量级", "行数趋势或聚合结果", "浏览真实正文、用户或敏感字段"],
            ["RLS 状态", "是否启用及策略数量", "在没有回归测试时 Disable RLS"],
          ],
        },
        {
          type: "paragraph",
          text: "Evidence Graph 案例只确认预期 Schema 和表是否存在，不打开真实研究正文或用户行。表结构与仓库迁移不一致时先停止，保存脱敏结构证据，再在本地复现差异。",
        },
      ],
    },
    {
      id: "sql-migrations",
      title: "SQL Editor 与仓库迁移的正确分工",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/supabase/sql-editor.webp",
          alt: "脱敏后的 Supabase SQL Editor，标出数据库角色、结果行上限、Run 按钮和结果区域",
          title: "SQL Editor 先识别角色与执行边界",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1440,
          height: 900,
          legend: [
            { label: "1", title: "Role（数据库角色）", detail: "高权限角色可能绕过应用限制；生产只读也要使用最小权限。" },
            { label: "2", title: "Limit rows", detail: "限制结果规模，避免无界查询拉取大量生产数据。" },
            { label: "3", title: "Run", detail: "执行任何 SQL 都可能改变状态或负载，本课不在生产点击。" },
            { label: "4", title: "Results", detail: "结果区可能包含真实数据，截图与记录必须脱敏。" },
          ],
          sourceUrl: "https://supabase.com/docs/guides/database/overview",
        },
        {
          type: "diagram",
          title: "迁移从仓库进入生产",
          chart: `flowchart LR
  C[Schema change proposal] --> M[Versioned migration]
  M --> L[Local database test]
  L --> P[Preview / isolated project]
  P --> R[Review and release plan]
  R --> D[Production migration]
  D --> V[Read-only verification]`,
        },
        {
          type: "steps",
          items: [
            { title: "写向前兼容迁移", detail: "优先新增可空列、表或索引，避免同一发布立即删除旧代码仍读取的结构。" },
            { title: "本地验证", detail: "从空库和现有快照分别应用迁移，确认可重复执行的边界和失败处理。" },
            { title: "Preview 验收", detail: "在隔离项目验证 API、RLS、Auth 与应用版本，不连接 Evidence Graph 生产数据。" },
            { title: "生产执行与只读核对", detail: "执行需要独立确认；完成后只读检查版本、结构、关键查询和错误趋势。" },
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "SQL Editor 适合什么",
          text: "适合在隔离环境探索查询和做受控诊断；最终结构变更仍要转成仓库迁移。生产诊断优先使用预先审查的只读语句、明确 LIMIT 与超时，并由单独变更流程执行。",
        },
      ],
    },
    {
      id: "failure-guide",
      title: "连接、查询与迁移异常怎么判断",
      blocks: [
        {
          type: "table",
          headers: ["症状", "先看", "常见原因", "停止条件"],
          rows: [
            ["应用无法连接", "Project 状态、连接数、Vercel Runtime Logs", "连接串环境错误、连接耗尽、网络事件", "不要反复增加连接或更换生产密钥"],
            ["查询突然变慢", "时间窗、Query Performance、CPU / Disk", "缺索引、数据增长、长事务、异常流量", "不要直接在生产跑无界 EXPLAIN ANALYZE"],
            ["列或表不存在", "应用版本与迁移历史", "迁移未应用、环境串错、发布顺序错误", "不要用控制台临时补结构"],
            ["迁移执行中断", "已执行语句、事务边界与锁", "权限、超时、数据不满足约束", "不明确部分成功状态时不要重复执行"],
          ],
        },
        {
          type: "paragraph",
          text: "正常信号是远端结构与仓库迁移一致、关键只读查询在基线内、连接和资源趋势平稳。异常不是“面板有红色”本身，而是关键路径失败、结构漂移、持续资源压力或数据完整性风险。",
        },
      ],
    },
    {
      id: "evidence-risk",
      title: "Evidence Graph 只读案例、风险与停止条件",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "确认 Project 与 Production", detail: "只读核对项目和环境标签，不展开 Connect、连接串或 API Keys。" },
            { title: "查看健康信号", detail: "记录 Status、资源趋势和时间范围，不调整 Compute。" },
            { title: "核对结构", detail: "查看目标 Schema 与表是否存在，不打开真实行、不运行 SQL。" },
            { title: "对照仓库迁移", detail: "用迁移文件解释预期结构；不一致就记录差异并停止。" },
          ],
        },
        {
          type: "table",
          headers: ["风险", "示例", "执行规则"],
          rows: [
            ["只读", "查看 Status、Schema、表结构与迁移记录", "允许在生产执行，避免读取敏感行"],
            ["普通变更", "在练习项目建表、运行迁移、增加索引", "只在本地或隔离环境执行"],
            ["高风险", "生产 DDL、删列、改约束、恢复或调整 Compute", "另行确认，准备备份、兼容与恢复方案"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "停止条件",
          text: "看到 New table、Run、Delete、Truncate、Disable RLS、Restore、Upgrade 或连接凭据时停止。无法确认 SQL 是否只读、是否持锁、影响多少行或如何恢复，也不要继续。",
        },
      ],
    },
    {
      id: "resources-checkpoint",
      title: "英文速查、官方资源与自检",
      blocks: [
        {
          type: "table",
          headers: ["英文", "中文", "关键边界"],
          rows: [
            ["Schema", "数据库命名空间", "同名表可能位于不同 Schema"],
            ["Table Editor", "可视化表结构与数据入口", "不是迁移事实来源"],
            ["SQL Editor", "交互式 SQL 控制台", "Run 是真实执行，不是预览"],
            ["Migration", "版本化结构变更", "要与应用发布顺序和兼容策略一起设计"],
            ["Connection pooling", "连接池化", "不能替代修复连接泄漏和长事务"],
          ],
        },
        {
          type: "resources",
          title: "Supabase 数据库与迁移官方文档",
          items: [
            { title: "Database Overview", url: "https://supabase.com/docs/guides/database/overview", kind: "docs", note: "托管 Postgres、连接与数据库能力总览。" },
            { title: "Tables and Data", url: "https://supabase.com/docs/guides/database/tables", kind: "docs", note: "Schema、Table 与数据入口。" },
            { title: "Database Migrations", url: "https://supabase.com/docs/guides/deployment/database-migrations", kind: "docs", note: "使用 CLI 与仓库管理迁移。" },
            { title: "Database Health", url: "https://supabase.com/docs/guides/platform/database-size", kind: "docs", note: "容量与资源检查入口之一，具体面板以当前控制台为准。" },
          ],
        },
        {
          type: "checkpoint",
          title: "P05 自检",
          criteria: [
            "能解释 Project、Postgres、Schema、Table、SQL Editor 与 Migration 的关系",
            "能只读检查 Project 状态和表结构，而不展开生产行或连接凭据",
            "能说明为什么仓库迁移是结构变更事实来源",
            "能为连接失败、慢查询和结构漂移选择第一个证据入口",
            "能在 SQL、DDL、Compute 或恢复按钮前按风险等级停止",
          ],
        },
      ],
    },
  ],
};

export const supabaseAuthRlsRecoveryChapter: Omit<Chapter, "number"> = {
  slug: "supabase-auth-rls-recovery",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P06 Supabase Auth、RLS、日志与备份",
  shortTitle: "Supabase Auth 与 RLS",
  phase: "平台中文教程",
  track: "工程上线",
  tags: ["Supabase", "Auth", "RLS", "Backups", "API Keys"],
  duration: "45 分钟",
  level: "工程化",
  goal: "能定位登录与权限异常，区分公开和服务端密钥，并判断 RLS、日志和备份是否达到最小生产安全边界。",
  dependencies: ["P05 Supabase 数据库、SQL 与迁移"],
  terms: ["Auth User", "Provider", "Redirect URL", "Session", "RLS", "Backup"],
  relatedResources: [
    "supabase-auth-docs",
    "supabase-redirect-urls-docs",
    "supabase-rls-docs",
    "supabase-logs-docs",
    "supabase-backups-docs",
    "supabase-api-keys-docs",
  ],
  sections: [
    {
      id: "auth-model",
      title: "Auth 是什么，Provider、Redirect 与 Session 如何协作",
      blocks: [
        {
          type: "paragraph",
          text: "Supabase Auth 的职责是验证身份、签发 Session 并把用户身份交给 Postgres RLS。它不负责决定每一行数据是否可见，也不负责 Vercel 路由或业务授权。登录成功只证明身份建立，是否能读写数据仍由 RLS 和应用规则决定。",
        },
        {
          type: "diagram",
          title: "登录到行权限的最小链路",
          chart: `flowchart LR
  U[User] --> P[Auth Provider]
  P --> R[Redirect URL]
  R --> S[Supabase Session]
  S --> C[Client request]
  C --> L[Postgres RLS policy]
  L --> D[Allowed rows]`,
        },
        {
          type: "table",
          headers: ["对象", "负责", "不负责"],
          rows: [
            ["Provider", "邮箱、OAuth、Phone 等登录方式", "表中行权限"],
            ["Redirect URL", "登录完成后允许返回的地址", "证明请求来自可信用户"],
            ["Session", "携带已验证身份和有效期", "永久有效或绕过 RLS"],
            ["RLS Policy", "按角色、用户和行条件授权", "替代服务端业务校验的全部职责"],
          ],
        },
      ],
    },
    {
      id: "auth-providers",
      title: "Provider 页面先看开关、回调与保存动作",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/supabase/auth-providers.webp",
          alt: "脱敏后的 Supabase Auth Providers 页面，标出用户注册、开关、Provider 列表、配置导航与保存按钮",
          title: "Auth Providers 的五个风险点",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1440,
          height: 900,
          legend: [
            { label: "1", title: "User Signups", detail: "决定是否允许新用户注册，改变它会影响真实用户入口。" },
            { label: "2", title: "Auth switches", detail: "匿名登录、邮箱确认等开关会改变身份边界，不在生产练习。" },
            { label: "3", title: "Auth Providers", detail: "逐个 Provider 核对启用状态；Client Secret 等敏感配置不得截图。" },
            { label: "4", title: "Configuration", detail: "URL、Session、Rate Limits、MFA 等入口共同决定登录行为。" },
            { label: "5", title: "Save changes", detail: "保存即生产变更；即使按钮可见，本课程也不点击。" },
          ],
          sourceUrl: "https://supabase.com/docs/guides/auth",
        },
        {
          type: "table",
          headers: ["症状", "先确认", "常见异常"],
          rows: [
            ["登录按钮不可用", "Provider 是否启用、前端配置", "环境变量串错、Provider 被关闭"],
            ["OAuth 回调失败", "Redirect URL、Site URL、Vercel Environment", "Preview / Production URL 未加入允许列表"],
            ["登录后立即失效", "Session、Cookie、域名与时间", "Cookie 作用域、服务端刷新、时钟或环境混用"],
            ["能登录但读不到数据", "RLS 与用户身份", "Policy 未覆盖操作、用户 ID 条件不匹配"],
          ],
        },
      ],
    },
    {
      id: "rls",
      title: "RLS 才是浏览器访问数据库的行级边界",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/supabase/rls-policies.webp",
          alt: "脱敏后的 Supabase Policies 页面，标出策略入口、Schema、Disable RLS、角色与策略菜单",
          title: "RLS Policies 页面只读判断点",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1440,
          height: 900,
          legend: [
            { label: "1", title: "Policies", detail: "集中查看各表 RLS 与策略，不显示真实策略正文。" },
            { label: "2", title: "Schema", detail: "策略属于具体 Schema 与表，先确认作用对象。" },
            { label: "3", title: "Disable RLS", detail: "关闭 RLS 可能暴露整表，属于高风险动作。" },
            { label: "4", title: "Applied to（角色）", detail: "authenticated、anon 等角色决定谁进入策略判断。" },
            { label: "5", title: "Policy menu", detail: "编辑或删除策略会改变权限，生产排障不应临时放宽。" },
          ],
          sourceUrl: "https://supabase.com/docs/guides/database/postgres/row-level-security",
        },
        {
          type: "table",
          headers: ["检查", "正常", "异常风险"],
          rows: [
            ["RLS 开启", "浏览器可访问表已启用 RLS", "未启用导致 API 暴露整表"],
            ["角色明确", "anon / authenticated 与用例对应", "使用过宽角色或 service role 绕过"],
            ["操作覆盖", "SELECT / INSERT / UPDATE / DELETE 按需授权", "只测读取，写入策略遗漏"],
            ["租户条件", "每行归属与 auth.uid() 等条件一致", "跨用户或跨租户可见"],
            ["回归测试", "允许和拒绝用例都存在", "只验证成功路径，未证明越权被拒绝"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "不要用 Disable RLS 调试 403",
          text: "403 / permission denied 是安全信号。先在隔离环境用同一身份、操作和行条件复现，再修 Policy 与测试。生产临时关闭 RLS 会把单个授权问题放大成数据泄漏风险。",
        },
      ],
    },
    {
      id: "logs-backups",
      title: "Logs 用于定位，Backups 用于准备恢复",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/supabase/logs-backups.webp",
          alt: "脱敏后的 Supabase Database Backups 页面，标出备份类型、当前方案能力、升级按钮与侧栏入口",
          title: "备份页面先确认能力，不执行升级或恢复",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1440,
          height: 900,
          legend: [
            { label: "1", title: "Backup modes", detail: "Scheduled、Point in time、Restore to new project 的可用性取决于当前方案。" },
            { label: "2", title: "Current capability", detail: "画面记录采集当日的提示，不应当作永久套餐说明。" },
            { label: "3", title: "Upgrade", detail: "升级涉及费用，属于高风险，本课不点击。" },
            { label: "4", title: "Backups navigation", detail: "从 Database 侧栏进入备份能力与状态检查。" },
          ],
          sourceUrl: "https://supabase.com/docs/guides/platform/backups",
        },
        {
          type: "table",
          headers: ["能力", "回答的问题", "不能证明"],
          rows: [
            ["Auth Logs", "登录、回调与身份事件是否异常", "某行数据为何被 RLS 拒绝的完整原因"],
            ["Postgres / API Logs", "查询、API、权限或连接发生了什么", "应用前端错误与用户完整轨迹"],
            ["Scheduled Backup", "平台是否按计划生成备份", "备份一定可恢复且应用兼容"],
            ["Point-in-time recovery", "是否可恢复到时间点", "恢复后外部任务和对象存储自动一致"],
          ],
        },
        {
          type: "paragraph",
          text: "备份不是恢复证明。个人项目至少每月记录备份能力、最近状态、保留边界和恢复负责人；恢复演练只在新项目或隔离环境完成，并验证 Schema、关键数据、Auth、RLS 与应用版本兼容。",
        },
      ],
    },
    {
      id: "keys",
      title: "Publishable、anon 与 service role 的安全边界",
      blocks: [
        {
          type: "table",
          headers: ["密钥 / 配置", "可见位置", "权限边界"],
          rows: [
            ["Publishable key", "浏览器可见", "依赖用户 Session 与 RLS；公开不等于无限权限"],
            ["Legacy anon key", "历史项目中可能用于浏览器", "仍必须受 RLS 约束，逐步按官方指引迁移"],
            ["Secret / service role", "仅可信服务端", "可拥有高权限或绕过 RLS，绝不能进入 NEXT_PUBLIC_*"],
            ["Project URL", "通常可公开", "不是认证凭据，但与密钥组合后必须依赖 RLS"],
            ["Redirect URL", "控制台允许列表", "防止回调到未授权域名，Preview 与 Production 分开"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "泄漏处理是高风险流程",
          text: "发现服务端密钥进入浏览器、仓库或日志时，先停止发布和扩散，记录影响范围，再按依赖顺序轮换、重新部署和验证。不要只删除 Git 中的一行就认为泄漏结束。",
        },
      ],
    },
    {
      id: "failure-guide",
      title: "登录失败、权限拒绝与泄漏风险的判断路径",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "固定用户症状与时间", detail: "记录登录方式、环境、时间和错误类别，不保存用户邮箱、Token 或真实请求正文。" },
            { title: "查 Vercel 与 Auth Logs", detail: "确认回调是否到达、环境变量和 Redirect 是否匹配，再看 Provider / Session 事件。" },
            { title: "查 RLS", detail: "身份建立但数据请求被拒绝时，核对角色、操作、表和行条件。" },
            { title: "判断正常或异常", detail: "单个过期 Session 可重新登录；持续跨用户可见、RLS 关闭或服务端密钥暴露是需立即停止的异常。" },
          ],
        },
        {
          type: "table",
          headers: ["信号", "判断", "动作"],
          rows: [
            ["OAuth 只在 Preview 失败", "Redirect 或环境配置异常", "在练习环境修正允许列表并回归"],
            ["所有用户突然 401", "Session、Provider、密钥或时钟异常", "停止发布，关联变更时间和日志"],
            ["一个用户看不到自己的行", "RLS 条件或数据归属异常", "隔离复现，不放宽全部角色"],
            ["用户能看到他人数据", "数据泄漏高风险", "立即停止相关路径，保全证据并启动响应"],
          ],
        },
      ],
    },
    {
      id: "evidence-risk",
      title: "Evidence Graph 只读案例与风险分级",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "Auth 配置", detail: "只读查看 Provider、URL Configuration 和 Session 入口，不展开 Client Secret，不改开关。" },
            { title: "RLS 覆盖", detail: "只确认目标表启用 RLS、存在对应角色和操作策略，不打开策略中的私有命名。" },
            { title: "日志时间窗", detail: "围绕一次脱敏症状检查 Auth / API 日志，不复制用户、Token、IP 或请求正文。" },
            { title: "备份准备", detail: "只读确认当前方案提供的备份能力与入口，不升级、不下载、不恢复。" },
          ],
        },
        {
          type: "table",
          headers: ["风险", "示例", "规则"],
          rows: [
            ["只读", "查看 Provider、Policy、日志和备份能力", "允许在生产执行，严格脱敏"],
            ["普通变更", "在练习项目改 Redirect、Provider、Policy", "用允许 / 拒绝测试验收"],
            ["高风险", "Disable RLS、轮换密钥、恢复备份、升级套餐", "Evidence Graph 不执行，另行确认"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "停止条件",
          text: "看到用户列表、Token、Secret、Disable RLS、Save、Delete、Restore、Rotate 或 Upgrade 时停止。无法确认身份、角色、行条件、恢复目标或费用影响，也不要继续。",
        },
      ],
    },
    {
      id: "resources-checkpoint",
      title: "英文速查、官方资源与自检",
      blocks: [
        {
          type: "table",
          headers: ["英文", "中文", "常见误区"],
          rows: [
            ["Provider", "登录方式提供方", "启用 Provider 不等于 Redirect 配置正确"],
            ["Session", "已验证身份的会话", "登录成功不等于拥有所有数据权限"],
            ["RLS", "行级安全", "不能用前端隐藏按钮替代"],
            ["Service role", "高权限服务端角色", "绝不能作为浏览器公开变量"],
            ["Backup", "备份副本", "存在备份不等于恢复演练成功"],
          ],
        },
        {
          type: "resources",
          title: "Supabase Auth、安全与恢复官方文档",
          items: [
            { title: "Auth", url: "https://supabase.com/docs/guides/auth", kind: "docs", note: "身份、Provider 与 Session 总览。" },
            { title: "Redirect URLs", url: "https://supabase.com/docs/guides/auth/redirect-urls", kind: "docs", note: "Site URL、允许列表与 Preview 回调。" },
            { title: "Row Level Security", url: "https://supabase.com/docs/guides/database/postgres/row-level-security", kind: "docs", note: "RLS、角色与 Policy 语义。" },
            { title: "Logs", url: "https://supabase.com/docs/guides/platform/logs", kind: "docs", note: "平台日志入口与能力。" },
            { title: "Backups", url: "https://supabase.com/docs/guides/platform/backups", kind: "docs", note: "备份、时间点恢复与当前可用性。" },
            { title: "API Keys", url: "https://supabase.com/docs/guides/api/api-keys", kind: "docs", note: "Publishable、Secret 与历史密钥边界。" },
          ],
        },
        {
          type: "checkpoint",
          title: "P06 自检",
          criteria: [
            "能解释 Provider、Redirect URL、Session 与 RLS 的协作关系",
            "能区分登录失败和 RLS 权限拒绝的第一个证据入口",
            "能说明 publishable / anon 与 secret / service role 的浏览器边界",
            "能说明备份为什么不等于恢复成功，并列出隔离恢复验收项",
            "能完成 Evidence Graph 只读检查，并在 RLS、密钥、恢复和费用按钮前停止",
          ],
        },
      ],
    },
  ],
};
