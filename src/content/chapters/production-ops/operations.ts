import type { Chapter } from "../../types";

export const releaseChecksRollbackChapter: Omit<Chapter, "number"> = {
  slug: "release-checks-rollback",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P11 发布前后检查与回滚决策",
  shortTitle: "发布检查与回滚",
  phase: "联合运维",
  track: "工程上线",
  tags: ["发布", "验收", "Rollback", "Runbook"],
  duration: "40 分钟",
  level: "工程化",
  goal: "能在一次发布前后核对变量、迁移、回调、版本和关键路径，并根据证据决定观察、修复、回滚评估或停止。",
  dependencies: ["P03–P10 四个平台课程"],
  terms: ["Release Check", "Compatibility", "Rollback", "Redeploy", "Evidence"],
  relatedResources: [
    "vercel-managing-deployments-docs",
    "supabase-migrations-docs",
    "inngest-functions-docs",
    "sentry-releases-docs",
  ],
  sections: [
    {
      id: "pre-release",
      title: "发布前：先证明依赖兼容",
      blocks: [
        {
          type: "table",
          headers: ["检查项", "Vercel", "Supabase", "Inngest", "Sentry"],
          rows: [
            ["版本", "Preview Deployment、构建结果", "迁移版本与 Schema", "App 同步与 Function 版本", "Release 与 Source Map"],
            ["配置", "Environment Variables 与 Domain", "Auth URL、RLS、连接资源", "签名、触发与并发", "DSN、采样、隐私清理"],
            ["兼容性", "Web / API 入口", "向前兼容迁移", "Event payload 与幂等", "事件字段与版本标签"],
            ["证据", "Deployment 链接和 commit", "迁移文件与只读核对", "Function / Run 链接", "Issue / Trace 查询"],
          ],
        },
        {
          type: "steps",
          items: [
            { title: "锁定变更范围", detail: "写下代码、变量、数据库迁移、Auth 回调、后台任务和观测配置，不把未计划改动混入发布。" },
            { title: "先跑 Preview", detail: "使用隔离变量和 fixture 验证首页、登录、只读数据、事件、Run、Issue 与 Trace。" },
            { title: "确认迁移顺序", detail: "先部署兼容结构，再发布读取新字段的代码；删除旧结构必须拆成后续发布。" },
            { title: "写发布记录", detail: "记录负责人、时间窗、回滚条件、验收路径和停止条件。" },
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "发布前的停止条件",
          text: "变量来源不明、迁移未在隔离环境验证、Auth Redirect 未区分环境、Inngest 副作用不可幂等或 Sentry 无法关联 Release 时，不要继续进入 Production。",
        },
      ],
    },
    {
      id: "post-release",
      title: "发布后：用同一时间窗验收四个平台",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "Vercel", detail: "确认 Production Deployment、正式域名、Build / Runtime Logs 和关键页面。" },
            { title: "Supabase", detail: "确认迁移完成、Auth 回调、只读查询、RLS 拒绝路径和资源趋势。" },
            { title: "Inngest", detail: "确认 Event、Run 状态、失败 Step、队列和幂等行为。" },
            { title: "Sentry", detail: "确认新 Release、Issue、Trace、Alert 和 Usage 没有异常抬升。" },
          ],
        },
        {
          type: "table",
          headers: ["证据组合", "更可能的决策", "不要做什么"],
          rows: [
            ["构建失败，未进入 Production", "本地修复后重新提交", "重复 Redeploy 同一错误代码"],
            ["Ready + 关键路径 5xx + 新 Issue", "停止继续发布，修复或回滚评估", "只看绿色 Deployment 状态"],
            ["Ready + Auth 403 + RLS 异常", "转 Supabase 权限证据链", "改 Vercel 变量掩盖权限问题"],
            ["Run 失败 + Event 重复 + Usage 上升", "停止 Replay，检查幂等和下游", "批量重放试图“清空失败”"],
          ],
        },
      ],
    },
    {
      id: "rollback-record",
      title: "Redeploy、修复与 Rollback 的选择",
      blocks: [
        {
          type: "table",
          headers: ["动作", "选择条件", "额外确认"],
          rows: [
            ["继续观察", "错误单次、关键路径正常、趋势未扩大", "设下一次检查时间"],
            ["代码修复 + 新发布", "错误可稳定复现且旧版无需立即切回", "迁移与任务兼容"],
            ["Redeploy", "构建基础设施或缓存偶发问题", "确认代码与变量没有变化"],
            ["Rollback 评估", "关键路径持续不可用，旧版与当前数据兼容", "数据库、任务副作用、验收和负责人"],
            ["停止操作", "证据不足、数据风险或副作用未知", "保全时间、版本、链接和日志类别"],
          ],
        },
        {
          type: "code",
          language: "markdown",
          filename: "release-record-YYYY-MM-DD.md",
          code: `# 发布记录

- 版本 / Deployment：
- 时间窗 / 负责人：
- Vercel：版本、域名、关键路径
- Supabase：迁移、Auth、RLS、只读查询
- Inngest：Event、Run、失败率、幂等
- Sentry：Release、Issue、Trace、Alert
- 结论：通过 | 观察 | 修复 | 回滚评估 | 停止
- 回滚条件与恢复方式：
- 下一次检查：`,
          caption: "只记录链接、类别和结论，不粘贴用户、密钥、请求正文或生产数据。",
        },
        {
          type: "paragraph",
          text: "本案例的发布记录只做只读验收，不执行生产 Redeploy、Promote、Rollback、迁移、Replay 或密钥修改。记录完成后要明确“没有发现需处理信号”或列出下一步负责人。",
        },
        {
          type: "checkpoint",
          title: "P11 自检",
          criteria: [
            "能写出发布前的变量、迁移、回调、任务和观测检查项",
            "能用 Vercel、Supabase、Inngest、Sentry 的同一时间窗完成发布后验收",
            "能区分继续观察、代码修复、Redeploy、Rollback 评估和停止",
            "能写一份不包含敏感正文的最小发布记录",
            "在证据不足或副作用未知时能停止并请求确认",
          ],
        },
      ],
    },
  ],
};

export const crossPlatformIncidentResponseChapter: Omit<Chapter, "number"> = {
  slug: "cross-platform-incident-response",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P12 跨平台故障定位",
  shortTitle: "跨平台故障定位",
  phase: "联合运维",
  track: "工程上线",
  tags: ["故障树", "证据链", "Incident", "Correlation"],
  duration: "45 分钟",
  level: "工程化",
  goal: "能从五类用户症状进入正确平台，用时间、版本、请求和运行标识串联证据，并在扩大故障前停止。",
  dependencies: ["P11 发布前后检查与回滚决策"],
  terms: ["Incident", "Symptom", "Request ID", "Run ID", "Trace ID"],
  relatedResources: [
    "vercel-logs-docs",
    "supabase-logs-docs",
    "inngest-runs-docs",
    "sentry-traces-docs",
  ],
  sections: [
    {
      id: "fault-tree",
      title: "从症状进入第一个平台",
      blocks: [
        {
          type: "diagram",
          title: "个人项目故障树",
          chart: `flowchart TD
  U[用户症状] --> A{打不开}
  U --> B{登录失败}
  U --> C{数据异常}
  U --> D{任务卡住}
  U --> E{页面报错}
  A --> V[Vercel Domain / Deployment / Runtime]
  B --> S[Supabase Auth / RLS]
  C --> S2[Supabase Table / Logs]
  D --> I[Inngest Event / Run / Step]
  E --> T[Sentry Issue / Trace]
  V --> X[时间 + 版本 + 决策]
  S --> X
  S2 --> X
  I --> X
  T --> X`,
        },
        {
          type: "table",
          headers: ["用户症状", "第一个入口", "排除后转向"],
          rows: [
            ["打不开", "Vercel Domain、Deployment、Runtime Logs", "平台可达后查 DNS、路由和 Sentry"],
            ["登录失败", "Supabase Auth、Redirect、Session", "回调到达则查 Vercel 与 RLS"],
            ["数据异常", "Supabase Table、RLS、Logs", "查询正常则关联 Release 与请求"],
            ["任务卡住", "Inngest Event、Run、Step", "事件未到达则回到 Vercel API"],
            ["页面报错", "Sentry Issue / Event / Trace", "按 Release 回到 Vercel、Supabase 或 Inngest"],
          ],
        },
      ],
    },
    {
      id: "evidence-correlation",
      title: "最小证据链：时间、版本、请求与运行标识",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "统一时间", detail: "记录时区、用户症状时间、Deployment、Issue、Run 和数据库日志时间窗。" },
            { title: "统一版本", detail: "记录 commit、Deployment、Release、Function 版本和迁移版本。" },
            { title: "统一标识", detail: "按需记录脱敏 requestId、runId、eventId、traceId；不把 ID 与用户正文一起公开。" },
            { title: "找排除信号", detail: "用明确的 2xx、Healthy、Completed 或无新 Issue 排除一个平台，再移动到下一个。" },
            { title: "做出动作", detail: "记录、修复、回滚评估或停止；没有证据时不要跨平台同时点按钮。" },
          ],
        },
        {
          type: "table",
          headers: ["关联字段", "能回答什么", "隐私边界"],
          rows: [
            ["时间窗", "哪些信号同时变化", "使用时区，不记录用户可识别时间线"],
            ["版本", "是否与新发布相关", "Release SHA 可内部保存，公开材料需脱敏"],
            ["requestId / traceId", "一次请求经过哪些入口", "不要与邮箱、Token、正文一并传播"],
            ["runId / eventId", "后台任务是否接收与执行", "只保存内部链接和状态类别"],
          ],
        },
      ],
    },
    {
      id: "decision-and-stop",
      title: "故障动作与停止条件",
      blocks: [
        {
          type: "table",
          headers: ["信号", "下一步", "停止条件"],
          rows: [
            ["单个已知 Issue，关键路径正常", "记录并观察", "不要为了清单为空而 Resolve"],
            ["新版本后持续 5xx", "保全证据并修复 / 回滚评估", "不重复发布未知代码"],
            ["RLS 或隐私泄漏迹象", "立即停止相关路径并升级", "不关闭 RLS、不导出数据"],
            ["Run 大量失败或重复副作用", "暂停重放，核对幂等与下游", "不批量 Replay / Rerun"],
            ["无法判断环境或影响", "退出页面并请求确认", "所有写操作自动升为高风险"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "故障中最重要的动作是停止扩大影响",
          text: "不要一边猜原因一边改变量、迁移、RLS、并发、采样或生产流量。先记录时间、版本、入口和状态，确定事实平台与负责人，再选择一个可验证动作。",
        },
        {
          type: "checkpoint",
          title: "P12 自检",
          criteria: [
            "能从打不开、登录失败、数据异常、任务卡住、页面报错进入第一个平台",
            "能用时间、版本、requestId、runId、eventId 或 traceId 串联证据",
            "能说明什么信号可以排除当前平台",
            "能在记录、修复、回滚评估和停止之间做出有证据的选择",
            "在 RLS、隐私、重放和环境不明时能停止扩大影响",
          ],
        },
      ],
    },
  ],
};

export const productionSecurityCostRecoveryChapter: Omit<Chapter, "number"> = {
  slug: "production-security-cost-recovery",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P13 密钥、权限、成本与恢复",
  shortTitle: "安全、成本与恢复",
  phase: "联合运维",
  track: "工程上线",
  tags: ["Secrets", "Least Privilege", "Cost", "Backup", "Recovery"],
  duration: "40 分钟",
  level: "工程化",
  goal: "能为个人项目建立最小权限、密钥轮换、Usage 巡检和恢复准备度，不把备份或额度数字当作永久保证。",
  dependencies: ["P05–P10 平台安全与用量章节"],
  terms: ["Least Privilege", "Secret Rotation", "Quota", "Backup", "Restore Drill"],
  relatedResources: [
    "vercel-environment-variables-docs",
    "supabase-api-keys-docs",
    "supabase-backups-docs",
    "inngest-usage-docs",
    "sentry-privacy-docs",
  ],
  sections: [
    {
      id: "permission-boundary",
      title: "四个平台的最小权限边界",
      blocks: [
        {
          type: "table",
          headers: ["平台", "客户端可见", "服务端机密 / 高风险", "日常只读"],
          rows: [
            ["Vercel", "公开 URL、publishable 配置", "Secret、Production 变量、Domain、Upgrade", "Deployment、Logs、Usage"],
            ["Supabase", "Project URL、Publishable / anon key", "Secret / service role、DDL、RLS、Restore", "Status、Schema、Auth、Logs、Backups"],
            ["Inngest", "最小事件字段", "Signing key、Replay、Cancel、Concurrency", "App、Event、Run、Usage"],
            ["Sentry", "经过清理的错误摘要", "Auth token、导出、隐私策略、组织设置", "Issue、Trace、Alert、Usage"],
          ],
        },
        {
          type: "paragraph",
          text: "最小权限不是把所有操作都禁掉，而是让每个身份只拥有完成当前职责所需的权限。客户端公开变量不能因为名字看起来安全就访问高权限 API；Server-only secret 不能进入浏览器、日志、截图、提交或课程示例。",
        },
      ],
    },
    {
      id: "rotation-cost",
      title: "轮换触发与成本巡检",
      blocks: [
        {
          type: "table",
          headers: ["触发", "先做什么", "四平台联动"],
          rows: [
            ["密钥疑似泄漏", "停止扩散、记录范围、轮换并重新部署", "Vercel 变量 → Supabase / Inngest / Sentry 验证"],
            ["成员或权限变化", "撤销不再需要的访问，检查最小权限", "四平台成员、Token 与服务身份"],
            ["Usage 突增", "按时间和产品项分解重复、流量和重试", "Vercel、Supabase、Inngest、Sentry 对齐窗口"],
            ["备份或恢复能力变化", "更新记录并安排隔离演练", "Supabase 数据 + Vercel 版本 + Auth / Run / Issue"],
          ],
        },
        {
          type: "steps",
          items: [
            { title: "周检 Usage", detail: "用同长度时间窗比较 Vercel、Supabase、Inngest、Sentry 的资源和错误趋势。" },
            { title: "月检权限", detail: "清理不再使用的成员、Token、Integration 和服务身份，保留轮换记录。" },
            { title: "月检恢复", detail: "确认 Supabase 备份能力、Vercel 版本、Auth 回调、Inngest 幂等与 Sentry 证据链。" },
            { title: "更新 Runbook", detail: "平台套餐、按钮和菜单会变化，记录官方链接与查阅日期，不写死价格。" },
          ],
        },
      ],
    },
    {
      id: "recovery",
      title: "备份不等于恢复：最小演练",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "选择隔离目标", detail: "恢复到新项目或本地副本，不覆盖真实生产数据。" },
            { title: "恢复数据库", detail: "验证 Schema、迁移、关键只读查询和 RLS，不仅看恢复按钮成功。" },
            { title: "恢复应用配置", detail: "用练习变量部署 Vercel，配置 Auth Redirect 和最小 Inngest fixture。" },
            { title: "验证观测", detail: "触发受控错误，确认 Sentry Issue / Trace，查看 Inngest Run 和 Vercel Logs。" },
            { title: "记录差异", detail: "写下数据时间点、外部副作用、缺失资源、RTO / RPO 和回到生产的条件。" },
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "高风险恢复边界",
          text: "生产 Restore、Delete、Rotate、Upgrade、Rollback 和批量权限修改不在本课程执行。没有恢复目标、备份时间点、兼容版本和验收路径时，必须停止。",
        },
        {
          type: "paragraph",
          text: "本案例只读检查可以记录备份入口、Usage 趋势、权限状态和恢复准备度，不下载生产数据、不恢复生产项目、不触发付费升级。",
        },
      ],
    },
    {
      id: "checkpoint",
      title: "个人项目周检与月检自检",
      blocks: [
        {
          type: "table",
          headers: ["频率", "最小问题", "完成标准"],
          rows: [
            ["每周", "四平台 Usage、错误、失败任务是否脱离基线？", "写下趋势、证据链接和观察结论"],
            ["每周", "客户端是否出现高权限变量或新泄漏？", "确认变量边界与近期变更"],
            ["每月", "成员、Token、Provider 和服务身份是否仍需要？", "撤销无用权限或安排轮换"],
            ["每月", "Supabase 备份能否恢复，Vercel / Auth / Inngest / Sentry 能否重建？", "完成隔离演练或记录阻塞"],
          ],
        },
        {
          type: "checkpoint",
          title: "P13 自检",
          criteria: [
            "能分清客户端公开配置和四个平台服务端机密",
            "能为密钥泄漏、成员变化、Usage 突增和备份变化写出第一步",
            "能列出 Supabase 恢复后还要验证的 Vercel、Auth、Inngest、Sentry 项",
            "能按周检和月检记录成本、权限和恢复准备度",
            "在 Restore、Rotate、Upgrade、Delete 或生产回滚前能停止并确认",
          ],
        },
      ],
    },
  ],
};

export const observableProductionPracticumChapter: Omit<Chapter, "number"> = {
  slug: "observable-production-practicum",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P14 从 GitHub 到可观测生产环境",
  shortTitle: "可观测生产练习",
  phase: "综合实践",
  track: "工程上线",
  tags: ["Practicum", "GitHub", "Fixtures", "End-to-end"],
  duration: "45 分钟",
  level: "实战",
  goal: "在独立练习项目中串联 Vercel、Supabase、Inngest、Sentry，完成一次可回归、可观测且可清理的部署演练。",
  dependencies: ["P11–P13 联合运维章节"],
  terms: ["Fixture", "Preview", "Acceptance", "Controlled Error", "Cleanup"],
  relatedResources: [
    "vercel-deployments-docs",
    "supabase-migrations-docs",
    "inngest-functions-docs",
    "sentry-source-maps-docs",
  ],
  sections: [
    {
      id: "guardrails",
      title: "练习边界：新仓库、新资源、无真实 Provider",
      blocks: [
        {
          type: "paragraph",
          text: "P14 不是对真实生产环境的操作清单，而是一个隔离练习。新建 GitHub 仓库、Supabase 项目、Vercel 项目和 Inngest App，使用 fixture 数据和无外部 Provider 的 hello-run；Sentry 只接收练习环境的受控错误。",
        },
        {
          type: "table",
          headers: ["资源", "练习规则", "禁止复用"],
          rows: [
            ["GitHub", "新仓库、最小 README、无生产密钥", "已有生产仓库与生产分支"],
            ["Supabase", "独立项目、最小迁移、假用户或本地 fixture", "生产数据库、真实用户和备份"],
            ["Vercel", "Preview / Production 变量分离", "正式域名和生产 Secret"],
            ["Inngest", "hello-run 与可重复 fixture Event", "真实通知、扣费或不可逆任务"],
            ["Sentry", "练习 DSN、受控错误、脱敏事件", "生产 Issue、用户和 Trace"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "不调用真实 OpenAI / Tavily",
          text: "本练习使用固定响应和本地 fixture，不把付费 Provider、生产 Token 或个人账号凭据放入 CI、截图、仓库或课程记录。",
        },
      ],
    },
    {
      id: "seven-stages",
      title: "七阶段部署与验收",
      blocks: [
        {
          type: "steps",
          items: [
            { title: "1. 新建独立 GitHub 练习仓库", detail: "预期输出：一个没有生产历史的仓库。失败先看：git remote、.env.example 和 secret scan。风险：只读；完成标准：默认分支和 README 可访问。" },
            { title: "2. 创建练习 Supabase 项目并应用最小迁移", detail: "预期输出：一张 fixture 表和最小 RLS。失败先看：迁移日志、Schema 与 Policy。风险：练习普通变更；完成标准：允许 / 拒绝查询都有测试。" },
            { title: "3. 导入 Vercel Preview 并分环境设置变量", detail: "预期输出：Preview 构建 Ready，公开变量与服务端机密分开。失败先看：Build Logs 和变量作用域。风险：练习普通变更；完成标准：正式变量未进入 Preview。" },
            { title: "4. 同步无外部 Provider 的 Inngest hello-run", detail: "预期输出：fixture Event 触发 Completed Run。失败先看：App sync、Function、Event 与 Run。风险：练习普通变更；完成标准：重复 Event 只有一次业务结果。" },
            { title: "5. 接入 Sentry 并触发受控错误", detail: "预期输出：练习 Release 下有一条脱敏 Issue / Trace。失败先看：DSN、Source Map、采样和隐私过滤。风险：练习普通变更；完成标准：无用户正文和密钥。" },
            { title: "6. 验证部署、回调、读写、Run 和 Issue / Trace", detail: "预期输出：发布记录中的五项验收证据。失败先看：对应平台事实日志。风险：只读；完成标准：关键路径、拒绝路径和受控错误都可复现。" },
            { title: "7. 填写发布、故障证据和清理清单", detail: "预期输出：时间、版本、证据链接、结论与资源删除计划。失败先看：记录模板和资源清单。风险：只读 / 清理需确认；完成标准：练习资源可撤销，不影响生产。" },
          ],
        },
        {
          type: "table",
          headers: ["验收信号", "四个平台证据"],
          rows: [
            ["发布可用", "Vercel Deployment Ready + Supabase 迁移完成 + Inngest App synced + Sentry Release"],
            ["登录 / 权限", "Supabase Auth 回调、RLS 允许与拒绝用例，Vercel Runtime 无未处理错误"],
            ["后台任务", "Vercel API 返回 accepted + Inngest Event / Run / Step + Supabase fixture 结果"],
            ["可观测", "Sentry Issue / Trace、Vercel Logs、Inngest Run、Supabase Logs 可用同一时间关联"],
          ],
        },
      ],
    },
    {
      id: "record-and-cleanup",
      title: "受控故障、记录与清理",
      blocks: [
        {
          type: "code",
          language: "markdown",
          filename: "practicum-record.md",
          code: `# 独立练习记录

- GitHub 仓库 / commit：
- Vercel Deployment / environment：
- Supabase migration / RLS：
- Inngest event / run / step：
- Sentry release / issue / trace：
- 受控错误症状与时间：
- 先看哪里、排除什么：
- 结论：通过 | 修复 | 停止
- 清理资源与负责人：`,
          caption: "只填练习项目链接、状态和类别，不填真实账号、Token、用户或 Provider 响应。",
        },
        {
          type: "steps",
          items: [
            { title: "触发一次可控错误", detail: "只在练习环境用固定错误码或 fixture 抛错，不制造真实用户影响。" },
            { title: "按故障树定位", detail: "从页面症状进入 Vercel、Sentry，再到 Supabase 或 Inngest，记录排除信号。" },
            { title: "停止后清理", detail: "删除练习域名、变量、数据库和 App 前确认记录已导出为脱敏摘要，不能误删生产资源。" },
          ],
        },
        {
          type: "paragraph",
          text: "本案例在 P14 只作为对照：学习者应能解释为什么同样的 Vercel、Supabase、Inngest、Sentry 步骤不能直接套到生产项目。所有写操作、故障注入和资源清理都限定在独立练习环境。",
        },
        {
          type: "callout",
          tone: "warning",
          title: "不要继续的情况",
          text: "项目、域名、变量、数据库或账号无法证明属于练习环境时，立即停止；如果发现真实 Provider、生产数据或高权限密钥被接入，也停止并清理暴露面。",
        },
        {
          type: "checkpoint",
          title: "P14 自检",
          criteria: [
            "能从新 GitHub 仓库开始创建独立 Vercel、Supabase、Inngest、Sentry 练习资源",
            "能完成最小迁移、RLS、Preview 变量、hello-run 和受控 Sentry 错误",
            "能用时间、版本和平台标识写出一次发布与故障记录",
            "能证明练习没有调用真实 OpenAI / Tavily、生产数据或生产密钥",
            "能在环境不明、资源混用或清理目标不明确时停止",
          ],
        },
      ],
    },
  ],
};
