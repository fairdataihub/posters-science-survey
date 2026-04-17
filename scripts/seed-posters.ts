import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { createId } from "@paralleldrive/cuid2";
import { PrismaClient } from "../shared/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Usage:
 *   pnpm seed:poster
 *
 * Optional:
 *   --dir    path to sample folder (default: ./poster_sentry_training_pdfs_jpeg)
 *   --limit  max number of files to process (default: all)
 *
 * Required env vars:
 *   DATABASE_URL
 *   NUXT_BUNNY_PUBLIC_STORAGE   e.g. https://storage.bunnycdn.com/my-zone
 *   NUXT_BUNNY_PUBLIC_STORAGE_KEY
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BUNNY_CDN_URL = "https://cdn.posters.science";

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

type ImageEntry = {
  filePath: string;
  originalFilename: string;
  isPoster: boolean;
};

function collectImages(baseDir: string): ImageEntry[] {
  const entries: ImageEntry[] = [];

  const subfolders: Array<{ name: string; isPoster: boolean }> = [
    { name: "poster", isPoster: true },
    { name: "non_poster", isPoster: false },
  ];

  for (const { name, isPoster } of subfolders) {
    const dir = path.join(baseDir, name);
    if (!fs.existsSync(dir)) {
      console.warn(`   WARN Directory not found, skipping: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g)$/i.test(f));
    for (const file of files) {
      entries.push({
        filePath: path.join(dir, file),
        originalFilename: file,
        isPoster,
      });
    }
  }

  return entries;
}

async function main() {
  const { NUXT_BUNNY_PUBLIC_STORAGE, NUXT_BUNNY_PUBLIC_STORAGE_KEY } =
    process.env;

  if (!NUXT_BUNNY_PUBLIC_STORAGE || !NUXT_BUNNY_PUBLIC_STORAGE_KEY) {
    console.error(
      "ERROR Missing required env vars: NUXT_BUNNY_PUBLIC_STORAGE, NUXT_BUNNY_PUBLIC_STORAGE_KEY",
    );
    process.exitCode = 1;
    return;
  }

  const baseDir =
    getArg("dir") ??
    path.join(process.cwd(), "poster_sentry_training_pdfs_jpeg");
  const limitArg = getArg("limit");
  const limit = limitArg ? Number(limitArg) : Infinity;

  const allEntries = collectImages(baseDir);
  const entries = allEntries.slice(0, isFinite(limit) ? limit : undefined);

  console.log(`\nBase dir: ${baseDir}`);
  console.log(
    `Found ${allEntries.length} JPEGs total — processing ${entries.length}`,
  );

  let created = 0;
  let errored = 0;

  console.log(`Uploading ${entries.length} images...\n`);

  for (const { filePath, originalFilename, isPoster } of entries) {
    let imageBuffer: Buffer;
    try {
      imageBuffer = fs.readFileSync(filePath);
    } catch (err: unknown) {
      console.error(
        `   ERROR Could not read image: ${originalFilename}\n      ${(err as Error).message}`,
      );
      errored++;
      continue;
    }

    const id = createId();
    const remotePath = `survey/${id}.jpg`;
    const uploadUrl = `${NUXT_BUNNY_PUBLIC_STORAGE.replace(/\/$/, "")}/${remotePath}`;
    const cdnUrl = `${BUNNY_CDN_URL.replace(/\/$/, "")}/${remotePath}`;

    // Upload to Bunny
    let uploadOk = false;
    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          AccessKey: NUXT_BUNNY_PUBLIC_STORAGE_KEY,
          "Content-Type": "image/jpeg",
          "Content-Length": String(imageBuffer.length),
        },
        body: imageBuffer as unknown as BodyInit,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(
          `   ERROR Bunny upload failed (${response.status}): ${originalFilename}\n      ${text}`,
        );
        errored++;
        continue;
      }

      uploadOk = true;
    } catch (err: unknown) {
      console.error(
        `   ERROR Upload error: ${originalFilename}\n      ${(err as Error).message}`,
      );
      errored++;
      continue;
    }

    if (!uploadOk) continue;

    // Insert Poster row
    try {
      await prisma.poster.create({
        data: { id, url: cdnUrl, originalFilename, isPoster },
      });
      console.log(
        `   OK [${isPoster ? "poster    " : "non_poster"}] ${id} — ${originalFilename.slice(0, 60)}`,
      );
      created++;
    } catch (err: unknown) {
      console.error(
        `   ERROR DB insert failed: ${originalFilename}\n      ${(err as Error).message}`,
      );
      errored++;
    }
  }

  console.log(
    `\nDone. Uploaded+saved: ${created}, Errored: ${errored} (of ${entries.length} processed)\n`,
  );
}

main()
  .catch((err) => {
    console.error("\nERROR Seed failed:");
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
