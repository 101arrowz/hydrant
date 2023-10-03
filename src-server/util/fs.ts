import { fileURLToPath } from "url";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { rename, writeFile } from "fs/promises";

// will be in the server/data folder
export const dataDir = fileURLToPath(new __parcel__URL__("data"));

// tolerant of failure mid-write
export async function writeFileAtomic(to: string, data: string | Buffer) {
  const filename = join(tmpdir(), randomBytes(16).toString('hex'));
  await writeFile(filename, data);
  await rename(filename, to);
}