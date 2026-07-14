import "server-only";

import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export const mdxOptions: NonNullable<MDXRemoteProps["options"]>["mdxOptions"] = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "wrap",
        properties: { className: ["heading-link"] },
      },
    ],
    [
      rehypePrettyCode,
      {
        theme: { light: "github-light", dark: "github-dark-default" },
        keepBackground: false,
        defaultLang: "plaintext",
      },
    ],
  ],
};
