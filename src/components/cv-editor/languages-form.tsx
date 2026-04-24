"use client";

import * as React from "react";
import { LanguageEntry } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/types";

interface LanguagesFormProps {
  entries: LanguageEntry[];
  onChange: (entries: LanguageEntry[]) => void;
}

const PROFICIENCY_LEVELS = [
  "Native",
  "Fluent",
  "Advanced",
  "Upper-Intermediate",
  "Intermediate",
  "Elementary",
  "Beginner",
];

export function LanguagesForm({ entries, onChange }: LanguagesFormProps) {
  const addEntry = () => {
    const newEntry: LanguageEntry = {
      id: generateId(),
      name: "",
      proficiency: "",
    };
    onChange([...entries, newEntry]);
  };

  const updateEntry = (id: string, field: keyof LanguageEntry, value: string) => {
    onChange(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base">Ngôn ngữ</Label>
        <Button variant="outline" size="sm" onClick={addEntry}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm ngôn ngữ
        </Button>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.id} className="flex gap-3 items-center p-3 border rounded-lg bg-gray-50">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Ngôn ngữ</Label>
              <Input
                value={entry.name}
                onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
                placeholder="English, Japanese,..."
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Trình độ</Label>
              <select
                value={entry.proficiency}
                onChange={(e) => updateEntry(entry.id, "proficiency", e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="">Chọn trình độ</option>
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeEntry(entry.id)}
              className="text-destructive hover:text-destructive mt-6"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có thông tin ngôn ngữ. Nhấn &quot;Thêm ngôn ngữ&quot; để bắt đầu.
        </p>
      )}
    </div>
  );
}