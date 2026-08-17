export interface ExtractedCode {
  language: string;
  code: string;
}

const FENCE_RE = /```([\w+-]*)\s*\n([\s\S]*?)```/g;

/**
 * AI yanıtından tüm kod bloklarını çıkarır.
 */
export function extractCodeBlocks(text: string): ExtractedCode[] {
  const blocks: ExtractedCode[] = [];
  let match: RegExpExecArray | null;
  while ((match = FENCE_RE.exec(text)) !== null) {
    blocks.push({
      language: match[1]?.trim() || "html",
      code: match[2].trim(),
    });
  }
  return blocks;
}

export function extractFirstCode(text: string): ExtractedCode | null {
  const blocks = extractCodeBlocks(text);
  return blocks.length > 0 ? blocks[0] : null;
}
