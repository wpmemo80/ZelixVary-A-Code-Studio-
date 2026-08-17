"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Download,
  FolderInput,
  FolderOpen,
  History,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import type { ProjectListItem } from "@/lib/projects/store";
import { deleteProject, subscribeProjects } from "@/lib/projects/store";
import { useAuth } from "@/lib/auth-context";

interface ProjectsPanelProps {
  open: boolean;
  onClose: () => void;
  onNewProject: () => void;
  onImportProject: () => void;
  onOpenProject: (id: string) => void;
  onExportProject: () => void;
}

export default function ProjectsPanel({
  open,
  onClose,
  onNewProject,
  onImportProject,
  onOpenProject,
  onExportProject,
}: ProjectsPanelProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    const unsub = subscribeProjects(
      user.uid,
      (list) => {
        setProjects(list);
        setLoadError(null);
      },
      (message) => setLoadError(message),
    );
    return unsub;
  }, [open, user]);

  if (!open) return null;

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 3000);
      return;
    }
    setDeleting(id);
    try {
      await deleteProject(id);
    } catch (err) {
      setLoadError(String(err instanceof Error ? err.message : err));
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col border-r border-zinc-800 bg-[#16161b] shadow-2xl">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
          <span className="flex items-center gap-2 text-[13.5px] font-bold text-zinc-100">
            <FolderOpen size={16} className="text-violet-400" />
            Projelerim
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 border-b border-zinc-800 p-3">
          <button
            onClick={onNewProject}
            className="flex w-full items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
          >
            <FolderInput size={15} />
            Yeni Proje (Klasör Seç)
          </button>
          <button
            onClick={onImportProject}
            className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-700 px-4 py-2.5 text-[13px] font-medium text-zinc-300 transition hover:border-violet-500/60 hover:text-violet-300 active:scale-[0.98]"
          >
            <Download size={15} />
            Projeyi İçe Aktar
          </button>
          <button
            onClick={onExportProject}
            className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-700 px-4 py-2.5 text-[13px] font-medium text-zinc-300 transition hover:border-emerald-500/60 hover:text-emerald-300 active:scale-[0.98]"
          >
            <FolderInput size={15} className="rotate-180" />
            Projeyi Çıkar (zelixcode)
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <History size={12} />
            Geçmiş Projeler
          </div>

          {loadError && (
            <div className="mb-3 rounded-xl border border-red-600/40 bg-red-950/40 p-3">
              <p className="flex items-start gap-2 text-[12px] leading-relaxed text-red-300">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>Projeler yüklenemedi: {loadError}</span>
              </p>
            </div>
          )}

          {projects.length === 0 && !loadError ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-5 text-center">
              <FolderOpen size={22} className="mx-auto mb-2 text-zinc-700" />
              <p className="text-[12.5px] text-zinc-600">
                {"Henüz projen yok. \"Yeni Proje\" ile bir klasör seçerek başla."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="group rounded-xl border border-zinc-800 bg-[#101014] p-3 transition hover:border-violet-500/40"
                >
                  <button onClick={() => onOpenProject(p.id)} className="block w-full text-left">
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-zinc-100">
                      <FolderOpen size={13} className="shrink-0 text-violet-400" />
                      <span className="truncate">{p.name}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-600">
                      {p.fileCount} dosya ·{" "}
                      {p.updatedAt
                        ? new Date(p.updatedAt).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className={`mt-2 flex items-center gap-1 rounded px-2 py-1 text-[11px] transition ${
                      confirmDelete === p.id
                        ? "bg-red-500/20 text-red-300"
                        : "text-zinc-600 hover:bg-red-500/10 hover:text-red-400"
                    }`}
                  >
                    {deleting === p.id ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Trash2 size={11} />
                    )}
                    {confirmDelete === p.id ? "Emin misin? Tıkla ve sil" : "Sil"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
