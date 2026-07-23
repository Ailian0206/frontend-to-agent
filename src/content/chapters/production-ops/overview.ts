import type { Chapter } from "../../types";

export const productionOpsIntroChapter: Omit<Chapter, "number"> = {
  slug: "production-ops-intro",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S11", "E2", "E3", "E4"],
  title: "P01 托管生产系统地图",
  shortTitle: "托管生产系统地图",
  phase: "生产入门",
  track: "工程上线",
  tags: ["系统地图", "环境", "职责边界", "脱敏案例"],
  duration: "40 分钟",
  level: "基础",
  goal: "能画出 Vercel、Supabase、Inngest、Sentry 的协作链路，并在查看生产控制台前先判断操作风险。",
  terms: [
    "Development",
    "Preview",
    "Production",
    "Deployment",
    "Auth",
    "Background Job",
    "Observability",
  ],
  sections: [
    {
      id: "system-map",
      title: "一条请求如何穿过四个平台",
      blocks: [
        {
          type: "paragraph",
          text: "托管平台把服务器、数据库、任务队列和监控拆成了多个控制台，但用户请求仍是一条连续链路。先从浏览器的症状出发，再沿时间、版本和请求标识向后找证据，比在四个平台之间随机翻日志更可靠。",
        },
        {
          type: "diagram",
          title: "个人全栈项目的生产链路",
          chart: `flowchart LR
  B[Browser 浏览器] --> V[Vercel Web / API]
  V --> A[Supabase Auth]
  V --> D[Supabase Postgres]
  V --> E[Inngest Event]
  E --> F[Inngest Function / Run]
  V -. Error / Trace .-> S[Sentry]
  F -. Error / Trace .-> S`,
        },
        {
          type: "table",
          headers: ["平台", "主要负责", "不负责", "先看什么"],
          rows: [
            ["Vercel", "Web、API、Deployment、Domain", "数据库权限与后台任务状态", "Deployment 状态、Build Logs、Runtime Logs"],
            ["Supabase", "Postgres、Auth、RLS、Storage", "前端构建与 Git 发布", "数据库、Auth、Policy、Logs"],
            ["Inngest", "Event、Function、Run、Retry", "页面渲染与用户登录", "失败 Run、步骤、积压与重试"],
            ["Sentry", "Issue、Event、Trace、Alert", "替代业务数据库或任务队列", "新 Issue、回归、版本与调用栈"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "Observability 不是第五份真相",
          text: "Sentry 记录的是应用观察到的错误和性能信号；Vercel、Supabase、Inngest 才分别保存部署、数据和任务的运行事实。跨平台定位时用 Sentry 找入口，再回到事实来源确认。",
        },
      ],
    },
    {
      id: "environments",
      title: "Development、Preview 与 Production",
      blocks: [
        {
          type: "table",
          headers: ["环境", "典型入口", "数据与变量", "允许的学习操作"],
          rows: [
            ["Development（开发）", "localhost、本地 CLI", "本地变量与本地/隔离数据", "可运行迁移、造数、故障注入和配置练习"],
            ["Preview（预览）", "PR / 分支 Deployment", "Preview 变量与测试数据", "可验收构建和集成，仍要避免连接生产写权限"],
            ["Production（生产）", "正式域名", "Production 变量与真实数据", "本课程只做查看、记录和判断"],
          ],
        },
        {
          type: "steps",
          items: [
            {
              title: "变量从本地进入托管平台",
              detail: "本地 .env 只供开发使用；部署平台按 Environment 保存同名变量，仓库不应提交真实值。",
            },
            {
              title: "服务端读取机密",
              detail: "service role、Provider key 等 Secret 只在 Server / Function 中读取，不能进入 NEXT_PUBLIC_* 或浏览器响应。",
            },
            {
              title: "配置指向对应环境",
              detail: "Preview 应连接隔离项目或最小权限资源；Production 才连接正式域名、数据库和回调地址。",
            },
            {
              title: "发布后验证实际版本",
              detail: "提交成功不等于线上已更新，要在 Deployment、Release 和关键路径中核对同一版本。",
            },
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "不要把环境名称当安全边界",
          text: "名为 Preview 的 Deployment 仍可能持有 Production 密钥。判断风险要看它实际连接的项目、角色和数据，而不是只看页面标签。",
        },
      ],
    },
    {
      id: "desensitized-case",
      title: "脱敏案例：只读检查",
      blocks: [
        {
          type: "paragraph",
          text: "本专题用脱敏生产案例截图说明：查看 Vercel 当前 Deployment，确认 Supabase 服务可用，检查 Inngest 是否有失败 Run，再查看 Sentry 是否出现同一时间的新 Issue。案例只说明怎样读取信号，不公开项目名、账号、域名、ID、错误正文或生产数据。",
        },
        {
          type: "table",
          headers: ["风险等级", "生产环境示例", "本课程规则"],
          rows: [
            ["只读", "查看 Deployment、Logs、Run、Issue、Usage", "可以执行；先确认筛选范围并记录时间"],
            ["普通变更", "改变量、重放任务、调整告警、重新部署", "仅在本地或独立练习环境执行"],
            ["高风险", "生产回滚、恢复备份、轮换密钥、删除数据、付费升级", "只解释决策条件；必须另行确认并先准备恢复路径"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "停止条件",
          text: "看到 Run、Replay、Redeploy、Promote、Rollback、Restore、Delete、Rotate、Disable 或保存配置的按钮时先停止。无法确认环境、影响范围、幂等性或恢复方式，也应退出页面并记录疑问。",
        },
      ],
    },
    {
      id: "inspection-preview",
      title: "从地图进入巡检",
      blocks: [
        {
          type: "paragraph",
          text: "后续课程会把这张地图变成固定节奏：发布后核对版本和关键路径；每日看错误与失败任务；每周看趋势、权限和用量；每月检查备份、成本与恢复准备；故障时按时间线串联四个平台。P02 会先把这套节奏压缩成十分钟可执行清单。",
        },
        {
          type: "checkpoint",
          title: "P01 自检",
          criteria: [
            "能画出 Browser → Vercel → Supabase / Inngest → Sentry 的关系",
            "能说明 Development、Preview、Production 的数据和变量不能混用",
            "能为查看日志、重放任务、恢复备份分别标注只读、普通变更、高风险",
            "能说出脱敏案例的边界：只读、脱敏、不执行生产写操作",
          ],
        },
      ],
    },
  ],
};

export const productionInspectionRhythmChapter: Omit<Chapter, "number"> = {
  slug: "production-inspection-rhythm",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S11", "E2", "E3", "E4"],
  title: "P02 个人项目的巡检节奏",
  shortTitle: "个人项目巡检节奏",
  phase: "生产入门",
  track: "工程上线",
  tags: ["巡检", "风险分级", "故障", "运行记录"],
  duration: "40 分钟",
  level: "基础",
  goal: "建立发布后、每日、每周、每月与故障时的最小巡检，并能区分正常、可疑和需处理信号。",
  terms: ["Post-deploy Check", "Runbook", "Signal", "Incident", "Recovery"],
  sections: [
    {
      id: "rhythm",
      title: "五种触发时机，而不是全天盯屏",
      blocks: [
        {
          type: "paragraph",
          text: "个人项目的运维目标不是建立全天值班中心，而是用固定入口尽早发现明显回归。每次巡检只回答三件事：当前版本是否正确、关键路径是否可用、错误和成本是否出现异常变化。没有异常就记录并结束。",
        },
        {
          type: "table",
          headers: ["时机", "最小检查", "完成标准"],
          rows: [
            ["发布后 10–15 分钟", "Deployment / Release、关键页面、登录、核心任务、新错误", "版本一致，关键路径通过，无新增高影响错误"],
            ["每日 5–10 分钟", "失败 Deployment、Sentry 新 Issue、Inngest 失败 Run、Supabase 异常日志", "没有持续失败或错误突增"],
            ["每周 15 分钟", "错误趋势、任务耗时与积压、数据库/Auth 信号、Usage", "趋势可解释，额度与容量有余量"],
            ["每月 30 分钟", "密钥与权限、备份、依赖和成本、恢复说明", "负责人、恢复入口和预算边界仍有效"],
            ["故障时", "症状、开始时间、版本、请求/Run/Event/Trace ID", "形成一条可复查时间线并明确下一动作"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "先固定入口，再增加指标",
          text: "每个平台先保留一个总览页和一个失败详情页。只有真实故障证明现有信息不足时，才增加告警或仪表盘，避免维护一套无人阅读的流程。",
        },
      ],
    },
    {
      id: "signals",
      title: "正常、可疑与需处理",
      blocks: [
        {
          type: "table",
          headers: ["级别", "典型信号", "动作"],
          rows: [
            ["正常", "Ready / Completed；零星已知错误；用量趋势平稳", "记录时间与结论，结束巡检"],
            ["可疑", "单次 Failed；耗时变长；错误集中在新版本；用量突然抬升", "缩小时间范围，对比基线并找到详情证据"],
            ["需处理", "关键路径不可用；连续失败；权限或数据泄漏迹象；额度即将耗尽", "停止变更，保全证据，选择修复、回滚或升级处理"],
          ],
        },
        {
          type: "steps",
          items: [
            {
              title: "定位共同时间窗",
              detail: "把用户症状、Deployment、Issue、Run 和数据库日志收敛到同一时区和时间范围。",
            },
            {
              title: "确认共同版本或标识",
              detail: "优先记录 release、commit、request、run、event 或 trace 标识，不复制敏感正文。",
            },
            {
              title: "排除一个平台",
              detail: "用明确证据说明该平台正常，再沿 P01 的链路移动，不在多个控制台同时猜测。",
            },
            {
              title: "决定并停止",
              detail: "只读检查足以形成结论时立即停止；需要写操作则转到独立练习环境或单独变更流程。",
            },
          ],
        },
      ],
    },
    {
      id: "risk-matrix",
      title: "把操作分成三级风险",
      blocks: [
        {
          type: "table",
          headers: ["等级", "判断问题", "操作示例", "执行位置"],
          rows: [
            ["只读", "是否完全不改变运行状态和数据？", "查看日志、筛选 Issue、检查 Usage", "允许在生产执行"],
            ["普通变更", "影响是否可控、可验证、可撤销？", "修改变量、调整告警、重放幂等任务", "本地或独立练习环境"],
            ["高风险", "是否可能影响真实数据、权限、可用性或费用？", "回滚、恢复、删数据、轮换密钥、升级套餐", "本教程不执行，另行审批和确认"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "按钮可见不等于应该点击",
          text: "生产后台常把查看和写操作放在同一页面。遇到 Disable、Replay、Rerun、Cancel、Redeploy、Promote、Rollback、Restore、Delete、Rotate 或 Upgrade，先记录按钮用途，不继续操作。",
        },
        {
          type: "paragraph",
          text: "如果无法确认当前是 Development、Preview 还是 Production，操作自动升一级风险；如果无法说明副作用是否幂等、如何验收、如何恢复，则普通变更按高风险处理。",
        },
      ],
    },
    {
      id: "record-template",
      title: "十分钟巡检记录模板",
      blocks: [
        {
          type: "code",
          language: "markdown",
          filename: "ops-check-YYYY-MM-DD.md",
          code: `# 个人项目巡检

- 时间 / 时区：
- 触发：发布后 | 每日 | 每周 | 每月 | 故障
- 当前版本 / Deployment：
- Vercel：正常 | 可疑 | 需处理（证据链接）
- Supabase：正常 | 可疑 | 需处理（证据链接）
- Inngest：正常 | 可疑 | 需处理（证据链接）
- Sentry：正常 | 可疑 | 需处理（证据链接）
- 结论：无动作 | 继续观察 | 修复 | 回滚评估 | 停止操作
- 下一次检查：`,
          caption: "记录结论和后台链接，不粘贴密钥、用户信息、错误正文或生产数据。",
        },
        {
          type: "paragraph",
          text: "示例巡检只读取四个平台：确认 Vercel 当前版本，查看 Supabase 服务与异常日志，筛选 Inngest 失败 Run，再核对 Sentry 新 Issue。若四处均无异常，就写下“未发现需处理信号”并结束，不为制造工作而执行普通变更。",
        },
        {
          type: "callout",
          tone: "warning",
          title: "常见误区",
          text: "不要把零错误当作唯一健康标准，也不要因单次错误立即回滚。先看是否影响关键路径、是否持续、是否与新版本相关。故障中反复刷新或重放可能放大负载，证据足够后应停止操作。",
        },
        {
          type: "checkpoint",
          title: "P02 自检",
          criteria: [
            "能在十分钟内完成一次只读巡检并留下时间、版本、证据和结论",
            "能分别列出发布后、每日、每周、每月与故障时的最小检查项",
            "能把一个信号判断为正常、可疑或需处理，并说明下一步",
            "遇到普通变更或高风险按钮时能停止，不在真实生产环境练习写操作",
          ],
        },
      ],
    },
  ],
};
