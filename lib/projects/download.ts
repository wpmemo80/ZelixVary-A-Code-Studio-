"use client";

import JSZip from "jszip";

/**
 * Projeyi zip olarak indirir. Klasör adına "(zelixcode)" eki konur.
 */
export async function downloadProjectZip(name: string, files: Record<string, string>) {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const safeName = name.replace(/[\\/:*?"<>|]/g, "_").trim() || "proje";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName} (zelixcode).zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
