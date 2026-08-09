export type Post = {
  slug: string;
  title: string;
  date: string;
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
      "Hi, I'm Doria — this is a spot for me to put what I'm working on and write down thoughts as I go, instead of letting them stay scattered across notes and half-finished docs.",
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
