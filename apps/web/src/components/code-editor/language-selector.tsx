"use client";

const LANGUAGES = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "sql", label: "SQL" },
  { id: "markdown", label: "Markdown" },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-blue-500 cursor-pointer"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.id} value={lang.id} className="bg-[#1a1a1d]">
          {lang.label}
        </option>
      ))}
    </select>
  );
}
