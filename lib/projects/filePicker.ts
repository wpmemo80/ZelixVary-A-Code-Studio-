"use client";

export interface PickedFile {
  path: string;
  content: string;
}

const TEXT_EXTENSIONS = new Set([
  "html", "htm", "css", "js", "mjs", "cjs", "ts", "tsx", "jsx", "json", "md",
  "txt", "svg", "xml", "yaml", "yml", "toml", "ini", "env", "sh", "bat", "ps1",
  "py", "java", "c", "cpp", "h", "cs", "go", "rs", "rb", "php", "sql", "vue",
  "svelte", "astro", "scss", "sass", "less", "csv", "log",
]);

const SKIP_NAMES = new Set(["node_modules", ".git", ".next", "dist", "build", ".turbo", "out"]);

function isTextFile(name: string): boolean {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return true;
  const ext = name.slice(dot + 1).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

interface DirectoryEntries {
  entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
}

async function walkDirectory(dir: FileSystemHandle, prefix: string, out: PickedFile[], maxFiles = 300) {
  if (dir.kind !== "directory" || out.length >= maxFiles) return;
  const withEntries = dir as unknown as DirectoryEntries;
  for await (const [name, handle] of withEntries.entries()) {
    if (out.length >= maxFiles) return;
    if (SKIP_NAMES.has(name)) continue;
    const path = prefix ? `${prefix}/${name}` : name;
    if (handle.kind === "directory") {
      await walkDirectory(handle, path, out, maxFiles);
    } else {
      const file = await (handle as FileSystemFileHandle).getFile();
      if (!isTextFile(file.name)) continue;
      const content = await file.text();
      out.push({ path, content });
    }
  }
}

/**
 * Kullanıcıdan bir klasör seçmesini ister ve içindeki metin dosyalarını okur.
 * Chrome/Edge: File System Access API (showDirectoryPicker)
 * Diğer tarayıcılar: gizli <input type="file" webkitdirectory> fallback'i
 */
export function pickProjectFolder(): Promise<{ name: string; files: PickedFile[] } | null> {
  return new Promise((resolve) => {
    const win = window as Window & {
      showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
    };

    async function fromPicker() {
      try {
        const handle = await win.showDirectoryPicker!({ mode: "read" });
        const files: PickedFile[] = [];
        await walkDirectory(handle, "", files);
        resolve({ name: handle.name, files });
      } catch (err) {
        if ((err as Error).name === "AbortError") resolve(null);
        else resolve(null);
      }
    }

    if (win.showDirectoryPicker) {
      fromPicker();
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.style.display = "none";
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("directory", "");
    document.body.appendChild(input);
    input.addEventListener("change", async () => {
      const files = Array.from(input.files ?? []);
      const picked: PickedFile[] = [];
      const rootName = files[0]?.webkitRelativePath.split("/")[0] ?? "proje";
      for (const file of files.slice(0, 300)) {
        const rel = file.webkitRelativePath.replace(`${rootName}/`, "");
        if (!rel) continue;
        const parts = rel.split("/");
        if (parts.some((p) => SKIP_NAMES.has(p))) continue;
        if (!isTextFile(file.name)) continue;
        picked.push({ path: rel, content: await file.text() });
      }
      input.remove();
      resolve({ name: rootName, files: picked });
    });
    input.addEventListener("cancel", () => {
      input.remove();
      resolve(null);
    });
    input.click();
  });
}
