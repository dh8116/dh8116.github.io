export type Post = {
  slug: string;
  title: string;
  date: string;
  // "kernel" posts are grouped separately on /blog; anything else is general.
  category?: "kernel";
  excerpt: string;
  paragraphs: string[];
  image?: string;
  imageAlt?: string;
};

const unsortedPosts: Post[] = [
  {
    slug: "hello-world",
    title: "Hello, world",
    date: "2026-07-25",
    excerpt: "Starting this site as a place to put my projects and writing.",
    paragraphs: [
      "Hi, I'm Richael — this is a spot for me to put what I'm working on and write down thoughts as I go, instead of letting them stay scattered across notes and half-finished docs.",
      "Expect a mix of things here: math modelling, AI tools, whatever project I'm currently deep in, and probably some tangents too.",
    ],
  },
  {
    slug: "what-is-soulor-ai",
    title: "What Is Soulor AI",
    date: "2026-07-25",
    excerpt:
      "Soulor AI is a companion and social simulation platform — not just a chat buddy, but a space to build relationships and rehearse them.",
    paragraphs: [
      "Soulor AI is a companion and social simulation platform — not just a chat buddy, but a space to build relationships and rehearse them.",
      "The companion side remembers you: your name, your mood, running jokes, the people in your life — surfaced naturally, unprompted. Each companion has its own personality and avatar, and the relationship evolves through five stages, from Stranger to Soulmate, as affection, trust, and intimacy build over time.",
      "The simulation side is further useful: Simulate mode lets you roleplay with fully custom agents (name, personality, backstory), and Storytelling mode takes one real situation and runs it through 7 different AI perspectives simultaneously — useful for rehearsing a hard conversation or just seeing an angle you missed. Voice/video calls with a live animated face, a Support mode for emotional check-ins, and a wellness layer (journaling, habits, guided breathing) round it into something built for daily use, not a one-off gimmick.",
      "A working version is available at soulor-ai.vercel.app.",
    ],
  },
  {
    slug: "writing-my-first-gpu-kernel",
    category: "kernel",
    title: "Writing My First GPU Kernel",
    date: "2026-07-26",
    excerpt:
      "Built my first Triton kernel today (vector add), following the official tutorial. Correctness confirmed, and it matches PyTorch's throughput almost exactly on a T4 GPU.",
    paragraphs: [
      "Built my first Triton kernel today (vector add), following the official tutorial. Correctness confirmed (max diff = 0.0 vs PyTorch), and it matches PyTorch's throughput almost exactly on a T4 GPU.",
      "Next: a kernel where there's actual room to beat the baseline (softmax).",
    ],
    image: "/blog/triton-vector-add-benchmark.png",
    imageAlt:
      "Line chart comparing Triton and PyTorch throughput (GB/s) across vector sizes from 10^4 to 10^8 elements, showing the two lines closely overlapping and plateauing around 240 GB/s.",
  },
  {
    slug: "fused-softmax-kernel",
    category: "kernel",
    title: "Fused Softmax in Triton",
    date: "2026-07-29",
    excerpt:
      "Naive softmax needs 3 passes over memory — fusing them into one pass takes it from ~55 GB/s to ~230 GB/s, a 4x jump, and holds a tighter line than PyTorch's own kernel.",
    paragraphs: [
      "Mid-week 2nd kernel: fused softmax. Naive softmax needs 3 passes over memory (max, exp+sum, divide) — fusing into one pass takes it from ~55 GB/s to ~230 GB/s, a 4x jump.",
      "Triton's line is also tighter and more consistent than PyTorch's across block sizes.",
      "Next: flash attention.",
    ],
    image: "/blog/triton-softmax-benchmark.png",
    imageAlt:
      "Line chart comparing Triton, PyTorch, and naive softmax throughput (GB/s) across row widths from ~250 to ~12,500 columns. Triton holds a tight band around 225-230 GB/s, Torch fluctuates between 210-245 GB/s with several dips, and naive softmax stays flat around 50-60 GB/s.",
  },
  {
    slug: "flash-attention-kernel",
    category: "kernel",
    title: "Flash Attention: Correct, but Not Fast",
    date: "2026-08-03",
    excerpt:
      "Correctness is solid, but it's ~25x slower than PyTorch on my T4 — turns out the T4 just lacks the pipelining hardware flash attention needs.",
    paragraphs: [
      "3rd kernel: flash attention. Correctness is solid (max diff 0.000122 vs PyTorch), but it's ~25x slower on my T4.",
      "Tried the exp2 trick thinking it was compute-bound - no change. T4 (Turing) lacks the pipelining hardware flash attention needs. Hardware limit, not a bug.",
    ],
    image: "/blog/triton-flash-attention-benchmark.png",
    imageAlt:
      "Line chart comparing Triton and Torch SDPA throughput (TFLOPs/s) across sequence lengths from 512 to 8192. Torch SDPA climbs quickly to 13-14 TFLOPs/s, while Triton stays flat around 0.5 TFLOPs/s across all sequence lengths.",
  },
  {
    slug: "triton-matmul-no-tensor-cores",
    category: "kernel",
    title: "Matmul: Correct, but No Tensor Cores",
    date: "2026-08-09",
    excerpt:
      "Output matches PyTorch, but throughput stays flat around 1 TFLOPS no matter the matrix size while cuBLAS climbs to 38 — traced it to the compiled PTX and found zero tensor-core instructions.",
    paragraphs: [
      "4th kernel: tiled matmul. Correct (matches torch.matmul within fp16 tolerance), but flat around ~1 TFLOPS regardless of matrix size, while PyTorch's cuBLAS climbs to ~38 TFLOPS.",
      "Flat-no-matter-the-size is the tell for a compute-bound kernel — something wasn't engaging. Tried deeper pipelining (num_stages), tried stripping out boundary masking, neither moved the needle. Grepped the actual compiled PTX: zero mma.sync, HMMA, or wmma instructions. Tensor cores never fired, not even once.",
      "Unlike flash attention, this isn't a hard architecture wall — Turing does have tensor cores. Looks more like current Triton (3.6.0) just isn't generating tensor-core code for the T4's sm_75 target anymore, as the project's focus has moved to newer hardware. Second week running an old T4 has surfaced a real gap between what current Triton ships for and what Colab's free-tier GPU can actually do.",
    ],
    image: "/blog/triton-matmul-benchmark.png",
    imageAlt:
      "Line chart comparing Triton and PyTorch cuBLAS matmul throughput (TFLOPS) across square matrix sizes from 256 to 3840. PyTorch climbs sharply to a peak around 38 TFLOPS near M=1800 before gradually declining to ~19 TFLOPS, while Triton stays flat near 1 TFLOPS across the entire range.",
  },
  {
    slug: "rmsnorm-forward-and-backward",
    category: "kernel",
    title: "RMSNorm: Forward, Backward, and Why It Matters",
    date: "2026-08-16",
    excerpt:
      "Reading Kimi K3's report right now, and RMSNorm keeps coming up as one of its bigger architectural wins alongside attention residuals — so this week's kernel is RMSNorm, forward and backward.",
    paragraphs: [
      "5th kernel: RMSNorm, forward and backward. Motivation came from the paper side of the track — reading Kimi K3's report at the moment, and RMSNorm keeps coming up as one of the report's bigger architectural wins, right alongside attention residuals. Felt worth building rather than just reading about.",
      "Forward pass: correct (max diff 0.00195, normal fp16 tolerance), ~230 GB/s vs ~20 GB/s for an unfused PyTorch baseline. Same fusion story as softmax's win a few weeks back.",
      "Backward was the harder half — had to actually derive the gradient (dx = rrms * (dxnorm - x_norm * mean(dxnorm * x_norm))), and the weight gradient needs a sum across every row, not just within one. Used atomic_add for that, which works (dx diff 0.0078, dweight diff 0.0625, both fine once you account for dweight's larger scale) but shows up as a jagged, non-flat throughput line instead of forward's clean one — real atomic contention, not a bug. Still ~10x over PyTorch either way.",
      "Next: maybe fix the atomics with a proper two-stage reduction, or move on to week 6.",
    ],
    image: "/blog/triton-rmsnorm-benchmark.png",
    imageAlt:
      "Line chart comparing Triton and PyTorch throughput (GB/s) for the RMSNorm backward pass across column widths from 1024 to 15872. Triton climbs sharply then settles into a jagged band roughly between 108-150 GB/s with visible dips, while PyTorch stays flat around 11 GB/s.",
  },
  {
    slug: "rope-forward-and-backward",
    category: "kernel",
    title: "RoPE: One Kernel for Both Directions",
    date: "2026-08-23",
    excerpt:
      "6th kernel: rotary position embeddings, the other piece of Kimi K3's attention stack worth building. The nice part isn't the speedup, it's that backward reuses the exact same kernel as forward — just flip the sign on sin.",
    paragraphs: [
      "6th kernel: RoPE (rotary position embeddings), forward and backward. Same paper tie-in as RMSNorm last week — still working through Kimi K3's report, and RoPE is the other piece of its attention stack worth building instead of just reading past. Used the Llama-style \"rotate-half\" convention — split head_dim in half and rotate the two halves against each other — rather than GPT-J's interleaved-pairs version, since it's what most current LLMs (Kimi K3 included) actually use.",
      "Correct on both passes: fwd max diff 0.00390625, bwd max diff 0.00390625, both normal fp16 rounding. Throughput: ~156-206 GB/s on Triton vs a flat ~38-46 GB/s for PyTorch eager across sequence lengths 512-8192. Same caveat as softmax and RMSNorm though — that's a fused kernel against an unfused eager baseline, not a fused-vs-fused comparison, so I'm not calling it a clean win.",
      "The actual interesting part: backward didn't need a second kernel. Rotating by -theta undoes a rotation by theta, so backward is just the forward kernel called again with a NEGATE_SIN flag flipping sin to -sin at compile time. No separate gradient derivation, no second set of pointer math.",
      "Next up is probably cross-entropy loss, forward and backward — it's the one op every training step touches, and it'd round RMSNorm and RoPE out into something that actually looks like a transformer forward pass.",
    ],
    image: "/blog/triton-rope-benchmark.png",
    imageAlt:
      "Line chart comparing Triton and PyTorch throughput (GB/s) for RoPE across sequence lengths from 512 to 8192. Triton rises to a peak around 205 GB/s near seq_len 2000 then gradually declines to about 156 GB/s, while PyTorch stays flat around 40-47 GB/s.",
  },
  {
    slug: "fused-cross-entropy",
    category: "kernel",
    title: "Cross-Entropy: The Benchmark That Nearly Fooled Me",
    date: "2026-08-30",
    excerpt:
      "7th kernel: cross-entropy, forward and backward in one pass. First fused-vs-fused comparison I've done \u2014 which is how I caught that my 2.5x speedup was just me handicapping the baseline.",
    paragraphs: [
      "7th kernel: cross-entropy loss, forward and backward fused into one kernel. The gradient is just softmax(logits) - onehot(target), which depends on nothing but the logits \u2014 so you can compute it during the forward pass and write it straight back over the input buffer. PyTorch has to allocate a second [batch, vocab] tensor for the gradient. This doesn't.",
      "First numbers were 2.5x faster and 2.5x less memory, and I nearly stopped there. My baseline was F.cross_entropy(x.float(), targets), and that .float() quietly makes a full fp32 copy of the logits my kernel never pays for. Against an honest fp16 baseline it's 1.51x faster at vocab 131072 (15.9ms vs 24.0ms) and 1.67x less peak memory \u2014 exactly 1.67x at every vocab size, because PyTorch keeps five copies of the logits alive through fwd+bwd and this keeps three. Worth catching, since F.cross_entropy is a real fused kernel: this is the first week I'm not measuring against unfused eager PyTorch.",
      "The catch: at vocab 32k, 74.3% of the gradient values it writes are exactly zero. Each one is about 1/(vocab x batch) \u2248 6e-8, and fp16's smallest subnormal is 5.96e-8, so the tail underflows on the way into the buffer. GradScaler can't save it either \u2014 that scale arrives in backward(), after the kernel has already stored them.",
      "Next up is probably fused linear + cross-entropy \u2014 chunking the lm_head projection into the loss so the [batch, vocab] logits never exist at all.",
    ],
    image: "/blog/triton-cross-entropy-benchmark.png",
    imageAlt:
      "Two line charts comparing Triton fused cross-entropy against torch F.cross_entropy on a T4 across vocab sizes 4096 to 131072. Left panel, forward plus backward time: Triton reaches about 15.9ms at vocab 131072 versus PyTorch's 24.0ms. Right panel, peak memory: Triton stays consistently below PyTorch, ending at about 1611MB versus 2684MB.",
  },
  {
    slug: "small-models-are-the-future",
    title: "LLMs Are Dead. Small Models Are the Future.",
    date: "2026-08-31",
    excerpt:
      "Today's LLMs win on text prediction and data volume, not depth \u2014 what we actually need are small models built deep in one field, with LLMs there just to wire them together.",
    paragraphs: [
      "Nowadays, LLMs are strong mainly through text prediction and data accumulation. I have to admit that they can handle many cross-domain work, including the hard ones, but their training data is messy and largely outdated, and according to some, only \u201ctutorial-level difficulty\u201d. Their advantages are mostly the same \u2014 \u201ccoding\u201d, \u201creasoning\u201d, \u201clong memory\u201d \u2014 which, after years of advertising, became plain and not as useful.",
      "Instead, what we are increasingly in need of are efficient small models for deep, narrow areas to ensure real professional performance, not just surface work, which will definitely outperform LLMs in their own field. For example, each one for emotional communication, astrophysics, art, etc. The role of LLMs in the future is just to wire those small models up, to do integration and cross-domain work to produce more grounded achievements.",
      "I'm Richael, and I'm fine-tuning small models like Qwen 14B to improve the performance of Soulor \u2014 a multi-companion and simulation app \u2014 and VNPortal \u2014 a music recreation and creation community platform with fair, controllable AI assistance. I hope to redefine AI's role in the modern and future world. If you're interested, welcome to visit my apps, share, and support. Thanks for reading, and have a good day!",
    ],
  },
  {
    slug: "apps-are-just-prompt-shells",
    title: "Apps Need Their Own Models, Not Prompt Shells",
    date: "2026-09-01",
    excerpt:
      "APIs are still efficient and cheap enough for everyday use, but for vertical apps it is increasingly essential to fine-tune a small model to serve a narrow area.",
    paragraphs: [
      "Most apps today are just prompt shells around LLMs. Though some of them go viral and look genuinely useful, they can't do anything the underlying model cannot do, and they disappear quickly after models ship updates. And as these models are trained to be broad rather than deep, their outputs can't be professional enough to produce the results specialised tasks demand. APIs are still efficient and cheap enough for everyday use, but for vertical apps it is increasingly essential to train — or at least fine-tune — a small model to serve a narrow area. Refer to my last post to see why small models are necessary: https://dh8116.github.io/blog/small-models-are-the-future.",
      "I'm Richael. I'm creating new ways to use AI in applications, so as to redefine its role in the next era. I'm currently developing two apps: a multi-companion and simulation platform, and a music recreation & creation community. If you are interested, check out my website or follow me for more!",
    ],
  },
];

// unsortedPosts is declared in the order each post was written, so on a
// same-date tie the later-declared post (written later that day) should
// still sort as more recent.
export const posts: Post[] = unsortedPosts
  .map((post, writeOrder) => ({ post, writeOrder }))
  .sort(
    (a, b) =>
      b.post.date.localeCompare(a.post.date) || b.writeOrder - a.writeOrder
  )
  .map(({ post }) => post);
