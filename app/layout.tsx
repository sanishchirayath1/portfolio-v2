import { BootSequence } from "@/components/boot/BootSequence";
import { KeyboardShortcuts } from "@/components/keyboard/KeyboardShortcuts";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { CommandPalette } from "@/components/palette/CommandPalette";
import { ReadingProgress } from "@/components/reading/ReadingProgress";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { KonamiVerbose } from "@/components/verbose/KonamiVerbose";
import { loadIdentity } from "@/lib/content";
import { inter, jetbrainsMono } from "@/lib/fonts";
import { listPosts } from "@/lib/posts";
import { getCachedProjects } from "@/lib/projects-cache";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio.hstart.in"),
  title: {
    default: "Sanish Chirayath",
    template: "%s · Sanish Chirayath",
  },
  description: "Software Development Engineer based in Bangalore. Writing, projects, and notes.",
  authors: [{ name: "Sanish Chirayath" }],
  creator: "Sanish Chirayath",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://portfolio.hstart.in",
    siteName: "Sanish Chirayath",
    title: "Sanish Chirayath",
    description: "Software Development Engineer based in Bangalore. Writing, projects, and notes.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@sanishch",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(99% 0.005 250)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(14% 0.01 250)" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [identity, posts, projectsResult] = await Promise.all([
    loadIdentity(),
    listPosts().catch(() => []),
    getCachedProjects().catch(() => ({ projects: [], source: "error" as const, error: null })),
  ]);
  const paletteData = {
    email: identity.email,
    github: identity.socials.github,
    linkedin: identity.socials.linkedin,
    twitter: identity.socials.twitter,
    posts: posts
      .filter((p) => !p.frontmatter.draft)
      .map((p) => ({
        slug: p.slug,
        title: p.frontmatter.title,
        tags: p.frontmatter.tags,
      })),
    projects: projectsResult.projects
      .filter((p) => !p.hidden)
      .slice(0, 40)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        description: p.description,
      })),
  };
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[color:var(--color-bg)] focus:px-3 focus:py-2 focus:font-mono focus:text-sm"
        >
          skip to content
        </a>
        <Nav />
        <div id="main">{children}</div>
        <Footer identity={identity} />
        <KeyboardShortcuts />
        <CommandPalette {...paletteData} />
        <BootSequence />
        <KonamiVerbose />
        <ReadingProgress />
      </body>
    </html>
  );
}
