import type { Chapter } from "../../types";

export const inngestEventsFunctionsRunsChapter: Omit<Chapter, "number"> = {
  slug: "inngest-events-functions-runs",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P07 Inngest App、Event、Function 与 Run",
  shortTitle: "Inngest 核心对象",
  phase: "平台中文教程",
  track: "工程上线",
  tags: ["Inngest", "Event", "Function", "Run", "Step"],
  duration: "45 分钟",
  level: "基础",
  goal: "能从 App、Event、Function、Run、Step 的关系定位后台任务，并判断任务状态是否需要进一步调查。",
  dependencies: ["P01 托管生产系统地图", "P03 Vercel 核心对象与常用操作"],
  terms: ["App", "Event", "Function", "Run", "Step", "Queued", "Completed"],
  relatedResources: [
    "inngest-concepts-docs",
    "inngest-events-docs",
    "inngest-functions-docs",
    "inngest-runs-docs",
  ],
  sections: [
    {
      id: "responsibility",
      title: "Inngest 是什么，为什么不把长任务塞进请求",
      blocks: [
        {
          type: "paragraph",
          text: "Inngest 是事件驱动的后台函数平台。Web 请求只负责鉴权、校验和发送 Event，Inngest 再按 Function 定义调度 Run、Step、重试和状态。它负责后台执行的时间线，不负责前端页面、数据库事实或用户登录。",
        },
        {
          type: "table",
          headers: ["对象", "职责", "不负责"],
          rows: [
            ["App", "连接部署应用与环境，承载 Functions", "单次任务的业务结果"],
            ["Event", "描述发生了什么，触发一个或多个 Function", "保证下游副作用天然幂等"],
            ["Function", "声明触发条件、步骤、重试与并发配置", "替代数据库事务或用户响应"],
            ["Run", "某个 Event 触发 Function 后的一次执行", "证明外部系统已成功提交不可逆副作用"],
            ["Step", "可重试、可观测的执行单元", "自动修复不可重试错误"],
          ],
        },
        {
          type: "callout",
          tone: "note",
          title: "长任务的判断线",
          text: "预计超过一次 Web 请求时限、需要等待、重试、定时或分段执行的工作，通常应变成 Event + Function。即使 Run 显示 Completed，也要结合 Supabase 写入、外部 API 结果和 Sentry 错误判断业务是否真的完成。",
        },
      ],
    },
    {
      id: "apps-functions",
      title: "Apps 与 Functions：先确认同步和环境",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/inngest/apps-functions.webp",
          alt: "脱敏后的 Inngest Apps 页面，标出 New app、环境筛选、同步应用、查看 Runs 与 Functions 入口",
          title: "Apps 页面确认应用已同步",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "New app", detail: "注册或连接新应用属于普通变更，只在练习环境执行。" },
            { label: "2", title: "Environment", detail: "先确认 Production、Preview 或其他环境，避免混看 Function。" },
            { label: "3", title: "Synced App", detail: "同步时间、SDK、语言和框架是部署接入信号，不是业务健康证明。" },
            { label: "4", title: "View Runs", detail: "进入该 App 的运行记录，按时间继续定位。" },
            { label: "5", title: "Functions", detail: "查看已发现的 Function；函数名和内部项目标识已脱敏。" },
          ],
          sourceUrl: "https://www.inngest.com/docs/learn",
        },
        {
          type: "steps",
          items: [
            { title: "部署同步端点", detail: "Vercel 部署必须暴露 Inngest serve / sync 入口，确认部署版本和环境变量匹配。" },
            { title: "查看 App 状态", detail: "记录最近同步时间、Function 数量和环境，不重复点击 Sync 或创建 App。" },
            { title: "进入 Function", detail: "核对触发事件、步骤数量、Retry、Concurrency 与版本摘要。" },
            { title: "串联 Vercel", detail: "同步失败先看 Vercel Runtime Logs，再看 Inngest App；不要在两个控制台同时重试。" },
          ],
        },
      ],
    },
    {
      id: "events",
      title: "Event 页面：看触发事实，不看敏感 payload",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/inngest/events.webp",
          alt: "脱敏后的 Inngest Events 页面，标出重放与发送入口、搜索、时间筛选、事件名称和触发函数",
          title: "Events 列表的五个只读检查点",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "Replay events", detail: "重放会触发真实副作用，属于高风险入口；本课不点击。" },
            { label: "2", title: "Send event", detail: "发送 Event 会启动 Function，生产环境不为教学制造事件。" },
            { label: "3", title: "Search", detail: "按事件名或脱敏标识检索，不输入用户数据或完整 payload。" },
            { label: "4", title: "Event name", detail: "事件名连接业务动作与 Function，记录名称即可。" },
            { label: "5", title: "Function triggered", detail: "显示可能被触发的 Function；是否成功要转到 Runs。" },
          ],
          sourceUrl: "https://www.inngest.com/docs/events",
        },
        {
          type: "table",
          headers: ["事件信号", "正常", "异常或下一步"],
          rows: [
            ["Received", "事件进入时间线", "重复激增、来源异常或时间窗不符需调查"],
            ["Triggered", "匹配的 Function 被调度", "没有触发可能是事件名、环境或同步问题"],
            ["Payload", "只含执行所需的最小字段", "含 Token、完整用户资料或密钥是隐私风险"],
            ["Event → Run", "可用时间和名称关联", "找不到 Run 时转 App、Function 和 Vercel 日志"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "事件不等于业务完成",
          text: "Event 被接收只说明消息进入平台；Function 可能还在排队、失败或被取消。不要用“发送成功”向用户承诺数据库写入或外部通知已经完成。",
        },
      ],
    },
    {
      id: "runs",
      title: "Runs 页面：用状态与时间线定位执行",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/inngest/runs.webp",
          alt: "脱敏后的 Inngest Runs 页面，标出状态筛选、App、Run Type、排队时间与结束时间",
          title: "Runs 列表的状态、筛选与时间",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "Status", detail: "Completed、Failed、Cancelled 等状态是第一层分类。" },
            { label: "2", title: "Status filter", detail: "按状态、时间、App、Run Type 缩小范围，避免混入其他 Function。" },
            { label: "3", title: "Queued at", detail: "排队时间过长提示并发、积压或资源问题。" },
            { label: "4", title: "Ended at", detail: "结合开始与结束时间估算耗时，并与历史基线比较。" },
            { label: "5", title: "Runs count", detail: "数量变化是趋势信号，不直接说明成功率或成本。" },
          ],
          sourceUrl: "https://www.inngest.com/docs/runs",
        },
        {
          type: "table",
          headers: ["状态", "中文理解", "先看什么"],
          rows: [
            ["Queued", "已接收、等待执行", "队列时长、并发和最近发布"],
            ["Running", "正在执行", "当前 Step、耗时和外部依赖"],
            ["Completed", "步骤执行完成", "业务副作用是否有独立确认"],
            ["Failed", "最终失败或重试耗尽", "Run 详情、失败 Step、错误类别和版本"],
            ["Cancelled", "被取消或停止", "取消原因，避免把取消当成功"],
          ],
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
            { title: "确认 App 和环境", detail: "从 Vercel 当前版本进入对应 App，记录同步时间与 Function 数量。" },
            { title: "筛选事件与 Run", detail: "用脱敏事件名和窄时间窗寻找对应 Run，不打开完整 payload。" },
            { title: "分类状态", detail: "记录 Queued、Running、Completed、Failed 或 Cancelled，并保存运行链接。" },
            { title: "转到事实来源", detail: "Failed 转 Function / Step 与 Sentry；数据副作用转 Supabase；不要在平台上 Replay。" },
          ],
        },
        {
          type: "paragraph",
          text: "本案例只读 App、Event 和 Run 的状态与时间线；不发送事件、不打开完整 payload，也不把脱敏截图当作当前生产状态证明。",
        },
        {
          type: "table",
          headers: ["风险", "Inngest 示例", "规则"],
          rows: [
            ["只读", "查看 App、Event、Run、状态与时间线", "允许在生产执行，隐藏 payload 与 ID"],
            ["普通变更", "练习环境发送 Event、调整函数配置", "使用 fixture，验证幂等和完成标准"],
            ["高风险", "生产 Replay、Rerun、Cancel、改并发", "确认副作用、幂等、负责人和恢复后再执行"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "停止条件",
          text: "看到 Send、Replay、Rerun、Cancel、Delete 或保存 Concurrency 时停止。无法确认 Event 是否有外部副作用、是否幂等、是否会重复通知，也不要继续。",
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
            ["Event", "事件消息", "接收成功不等于 Function 成功"],
            ["Function", "后台函数定义", "不是一次具体执行记录"],
            ["Run", "一次执行", "Completed 不自动证明外部副作用完成"],
            ["Step", "可观测执行步骤", "步骤重试可能重复调用外部系统"],
            ["Queued", "排队中", "短时排队正常，持续积压才是异常趋势"],
          ],
        },
        {
          type: "resources",
          title: "Inngest 核心对象官方文档",
          items: [
            { title: "Learn Inngest", url: "https://www.inngest.com/docs/learn", kind: "docs", note: "事件驱动、Functions 与运行模型总览。" },
            { title: "Events", url: "https://www.inngest.com/docs/events", kind: "docs", note: "发送、接收和事件数据边界。" },
            { title: "Functions", url: "https://www.inngest.com/docs/functions", kind: "docs", note: "Function、Step、触发与执行定义。" },
            { title: "Runs", url: "https://www.inngest.com/docs/runs", kind: "docs", note: "运行状态、时间线与调试入口。" },
          ],
        },
        {
          type: "checkpoint",
          title: "P07 自检",
          criteria: [
            "能解释 App、Event、Function、Run、Step 的关系",
            "能从 Events 和 Runs 页面沿时间、事件名与状态找到一次执行",
            "能区分 Queued、Running、Completed、Failed、Cancelled 的下一步",
            "能说明为什么长任务不应阻塞一次普通 Vercel 请求",
            "能在 payload、Send、Replay、Rerun、Cancel 与并发配置前停止",
          ],
        },
      ],
    },
  ],
};

export const inngestRetriesConcurrencyCostChapter: Omit<Chapter, "number"> = {
  slug: "inngest-retries-concurrency-cost",
  curriculum: "production-ops",
  kind: "lesson",
  skills: ["S10", "S11", "E2", "E3", "E4"],
  title: "P08 Inngest 重试、并发、重放与成本",
  shortTitle: "Inngest 重试与成本",
  phase: "平台中文教程",
  track: "工程上线",
  tags: ["Inngest", "Retry", "Replay", "Concurrency", "Usage"],
  duration: "45 分钟",
  level: "工程化",
  goal: "能判断失败是否可重试，区分 Replay、Rerun、Cancel 与 Concurrency，并用失败率、耗时、积压和 Usage 控制成本上界。",
  dependencies: ["P07 Inngest App、Event、Function 与 Run"],
  terms: ["Retry", "Replay", "Rerun", "Cancel", "Concurrency", "Throttle", "Idempotency"],
  relatedResources: [
    "inngest-retries-docs",
    "inngest-concurrency-docs",
    "inngest-idempotency-docs",
    "inngest-usage-docs",
  ],
  sections: [
    {
      id: "failure-model",
      title: "失败分类先于重试",
      blocks: [
        {
          type: "paragraph",
          text: "本课聚焦 Inngest 在失败恢复和成本控制上的职责，不负责替代数据库事务、业务幂等或人工审批。重试适合临时网络错误、限流和短暂依赖不可用；不适合参数校验失败、权限拒绝、Schema 不兼容或确定性代码错误。每一次重试都可能再次执行副作用，所以函数要有幂等键、去重记录和明确的不可重试错误分类。",
        },
        {
          type: "table",
          headers: ["失败类别", "是否重试", "证据与动作"],
          rows: [
            ["Transient", "通常可以", "查看错误码、退避和下游恢复"],
            ["Rate limited", "有限重试", "遵守 Retry-After，降低并发或限流"],
            ["Invalid input", "不应盲目重试", "修事件契约或进入死信处理"],
            ["Permission / Auth", "通常不应", "修凭据或权限，不制造重试风暴"],
            ["Side effect unknown", "先停止", "确认是否已提交，避免重复通知或扣款"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "Retry 不是免费恢复",
          text: "重试会增加执行次数、延迟与用量。把“失败自动重试”当作可靠性策略时，必须同时写出最大尝试次数、退避、幂等键、不可重试分类和人工接管入口。",
        },
      ],
    },
    {
      id: "run-steps",
      title: "Run 详情：步骤、耗时与输出边界",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/inngest/run-steps.webp",
          alt: "脱敏后的 Inngest Run 详情，标出取消入口、输入、时间线、失败步骤和输出区域",
          title: "Run 详情的五个诊断入口",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "Cancel", detail: "取消可能中断后续步骤但无法撤销已完成副作用，生产不点击。" },
            { label: "2", title: "Input / Output", detail: "输入输出可能包含用户数据或密钥，截图只保留 REDACTED。" },
            { label: "3", title: "Timeline", detail: "步骤开始、等待与结束时间帮助区分依赖慢和平台排队。" },
            { label: "4", title: "Failed step", detail: "先定位失败 Step 与错误类别，不从总状态猜根因。" },
            { label: "5", title: "Function load", detail: "版本或函数加载异常要回到 App 同步与 Vercel Deployment。" },
          ],
          sourceUrl: "https://www.inngest.com/docs/functions",
        },
        {
          type: "steps",
          items: [
            { title: "按时间和版本定位", detail: "把 Run 与 Deployment、Event 和 Sentry trace 放进同一时间窗。" },
            { title: "先看失败 Step", detail: "区分函数加载、业务代码、外部依赖和已完成副作用。" },
            { title: "判断是否可重试", detail: "只有明确的临时失败、幂等副作用和退避边界才进入重试决策。" },
            { title: "记录而不复制", detail: "保存 Run 链接、状态、版本和错误类别，不复制 payload、Token 或外部响应正文。" },
          ],
        },
      ],
    },
    {
      id: "replay-concurrency",
      title: "Replay、Rerun、Cancel、Concurrency 与 Throttle",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/inngest/replay-concurrency.webp",
          alt: "脱敏后的 Inngest Function 配置页面，标出函数版本、环境、Retry、Rate Limit 与并发区域",
          title: "执行配置决定可靠性和成本上界",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "Function version", detail: "先确认配置属于哪个函数与环境，不把 Preview 配置当 Production。" },
            { label: "2", title: "Environment filter", detail: "环境筛选决定下面的 Retry、Rate Limit 和 Concurrency 作用域。" },
            { label: "3", title: "Retry count", detail: "有限次数与退避控制失败成本；数值变化属于普通变更。" },
            { label: "4", title: "Rate Limit", detail: "按 key 和时间窗限流，避免下游被重试或突发事件压垮。" },
            { label: "5", title: "Concurrency", detail: "并发上限保护资源，但也会增加排队延迟；不要在生产随意调整。" },
          ],
          sourceUrl: "https://www.inngest.com/docs/guides/concurrency",
        },
        {
          type: "table",
          headers: ["动作 / 配置", "发生什么", "副作用风险"],
          rows: [
            ["Retry", "同一 Run 按策略再次尝试失败步骤", "重复调用外部系统"],
            ["Replay", "重新处理已有事件或失败执行", "可能再次发送通知、写数据或扣费"],
            ["Rerun", "按当前函数逻辑重新开始一次执行", "代码和配置已变化，结果可能不同"],
            ["Cancel", "停止未完成的执行", "已完成步骤无法自动撤销"],
            ["Concurrency", "限制同时运行数量", "过低积压，过高压垮依赖"],
            ["Throttle / Rate Limit", "限制时间窗内触发量", "配置错误会丢延迟或造成业务饥饿"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "生产重放需要单独确认",
          text: "重放属于普通变更或高风险动作，取决于副作用。必须先确认幂等键、下游状态、重复通知策略、最大数量和停止办法；本课程不在真实生产环境重放。",
        },
      ],
    },
    {
      id: "usage",
      title: "Usage、失败率、耗时与积压的日常判断",
      blocks: [
        {
          type: "screenshot",
          src: "/course/production-ops/inngest/usage.webp",
          alt: "脱敏后的 Inngest Usage 页面，标出事件、步骤和运行维度、时间范围、执行柱状图和额外执行指标",
          title: "Usage 页面看执行量趋势",
          capturedAt: "2026-07-22",
          imageKind: "real",
          width: 1920,
          height: 802,
          legend: [
            { label: "1", title: "Metric tabs", detail: "区分 Event、Step、Run 等统计维度，不把一次 Run 等同于一个步骤。" },
            { label: "2", title: "Period", detail: "使用可比较的时间范围，避免把月累计和单日异常混看。" },
            { label: "3", title: "Execution chart", detail: "观察突发柱状、周期性增长和发布后的变化。" },
            { label: "4", title: "Additional executions", detail: "额外执行可能来自重试、重放或新流量，需回到 Runs 分解。" },
          ],
          sourceUrl: "https://www.inngest.com/docs/platform/usage",
        },
        {
          type: "table",
          headers: ["信号", "正常 / 异常判断", "下一步"],
          rows: [
            ["Failure rate", "小幅波动可正常；新版本后持续上升是异常", "按 Function、版本、错误类别分桶"],
            ["Duration", "与历史基线接近；P95 持续上升需处理", "看具体 Step 和外部依赖"],
            ["Queue depth", "短时排队后恢复；长期积压是异常", "检查 Concurrency、下游限流与事件突增"],
            ["Usage", "与业务量同步；执行量脱离流量是可疑", "拆分重试、重放、重复 Event 和突发流量"],
          ],
        },
        {
          type: "paragraph",
          text: "不要把平台套餐数字写死在 Runbook。每周用相同时间窗比较执行量、步骤量、失败率、耗时和积压，关注变化方向；费用或额度接近边界时先降低重复执行和非必要日志，再按当前官方 Usage 说明确认。",
        },
      ],
    },
    {
      id: "idempotency",
      title: "幂等键、不可重试错误与成本上界",
      blocks: [
        {
          type: "diagram",
          title: "一个安全重试决策",
          chart: `flowchart TD
  F[Function failed] --> C{Classify error}
  C -->|Transient + idempotent| R[Retry with backoff]
  C -->|Invalid / permission| S[Stop and record]
  C -->|Side effect unknown| H[Human confirmation]
  R --> L{Budget and concurrency ok?}
  L -->|yes| N[Retry once within limit]
  L -->|no| Q[Queue or dead-letter path]`,
        },
        {
          type: "table",
          headers: ["设计项", "最小要求", "验证方式"],
          rows: [
            ["Idempotency key", "同一业务事件可识别重复执行", "重复 fixture 只产生一次副作用"],
            ["Retry budget", "最大次数、退避和总时长明确", "模拟连续失败检查 Run 数量"],
            ["Non-retryable", "输入、权限、Schema 等错误显式分类", "错误直接进入记录或人工队列"],
            ["Concurrency", "按资源和下游能力设上限", "压测观察队列、延迟和错误率"],
            ["Cost bound", "事件、步骤和重试数量有监控", "Usage 趋势脱离基线能触发提醒"],
          ],
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
            { title: "查看失败 Run", detail: "按窄时间窗筛选 Failed，记录 Function、版本、耗时和失败 Step。" },
            { title: "核对配置", detail: "只读查看 Retry、Rate Limit、Concurrency 的当前作用域，不保存修改。" },
            { title: "分解 Usage", detail: "把额外执行和步骤量与发布、流量和重试关联，不依赖套餐静态数字。" },
            { title: "停止重放", detail: "若副作用未知或存在重复风险，只记录证据并转人工确认，不点击 Replay / Rerun / Cancel。" },
          ],
        },
        {
          type: "paragraph",
          text: "本案例的重试与成本检查只读失败率、耗时、积压和 Usage 趋势；任何 Replay、Rerun、Cancel 或并发修改都留到独立练习环境。",
        },
        {
          type: "table",
          headers: ["风险", "示例", "规则"],
          rows: [
            ["只读", "查看配置、失败率、Run、Step、Usage", "允许在生产执行，遮挡输入输出"],
            ["普通变更", "练习环境调整 Retry、Concurrency、Throttle", "用 fixture 压测并验证成本上界"],
            ["高风险", "生产 Replay、Rerun、Cancel、批量重放", "先确认幂等和副作用，另行审批"],
          ],
        },
        {
          type: "callout",
          tone: "warning",
          title: "常见误区",
          text: "不要把重试次数当成功率，不要因一次 Failed 就批量 Replay，不要把 Completed 当作外部副作用已确认，也不要在高并发积压时继续提高并发。",
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
            ["Retry", "重试", "只对可恢复且幂等的失败使用"],
            ["Replay / Rerun", "重放 / 重跑", "可能重新产生副作用，不能随便点击"],
            ["Concurrency", "并发上限", "保护下游与成本，过低会积压"],
            ["Throttle", "限流", "限制时间窗触发量，不等于幂等"],
            ["Idempotency", "幂等", "重复执行不会重复产生业务结果"],
          ],
        },
        {
          type: "resources",
          title: "Inngest 重试、并发与用量官方文档",
          items: [
            { title: "Retries", url: "https://www.inngest.com/docs/features/retries", kind: "docs", note: "重试、退避和错误处理。" },
            { title: "Concurrency", url: "https://www.inngest.com/docs/guides/concurrency", kind: "docs", note: "并发、限流与队列控制。" },
            { title: "Idempotency", url: "https://www.inngest.com/docs/guides/idempotency", kind: "docs", note: "幂等设计与重复执行边界。" },
            { title: "Usage", url: "https://www.inngest.com/docs/platform/usage", kind: "docs", note: "当前执行量和计量维度，以平台当前说明为准。" },
          ],
        },
        {
          type: "checkpoint",
          title: "P08 自检",
          criteria: [
            "能区分可重试、不可重试和副作用未知的失败",
            "能解释 Retry、Replay、Rerun、Cancel、Concurrency、Throttle 的差异",
            "能用失败率、耗时、积压和 Usage 找到异常趋势",
            "能为函数写出幂等键、最大重试次数和成本上界的验证方法",
            "能在生产重放、取消、并发和限流按钮前停止并请求确认",
          ],
        },
      ],
    },
  ],
};
