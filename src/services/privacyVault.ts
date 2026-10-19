/**
 * Jenus Yerel Gizlilik Kasası ve PII (Kişisel Veri) Temizleme Motoru
 * Cihaz içi veri sanitizasyonu ve yerel şifreleme simülasyonu.
 */

export interface PiiScrubResult {
  scrubbedText: string;
  hasPii: boolean;
  scrubbedItems: Array<{ type: string; originalPlaceholder: string }>;
}

// Regex patterns for sensitive private information
const TCKN_REGEX = /\b[1-9][0-9]{10}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
const PHONE_REGEX = /(\+?90\s?)?(0?5\d{2})[\s.-]?(\d{3})[\s.-]?(\d{2})[\s.-]?(\d{2})/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

/**
 * Scrubs private identifiable data locally on device before sending to cloud
 */
export function scrubPII(text: string): PiiScrubResult {
  let scrubbedText = text;
  const scrubbedItems: Array<{ type: string; originalPlaceholder: string }> = [];

  // TCKN Scrubbing
  if (TCKN_REGEX.test(scrubbedText)) {
    scrubbedText = scrubbedText.replace(TCKN_REGEX, () => {
      const ph = '[GİZLENDİ: TCKN]';
      scrubbedItems.push({ type: 'TC Kimlik Numarası', originalPlaceholder: ph });
      return ph;
    });
  }

  // Credit Card Scrubbing
  if (CREDIT_CARD_REGEX.test(scrubbedText)) {
    scrubbedText = scrubbedText.replace(CREDIT_CARD_REGEX, () => {
      const ph = '[GİZLENDİ: Kredi Kartı]';
      scrubbedItems.push({ type: 'Kredi Kartı', originalPlaceholder: ph });
      return ph;
    });
  }

  // Email Scrubbing
  if (EMAIL_REGEX.test(scrubbedText)) {
    scrubbedText = scrubbedText.replace(EMAIL_REGEX, () => {
      const ph = '[GİZLENDİ: E-Posta]';
      scrubbedItems.push({ type: 'E-Posta Adresi', originalPlaceholder: ph });
      return ph;
    });
  }

  // Phone Number Scrubbing
  if (PHONE_REGEX.test(scrubbedText)) {
    scrubbedText = scrubbedText.replace(PHONE_REGEX, () => {
      const ph = '[GİZLENDİ: Telefon]';
      scrubbedItems.push({ type: 'Telefon Numarası', originalPlaceholder: ph });
      return ph;
    });
  }

  // IP Address Scrubbing
  if (IP_REGEX.test(scrubbedText)) {
    scrubbedText = scrubbedText.replace(IP_REGEX, () => {
      const ph = '[GİZLENDİ: IP Adresi]';
      scrubbedItems.push({ type: 'IP Adresi', originalPlaceholder: ph });
      return ph;
    });
  }

  return {
    scrubbedText,
    hasPii: scrubbedItems.length > 0,
    scrubbedItems,
  };
}

/**
 * Calculates current local storage usage in Kilobytes
 */
export function getLocalStorageSizeKb(): number {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 0;
  }
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      totalBytes += (key.length + value.length) * 2; // UTF-16 characters
    }
  }
  return Number((totalBytes / 1024).toFixed(2));
}

/**
 * Completely wipes all Jenus local database and storage
 */
export function wipeAllLocalData(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('jenus_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}

/**
 * Exports all Jenus local data as a JSON file
 */
export function exportLocalDataJson(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return '{}';
  }
  const exportData: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('jenus_')) {
      try {
        exportData[key] = JSON.parse(localStorage.getItem(key) || 'null');
      } catch {
        exportData[key] = localStorage.getItem(key);
      }
    }
  }
  return JSON.stringify(exportData, null, 2);
}
