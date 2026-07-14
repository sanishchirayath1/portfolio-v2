import { Prose } from "@/components/typography/Prose";
import { loadMdx } from "@/lib/content";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";

export const metadata: Metadata = {
  title: "uses",
  description: "The stuff I actually use: editor, terminal, hardware.",
};

export default async function UsesPage() {
  const { content, data } = await loadMdx("uses.mdx");
  const updated = typeof data.updated === "string" ? data.updated : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-8">
        <p className="font-mono text-xs text-[color:var(--color-muted)]">$ cat uses</p>
        {updated && (
          <p className="mt-2 font-mono text-xs text-[color:var(--color-muted)]">
            last touched {updated}
          </p>
        )}
      </header>
      <Prose>
        <MDXRemote source={content} />
      </Prose>
    </main>
  );
}
