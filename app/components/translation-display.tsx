import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface Translation {
  languageCode: string;
  name: string;
  description?: string | null;
}

interface TranslationDisplayProps {
  translations?: Translation[];
  field?: "name" | "description";
  fallback?: string;
  className?: string;
  showLanguageSelector?: boolean;
  defaultLanguage?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  vi: "🇻🇳 Tiếng Việt",
  en: "🇬🇧 English",
  ko: "🇰🇷 한국어",
  zh: "🇨🇳 中文",
  ja: "🇯🇵 日本語",
  fr: "🇫🇷 Français",
  de: "🇩🇪 Deutsch",
  es: "🇪🇸 Español",
};

/**
 * Component hiển thị translations với khả năng chọn ngôn ngữ
 * Sử dụng trong các bảng list để hiển thị name/description đa ngôn ngữ
 *
 * @example
 * // Trong columns.tsx
 * <TranslationDisplay
 *   translations={row.original.translations}
 *   field="name"
 *   showLanguageSelector
 * />
 */
export function TranslationDisplay({
  translations,
  field = "name",
  fallback = "—",
  className = "",
  showLanguageSelector = true,
  defaultLanguage = "vi",
}: TranslationDisplayProps) {
  const [selectedLang, setSelectedLang] = useState(defaultLanguage);

  if (!translations || translations.length === 0) {
    return <span className={className}>{fallback}</span>;
  }

  // Tìm translation theo language đã chọn
  const currentTranslation =
    translations.find((t) => t.languageCode === selectedLang) ||
    translations.find((t) => t.languageCode === "vi") ||
    translations[0];

  const displayValue = currentTranslation?.[field] || fallback;

  // Chỉ hiển thị text nếu không có language selector
  if (!showLanguageSelector) {
    return <span className={className}>{displayValue}</span>;
  }

  // Hiển thị với language selector
  return (
    <div className="flex flex-col items-start gap-2">
      <span className={className}>{displayValue}</span>
      {translations.length > 1 && (
        <Select value={selectedLang} onValueChange={setSelectedLang}>
          <SelectTrigger className="h-7 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {translations.map((t) => (
              <SelectItem key={t.languageCode} value={t.languageCode}>
                {LANGUAGE_NAMES[t.languageCode] || t.languageCode.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
