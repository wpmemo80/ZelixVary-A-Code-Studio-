export const SYSTEM_PROMPT = `Sen ZelixVary AI Kod Asistanısın. Kod yazma, analiz etme, hata ayıklama ve UI tasarımı konularında uzmanlaşmış bir kıdemli Full-Stack geliştiricisin.

Kurallar:
1. Her zaman Türkçe yanıt ver.
2. Kod yanıtlarında kullanıcıya vereceğin kod, tek bir \`\`\`html / \`\`\`css / \`\`\`js / \`\`\`javascript kod bloğu içinde eksiksiz olsun.
3. Kod bloğunu açıklama yapmadan önce kısa bir özet ver.
4. Kullanıcı "tam sayfa" istemediği sürece HTML kodu üretirken tam <!DOCTYPE> dokümanı değil, içerik + <style> + <script> parçaları halinde üret.
5. Yalnızca kod istendiğinde ekstra seçenekler sunma, direkt çalışan kod ver.
6. Kod analizi yaparken önce hatayı net olarak açıkla, sonra düzeltilmiş kodu ver.
7. Güvenlik: console.log dışında zararlı sayılabilecek kod üretme.`;

export function buildDebugPrompt(code: string): string {
  return `Aşağıdaki kod parçasını dikkatle analiz et. Görevlerin:
1) Varsa hataları / bug'ları tek tek bul ve nedenini açıkla.
2) Performans, okunabilirlik ve güvenlik açısından iyileştirme önerileri sun.
3) Son olarak DÜZELTİLMİŞ tam kodu tek bir kod bloğu içinde ver (block kullan).

Analiz edilecek kod:
\`\`\`
${code}
\`\`\``;
}

export function buildRefactorPrompt(code: string): string {
  return `Aşağıdaki kodu yeniden yaz (refactor). Kurallar:
1) Kod davranışını (çıktısını) birebir koru.
2) Daha temiz, daha okunaklı ve performanslı olacak şekilde yeniden yaz.
3) Açıklayıcı fonksiyon/değişken isimleri kullan, tekrar eden kodları fonksiyonlara al.
4) Gereksiz yorum yazma; ancak karmaşık mantık varsa 1 satır Türkçe yorum ekle.
5) Refactor edilmiş tam kodu tek bir kod bloğu içinde ver.

Refactor edilecek kod:
\`\`\`
${code}
\`\`\``;
}

export function buildUiPrompt(description: string): string {
  return `Aşağıdaki isteğe göre modern, şık ve responsive bir web arayüzü tasarla:
"${description}"

Kurallar:
1) Tam bir HTML dokümanı oluştur: <!DOCTYPE html> ile başlasın, <style> ve <script> blokları içinde olsun.
2) Modern tasarım: gradient arka planlar, gölgeler, hover animasyonları, smooth geçişler.
3) İçerik Türkçe olsun.
4) Tek bir kod bloğu içinde eksiksiz HTML ver.
5) Kısaca tasarım kararlarını açıkla.`;
}
