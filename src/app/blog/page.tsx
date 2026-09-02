import type { Metadata } from "next";
import { posts } from "@/data/posts";
import { site } from "@/data/site";
import BlogList from "./BlogList";

export const metadata: Metadata = {
  title: `Blog — ${site.name}`,
};

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <BlogList posts={posts} />
    </div>
  );
}
