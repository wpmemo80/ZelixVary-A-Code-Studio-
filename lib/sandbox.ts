const LOCALSTORAGE_SHIM = `<script>
(function () {
  try {
    var t = window.localStorage;
    if (t) return; // erişilebilir, shim gerekmez
  } catch (e) {}
  // Sandbox iframe'de localStorage erişimi engellenir (SecurityError).
  // Bellek tabanlı uyumlu bir shim sağla.
  var store = {};
  var storage = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; },
    clear: function () { store = {}; },
    key: function (i) { return Object.keys(store)[i] || null; },
    get length() { return Object.keys(store).length; }
  };
  Object.defineProperty(window, "localStorage", { value: storage, configurable: true, writable: true });
})();
<\/script>`;

const CONSOLE_HOOK = `<script>
(function () {
  function send(level, args) {
    try {
      parent.postMessage({
        source: "zelixvary",
        type: level,
        data: Array.prototype.map.call(args, function (a) {
          if (a instanceof Error) return a.name + ": " + a.message;
          if (typeof a === "object") { try { return JSON.stringify(a); } catch (e) { return String(a); } }
          return String(a);
        })
      }, "*");
    } catch (e) {}
  }
  ["log", "warn", "error", "info"].forEach(function (level) {
    var orig = console[level].bind(console);
    console[level] = function () { send(level, arguments); orig.apply(null, arguments); };
  });
  window.addEventListener("error", function (e) {
    send("error", ["Uncaught: " + e.message + " (satır " + e.lineno + ")"] );
  });
  window.addEventListener("unhandledrejection", function (e) {
    send("error", ["Unhandled rejection: " + (e.reason && e.reason.message ? e.reason.message : e.reason)]);
  });
})();
<\/script>`;

const WRAPPED_BODY = (inner: string) => `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ZelixVary Önizleme</title>
</head>
<body>
${inner}
</body>
</html>`;

/**
 * Editördeki kodu tam bir HTML dokümanına dönüştürür.
 * - Tam HTML dokümanı ise olduğu gibi kullanır.
 * - Tek tag (ör. <div>...) ise <body> içine yerleştirir.
 * - CSS gibi görünüyorsa <style> olarak sarar.
 * - JS gibi görünüyorsa <script> olarak sarar.
 * Console mesajlarını yakalayan hook her iki durumda da enjekte edilir.
 */
export function buildSandboxHtml(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return "";

  const isFullDoc = /^<!doctype\b/i.test(trimmed) || /^<html[\s>]/i.test(trimmed);

  if (isFullDoc) {
    return injectHook(trimmed);
  }

  const looksLikeCss = !trimmed.includes("<") && /\{[^}]*\}/.test(trimmed);
  const looksLikeJs = !trimmed.includes("<");

  let inner: string;
  if (looksLikeCss) {
    inner = `<style>\n${trimmed}\n</style>\n<div class="preview-body"></div>`;
  } else if (looksLikeJs) {
    inner = `<script>\n${trimmed}\n<\/script>`;
  } else {
    inner = trimmed;
  }

  return injectHook(WRAPPED_BODY(inner));
}

function injectHook(doc: string): string {
  const hook = LOCALSTORAGE_SHIM + CONSOLE_HOOK;
  if (/<\/body>/i.test(doc)) {
    return doc.replace(/<\/body>/i, `${hook}</body>`);
  }
  if (/<\/html>/i.test(doc)) {
    return doc.replace(/<\/html>/i, `${hook}</html>`);
  }
  return doc + hook;
}

/**
 * HTML'de başvurulan yolu proje dosyalarından çözer.
 * "style.css", "./style.css" ve "/style.css" aynı dosyayı gösterir.
 */
function resolveAssetPath(href: string, files: Record<string, string>): string | null {
  const candidates = [href, href.replace(/^\.\//, ""), href.replace(/^\//, "")];
  for (const c of candidates) {
    if (Object.prototype.hasOwnProperty.call(files, c) && c.trim()) return c;
  }
  return null;
}

/**
 * Proje modundaki HTML'in bağladığı harici css/js dosyalarını bulup içine gömer.
 *   <link rel="stylesheet" href="style.css">  → <style>…içerik…</style>
 *   <script src="app.js"></script>            → <script>…içerik…</script>
 * Proje dosyalarından bulunamayan bağlantılar olduğu gibi bırakılır.
 */
export function inlineProjectAssets(html: string, files: Record<string, string>): string {
  let out = html;

  out = out.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = tag.match(/\brel\s*=\s*["']([^"']*)["']/i);
    if (!rel || !/\bstylesheet\b/i.test(rel[1])) return tag;
    const href = tag.match(/\bhref\s*=\s*["']([^"']*)["']/i);
    if (!href) return tag;
    const target = resolveAssetPath(href[1], files);
    if (!target) return tag;
    return `<style>\n${files[target]}\n</style>`;
  });

  out = out.replace(/<script\b[^>]*\bsrc\s*=\s*["']([^"']*)["'][^>]*>\s*<\/script>/gi, (tag, src: string) => {
    const target = resolveAssetPath(src, files);
    if (!target) return tag;
    return `<script>\n${files[target]}\n</script>`;
  });

  return out;
}

/**
 * Tek başına çalıştırılan bir JS dosyası için konsol-odaklı önizleme dokümanı üretir.
 * Kod iframe içinde çalışır; console.log çıktıları Konsol panelinde izlenir.
 */
export function buildJsConsoleDoc(js: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ZelixVary Konsol</title>
${LOCALSTORAGE_SHIM}
${CONSOLE_HOOK}
</head>
<body>
<pre style="margin:0;padding:12px 14px;font-family:Consolas,monospace;font-size:12px;color:#52525b;background:#101013;">// ${js.length} karakter — kod çalıştı. Çıktıları alttaki Konsol panelinden izle.</pre>
<script>
${js}
<\/script>
</body>
</html>`;
}

export const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ZelixVary Deneme</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e2e8f0;
    }
    .card {
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 32px 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }
    .card h1 { font-size: 28px; margin-bottom: 8px; }
    .card p { color: #94a3b8; margin-bottom: 20px; }
    .card button {
      background: #7c3aed;
      color: #fff;
      border: none;
      padding: 10px 22px;
      border-radius: 8px;
      font-size: 15px;
      cursor: pointer;
      transition: transform 0.15s, background 0.15s;
    }
    .card button:hover { background: #8b5cf6; transform: translateY(-2px); }
    .card button:active { transform: scale(0.96); }
    #clickCount { font-weight: 700; color: #fbbf24; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 ZelixVary Çalışıyor!</h1>
    <p>Soldaki editöre HTML / CSS / JS yaz, bu önizleme anlık güncellensin.</p>
    <button id="btn">Bana Tıkla</button>
    <p style="margin-top:16px;">Tıklama sayısı: <span id="clickCount">0</span></p>
  </div>

  <script>
    let count = 0;
    const btn = document.getElementById("btn");
    btn.addEventListener("click", () => {
      count++;
      document.getElementById("clickCount").textContent = count;
      console.log("Butona tıklandı! Sayı:", count);
    });
  <\/script>
</body>
</html>`;
