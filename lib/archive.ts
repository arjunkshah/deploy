import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as tar from "tar";

export interface InlineFilePayload {
  file: string;
  data: string;
  encoding: "base64";
}

export interface ExtractedFile {
  file: string;
  sha: string;
  size: number;
  mode: number;
  data?: string;
  absolutePath?: string;
}

const DEFAULT_EXCLUDED_DIRS = new Set([".git", "node_modules", ".next", ".vercel"]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;
const MAX_FILES = 20000;

const INLINE_FILE_LIMIT = 250;
const INLINE_BYTES_LIMIT = 6 * 1024 * 1024;

function shouldSkip(relativePath: string) {
  const segments = relativePath.split(path.sep);
  return segments.some((segment) => DEFAULT_EXCLUDED_DIRS.has(segment));
}

function hashBuffer(buffer: Buffer) {
  return createHash("sha1").update(buffer).digest("hex");
}

async function collectFiles(
  rootDir: string,
  currentDir: string,
  files: ExtractedFile[],
  stats: { totalBytes: number; totalFiles: number },
  inline: boolean
) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(rootDir, entryPath);
    if (relativePath === "repo.tgz" || shouldSkip(relativePath)) {
      continue;
    }
    if (entry.isDirectory()) {
      await collectFiles(rootDir, entryPath, files, stats, inline);
      continue;
    }
    if (!entry.isFile()) continue;

    const fileStat = await fs.stat(entryPath);
    if (fileStat.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File too large to deploy: ${relativePath}`);
    }
    stats.totalBytes += fileStat.size;
    stats.totalFiles += 1;
    if (stats.totalFiles > MAX_FILES) {
      throw new Error("Repository contains too many files to deploy.");
    }
    if (stats.totalBytes > MAX_TOTAL_BYTES) {
      throw new Error("Repository is too large to deploy from a public URL.");
    }

    const buffer = await fs.readFile(entryPath);
    const posixPath = relativePath.split(path.sep).join("/");
    files.push({
      file: posixPath,
      sha: hashBuffer(buffer),
      size: fileStat.size,
      mode: fileStat.mode,
      data: inline ? buffer.toString("base64") : undefined,
      absolutePath: inline ? undefined : entryPath
    });
  }
}

export async function extractTarballToFiles(buffer: Buffer) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "deploydotcom-"));
  const archivePath = path.join(tempDir, "repo.tgz");
  const files: ExtractedFile[] = [];
  const stats = { totalBytes: 0, totalFiles: 0 };
  const cleanup = async () => fs.rm(tempDir, { recursive: true, force: true });

  try {
    await fs.writeFile(archivePath, buffer);
    await tar.x({ file: archivePath, cwd: tempDir, strip: 1 });
    await collectFiles(tempDir, tempDir, files, stats, true);
    return { files, stats, cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  }
}

export async function extractTarballToUploadedFiles(buffer: Buffer) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "deploydotcom-"));
  const archivePath = path.join(tempDir, "repo.tgz");
  const files: ExtractedFile[] = [];
  const stats = { totalBytes: 0, totalFiles: 0 };
  const cleanup = async () => fs.rm(tempDir, { recursive: true, force: true });

  try {
    await fs.writeFile(archivePath, buffer);
    await tar.x({ file: archivePath, cwd: tempDir, strip: 1 });
    await collectFiles(tempDir, tempDir, files, stats, false);
    return { files, stats, cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  }
}

export function shouldInlineFiles(stats: { totalBytes: number; totalFiles: number }) {
  return stats.totalBytes <= INLINE_BYTES_LIMIT && stats.totalFiles <= INLINE_FILE_LIMIT;
}
