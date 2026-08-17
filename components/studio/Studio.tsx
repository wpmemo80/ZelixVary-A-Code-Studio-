"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Bug,
  Download,
  Eye,
  FileCode2,
  FolderOpen,
  Loader2,
  LogOut,
  Play,
  Save,
  Settings,
  Wand2,
} from "lucide-react";
import { signOut } from "firebase/auth";
import type { ApiKeys, ChatAction, RightTab } from "@/lib/types";
import { DEFAULT_TEMPLATE } from "@/lib/sandbox";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { useAuth } from "@/lib/auth-context";
import { getFirebase } from "@/lib/firebase/client";
import {
  createProject,
  describeFirestoreError,
  loadProject,
  saveProject,
  type Project,
} from "@/lib/projects/store";
import { pickProjectFolder } from "@/lib/projects/filePicker";
import { downloadProjectZip } from "@/lib/projects/download";
import CodeEditor, { editorLanguageForFile } from "@/components/editor/CodeEditor";
import FileExplorer from "@/components/editor/FileExplorer";
import PreviewPanel from "@/components/preview/PreviewPanel";
import AIChat, { type AIChatHandle } from "@/components/chat/AIChat";
import SettingsModal from "@/components/settings/SettingsModal";
import ProjectsPanel from "@/components/projects/ProjectsPanel";

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type DiscardAction = "new" | "import" | "open";

export default function Studio() {
  const { user } = useAuth();
  const [code, setCode] = useLocalStorageValue<string>("zelixvary:code", DEFAULT_TEMPLATE);
  const [apiKeys, setApiKeys] = useLocalStorageValue<ApiKeys>("zelixvary:api-keys", {});

  const [project, setProject] = useState<Project | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [pendingDiscard, setPendingDiscard] = useState<{ action: DiscardAction; payload?: string } | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showNotice(kind: "ok" | "error", text: string) {
    setNotice({ kind, text });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 8000);
  }

  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<RightTab>("preview");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [split, setSplit] = useState(52);
  const [dragging, setDragging] = useState(false);
  const chatRef = useRef<AIChatHandle>(null);
  const savedSignatureRef = useRef<string | null>(null);

  const isProjectMode = project !== null;

  const activeCode = useMemo(() => {
    if (!project) return code;
    if (currentFile) return project.files[currentFile] ?? "";
    return "";
  }, [project, currentFile, code]);

  const filesSignature = useMemo(
    () => (project ? JSON.stringify(project.files) : null),
    [project],
  );

  const dirty = isProjectMode && savedSignatureRef.current !== filesSignature;

  const debouncedCode = useDebounced(activeCode, 600);

  const editorLanguage = useMemo(
    () => editorLanguageForFile(project ? currentFile : "index.html"),
    [project, currentFile],
  );

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging) return;
      const next = (e.clientX / window.innerWidth) * 100;
      setSplit(Math.min(70, Math.max(30, next)));
    }
    function onUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const handleEditorChange = useCallback(
    (value: string) => {
      if (project) {
        if (!currentFile) return;
        setProject((prev) => {
          if (!prev) return prev;
          return { ...prev, files: { ...prev.files, [currentFile]: value } };
        });
      } else {
        setCode(value);
      }
    },
    [project, currentFile, setCode],
  );

  function openPickedFolder(): Promise<boolean> {
    return new Promise((resolve) => {
      pickProjectFolder().then((picked) => {
        if (!picked || picked.files.length === 0) {
          resolve(false);
          return;
        }
        const files: Record<string, string> = {};
        for (const f of picked.files) files[f.path] = f.content;
        const newProject: Project = {
          id: "",
          name: picked.name,
          files,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setProject(newProject);
        savedSignatureRef.current = JSON.stringify(files);
        const preferred =
          picked.files.find((f) => f.path === "index.html") ?? picked.files[0];
        setCurrentFile(preferred?.path ?? null);
        setTab("preview");
        resolve(true);
      });
    });
  }

  async function handleSaveProject() {
    if (!project || !user || saving) return;
    setSaving(true);
    try {
      if (project.id) {
        await saveProject(project, user.uid);
      } else {
        const created = await createProject(user.uid, project.name, project.files);
        setProject({ ...project, id: created.id });
      }
      savedSignatureRef.current = JSON.stringify(project.files);
      showNotice("ok", "Proje kaydedildi ✅ Geçmiş Projeler'de görünür.");
    } catch (err) {
      showNotice("error", `Kayıt başarısız: ${describeFirestoreError(err)}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleOpenProject(id: string) {
    setProjectsOpen(false);
    if (dirty) {
      setPendingDiscard({ action: "open", payload: id });
      return;
    }
    await doOpenProject(id);
  }

  async function doOpenProject(id: string) {
    try {
      const loaded = await loadProject(id);
      if (!loaded) {
        showNotice("error", "Proje bulunamadı — kayıt silinmiş olabilir.");
        return;
      }
      setProject(loaded);
      savedSignatureRef.current = JSON.stringify(loaded.files);
      const preferred = loaded.files["index.html"] !== undefined ? "index.html" : Object.keys(loaded.files)[0] ?? null;
      setCurrentFile(preferred);
      setTab("preview");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showNotice("error", `Proje açılamadı: ${describeFirestoreError(err)}`);
    }
  }

  function requestNewProject() {
    setProjectsOpen(false);
    if (dirty) {
      setPendingDiscard({ action: "new" });
      return;
    }
    openPickedFolder();
  }

  function requestImportProject() {
    setProjectsOpen(false);
    if (dirty) {
      setPendingDiscard({ action: "import" });
      return;
    }
    openPickedFolder();
  }

  async function handleExportProject() {
    if (!project) return;
    if (project.id) {
      setSaving(true);
      try {
        await saveProject(project, user?.uid ?? "");
        savedSignatureRef.current = JSON.stringify(project.files);
      } catch (err) {
        showNotice("error", `Kayıt başarısız, indirme yine de yapıldı: ${describeFirestoreError(err)}`);
      } finally {
        setSaving(false);
      }
    }
    await downloadProjectZip(project.name, project.files);
    showNotice("ok", "Proje zip olarak indirildi (zelixcode).");
  }

  async function handleDiscardProceed() {
    const pending = pendingDiscard;
    setPendingDiscard(null);
    if (!pending) return;
    if (pending.action === "new" || pending.action === "import") {
      await openPickedFolder();
    } else if (pending.action === "open" && pending.payload) {
      await doOpenProject(pending.payload);
    }
  }

  function handleApplyCode(newCode: string) {
    if (project && currentFile) {
      setProject((prev) =>
        prev ? { ...prev, files: { ...prev.files, [currentFile]: newCode } } : prev,
      );
    } else {
      setCode(newCode);
    }
    setRefreshKey((k) => k + 1);
    setTab("preview");
  }

  function handleDeleteFile(path: string) {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return prev;
      const files = { ...prev.files };
      delete files[path];
      return { ...prev, files };
    });
    if (currentFile === path) {
      setCurrentFile(Object.keys(project.files).find((p) => p !== path) ?? null);
    }
  }

  function runAction(action: ChatAction) {
    setTab("ai");
    setTimeout(() => chatRef.current?.runAction(action), 50);
  }

  function handleSaveKeys(keys: ApiKeys) {
    setApiKeys(keys);
  }

  async function handleLogout() {
    try {
      await signOut(getFirebase().auth);
    } catch {
      // yut
    }
  }

  const hasAnyKey = Object.values(apiKeys).some((k) => k?.trim());
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Kullanıcı";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#101013] text-zinc-200">
      {/* ── Üst Bar ─────────────────────────────────────────────── */}
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-zinc-800 bg-[#1c1c1f] px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-fuchsia-600">
            <FileCode2 size={14} className="text-white" />
          </div>
          <span className="text-[13px] font-bold tracking-tight text-zinc-100">
            Zelix<span className="text-violet-400">Vary</span>
          </span>
        </div>

        <button
          onClick={() => setProjectsOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1 text-[11.5px] font-medium text-zinc-300 transition hover:border-violet-500/60 hover:text-violet-300"
          title="Projelerim: yeni proje, içe aktar, geçmiş"
        >
          <FolderOpen size={12} className="text-violet-400" />
          Proje
        </button>

        <div className="ml-1 flex min-w-0 items-center gap-2">
          {isProjectMode ? (
            <>
              <span className="flex max-w-48 items-center gap-1.5 truncate rounded-md border border-zinc-700 bg-[#232328] px-2.5 py-1 text-[11.5px] text-zinc-300">
                <FolderOpen size={12} className="text-amber-400" />
                <span className="truncate">{project.name}</span>
                {dirty && (
                  <span className="ml-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" title="Kaydedilmemiş değişiklikler" />
                )}
              </span>
              {currentFile && (
                <span className="hidden max-w-40 items-center gap-1.5 truncate rounded-md border border-zinc-800 bg-[#18181b] px-2 py-1 text-[11px] text-zinc-500 md:flex">
                  <FileCode2 size={11} className="text-sky-400" />
                  <span className="truncate">{currentFile}</span>
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#232328] px-2.5 py-1 text-[11.5px] text-zinc-300">
              <FileCode2 size={12} className="text-sky-400" />
              index.html (tek dosya)
            </span>
          )}
        </div>

        <div className="mx-auto flex items-center gap-2">
          {isProjectMode && (
            <button
              onClick={handleSaveProject}
              disabled={saving}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[11.5px] font-medium transition active:scale-95 disabled:opacity-50 ${
                dirty
                  ? "bg-amber-500/90 text-black hover:bg-amber-400"
                  : "border border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
              title={dirty ? "Kaydedilmemiş değişiklikler var" : "Kaydedildi"}
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {dirty ? "Kaydet" : "Kaydedildi"}
            </button>
          )}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1 text-[11.5px] font-medium text-white transition hover:bg-violet-500 active:scale-95"
            title="Önizlemeyi yenile (F5)"
          >
            <Play size={12} />
            Çalıştır
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => runAction("debug")}
            disabled={!hasAnyKey}
            className="hidden items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1 text-[11.5px] text-zinc-300 transition hover:border-amber-500/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
            title="Kodu analiz et & hata bul"
          >
            <Bug size={12} />
            Analiz Et
          </button>
          <button
            onClick={() => runAction("refactor")}
            disabled={!hasAnyKey}
            className="hidden items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1 text-[11.5px] text-zinc-300 transition hover:border-emerald-500/60 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
            title="Kodu yeniden yaz (refactor)"
          >
            <Wand2 size={12} />
            Refactor
          </button>
          {isProjectMode && (
            <button
              onClick={handleExportProject}
              className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1 text-[11.5px] text-zinc-300 transition hover:border-emerald-500/60 hover:text-emerald-300"
              title="Projeyi zip olarak indir (zelixcode)"
            >
              <Download size={12} />
              Çıkar
            </button>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11.5px] transition ${
              hasAnyKey
                ? "border-zinc-700 text-zinc-300 hover:border-violet-500/60 hover:text-violet-300"
                : "border-violet-500/50 bg-violet-600/15 text-violet-300 hover:bg-violet-600/25"
            }`}
            title="API anahtarlarını yönet"
          >
            <Settings size={12} />
            {hasAnyKey ? "Ayarlar" : "API Anahtarı"}
          </button>
          <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-[11px] font-bold text-violet-300">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden max-w-24 truncate text-[11.5px] text-zinc-400 lg:block">
              {displayName}
            </span>
            <button
              onClick={handleLogout}
              className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400"
              title="Çıkış yap"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Ana Alan ───────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* Sol blok: Dosya Gezgini + Editör */}
        <div className="flex min-w-0" style={{ width: `${split}%` }}>
          {isProjectMode && (
            <div className="w-52 shrink-0 border-r border-zinc-800">
              <FileExplorer
                files={project.files}
                currentFile={currentFile}
                onSelect={setCurrentFile}
                onCreateFile={(path, content) =>
                  setProject((prev) =>
                    prev ? { ...prev, files: { ...prev.files, [path]: content } } : prev,
                  )
                }
                onDeleteFile={handleDeleteFile}
              />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-8 items-center gap-2 border-b border-zinc-800 bg-[#232328] px-3">
              <span className="text-[11px] font-medium text-zinc-400">DÜZENLEYİCİ</span>
              <span className="text-[11px] text-zinc-600">
                {isProjectMode ? (currentFile ?? "dosya seç") : "HTML / CSS / JS — Monaco"}
              </span>
              <span className="ml-auto flex items-center gap-1 text-[11px] text-zinc-500">
                <Eye size={11} /> {activeCode.length} karakter
              </span>
            </div>
            <div className="h-[calc(100%-32px)]">
              {isProjectMode && !currentFile ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[13px] text-zinc-600">
                    Soldan bir dosya seç veya <button className="text-violet-400 hover:underline" onClick={() => setProjectsOpen(true)}>yeni dosya oluştur</button>
                  </p>
                </div>
              ) : (
                <CodeEditor code={activeCode} onChange={handleEditorChange} language={editorLanguage} />
              )}
            </div>
          </div>
        </div>

        {/* Sürükleme çubuğu */}
        <div
          className={`relative z-10 w-1 shrink-0 cursor-col-resize transition-colors ${
            dragging ? "bg-violet-500" : "bg-zinc-800 hover:bg-violet-500/60"
          }`}
          onMouseDown={() => setDragging(true)}
          title="Paneli yeniden boyutlandır"
        />

        {/* Sağ: Sekmeler */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-8 shrink-0 items-center gap-1 border-b border-zinc-800 bg-[#1c1c1f] px-2">
            <button
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-[12px] font-medium transition ${
                tab === "preview"
                  ? "border-x border-t border-zinc-800 bg-[#18181b] text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Eye size={13} className={tab === "preview" ? "text-sky-400" : ""} />
              Canlı Önizleme
            </button>
            <button
              onClick={() => setTab("ai")}
              className={`flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-[12px] font-medium transition ${
                tab === "ai"
                  ? "border-x border-t border-zinc-800 bg-[#18181b] text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Bot size={13} className={tab === "ai" ? "text-violet-400" : ""} />
              ZelixVary AI
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <div className={tab === "preview" ? "h-full" : "hidden"}>
              <PreviewPanel
                projectMode={isProjectMode}
                currentFile={currentFile}
                files={isProjectMode ? project?.files ?? null : null}
                singleCode={debouncedCode}
                refreshKey={refreshKey}
              />
            </div>
            <div className={tab === "ai" ? "h-full" : "hidden"}>
              <AIChat
                ref={chatRef}
                code={activeCode}
                files={isProjectMode ? project?.files ?? {} : {}}
                apiKeys={apiKeys}
                projectId={project?.id ?? null}
                chatLabel={project?.name ?? null}
                onApplyCode={handleApplyCode}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <ProjectsPanel
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        onNewProject={requestNewProject}
        onImportProject={requestImportProject}
        onOpenProject={handleOpenProject}
        onExportProject={handleExportProject}
      />

      {settingsOpen && (
        <SettingsModal
          keys={apiKeys}
          onClose={() => setSettingsOpen(false)}
          onSave={handleSaveKeys}
        />
      )}

      {notice && (
        <div
          className={`fixed right-4 top-14 z-50 max-w-md rounded-xl border px-4 py-3 text-[12.5px] leading-relaxed shadow-2xl backdrop-blur ${
            notice.kind === "ok"
              ? "border-emerald-600/50 bg-emerald-950/90 text-emerald-200"
              : "border-red-600/50 bg-red-950/90 text-red-200"
          }`}
        >
          {notice.text}
        </div>
      )}

      {pendingDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#1c1c1f] p-5 shadow-2xl">
            <h3 className="mb-2 text-[15px] font-bold text-zinc-100">Kaydedilmemiş Değişiklikler</h3>
            <p className="mb-4 text-[13px] leading-relaxed text-zinc-400">
              Bu işleme geçmeden önce projendeki değişiklikler kaydedilmemiş durumda.
              Kaydetmeden devam etmek istediğine emin misin?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDiscard(null)}
                className="rounded-lg px-4 py-2 text-[13px] text-zinc-300 transition hover:bg-zinc-700/40"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDiscardProceed}
                className="rounded-lg bg-amber-500 px-4 py-2 text-[13px] font-semibold text-black transition hover:bg-amber-400"
              >
                Kaydetmeden Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
