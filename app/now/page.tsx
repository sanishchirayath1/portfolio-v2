import { TrainingBlock } from "@/components/training/TrainingBlock";
import { Prose } from "@/components/typography/Prose";
import { loadMdx } from "@/lib/content";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";

export const metadata: Metadata = {
  title: "now",
  description: "What I'm working on, training for, and reading. Updated when it changes.",
};

export default async function NowPage() {
  const { content, data } = await loadMdx("now.mdx");
  const updated = typeof data.updated === "string" ? data.updated : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-8">
        <p className="font-mono text-xs text-[color:var(--color-muted)]">$ cat now</p>
        {updated && (
          <p className="mt-2 font-mono text-xs text-[color:var(--color-muted)]">
            last touched {updated}
          </p>
        )}
      </header>
      <Prose>
        <MDXRemote source={content} components={{ TrainingBlock }} />
      </Prose>
    </main>
  );
}
