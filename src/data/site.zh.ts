// Chinese copy for everything in site.ts. Shapes mirror the English source so
// content.ts can merge the two without either side knowing about the other;
// slugs, links, dates and images stay language-neutral and live only in site.ts.

import type { AboutCard, CurrentlyItem, Project } from "./site";

export const siteZh = {
  tagline: "构建会记住你的 AI",
  status: "AI 与 GPU 系统",
  location: "新西兰 奥克兰",
  bio: "11 年级学生，做 AI 陪伴应用、全栈 Web 平台和 GPU kernel，有数学建模竞赛和 AI 辅助开发的经历。",
};

export const projectStatusZh: Record<NonNullable<Project["status"]>, string> = {
  Live: "已上线",
  "In development": "开发中",
};

type ProjectCopy = { description: string; tags: string[] };

export const projectsZh: Record<string, ProjectCopy> = {
  "soulor-ai": {
    description:
      "Soulor 是一个会记住你的陪伴应用。每个角色都有自己的性格和声音，关系随着好感、信任和亲密度，在从陌生人到灵魂伴侣的五个阶段之间推进——这些状态会一路进入生成本身，所以角色说话的方式会随着它对你的了解而改变。同一套引擎也驱动模拟模式，一件真实发生的事可以同时被几种视角各走一遍，于是它也成了一个先排练难开口的对话、再去现实里真正开口的地方。",
    tags: ["记忆进入采样", "五阶段关系推进", "从修改中学到的偏置", "一套引擎，所有模式"],
  },
  vnportal: {
    description:
      "VNportal 是一个建立在实时音频之上的黑胶与音乐平台。找到一张唱片，听见它背后的声音，然后用双卡座混音、把它切进 DAW，或者进入一局由这首曲子自身节拍生成谱面的节奏游戏——下游的一切都由真正加载进来的那段音频生成。它也会写自己的声音：一次只要一件乐器，速度和调性由你设定，回来的片段严格锁在小节上、首尾能干净循环，是一段由你安放的声部，而不是一首成品。",
    tags: ["谱面来自检测到的节拍", "一份音频，所有模式", "一次只生成一件乐器", "速度即 token 预算"],
  },
};

export const aboutCardsZh: AboutCard[] = [
  {
    period: "2026 – 2028 · 奥克兰",
    title: "11 年级学生",
    description:
      "一边上学一边做 AI 产品，课业上也经常写结构化的数学与分析类报告。",
  },
  {
    period: "竞赛",
    title: "数学建模",
    description:
      "在竞赛时限内与队友合作完成数学建模论文，分析真实世界的问题——查资料、立假设、建模型、写结论，再一起反复打磨。",
  },
  {
    period: "持续进行",
    title: "AI 研究与开发",
    description:
      "用 Claude、VS Code、Google Colab 这类工具读前沿模型论文、写 GPU kernel、解决真实问题，并把 Web 应用做出来上线。",
  },
  {
    period: "志愿",
    title: "国际数学社区",
    description:
      "在 Mustang Math Community 做技术与课程开发方面的志愿工作，贡献技术能力、创意思考和数学解题经验。",
  },
];

export const skillsZh: string[] = [
  "Triton GPU Kernel",
  "PyTorch",
  "GPU 基准测试与性能分析",
  "大模型微调 (LoRA)",
  "模型部署 (vLLM、Modal)",
  "大模型编排与回退路由",
  "全栈 TypeScript (Next.js、Express)",
  "Supabase 与 Postgres",
  "实时 Web 音频",
  "数学建模",
  "技术写作",
  "AI 辅助开发",
];

export const currentlyLearningZh: CurrentlyItem[] = [
  {
    label: "在读",
    title: "Kimi K3 技术报告",
    detail:
      "逐节读到第 10 部分——过了 KDA 与注意力残差、Stable LatentMoE，进入后训练。第 11 部分讲怎么构建可信的奖励，正好接上下面那项研究。",
  },
  {
    label: "在写",
    title: "Triton GPU kernel",
    detail:
      "第 7 周完成：把交叉熵的前向和反向融进同一个 kernel——在 vocab 131072 下快 1.51 倍、峰值显存少 1.67 倍，也是这条线上第一次真正公平的基准。第 8 周把线性层也折进去，让完整的 logits 张量根本不再出现。",
  },
  {
    label: "接下来",
    title: "RLVR 验证器研究",
    detail:
      "一篇关于「持续出错的验证器何时会真正损害 GRPO 训练」的论文——固定错误率和不对称性，扫描持续性，并厘清两篇结论相左的已发表结果之间的地带。",
  },
];
