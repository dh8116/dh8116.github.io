// The site ships in two languages. English lives at the canonical paths ("/",
// "/blog", "/blog/<slug>") and Chinese mirrors it one level down ("/zh", ...),
// so every page has a real, shareable URL in both and nothing has to be
// translated in the browser — which matters, since the export's CSP has
// connect-src 'self' and could not call a translation API even if we wanted to.

export const LANGS = ["en", "zh"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";

// What the <html lang> attribute should say. harden-export.mjs stamps this onto
// the exported pages under out/zh, since one root layout can only emit one.
export const HTML_LANG: Record<Lang, string> = { en: "en", zh: "zh-Hans" };

export const LANG_LABEL: Record<Lang, string> = { en: "EN", zh: "中文" };

const PREFIX: Record<Lang, string> = { en: "", zh: "/zh" };

/** Strips the locale prefix off a pathname, leaving the canonical English path. */
export function stripLang(pathname: string): string {
  if (pathname === "/zh") return "/";
  if (pathname.startsWith("/zh/")) return pathname.slice(3);
  return pathname;
}

export function langFromPath(pathname: string): Lang {
  return pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
}

/** Rewrites a canonical English path ("/", "/#about", "/blog/x") into `lang`. */
export function localePath(path: string, lang: Lang): string {
  if (lang === "en") return path;
  return path === "/" ? PREFIX.zh : `${PREFIX.zh}${path}`;
}

/** The same page as `pathname`, in `lang`. Used by the header toggle. */
export function switchPath(pathname: string, lang: Lang): string {
  const route = stripLang(pathname);
  // 404.html prerenders at Next's internal "/_not-found", which is not a real
  // URL to offer a translation of — send those to the home page instead.
  return localePath(route.startsWith("/_") ? "/" : route, lang);
}

type SectionHeading = { eyebrow: string; title: string };

export type Ui = {
  toggleLabel: string;
  nav: { about: string; skills: string; projects: string; blog: string };
  home: {
    greeting: string;
    viewProjects: string;
    email: string;
    about: SectionHeading;
    skills: SectionHeading;
    projects: SectionHeading;
    writing: SectionHeading;
    allPosts: string;
  };
  details: {
    heading: string;
    name: string;
    location: string;
    status: string;
    email: string;
  };
  currently: string;
  projects: { visit: string; source: string };
  blog: {
    heading: string;
    general: string;
    kernel: string;
    sortDesc: string;
    sortAsc: string;
    back: string;
  };
  notFound: {
    tagline: string;
    body: string;
    existing: string;
  };
};

export const ui: Record<Lang, Ui> = {
  en: {
    toggleLabel: "Switch language",
    nav: {
      about: "About",
      skills: "Skills",
      projects: "Projects",
      blog: "Blog",
    },
    home: {
      greeting: "Hello, I'm",
      viewProjects: "View projects",
      email: "Email",
      about: { eyebrow: "My", title: "About" },
      skills: { eyebrow: "My", title: "Skills" },
      projects: { eyebrow: "My", title: "Projects" },
      writing: { eyebrow: "Latest", title: "Writing" },
      allPosts: "All posts",
    },
    details: {
      heading: "Personal Details",
      name: "Name",
      location: "Location",
      status: "Status",
      email: "Email",
    },
    currently: "Currently Learning",
    projects: { visit: "Visit site", source: "Source" },
    blog: {
      heading: "Blog",
      general: "General",
      kernel: "Kernel",
      sortDesc: "Latest → Earliest",
      sortAsc: "Earliest → Latest",
      back: "Back to blog",
    },
    notFound: {
      tagline: "Nice try.",
      body: "If you got here by clicking a broken link rather than by fuzzing — sorry, no exploit either way. Just a wrong path.",
      existing: "Endpoints that do exist",
    },
  },
  zh: {
    toggleLabel: "切换语言",
    nav: {
      about: "关于",
      skills: "技能",
      projects: "项目",
      blog: "博客",
    },
    home: {
      greeting: "你好，我是",
      viewProjects: "查看项目",
      email: "邮箱",
      about: { eyebrow: "关于", title: "我" },
      skills: { eyebrow: "我的", title: "技能" },
      projects: { eyebrow: "我的", title: "项目" },
      writing: { eyebrow: "最新", title: "文章" },
      allPosts: "全部文章",
    },
    details: {
      heading: "个人信息",
      name: "姓名",
      location: "所在地",
      status: "方向",
      email: "邮箱",
    },
    currently: "正在学习",
    projects: { visit: "访问网站", source: "源代码" },
    blog: {
      heading: "博客",
      general: "随笔",
      kernel: "Kernel",
      sortDesc: "由新到旧",
      sortAsc: "由旧到新",
      back: "返回博客",
    },
    notFound: {
      tagline: "想得美。",
      body: "如果你是点到了一个失效的链接才来到这里，而不是在扫目录——抱歉，两种情况都没有漏洞可挖，只是路径写错了。",
      existing: "确实存在的路径",
    },
  },
};

/**
 * Canonical + hreflang block for a page, so search engines treat "/blog/x" and
 * "/zh/blog/x" as the same page in two languages rather than duplicates.
 * `path` is the canonical English path; resolved against metadataBase.
 */
export function alternates(path: string, lang: Lang) {
  return {
    canonical: localePath(path, lang),
    languages: {
      en: localePath(path, "en"),
      "zh-Hans": localePath(path, "zh"),
      "x-default": localePath(path, "en"),
    },
  };
}
