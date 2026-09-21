"use client";

import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";

if (typeof window !== "undefined") {
  loader.config({ paths: { vs: "/monaco-editor/min/vs" } });
}

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
}

export function editorLanguageForFile(path: string | null): string {
  if (!path) return "html";
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "jsx":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "xml":
    case "svg":
      return "xml";
    default:
      return "plaintext";
  }
}

export default function CodeEditor({ code, onChange, language = "html" }: CodeEditorProps) {
  const beforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("zelixvary-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#18181b",
        "editor.lineHighlightBackground": "#232328",
        "editor.selectionBackground": "#264f78",
        "editorLineNumber.foreground": "#565669",
        "editorLineNumber.activeForeground": "#a1a1aa",
        "editorIndentGuide.background": "#26262c",
        "editorWidget.background": "#232328",
        "editorWidget.border": "#2e2e35",
        "editorSuggestWidget.background": "#232328",
        "editorSuggestWidget.selectedBackground": "#3f3f46",
        "scrollbarSlider.background": "#3f3f46aa",
        "scrollbarSlider.hoverBackground": "#52525baa",
        "editorGutter.background": "#18181b",
        "editorCursor.foreground": "#7c3aed",
      },
    });
  };

  const onMount: OnMount = (editor) => {
    editor.focus();
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[#18181b]">
      <Editor
        height="100%"
        language={language}
        theme="zelixvary-dark"
        value={code}
        onChange={(value) => onChange(value ?? "")}
        beforeMount={beforeMount}
        onMount={onMount}
        options={{
          fontSize: 14,
          fontFamily:
            "var(--font-geist-mono), Consolas, 'Courier New', monospace",
          fontLigatures: true,
          minimap: { enabled: true, maxColumn: 90 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "off",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "all",
          overviewRulerBorder: false,
          padding: { top: 12, bottom: 12 },
          fixedOverflowWidgets: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
          formatOnPaste: true,
          formatOnType: true,
          autoIndent: "full",
          inlayHints: { enabled: "on" },
          stickyScroll: { enabled: true },
          folding: true,
          lineNumbersMinChars: 3,
          scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
        }}
      />
    </div>
  );
}
