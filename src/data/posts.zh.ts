// Chinese copy for every post in posts.ts, keyed by slug. Slug, date, category
// and image stay in posts.ts — the two languages share one set of URLs, so a
// post is the same post in both and the header toggle can swap between them.
//
// Links back to this site point at /zh/... so a Chinese reader following one
// stays in Chinese; the post renderer turns those into client-side routes.

import type { Post } from "./posts";

export type PostCopy = Pick<Post, "title" | "excerpt" | "paragraphs"> & {
  imageAlt?: string;
};

export const postsZh: Record<string, PostCopy> = {
  "hello-world": {
    title: "你好，世界",
    excerpt: "把这个站点建起来，用来放我的项目和写的东西。",
    paragraphs: [
      "嗨，我是 Richael——这里是我放正在做的东西、以及边做边写下的想法的地方，省得它们一直散在笔记和写了一半的文档里。",
      "内容会比较杂：数学建模、AI 工具、我当下正扎进去的项目，大概还会有一些跑题的东西。",
    ],
  },
  "what-is-soulor-ai": {
    title: "Soulor AI 是什么",
    excerpt:
      "Soulor AI 是一个陪伴与社交模拟平台——不只是一个聊天搭子，而是一个建立关系、也排练关系的地方。",
    paragraphs: [
      "Soulor AI 是一个陪伴与社交模拟平台——不只是一个聊天搭子，而是一个建立关系、也排练关系的地方。",
      "陪伴的那一半会记住你：你的名字、你的心情、反复出现的梗、你生活里的人——自然地、不用你提醒就浮出来。每个角色都有自己的性格和形象，关系会随着好感、信任和亲密度的累积，走过从陌生人到灵魂伴侣的五个阶段。",
      "模拟的那一半更实用：Simulate 模式让你和完全自定义的角色（名字、性格、背景故事）对戏；Storytelling 模式把一件真实处境同时交给 7 个不同的 AI 视角——可以用来排练一场难开口的对话，或者单纯看看自己漏掉的角度。再加上带实时动画面孔的语音／视频通话、用于情绪检查的 Support 模式，以及一层 wellness 功能（写日记、习惯打卡、引导呼吸），整体是照着每天都能用来做的，而不是一次性的噱头。",
      "可用的版本在 soulor-ai.vercel.app。",
    ],
  },
  "writing-my-first-gpu-kernel": {
    title: "写下我的第一个 GPU Kernel",
    excerpt:
      "今天跟着官方教程写完了第一个 Triton kernel（向量加法）。正确性没问题，在 T4 上的吞吐几乎和 PyTorch 完全一致。",
    paragraphs: [
      "今天跟着官方教程写完了第一个 Triton kernel（向量加法）。正确性确认无误（与 PyTorch 的最大差值 = 0.0），在 T4 GPU 上的吞吐也几乎和 PyTorch 完全重合。",
      "下一个：一个真正有空间超过基线的 kernel（softmax）。",
    ],
    imageAlt:
      "折线图，比较 Triton 与 PyTorch 在 10^4 到 10^8 个元素的向量规模上的吞吐（GB/s），两条线基本重合，并在 240 GB/s 附近趋于平缓。",
  },
  "fused-softmax-kernel": {
    title: "在 Triton 里融合 Softmax",
    excerpt:
      "朴素 softmax 要在内存上走三趟——融成一趟后从约 55 GB/s 提到约 230 GB/s，快了 4 倍，而且比 PyTorch 自己的 kernel 更稳。",
    paragraphs: [
      "本周中段的第二个 kernel：融合 softmax。朴素 softmax 需要在内存上走三趟（求最大值、exp 加求和、做除法）——融成一趟后从约 55 GB/s 提到约 230 GB/s，快了 4 倍。",
      "Triton 这条线在不同 block size 下也比 PyTorch 更紧、更稳定。",
      "下一个：flash attention。",
    ],
    imageAlt:
      "折线图，比较 Triton、PyTorch 和朴素 softmax 在约 250 到约 12500 列宽下的吞吐（GB/s）。Triton 稳定在 225–230 GB/s 的窄带内，Torch 在 210–245 GB/s 之间波动并有几次下陷，朴素 softmax 一直平在 50–60 GB/s。",
  },
  "flash-attention-kernel": {
    title: "Flash Attention：正确，但不快",
    excerpt:
      "正确性很稳，但在我的 T4 上比 PyTorch 慢约 25 倍——结果发现是 T4 本身就缺少 flash attention 需要的流水线硬件。",
    paragraphs: [
      "第三个 kernel：flash attention。正确性很稳（与 PyTorch 的最大差值 0.000122），但在我的 T4 上慢了约 25 倍。",
      "以为是计算受限，试了 exp2 的技巧——没有变化。T4（Turing）缺少 flash attention 需要的流水线硬件。是硬件上限，不是 bug。",
    ],
    imageAlt:
      "折线图，比较 Triton 与 Torch SDPA 在序列长度 512 到 8192 上的吞吐（TFLOPs/s）。Torch SDPA 很快爬到 13–14 TFLOPs/s，Triton 在所有序列长度上都平在 0.5 TFLOPs/s 附近。",
  },
  "triton-matmul-no-tensor-cores": {
    title: "矩阵乘：正确，但没用上 Tensor Core",
    excerpt:
      "输出和 PyTorch 对得上，但不管矩阵多大吞吐都平在 1 TFLOPS 左右，而 cuBLAS 能爬到 38——一路查到编译出的 PTX，里面一条 tensor core 指令都没有。",
    paragraphs: [
      "第四个 kernel：分块矩阵乘。结果正确（在 fp16 容差内与 torch.matmul 一致），但不管矩阵多大都平在约 1 TFLOPS，而 PyTorch 的 cuBLAS 能爬到约 38 TFLOPS。",
      "「多大都一样平」正是计算受限 kernel 的典型症状——有东西没被启用。试过更深的流水线（num_stages），试过把边界掩码去掉，都纹丝不动。直接 grep 了编译出来的 PTX：没有任何 mma.sync、HMMA 或 wmma 指令。Tensor core 一次都没被触发。",
      "和 flash attention 不同，这一次不是硬性的架构墙——Turing 是有 tensor core 的。更像是当前的 Triton（3.6.0）已经不再为 T4 的 sm_75 目标生成 tensor core 代码了，因为项目的重心已经转向更新的硬件。连续第二周用老 T4，实实在在地暴露出当前 Triton 面向的硬件、和 Colab 免费档 GPU 实际能做的事之间的差距。",
    ],
    imageAlt:
      "折线图，比较 Triton 与 PyTorch cuBLAS 在 256 到 3840 的方阵规模上的矩阵乘吞吐（TFLOPS）。PyTorch 在 M=1800 附近陡升到约 38 TFLOPS 的峰值，随后逐步回落到约 19 TFLOPS，Triton 在整个区间都平在 1 TFLOPS 附近。",
  },
  "rmsnorm-forward-and-backward": {
    title: "RMSNorm：前向、反向，以及它为什么重要",
    excerpt:
      "最近正在读 Kimi K3 的报告，RMSNorm 和注意力残差一起，反复作为它比较大的架构收益出现——所以这周的 kernel 就是 RMSNorm 的前向和反向。",
    paragraphs: [
      "第五个 kernel：RMSNorm，前向加反向。动机来自这条线的论文那一半——最近在读 Kimi K3 的报告，RMSNorm 反复作为报告里比较大的架构收益出现，就紧挨着注意力残差。感觉与其只是读到，不如动手写一遍。",
      "前向：正确（最大差值 0.00195，属于正常的 fp16 容差），约 230 GB/s，对比未融合的 PyTorch 基线约 20 GB/s。和几周前 softmax 那次是同一个融合故事。",
      "反向是更难的一半——得真的把梯度推出来（dx = rrms * (dxnorm - x_norm * mean(dxnorm * x_norm))），而且权重梯度需要跨每一行求和，不只是行内。这里用了 atomic_add，能跑通（dx 差值 0.0078，dweight 差值 0.0625，考虑到 dweight 的数值尺度更大，两个都没问题），但它的吞吐曲线是锯齿状的，不像前向那条那么干净——是真实的原子操作争用，不是 bug。不管怎么说，都还是比 PyTorch 快约 10 倍。",
      "下一步：要么用一个正经的两阶段归约把原子操作修掉，要么直接进第 6 周。",
    ],
    imageAlt:
      "折线图，比较 Triton 与 PyTorch 在 1024 到 15872 列宽下 RMSNorm 反向的吞吐（GB/s）。Triton 陡升后落在大致 108–150 GB/s 之间的锯齿带里，有明显的下陷，PyTorch 一直平在 11 GB/s 附近。",
  },
  "rope-forward-and-backward": {
    title: "RoPE：一个 kernel 管两个方向",
    excerpt:
      "第六个 kernel：旋转位置编码，Kimi K3 注意力栈里另一块值得动手写的部分。好玩的不是加速比，而是反向直接复用了前向那个 kernel——把 sin 的符号翻一下就行。",
    paragraphs: [
      "第六个 kernel：RoPE（旋转位置编码），前向加反向。和上周的 RMSNorm 是同一条论文线索——还在读 Kimi K3 的报告，RoPE 是它注意力栈里另一块值得动手写、而不是读过去就算了的部分。用的是 Llama 那种「rotate-half」约定——把 head_dim 对半切开，让两半互相旋转——而不是 GPT-J 的交错配对版本，因为现在大多数 LLM（包括 Kimi K3）用的都是前者。",
      "两个方向都正确：前向最大差值 0.00390625，反向最大差值 0.00390625，都是正常的 fp16 舍入。吞吐：在序列长度 512–8192 上，Triton 约 156–206 GB/s，PyTorch eager 平在约 38–46 GB/s。不过和 softmax、RMSNorm 一样要加个限定——那是融合 kernel 对未融合的 eager 基线，不是融合对融合，所以我不把它算作一次干净的胜利。",
      "真正有意思的地方是：反向不需要第二个 kernel。旋转 -theta 正好抵消旋转 theta，所以反向就是把前向那个 kernel 再调一次，用一个 NEGATE_SIN 标志在编译期把 sin 变成 -sin。不用另外推一遍梯度，也不用再写一套指针运算。",
      "下一个大概是交叉熵损失的前向和反向——它是每一步训练都会碰到的那个算子，而且能把 RMSNorm 和 RoPE 补成一个看起来真像 transformer 前向的东西。",
    ],
    imageAlt:
      "折线图，比较 Triton 与 PyTorch 在序列长度 512 到 8192 上 RoPE 的吞吐（GB/s）。Triton 在 seq_len 2000 附近升到约 205 GB/s 的峰值，随后逐步回落到约 156 GB/s，PyTorch 一直平在 40–47 GB/s。",
  },
  "fused-cross-entropy": {
    title: "交叉熵：差点把我骗过去的那次基准测试",
    excerpt:
      "第七个 kernel：交叉熵，前向和反向融进一趟。这是我第一次做融合对融合的比较——也正因为这样才抓到，那个 2.5 倍加速只是我把基线拖了后腿。",
    paragraphs: [
      "第七个 kernel：交叉熵损失，前向和反向融进同一个 kernel。梯度就是 softmax(logits) - onehot(target)，除了 logits 什么都不依赖——所以可以在前向时就算出来，直接写回输入缓冲区。PyTorch 必须再为梯度分配一个 [batch, vocab] 张量。这个不用。",
      "第一组数字是快 2.5 倍、省 2.5 倍显存，我差点就到此为止了。我的基线是 F.cross_entropy(x.float(), targets)，而那个 .float() 悄悄给 logits 做了一份完整的 fp32 拷贝，这笔开销我的 kernel 根本不付。换成诚实的 fp16 基线后，在 vocab 131072 下是快 1.51 倍（15.9ms 对 24.0ms）、峰值显存少 1.67 倍——而且在每个 vocab 规模下都恰好是 1.67 倍，因为 PyTorch 在前向加反向期间要让五份 logits 同时活着，而这个只要三份。这个坑值得抓，因为 F.cross_entropy 本身就是个真正的融合 kernel：这是我第一周不再拿未融合的 eager PyTorch 当对照。",
      "代价在这里：vocab 32k 时，它写出去的梯度值有 74.3% 恰好是零。每个值大约是 1/(vocab x batch) ≈ 6e-8，而 fp16 最小的次正规数是 5.96e-8，所以尾部在写进缓冲区的路上就下溢了。GradScaler 也救不了——那个缩放是在 backward() 里才到的，那时 kernel 早就把它们存完了。",
      "下一个大概是融合的 linear + cross-entropy——把 lm_head 投影分块折进损失里，让 [batch, vocab] 的 logits 根本不存在。",
    ],
    imageAlt:
      "两张折线图，在 T4 上比较 Triton 融合交叉熵与 torch F.cross_entropy，vocab 从 4096 到 131072。左图是前向加反向耗时：Triton 在 vocab 131072 时约 15.9ms，PyTorch 约 24.0ms。右图是峰值显存：Triton 始终低于 PyTorch，最终约 1611MB 对 2684MB。",
  },
  "fused-swiglu-mlp": {
    title: "融合 SwiGLU：速度打平，张量从四个变两个",
    excerpt:
      "第九个 kernel：融合的 SwiGLU MLP。时间上和 torch.compile 打平，但在前向到反向之间只留两个大激活张量，而 eager 留四个——因为编译器会替你做融合，却不会替你把一个激活扔掉。",
    paragraphs: [
      "第九个 kernel：融合的 SwiGLU MLP，transformer block 里我还没写过的最后一块。一个 SwiGLU MLP 会造出三个 [rows, intermediate] 的张量——两次投影得到的 g 和 u，然后是 h = silu(g) * u——而 intermediate 是 hidden 的 3 到 4 倍，所以这个 block 的显存就停在那里。这里融合了两件事。逐元素的 silu 和乘法合成一个 Triton kernel。以及 h 根本不再被保存：eager 之所以让它活着，是因为下投影算权重梯度时需要它，所以这一版把那次投影折进同一个 autograd 节点，让 h 在前向里就死掉，反向时再从 g 和 u 重算出来。",
      "对上 torch.compile，时间是平手——intermediate 为 16384 时是 27.50ms 对 26.68ms，在 2048 以上的每一个规模都在 3% 以内。显存不是平手。前向到反向之间留住的量：eager 260MB，torch.compile 196MB，这一版 132MB。那正好是 [2048, 16384] 这个张量的四份、三份和两份，再加上输入。整步峰值是 420 / 356 / 292MB。",
      "而这才是真正的发现。torch.compile 把融合做掉了——它把 silu 折进乘法，把 eager 的四个保存张量降到三个，一行代码，免费，逐元素这块我是赢不过它的。它不会做的，是决定把一个激活扔掉、再花代价重建它。那个决定需要知道 h 可以从已经保存的东西里便宜地重算出来，而且它改的是 autograd 图的形状，不是 kernel。这周赢的地方不是 kernel，是 autograd 节点的边界划在了哪里。",
      "这也是离开 Colab 的第一周——它跑在 Modal 的 T4 上，同一张卡，所以数字仍然和第 1 到 8 周对得上。这样一来下一个就很明显了：flash attention 从第 3 周起就一直没写完，只有前向，而且比 torch 慢 25 倍，因为 T4 是 Ampere 之前的卡，没有 cp.async 可以做流水。而 Modal 按分钟出租 Ampere。",
    ],
    imageAlt:
      "两张折线图，在 T4 上比较 Triton 融合 SwiGLU MLP 与 torch eager、torch.compile，N=2048 行、hidden 1024、fp16，intermediate 从 1024 到 16384。左图是前向加反向耗时：三条线收敛，torch.compile 和融合版在 intermediate 16384 处重叠在约 27ms，eager 略高，约 28ms。右图是前向到反向之间留住的激活：三条线明显分开，eager 升到 260MB，torch.compile 到 196MB，融合版到 132MB。",
  },
  "fused-linear-cross-entropy": {
    title: "融合 Linear + CE：显存少 10 倍，而且更慢",
    excerpt:
      "第八个 kernel：把 lm_head 投影分块折进损失里，让 [batch, vocab] 的 logits 根本不存在。激活显存少了约 10 倍——而且在每一个规模上都更慢。",
    paragraphs: [
      "第八个 kernel：融合 linear + cross-entropy。上周那版仍然把 [batch, vocab] 的 logits 当输入，然后发现正是这个张量主导了时间和显存。所以这一版把 lm_head 投影拉进损失里：投影一块行，把它变成损失和梯度，折进 dx 和 dw，然后释放。完整的 logits 张量从不存在。反向必须在前向期间就跑——一块一旦释放，不重做那次矩阵乘就再也拿不回来。",
      "激活显存降了约 10 倍，从 vocab 4096 一路到 131072 都成立。它同时在每一个规模上都更慢，0.85–0.94 倍——而且把 chunk size 设成 2048（也就是只有一块、等于完全不分块）时仍然落后 9%。所以那个差距来自我的损失 kernel 和那些缩放梯度的 pass，不是分块本身。那个 10 倍也得加个限定：权重梯度是 [vocab, hidden]，两个版本都要分配它，所以它在测量里被抵消掉了。把显卡实际要装下的东西全算进去，峰值是 2181MB 对 978MB，2.23 倍。",
      "好的部分是上周那个下溢的下场。第 7 周把 (softmax - onehot)/n_valid 写进 fp16 缓冲区，74.3% 的值落成了恰好的零。这个 kernel 存的是纯粹的 softmax - onehot，取值在 [-1, 1] 之间，那个 1/n_valid 之后再作用到 dx 和 dw 上，那时张量已经很小了。同样的数学、同样的 dtype，零占比 0%——除法只是挪到了矩阵乘的另一边。",
      "下一个大概是融合的 SwiGLU MLP。RMSNorm、RoPE、注意力和损失都写完之后，它是 transformer block 里我还没写过的最后一块，也是这个 block 另一个存放大激活张量的地方。",
    ],
    imageAlt:
      "两张折线图，在 T4 上比较 Triton 融合 linear + cross-entropy 与 torch F.cross_entropy，vocab 从 4096 到 131072。左图是前向加反向耗时：融合版全程略高于 PyTorch，在 vocab 131072 时约 85ms 对 79ms。右图是峰值分配显存：PyTorch 陡升到约 1338MB，融合版几乎持平，最终约 134MB。",
  },
  "small-models-are-the-future": {
    title: "LLM 已死。小模型才是未来。",
    excerpt:
      "今天的 LLM 赢在文本预测和数据量，而不是深度——我们真正需要的，是在某一个领域扎得很深的小模型，LLM 只负责把它们接起来。",
    paragraphs: [
      "如今的 LLM，主要强在文本预测和数据积累。我得承认它们能处理很多跨领域的工作，包括难的那些，但它们的训练数据很杂，而且大多已经过时，按某些说法只到「教程级难度」。它们的优势也大同小异——「写代码」「推理」「长记忆」——在被宣传了这么多年之后，已经变得平淡，也没那么有用了。",
      "相反，我们越来越需要的，是面向深而窄的领域的高效小模型，以保证真正的专业表现，而不只是表面功夫；在它们各自的领域里，这类模型一定会胜过 LLM。比如各做一个给情感交流、天体物理、艺术，等等。LLM 在未来的角色，就只是把这些小模型接起来，做整合和跨领域的工作，产出更扎实的成果。",
      "我是 Richael，我正在微调 Qwen 14B 这样的小模型，来提升 Soulor——一个多角色陪伴与模拟应用——以及 VNportal——一个带有公平、可控 AI 辅助的音乐再创作与创作社区平台——的表现。我希望重新定义 AI 在当下和未来世界里的角色。如果你感兴趣，欢迎来看看我的应用、分享和支持。谢谢阅读，祝你一天愉快！",
    ],
  },
  "apps-are-just-prompt-shells": {
    title: "应用需要自己的模型，而不是一层 prompt 外壳",
    excerpt:
      "API 对日常用途来说依然足够高效也足够便宜，但对垂直应用来说，微调一个服务于窄领域的小模型正变得越来越必要。",
    paragraphs: [
      "今天大多数应用都只是套在 LLM 外面的一层 prompt 外壳。虽然其中有些火了，看起来也确实有用，但它们做不到底层模型做不到的任何事，而且在模型发新版之后很快就消失。而且由于这些模型是按广而不是按深来训练的，它们的输出没法专业到足以产出专门任务所要求的结果。API 对日常用途来说依然足够高效也足够便宜，但对垂直应用来说，训练——或者至少微调——一个服务于窄领域的小模型，正变得越来越必要。为什么小模型是必需的，可以看我上一篇：https://dh8116.github.io/zh/blog/small-models-are-the-future。",
      "我是 Richael。我在探索在应用里使用 AI 的新方式，以此重新定义它在下一个时代的角色。我目前在做两个应用：一个多角色陪伴与模拟平台，和一个音乐再创作与创作社区。如果你感兴趣，来看看我的网站，或者关注我获取更多内容！",
    ],
  },
  "fine-tuning-is-a-trade": {
    title: "微调是一笔交易，不是一次升级",
    excerpt:
      "所有人都在宣传微调带来什么，没人讲它的代价——我这一次买到的是调性和乐器辨识度，付出去的是节奏。",
    paragraphs: [
      "没有哪个决定值得仅仅因为「它有用」就去做；只有当它赢到的东西比付出去的更值钱时才值得做，而这一点你只有全程跑完才会知道。微调也是这样，而我仍然做了这个决定：宽泛的模型永远不会深到足以做专业的活，所以垂直应用必须训练自己的模型。但所有人都在宣传它带来什么，没人讲它的代价。",
      "我在给我的两个应用都微调小模型，这里是一份账单。我训练了一个小的音乐模型来生成单乐器分轨，它成功了——乐器和调性都对，而且会顺着已有的声部走，而不是瞎猜。但它丢掉了速度和节奏上的准确性，而基座模型在这一点上几乎分毫不差。所以这次训练买到的是调性和音色上的辨识度，换出去的是节奏。这笔交易仍然值得——但我只有拿到数据之后才敢这么说，在那之前的好几周里，我只能猜。",
      "而这正是之前那些「小模型」论证里缺掉的关键一环：微调改变的是整个场面，不只是你瞄准的那一处。凡是我们默认为背景的东西，都会在训练中悄悄漂移，看不出来，直到有什么撞上它。所以这里的结论不是「别微调」，而是：在训练之前就把要建的东西想周全，好让你最终有个可以对照的参照物。",
      "我是 Richael。我的两个应用是一个多角色陪伴与模拟平台，和一个音乐再创作与创作社区，我正在升级它们的模型，好让它们在各自独特的领域里发挥出全部潜力。我上一篇讲垂直应用为什么需要自己的模型，在这里：https://dh8116.github.io/zh/blog/apps-are-just-prompt-shells。如果你感兴趣，来看看我的网站或者关注我，谢谢你的支持！",
    ],
  },
  "ship-before-perfection-is-out-of-date": {
    title: "「先上线，再完美」已经过时了",
    excerpt:
      "这条建议在一个能跑的产品要一个团队做几个月的年代是成立的。现在代码由 agent 来写，一个人一天就能做完，而快速上线主要产出的是垃圾。",
    paragraphs: [
      "「先上线，再完美」是给那个「做东西很贵」的世界的建议。Reid Hoffman 这句名言被创造者们奉行了几十年：当一个能跑的产品要一个团队做几个月时，早点上线是唯一能去找用户反馈的办法。然而，那份成本现在基本消失了。在这轮 AI 热潮里，大部分代码由 agent 来写，一个人一天就能在网上做出一个完整可用的产品。但这条建议活得比支撑它的条件更久，它现在产出的是成千上万的 AI 垃圾——能跑、看起来做完了，却没有用——由那些被告知「上线才是关键」的人发出来。与此同时我们的空缺也在移动：这个产品值不值得被打开第二次，细节在真实使用下撑不撑得住，有没有人想过你真正身处的处境。",
      "所以这条建议现在看起来像是反了过来，变成了「完美优先于上线」。虽然上线仍然是拿到真实反馈的必要条件，但新项目本来就在到处、不停地被发出来。于是「完美」对应用、乃至对创造者本人，都变得越来越重要，那是从这个过热的市场里被看见的方式。知道什么值得做，并且拒绝在它真正够好之前把它放出去——这才是现在的创造者该遵循的。",
    ],
  },
  "leaderboard-changes-every-week": {
    title: "排行榜每周都在变，兴奋从来撑不过质疑",
    excerpt:
      "一个下午就来的兴奋，只能维持到一个前沿模型守住它的排名为止——平均一两周，而你从来没有自己测过那个模型。",
    paragraphs: [
      "昨天 Anthropic、OpenAI 和 xAI 都发了各自的全力新模型，几个小时之内，基准和性能测试就到处都是，显示 Astra 6 强过 Fable 5.1，OpenAI 又回到了前面。人们于是庆祝这个「历史性」时刻，把它当成 Dario 傲慢的报应。很多人宣布自己要退订 Claude，转去别的平台。",
      "这种场面好像之前出现过。几个月前也差不多，只是受害者换成了 OpenAI。目标一直在换，讨论却一模一样，而上一次宣布要换的人里，几乎没有谁在一个月后还在谈这件事。",
      "真正让人难受的不是人们站哪一边，而是这股热情爆起和跌落的速度，以及它的代价。一个下午就来的兴奋，只能维持到一个前沿模型守住它的排名为止——平均一两周。你换过去，得到几周的新鲜感，下一次发布落地，你再换一次。你从来没有自己测过它们的能力。",
      "而一个工具只有在无聊的那部分之后才开始回报你：在你摸清它在哪里会失败、它需要你的 prompt 给它什么、哪些活不能交给它之后。这比造势要花更长的时间，而造势衡量的只是一个窄的、平均过的能力版本，通常和你自己的工作没什么关系。",
      "有用的问题从来不是哪个实验室在赢。你只有和它待得够久、真正用起来，才选得出来——从 Qwen 3.8-27b 到 Claude Opus 5。",
    ],
  },
};
