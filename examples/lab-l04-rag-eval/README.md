# Lab L04 — RAG 入库与检索评估

**能力：** S5（独立 ESM 子包、离线评测）  
**关联课：** 知识检索 / RAG 流水线

## 目标

在**无 OpenAI、无 Qdrant、测试零网络**的前提下，练习 RAG 入库前的**文本切块（含 overlap）**、内存中的**词项重叠排序检索**，以及 **Recall@K** 指标。语料与金标查询均在 `fixtures` 中固定，适合 CI mock 回归。

## 本地运行

```bash
cd examples/lab-l04-rag-eval
npm install
npm test
```

类型检查 + 测试：

```bash
npm run check
```

**CI：** 根仓库串联本子包时，仅跑 Vitest 内存逻辑，不调用任何付费模型或外部向量库。

## 包结构

| 文件 | 说明 |
|------|------|
| `src/chunk.ts` | 按字符或 token 切块，支持 overlap |
| `src/retrieve.ts` | 内存词项重叠 / BM25-lite 排序，返回 chunk id |
| `src/metrics.ts` | `recallAtK(relevantIds, retrievedIds, k)` |
| `src/fixtures.ts` | 小语料 + 查询金标 relevant id |
| `src/*.test.ts` | 切块边界、排序、指标与边界用例 |

## 要点

- **切块：** `chunkSize` 与 `overlap` 同单位；`overlap >= chunkSize` 会抛错。
- **检索：** 对 query 与 chunk 做简单分词后计分，无 embedding。
- **Recall@K：** 相关 id 在检索结果前 K 条中的命中比例；无金标时定义为 1。

## 验收清单（≥5）

完成本 Lab 后，你应能勾选以下项（与 `npm test` 对齐）：

1. [ ] 字符切块在 overlap 下边界连续、id 为 `{source}#{index}`
2. [ ] token 切块按词滑动窗口产出预期片段
3. [ ] fixture 查询的 gold chunk 排在检索结果首位
4. [ ] `recallAtK` 全命中、部分命中、仅看前 K 条等行为正确
5. [ ] 空语料、`k=0`、无相关 id 等边界不抛错且语义明确
6. [ ] `npm run check` 通过（`tsc --noEmit` + Vitest）

## 与 S5 的对应

- 独立 `package.json` + NodeNext ESM + Vitest，与主站解耦  
- 评测指标可复用到真实向量库实现（替换 `retrieve` 即可）  
- 固定 fixture 保证 CI 可重复、无外部依赖
