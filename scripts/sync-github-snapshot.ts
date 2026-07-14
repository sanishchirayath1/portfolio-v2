import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchProjectsFromGitHub } from "../lib/github";

const snapshotPath = path.join(process.cwd(), "content", "projects.snapshot.json");

async function main() {
  const projects = await fetchProjectsFromGitHub();
  const payload = {
    projects,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(snapshotPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  console.log(`wrote ${projects.length} projects to ${snapshotPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
