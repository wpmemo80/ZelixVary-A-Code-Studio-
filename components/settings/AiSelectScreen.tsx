"use client";

import SettingsModal from "@/components/settings/SettingsModal";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import type { ApiKeys } from "@/lib/types";

/**
 * Mod seçildikten sonra (Local / Dosya) gösterilen yapay zeka seçim ekranı.
 * API ayarlar panelinin aynısıdır — "select" moduyla açılır:
 * - Arka plana / X ile kapanmaz (skip veya başlat demek gerekir)
 * - Anahtar + model seçimi aynı panelde yapılır
 * - Seçimler localStorage'a yazılır; stüdyodaki ⚙️ Ayarlar'dan
 *   istediğiniz zaman aynı panel tekrar açılır ve değiştirilebilir.
 */
export default function AiSelectScreen({ onDone }: { onDone: () => void }) {
  const [keys, setKeys] = useLocalStorageValue<ApiKeys>("zelixvary:api-keys", {});

  return (
    <SettingsModal
      variant="select"
      keys={keys}
      onSave={setKeys}
      onClose={onDone}
    />
  );
}
