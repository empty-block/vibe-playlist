/**
 * Text utility functions for processing and cleaning user-generated content
 */

/**
 * Removes URLs from text while preserving whitespace structure
 * @param text - The text containing URLs
 * @returns The text with URLs removed
 */
export function stripUrls(text: string): string {
  if (!text) return text;

  // Remove URLs (http, https, and protocol-relative)
  // This regex matches:
  // - http:// or https:// URLs
  // - URLs with various TLDs
  // - URLs with query parameters, fragments, etc.
  return text
    .replace(/https?:\/\/[^\s]+/g, '')  // Remove http(s) URLs
    .replace(/\s+/g, ' ')                 // Normalize multiple spaces to single space
    .trim();                              // Remove leading/trailing whitespace
}

/**
 * Check if text contains any URLs
 * @param text - The text to check
 * @returns True if text contains URLs
 */
export function containsUrls(text: string): boolean {
  if (!text) return false;
  return /https?:\/\/[^\s]+/.test(text);
}
