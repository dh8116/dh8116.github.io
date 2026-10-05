// /discuss (anonymous discussion threads) and /faq (visitor questions), stored behind the
// dh8116-auth Vercel project (api/comments). The site is a static export, so
// the page talks to that API from the browser; harden-export.mjs widens
// connect-src for exactly these pages.

import { AUTH_ORIGIN } from "@/lib/github";
import type { Lang } from "./i18n";

export const COMMENTS_API = `${AUTH_ORIGIN}/api/comments`;

export type CommentKind = "discussion" | "faq";

export type Comment = {
  id: number;
  kind: CommentKind;
  parentId: number | null;
  name: string;
  body: string;
  isAuthor: boolean;
  label: string | null;
  hidden: boolean;
  createdAt: string;
};

// Labels the owner can pick for a reply; anything else can be typed.
export const OWNER_LABELS = ["Author", "OP", "Admin"];

export const LIMITS = { name: 40, body: 2000 };

// Set by /discuss when the owner opens it; the admin hub counts anything newer.
export const SEEN_KEY = "admin:discuss-seen";

type Strings = {
  heading: Record<CommentKind, { eyebrow: string; title: string }>;
  intro: Record<CommentKind, string>;
  namePlaceholder: string;
  bodyPlaceholder: Record<CommentKind, string>;
  post: Record<CommentKind, string>;
  posting: string;
  reply: string;
  answer: string;
  cancel: string;
  hide: string;
  unhide: string;
  remove: string;
  confirmRemove: string;
  hidden: string;
  anonymous: string;
  empty: Record<CommentKind, string>;
  unanswered: string;
  loading: string;
  postingAs: string;
  label: string;
  preview: {
    empty: Record<CommentKind, string>;
    viewAll: Record<CommentKind, string>;
    replies: (n: number) => string;
    answered: string;
  };
  form: {
    legend: Record<CommentKind, string>;
    open: Record<CommentKind, string>;
    submit: string;
    posted: string;
  };
  errors: Record<string, string>;
};

export const discussUi: Record<Lang, Strings> = {
  en: {
    heading: {
      discussion: { eyebrow: "Open", title: "Discussion" },
      faq: { eyebrow: "Visitor", title: "FAQ" },
    },
    intro: {
      discussion:
        "Say anything — no account, and you choose a name each time you post. Anyone can reply.",
      faq: "Ask me anything — no account needed. Anyone can ask; I answer.",
    },
    namePlaceholder: "Name (optional)",
    bodyPlaceholder: {
      discussion: "Start a discussion…",
      faq: "Ask a question…",
    },
    post: { discussion: "Post", faq: "Ask" },
    posting: "Posting…",
    reply: "Reply",
    answer: "Answer",
    cancel: "Cancel",
    hide: "Hide",
    unhide: "Unhide",
    remove: "Delete",
    confirmRemove: "Delete this and its replies?",
    hidden: "Hidden",
    anonymous: "Anonymous",
    empty: {
      discussion: "No discussions yet. Start the first one.",
      faq: "No questions yet. Ask the first one.",
    },
    unanswered: "Not answered yet",
    loading: "Loading…",
    postingAs: "Posting as",
    label: "Label",
    preview: {
      empty: {
        discussion: "There's no discussion yet — go post the first one!",
        faq: "There are no questions yet — go ask the first one!",
      },
      viewAll: { discussion: "All discussions", faq: "All questions" },
      replies: (n) => (n === 1 ? "1 reply" : `${n} replies`),
      answered: "Answered",
    },
    form: {
      legend: { discussion: "New post", faq: "Ask a question" },
      open: { discussion: "Post", faq: "Ask a question" },
      submit: "Submit",
      posted: "Posted — thanks for joining in!",
    },
    errors: {
      slow_down: "You're posting quickly — try again in a few minutes.",
      empty: "Write something first.",
      not_configured: "Comments aren't switched on yet.",
      faq_owner_only: "Only the author answers FAQ questions.",
      no_parent: "That comment is gone.",
      network: "Couldn't reach the server. Try again.",
      default: "Something went wrong. Try again.",
    },
  },
  zh: {
    heading: {
      discussion: { eyebrow: "一起", title: "讨论" },
      faq: { eyebrow: "访客", title: "问答" },
    },
    intro: {
      discussion: "随便聊——不用注册，每次发言都可以自己取名字。任何人都可以回复。",
      faq: "有什么想问的都可以问——不用注册。任何人都能提问，由我来回答。",
    },
    namePlaceholder: "名字（可不填）",
    bodyPlaceholder: {
      discussion: "发起一个讨论……",
      faq: "提一个问题……",
    },
    post: { discussion: "发布", faq: "提问" },
    posting: "发布中……",
    reply: "回复",
    answer: "回答",
    cancel: "取消",
    hide: "隐藏",
    unhide: "取消隐藏",
    remove: "删除",
    confirmRemove: "删除这条及其所有回复？",
    hidden: "已隐藏",
    anonymous: "匿名",
    empty: {
      discussion: "还没有讨论，来发起第一个吧。",
      faq: "还没有问题，来问第一个吧。",
    },
    unanswered: "尚未回答",
    loading: "加载中……",
    postingAs: "署名",
    label: "标签",
    preview: {
      empty: {
        discussion: "还没有讨论——快来发第一个吧！",
        faq: "还没有问题——快来问第一个吧！",
      },
      viewAll: { discussion: "全部讨论", faq: "全部问题" },
      replies: (n) => `${n} 条回复`,
      answered: "已回答",
    },
    form: {
      legend: { discussion: "发帖", faq: "提个问题" },
      open: { discussion: "发帖", faq: "提问" },
      submit: "提交",
      posted: "发布成功，谢谢参与！",
    },
    errors: {
      slow_down: "发得有点快，过几分钟再试吧。",
      empty: "先写点内容吧。",
      not_configured: "评论功能还没开启。",
      faq_owner_only: "FAQ 的问题只由作者回答。",
      no_parent: "那条评论已经不在了。",
      network: "连不上服务器，请再试一次。",
      default: "出了点问题，请再试一次。",
    },
  },
};
