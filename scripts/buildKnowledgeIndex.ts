import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

type Category =
  | "vertical_business"
  | "member_service"
  | "operating_tools"
  | "search_operation"
  | "rules"
  | "skipped_or_incomplete";

type GeneratedArticle = {
  id: string;
  title: string;
  filePath: string;
  sourceUrl?: string;
  category: Category;
  crawledAt?: string;
  importedAt: string;
  isComplete: boolean;
};

const rootDir = join(process.cwd(), "knowledge/1688/raw");
const outputPath = join(process.cwd(), "src/data/knowledge/generatedOfficialArticles.ts");
const importedAt = new Date().toISOString();

const directoryCategories: Record<string, Category> = {
  "vertical-business": "vertical_business",
  "member-service": "member_service",
  "operating-tools": "operating_tools",
  "search-operation": "search_operation",
  rules: "rules",
  "skipped-or-incomplete": "skipped_or_incomplete"
};

const articles = scan(rootDir)
  .filter((filePath) => [".md", ".html"].includes(extname(filePath).toLowerCase()))
  .filter((filePath) => basename(filePath).toLowerCase() !== "readme.md")
  .map(toArticle)
  .sort((left, right) => left.title.localeCompare(right.title, "zh-CN"));

writeFileSync(
  outputPath,
  `import type { OfficialArticleSource } from "../../lib/knowledge/types";\n\n` +
    `export const generatedOfficialArticles: OfficialArticleSource[] = ${JSON.stringify(articles, null, 2)};\n`,
  "utf8"
);

console.log(`Generated ${articles.length} official article sources at ${relative(process.cwd(), outputPath)}`);

function scan(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const filePath = join(dir, entry);
    const stats = statSync(filePath);
    return stats.isDirectory() ? scan(filePath) : [filePath];
  });
}

function toArticle(filePath: string): GeneratedArticle {
  const raw = readFileSync(filePath, "utf8");
  const frontmatter = parseFrontmatter(raw);
  const category = inferCategory(filePath, frontmatter.category);
  const title = frontmatter.title ?? inferTitle(raw, filePath);
  const relativePath = relative(process.cwd(), filePath);

  return {
    id: slugify(relativePath),
    title,
    filePath: relativePath,
    sourceUrl: frontmatter.sourceUrl,
    category,
    crawledAt: frontmatter.crawledAt,
    importedAt,
    isComplete: category !== "skipped_or_incomplete"
  };
}

function inferCategory(filePath: string, explicitCategory?: string): Category {
  if (explicitCategory && isCategory(explicitCategory)) return explicitCategory;
  const relativeParts = relative(rootDir, filePath).split("/");
  return directoryCategories[relativeParts[0]] ?? "skipped_or_incomplete";
}

function inferTitle(raw: string, filePath: string): string {
  const markdownTitle = raw.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (markdownTitle) return markdownTitle;
  const htmlTitle = raw.match(/<title>(.*?)<\/title>/i)?.[1]?.trim();
  if (htmlTitle) return htmlTitle;
  return basename(filePath, extname(filePath));
}

function parseFrontmatter(raw: string): Record<string, string> {
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return {};

  const result: Record<string, string> = {};
  const block = raw.slice(3, end).trim();
  for (const line of block.split("\n")) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    result[key] = value.replace(/^["']|["']$/g, "").trim();
  }
  return result;
}

function isCategory(value: string): value is Category {
  return Object.values(directoryCategories).includes(value as Category);
}

function slugify(value: string): string {
  return value
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
