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
      "大多数陪伴类应用在两次对话之间就把你忘了，还把整段关系都塞进一条 prompt 里，于是每个角色最后听起来都差不多。Soulor 把这些状态推进到生成本身——记忆和关系阶段会直接改变角色说话的方式，从陌生人到灵魂伴侣的五个阶段把它一路带下去，角色的语气因此随时间彼此分化。同一套引擎也驱动模拟模式，所以它同时是一个可以先排练一场难开口的对话、再去现实里真正开口的地方。",
    tags: ["Express 网关", "Supabase", "区域感知路由", "微调流程"],
  },
  vnportal: {
    description:
      "音乐工具要么只给你一个播放键就结束了，要么把整首歌丢给模型，然后管这叫创作。VNportal 把一首曲子当作素材，把决定权留在人手里：找到一张唱片，听见它背后的分轨，然后混音、切进 DAW，或者把它当成一局由歌曲自身节拍生成谱面的节奏游戏。它的生成一次只要一件乐器，速度和调性由你设定，所以回来的是一段可以由你安放的声部，而不是一首直接塞给你的成品。",
    tags: ["Vite SPA", "Express 网关", "Supabase", "实时音频管线"],
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
