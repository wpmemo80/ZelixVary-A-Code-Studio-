// ── ZelixVary i18n Çeviri Sistemi ─────────────────────────────

export type Lang = "tr" | "en";

export const LANG_LABELS: Record<Lang, string> = {
  tr: "🇹🇷 Türkçe",
  en: "🇬🇧 English",
};

export const STRINGS = {
  // ── Landing Page ──
  "nav.login": { tr: "Giriş Yap", en: "Log In" },
  "nav.register": { tr: "Kayıt Ol", en: "Sign Up" },
  "hero.badge": { tr: "Gemini • DeepSeek • Grok • OpenAI destekli", en: "Powered by Gemini • DeepSeek • Grok • OpenAI" },
  "hero.title1": { tr: "Kod Yaz, Önizle,", en: "Write Code, Preview," },
  "hero.title2": { tr: "Yapay Zekaya Bırak.", en: "Leave It to AI." },
  "hero.desc": {
    tr: "ZelixVary; VS Code deneyimini tarayıcıya taşır. Monaco editörü, canlı önizleme ve istemine göre en uygun modeli otomatik seçen akıllı yönlendirici — hepsi tek yerde.",
    en: "ZelixVary brings the VS Code experience to your browser. Monaco editor, live preview, and a smart router that picks the best model for your prompt — all in one place.",
  },
  "hero.cta": { tr: "Ücretsiz Başla", en: "Start Free" },
  "hero.demo": { tr: "Canlı Demo", en: "Live Demo" },
  "hero.note": { tr: "Kayıt gerektirmez mi? Hayır — tüm özellikler için ücretsiz hesap yeterli.", en: "Does it require sign-up? Yes — a free account unlocks all features." },
  "features.title": { tr: "Neden", en: "Why" },
  "features.titleAccent": { tr: "ZelixVary?", en: "ZelixVary?" },
  "footer.tagline": { tr: "Multi-AI Code Studio", en: "Multi-AI Code Studio" },
  "footer.security": { tr: "API anahtarların yalnızca tarayıcında saklanır 🔒", en: "API keys are stored only in your browser 🔒" },
  "footer.by": { tr: "ZelixYzlm group tarafından", en: "by ZelixYzlm group" },
  "footer.author": { tr: "👑 Emir Özer (15)", en: "👑 Emir Özer (15)" },

  // ── Features ──
  "feat.live.title": { tr: "Canlı Önizleme", en: "Live Preview" },
  "feat.live.desc": { tr: "HTML, CSS, JS ve Python kodunu tarayıcıyı terk etmeden anında çalıştır.", en: "Run HTML, CSS, JS and Python code instantly without leaving the browser." },
  "feat.ai.title": { tr: "4+ Yapay Zeka", en: "5+ AI Models" },
  "feat.ai.desc": { tr: "Gemini, DeepSeek, Grok, OpenAI ve Claude — ZelixVary Auto Router en iyisini seçer.", en: "Gemini, DeepSeek, Grok, OpenAI and Claude — ZelixVary Auto Router picks the best." },
  "feat.apply.title": { tr: "Tek Tıkla Uygula", en: "Apply in One Click" },
  "feat.apply.desc": { tr: "AI'ın ürettiği kodu doğrudan editöre aktar, hata bul, refactor et.", en: "Send AI-generated code straight to the editor, find bugs, refactor." },
  "feat.cloud.title": { tr: "Bulut Projeler", en: "Cloud Projects" },
  "feat.cloud.desc": { tr: "Klasörlerini içe aktar, dosyalarını düzenle, hepsi hesabında saklansın.", en: "Import folders, edit files, all saved to your account." },
  "feat.chat.title": { tr: "Kalıcı Sohbet Geçmişi", en: "Persistent Chat History" },
  "feat.chat.desc": { tr: "AI sohbetlerin hesabına kaydedilir, kaldığın yerden devam edersin.", en: "AI chats are saved to your account; pick up where you left off." },
  "feat.editor.title": { tr: "Monaco Editörü", en: "Monaco Editor" },
  "feat.editor.desc": { tr: "VS Code gücünde editör: sözdizimi vurgulama, otomatik tamamlama, satır numaraları.", en: "VS Code-grade editor: syntax highlighting, autocomplete, line numbers." },

  // ── Auth Modal ──
  "auth.register.title": { tr: "ZelixVary'ye Katıl", en: "Join ZelixVary" },
  "auth.login.title": { tr: "Tekrar Hoş Geldin", en: "Welcome Back" },
  "auth.register.sub": { tr: "Hesabını oluştur, projelerin ve AI sohbet geçmişlerin bulutta güvende kalsın.", en: "Create your account; your projects and AI chat history stay safe in the cloud." },
  "auth.login.sub": { tr: "Projelerine ve sohbet geçmişine kaldığın yerden devam et.", en: "Continue your projects and chat history from where you left off." },
  "auth.name": { tr: "İsim", en: "Name" },
  "auth.namePh": { tr: "Adın", en: "Your name" },
  "auth.email": { tr: "E-posta", en: "Email" },
  "auth.emailPh": { tr: "ornek@email.com", en: "you@example.com" },
  "auth.password": { tr: "Şifre", en: "Password" },
  "auth.passwordPh": { tr: "••••••••", en: "••••••••" },
  "auth.create": { tr: "Hesap Oluştur", en: "Create Account" },
  "auth.login": { tr: "Giriş Yap", en: "Log In" },
  "auth.creating": { tr: "Hesap oluşturuluyor...", en: "Creating account..." },
  "auth.logging": { tr: "Giriş yapılıyor...", en: "Logging in..." },
  "auth.noAccount": { tr: "Hesabın yok mu?", en: "Don't have an account?" },
  "auth.hasAccount": { tr: "Zaten hesabın var mı?", en: "Already have an account?" },
  "auth.signupNow": { tr: "Hemen Kayıt Ol", en: "Sign Up Now" },
  "auth.cloudProjects": { tr: "Bulut projeler", en: "Cloud projects" },
  "auth.aiHistory": { tr: "AI geçmişi", en: "AI history" },
  "auth.quickLogin": { tr: "Hızlı giriş", en: "Quick login" },

  // ── Mode Selection ──
  "mode.welcome": { tr: "Hoşgeldiniz", en: "Welcome" },
  "mode.subtitle": { tr: "Vibe Coding için en iyi ortam", en: "The best environment for Vibe Coding" },
  "mode.local.title": { tr: "Local Kodla", en: "Code Locally" },
  "mode.local.desc": { tr: "Bulut üzerinde deneme amaçlı bir sistemdir.", en: "A trial-based system running in the cloud." },
  "mode.local.warning": { tr: "UYARI:", en: "WARNING:" },
  "mode.local.warningText": { tr: "Tarayıcınızı kapatır veya sekmeyi kapatırsanız her şey silinir.", en: "If you close your browser or tab, everything will be deleted." },
  "mode.local.badge": { tr: "Geçici kodlama stüdyosu", en: "Temporary coding studio" },
  "mode.file.title": { tr: "Dosya Üzerine Kodla", en: "Code on File" },
  "mode.file.desc1": { tr: "Eklediğiniz dosyayı alır ve içerisine yazdığınız her şeyi o dosyaya yazar.", en: "Takes your selected file and writes everything you code into it." },
  "mode.file.desc2": { tr: "Kalıcıdır.", en: "It's permanent." },
  "mode.file.info": { tr: "Kaydedip çıkarsanız aynı dosyadan içeriği değiştirilmiş olarak çıkar.", en: "When you save and exit, the file remains with your changes applied." },
  "mode.file.badge": { tr: "Kalıcı proje modu", en: "Permanent project mode" },
  "mode.note": { tr: "İstediğin zaman mod değiştirebilirsin.", en: "You can switch modes anytime." },

  // ── Studio Header ──
  "studio.back": { tr: "Geri", en: "Back" },
  "studio.project": { tr: "Proje", en: "Project" },
  "studio.local": { tr: "LOCAL", en: "LOCAL" },
  "studio.fileMode": { tr: "DOSYA", en: "FILE" },
  "studio.singleFile": { tr: "index.html (tek dosya)", en: "index.html (single file)" },
  "studio.save": { tr: "Kaydet", en: "Save" },
  "studio.saved": { tr: "Kaydedildi", en: "Saved" },
  "studio.run": { tr: "Çalıştır", en: "Run" },
  "studio.analyze": { tr: "Analiz Et", en: "Analyze" },
  "studio.refactor": { tr: "Refactor", en: "Refactor" },
  "studio.export": { tr: "Çıkar", en: "Export" },
  "studio.settings": { tr: "Ayarlar", en: "Settings" },
  "studio.apiKey": { tr: "API Anahtarı", en: "API Key" },
  "studio.logout": { tr: "Çıkış yap", en: "Log out" },
  "studio.loading": { tr: "ZelixVary yükleniyor...", en: "Loading ZelixVary..." },

  // ── Studio Body ──
  "studio.editor": { tr: "DÜZENLEYİCİ", en: "EDITOR" },
  "studio.preview": { tr: "Canlı Önizleme", en: "Live Preview" },
  "studio.ai": { tr: "ZelixVary AI", en: "ZelixVary AI" },
  "studio.chars": { tr: "karakter", en: "characters" },
  "studio.noFile": { tr: "dosya seç", en: "select file" },
  "studio.selectOrCreate": { tr: "Soldan bir dosya seç veya yeni dosya oluştur", en: "Select a file from the left or create a new one" },
  "studio.fileModeEmpty": { tr: "Sol taraftan bir dosya seç veya yeni dosya oluştur", en: "Select a file from the left or create a new one" },
  "studio.fileModeHint": { tr: "Dosya modu — değişiklikler kalıcı olarak kaydedilir", en: "File mode — changes are saved permanently" },
  "studio.unsavedChanges": { tr: "Kaydedilmemiş Değişiklikler", en: "Unsaved Changes" },
  "studio.discardMsg": { tr: "Bu işleme geçmeden önce projendeki değişiklikler kaydedilmemiş durumda. Kaydetmeden devam etmek istediğine emin misin?", en: "Your project changes are unsaved. Are you sure you want to continue without saving?" },
  "studio.cancel": { tr: "Vazgeç", en: "Cancel" },
  "studio.continue": { tr: "Kaydetmeden Devam Et", en: "Continue Without Saving" },
  "studio.savedOk": { tr: "Proje kaydedildi ✅ Geçmiş Projeler'de görünür.", en: "Project saved ✅ Visible in History Projects." },
  "studio.saveFail": { tr: "Kayıt başarısız:", en: "Save failed:" },
  "studio.projectNotFound": { tr: "Proje bulunamadı — kayıt silinmiş olabilir.", en: "Project not found — it may have been deleted." },
  "studio.projectOpenError": { tr: "Proje açılamadı:", en: "Failed to open project:" },
  "studio.zipDownloaded": { tr: "Proje zip olarak indirildi (zelixcode).", en: "Project downloaded as zip (zelixcode)." },

  // ── Quick Actions ──
  "action.debug": { tr: "Kodu Analiz Et & Hata Bul", en: "Analyze Code & Find Bugs" },
  "action.refactor": { tr: "Kodu Yeniden Yaz (Refactor)", en: "Rewrite Code (Refactor)" },
  "action.ui": { tr: "Modern UI Oluştur", en: "Create Modern UI" },

  // ── AI Chat ──
  "chat.title": { tr: "ZelixVary AI Asistan", en: "ZelixVary AI Assistant" },
  "chat.newChat": { tr: "Yeni Sohbet", en: "New Chat" },
  "chat.history": { tr: "Geçmiş", en: "History" },
  "chat.modelSelect": { tr: "Model seçimi", en: "Model selection" },
  "chat.autoRouter": { tr: "🤖 ZelixVary Auto Router", en: "🤖 ZelixVary Auto Router" },
  "chat.availableModels": { tr: "Kullanılabilir modeller", en: "Available models" },
  "chat.keyRequired": { tr: "Anahtar gerekli", en: "Key required" },
  "chat.noKeySuffix": { tr: "(anahtar yok)", en: "(no key)" },
  "chat.savedChats": { tr: "Kayıtlı Sohbetler", en: "Saved Chats" },
  "chat.noSavedChats": { tr: "Henüz kayıtlı sohbet yok. Biraz konuş, otomatik kaydedilsin.", en: "No saved chats yet. Start chatting and they'll be saved automatically." },
  "chat.deleteChat": { tr: "Bu sohbeti kalıcı olarak sil", en: "Permanently delete this chat" },
  "chat.confirmDelete": { tr: "Emin misin? Tekrar tıkla", en: "Are you sure? Click again" },
  "chat.encryptedChat": { tr: "Şifreli sohbet — açmak için kod gerekir", en: "Encrypted chat — PIN required to open" },
  "chat.openChat": { tr: "Bu sohbeti aç", en: "Open this chat" },
  "chat.send": { tr: "Gönder", en: "Send" },
  "chat.saveChat": { tr: "Sohbeti kaydet (ad ve isteğe bağlı şifre)", en: "Save chat (name and optional PIN)" },
  "chat.placeholder": { tr: "AI'a bir şeyler yaz... (Enter gönderir, Shift+Enter satır)", en: "Write something to AI... (Enter sends, Shift+Enter new line)" },
  "chat.placeholderNoKey": { tr: "Önce API anahtarı ekle (⚙️)", en: "Add an API key first (⚙️)" },
  "chat.aiTyping": { tr: "AI yanıt üretiyor...", en: "AI is responding..." },
  "chat.saveTitle": { tr: "Sohbeti Kaydet", en: "Save Chat" },
  "chat.chatName": { tr: "Sohbet Adı", en: "Chat Name" },
  "chat.chatNamePh": { tr: "Örn: Hesap makinesi sohbeti", en: "e.g. Calculator chat" },
  "chat.encryption": { tr: "Şifreleme sistemi olsun mu?", en: "Enable encryption?" },
  "chat.lockPin": { tr: "4 haneli kodla kilitle", en: "Lock with 4-digit PIN" },
  "chat.noLock": { tr: "Şifresiz açık sohbet", en: "Open chat without PIN" },
  "chat.pinCode": { tr: "4 Haneli Kod", en: "4-Digit PIN" },
  "chat.pinConfirm": { tr: "Kodu Onayla", en: "Confirm PIN" },
  "chat.encryptionNote": { tr: "🔐 Mesajlar tarayıcında AES-256 ile şifrelenir; Firestore'da yalnızca şifreli metin saklanır. Kodu unutursan sohbete hiçbir şekilde erişemezsin.", en: "🔐 Messages are AES-256 encrypted in your browser; only ciphertext is stored in Firestore. If you forget the PIN, you cannot access the chat." },
  "chat.cancel": { tr: "Vazgeç", en: "Cancel" },
  "chat.save": { tr: "Kaydet", en: "Save" },
  "chat.savedOk": { tr: "kaydedildi ✅", en: "saved ✅" },
  "chat.savedLocked": { tr: "şifreli olarak kaydedildi 🔐", en: "saved with encryption 🔐" },
  "chat.saveError": { tr: "Kayıt başarısız:", en: "Save failed:" },
  "chat.pinWrong": { tr: "Şifre yanlış. Tekrar dene.", en: "Wrong PIN. Try again." },
  "chat.pinTitle": { tr: "Şifreli Sohbet", en: "Encrypted Chat" },
  "chat.pinDesc": { tr: "sohbeti 4 haneli kodla korunuyor. Açmak için kodu gir.", en: "chat is protected with a 4-digit PIN. Enter the PIN to open." },
  "chat.open": { tr: "Aç", en: "Open" },
  "chat.encryptedMsg": { tr: "Bu sohbet şifreli 🔒", en: "This chat is encrypted 🔒" },
  "chat.encryptedSub": { tr: "Mesajlar yalnızca 4 haneli kodla açılır. Otomatik kayıt, güvenlik için kilitli sohbete yazmaz — kilidi açınca devam edebilirsin.", en: "Messages can only be opened with a 4-digit PIN. Auto-save doesn't write to locked chats for security — unlock to continue." },
  "chat.enterPin": { tr: "4 Haneli Kodu Gir", en: "Enter 4-Digit PIN" },
  "chat.setupKeys": { tr: "API Anahtarlarını Ayarla", en: "Set Up API Keys" },
  "chat.noKeysMsg": {
    tr: "⚠️ **API anahtarı tanımlı değil.**\n\nSağ üstteki **Ayarlar** (⚙️) butonundan Gemini, DeepSeek, Grok, OpenAI, Claude, Groq, Cerebras, Mistral veya OpenRouter anahtarlarını ekle. Anahtarlar yalnızca tarayıcında (localStorage) saklanır.",
    en: "⚠️ **No API key defined.**\n\nAdd Gemini, DeepSeek, Grok, OpenAI, Claude, Groq, Cerebras, Mistral or OpenRouter keys via the **Settings** (⚙️) button. Keys are stored only in your browser (localStorage).",
  },
  "chat.noKeysAction": {
    tr: "⚠️ Bu işlem için önce bir API anahtarı gerekli. **Ayarlar** (⚙️) butonundan anahtar ekle.",
    en: "⚠️ An API key is required for this action. Add one in **Settings** (⚙️).",
  },
  "chat.applied": { tr: "✅ Kod editöre uygulandı", en: "✅ Code applied to editor" },
  "chat.appliedPreview": { tr: "Önizleme sekmesi güncelleniyor...", en: "Updating preview tab..." },

  // ── Chat Welcome ──
  "chat.welcome": {
    tr: `Merhaba! Ben **ZelixVary AI Asistan** 👋

Aşağıdakileri yapabilirim:
- 🔍 **Kod analizi & hata bulma** — editördeki kodunu inceleyip düzeltilmiş halini veririm
- ✨ **Refactor** — kodunu temiz ve performanslı hale getiririm
- 🎨 **Modern UI oluşturma** — "bana modern bir dashboard tasarla" gibi isteklerle hazır arayüz üretirim
- 💬 **Genel kodlama** — her türlü algoritma ve kod sorusu

Desteklenen modeller:
✦ Gemini · 🐋 DeepSeek · 🕶 Grok · ◉ OpenAI · 🧠 Claude · ⚡ Groq · 🔶 Cerebras · 🌬️ Mistral · 🌐 OpenRouter

Üstteki model menüsünden **🤖 Auto Router**'ı seçersen; istemine göre en uygun yapay zekayı ben seçerim.
Ayrıca **Ayarlar**'dan her model için hangi sürümü kullanacağını seçebilirsin.`,
    en: `Hello! I'm **ZelixVary AI Assistant** 👋

Here's what I can do:
- 🔍 **Code analysis & bug finding** — I'll review your code and provide fixed versions
- ✨ **Refactor** — I'll make your code clean and performant
- 🎨 **Modern UI creation** — I can build ready-made interfaces like "design me a modern dashboard"
- 💬 **General coding** — any algorithm or coding question

Supported models:
✦ Gemini · 🐋 DeepSeek · 🕶 Grok · ◉ OpenAI · 🧠 Claude · ⚡ Groq · 🔶 Cerebras · 🌬️ Mistral · 🌐 OpenRouter

Select **🤖 Auto Router** from the model menu and I'll pick the best AI for your prompt.
You can also choose which model version each provider uses in **Settings**.`,
  },

  // ── File Picker Modal ──
  "pick.title.debug": { tr: "Kod Analizi & Hata Bul", en: "Code Analysis & Bug Finder" },
  "pick.title.refactor": { tr: "Kodu Yeniden Yaz", en: "Rewrite Code" },
  "pick.title.ui": { tr: "Modern UI Oluştur", en: "Create Modern UI" },
  "pick.desc": { tr: "Hangi dosyaları yapay zekaya göndereceğini seç. Seçili dosyalardaki kod analiz edilir.", en: "Select which files to send to the AI. Code in selected files will be analyzed." },
  "pick.selectAll": { tr: "Tümünü Seç", en: "Select All" },
  "pick.cancel": { tr: "Vazgeç", en: "Cancel" },
  "pick.analyze": { tr: "Analiz Et", en: "Analyze" },
  "pick.files": { tr: "dosya", en: "file(s)" },
  "pick.extraLabel": { tr: "Ekstra İstek", en: "Extra Request" },
  "pick.optional": { tr: "(isteğe bağlı)", en: "(optional)" },
  "pick.extraUiPh": { tr: "Örn: Kubernetes temalı bir dashboard yap, sidebar olsun...", en: "e.g. Make a Kubernetes-themed dashboard with a sidebar..." },
  "pick.extraRefactorPh": { tr: "Örn: Functional component'e çevir, TypeScript ekle...", en: "e.g. Convert to functional component, add TypeScript..." },
  "pick.extraDebugPh": { tr: "Örn: Bu hatayı düzelt, performansı artır...", en: "e.g. Fix this bug, improve performance..." },
  "pick.extraHint": { tr: "Yapay zekaya ek bilgi vermek istersen buraya yaz. Seçili dosyalardaki kodla birlikte gönderilir.", en: "Write additional instructions for the AI here. Sent along with the selected file code." },

  // ── Action Labels ──
  "act.debug": { tr: "🔍 **Kod Analizi & Hata Bulma** isteği gönderdim. Kodun inceleniyor...", en: "🔍 I sent a **Code Analysis & Bug Finding** request. Your code is being reviewed..." },
  "act.refactor": { tr: "✨ **Refactor (Kodu Yeniden Yaz)** isteği gönderdim. Kodun yeniden yazılıyor...", en: "✨ I sent a **Refactor (Rewrite Code)** request. Your code is being rewritten..." },
  "act.ui": { tr: "🎨 **Modern UI Oluşturma** isteği gönderdim. Arayüz tasarlanıyor...", en: "🎨 I sent a **Create Modern UI** request. The interface is being designed..." },

  // ── File Explorer ──
  "files.title": { tr: "Dosyalar", en: "Files" },
  "files.new": { tr: "Yeni dosya", en: "New file" },
  "files.empty": { tr: "Henüz dosya yok", en: "No files yet" },
  "files.emptyHint": { tr: "+ butonuna basarak yeni dosya oluştur", en: "Click + to create a new file" },
  "files.createBtn": { tr: "Yeni Dosya Oluştur", en: "Create New File" },
  "files.add": { tr: "Ekle", en: "Add" },
  "files.count": { tr: "dosya", en: "file(s)" },
  "files.editing": { tr: "düzenleniyor", en: "editing" },
  "files.noSelection": { tr: "seçim yok", en: "no selection" },
  "files.delete": { tr: "Dosyayı sil", en: "Delete file" },

  // ── Preview Panel ──
  "preview.selectFile": { tr: "Önizleme için soldan bir dosya seç.", en: "Select a file from the left to preview." },
  "preview.hint": { tr: "HTML → canlı web, JS → konsol, PY → Python çalıştırıcı", en: "HTML → live web, JS → console, PY → Python runner" },
  "preview.cannotPreview": { tr: "dosyası tek başına önizlenemez.", en: "file cannot be previewed alone." },
  "preview.thisFile": { tr: "Bu", en: "This" },
  "preview.linkHint": { tr: "Bir", en: "Open an" },
  "preview.linkHint2": { tr: "açıp bu dosyayı", en: "and link this file as" },
  "preview.linkHint3": { tr: "olarak bağla.", en: "." },

  // ── Python Runner ──
  "py.ready": { tr: "● Hazır", en: "● Ready" },
  "py.error": { tr: "✕ Hata", en: "✕ Error" },
  "py.loading": { tr: "○ Python yükleniyor...", en: "○ Loading Python..." },
  "py.run": { tr: "Çalıştır", en: "Run" },
  "py.stop": { tr: "Durdur", en: "Stop" },
  "py.clear": { tr: "Temizle", en: "Clear" },
  "py.done": { tr: "ms'de tamamlandı", en: "ms completed" },
  "py.errorLabel": { tr: "Hata", en: "Error" },
  "py.stopped": { tr: "— program kullanıcı tarafından durduruldu —", en: "— program stopped by user —" },
  "py.loadingMsg": { tr: "Python motoru indiriliyor (tek seferlik ~10 MB)...", en: "Downloading Python engine (one-time ~10 MB)..." },
  "py.emptyTitle": { tr: "Python REPL", en: "Python REPL" },
  "py.emptyDesc": { tr: "kod burada çalışır, print() çıktıları ve hatalar aşağıda görünür.", en: "code runs here; print() output and errors appear below." },
  "py.autoRun": { tr: "her düzenlemede otomatik çalışır, ya da Çalıştır butonuna bas.", en: "auto-runs on every edit, or press the Run button." },
  "py.inputNote": { tr: "input() artık destekleniyor! Aşağıdaki alandan cevap girebilirsin.", en: "input() is now supported! You can type your answer below." },
  "py.infiniteLoop": { tr: "Sonsuz döngü oluşursa", en: "If an infinite loop occurs, press" },
  "py.infiniteLoopEnd": { tr: "ile kes.", en: "to stop it." },
  "py.inputLabel": { tr: "Input:", en: "Input:" },
  "py.inputPh": { tr: "Cevabınızı yazın...", en: "Type your answer..." },
  "py.inputHint": { tr: "Enter ile gönder · input() artık çalışıyor!", en: "Press Enter to send · input() now works!" },
  "py.waitingInput": { tr: "giriş bekleniyor...", en: "waiting for input..." },
  "py.running": { tr: "çalışıyor...", en: "running..." },
  "py.idle": { tr: "beklemede — kod değişince otomatik çalışır", en: "idle — auto-runs when code changes" },
  "py.inputPending": { tr: "⏳ Giriş bekleniyor...", en: "⏳ Waiting for input..." },

  // ── Settings Modal ──
  "settings.title": { tr: "ZelixVary AI Hub — API Anahtarları & Modeller", en: "ZelixVary AI Hub — API Keys & Models" },
  "settings.saved": { tr: "Anahtarlar ve modeller kaydedildi.", en: "Keys and models saved." },
  "settings.active": { tr: "AKTİF", en: "ACTIVE" },
  "settings.getKey": { tr: "Anahtar al", en: "Get key" },
  "settings.modelLabel": { tr: "Model:", en: "Model:" },
  "settings.keySaved": { tr: "✅ API anahtarı girildi", en: "✅ API key entered" },
  "settings.cancel": { tr: "İptal", en: "Cancel" },
  "settings.save": { tr: "Kaydet", en: "Save" },
  "settings.saved2": { tr: "Kaydedildi", en: "Saved" },
  "settings.hide": { tr: "Gizle", en: "Hide" },
  "settings.show": { tr: "Göster", en: "Show" },
  "settings.privacyNote": {
    tr: "🔒 Anahtarlar yalnızca localStorage içinde saklanır ve istekler ZelixVary proxy sunucusu üzerinden gönderilir; sunucuya asla kaydedilmez. Tarayıcınızı temizlerseniz anahtarlar silinir.",
    en: "🔒 Keys are stored only in localStorage and requests go through the ZelixVary proxy server; never saved on the server. Clearing your browser will delete the keys.",
  },

  // ── Projects Panel ──
  "projects.title": { tr: "Projelerim", en: "My Projects" },
  "projects.newProject": { tr: "Yeni Proje (Klasör Seç)", en: "New Project (Select Folder)" },
  "projects.import": { tr: "Projeyi İçe Aktar", en: "Import Project" },
  "projects.export": { tr: "Projeyi Çıkar (zelixcode)", en: "Export Project (zelixcode)" },
  "projects.history": { tr: "Geçmiş Projeler", en: "History Projects" },
  "projects.loadError": { tr: "Projeler yüklenemedi:", en: "Failed to load projects:" },
  "projects.empty": { tr: "Henüz projen yok. \"Yeni Proje\" ile bir klasör seçerek başla.", en: "No projects yet. Start with \"New Project\" and select a folder." },
  "projects.files": { tr: "dosya", en: "files" },
  "projects.delete": { tr: "Sil", en: "Delete" },
  "projects.confirmDelete": { tr: "Emin misin? Tıkla ve sil", en: "Sure? Click to delete" },

  // ── Update Panel ──
  "update.old": { tr: "Eski", en: "Older" },
  "update.new": { tr: "Yeni", en: "Newer" },
  "update.close": { tr: "✔️ Kapat", en: "✔️ Close" },
  "update.dontShow": { tr: "✔️ Okudum — Tekrar Gösterme", en: "✔️ Got It — Don't Show Again" },

  // ── Ayarlar — Genişletilmiş (arama, favoriler, 2'li düzen) ──
  "settings.search": { tr: "🔍 Model veya sağlayıcı ara...", en: "🔍 Search models or providers..." },
  "settings.favorites": { tr: "⭐ Favorilerim", en: "⭐ My Favorites" },
  "settings.noResults": { tr: "🔍 Sonuç bulunamadı", en: "🔍 No results found" },
  "settings.noResultsHint": { tr: "Farklı bir kelime dene veya aramayı temizle.", en: "Try another word or clear the search." },
  "settings.models": { tr: "Modeller", en: "Models" },
  "settings.addFav": { tr: "Favorilere ekle", en: "Add to favorites" },
  "settings.removeFav": { tr: "Favorilerden çıkar", en: "Remove from favorites" },
  "settings.keyPh": { tr: "API anahtarı...", en: "API key..." },
  "settings.showKey": { tr: "Göster", en: "Show" },
  "settings.hideKey": { tr: "Gizle", en: "Hide" },
  "settings.favCount": { tr: "favori", en: "favorites" },

  // ── Yapay Zeka Seçim Ekranı (mod seçiminden sonra) ──
  "select.title": { tr: "🤖 Yapay Zekanı Seç", en: "🤖 Choose Your AI" },
  "select.subtitle": {
    tr: "Kodlama modunu seçtin — şimdi hangi yapay zeka ile çalışacağını seç. Anahtar girmek istemezsen atlayabilirsin; daha sonra Ayarlar'dan istediğin zaman değiştirebilirsin.",
    en: "You picked a coding mode — now choose which AI to work with. You can skip the API key for now and change this anytime later in Settings.",
  },
  "select.continue": { tr: "Bu Yapay Zeka ile Başla", en: "Start With This AI" },
  "select.skip": { tr: "Şimdilik atla", en: "Skip for now" },
  "select.changeHint": {
    tr: "💡 Değişikliklerin otomatik kaydedilir — stüdyodaki ⚙️ Ayarlar'dan dönersin.",
    en: "💡 Your changes save automatically — return anytime via ⚙️ Settings in the studio.",
  },
  "select.pickModel": { tr: "Kullanacağın modeli seç:", en: "Pick the model you'll use:" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}
