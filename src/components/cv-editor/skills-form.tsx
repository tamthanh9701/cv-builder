"use client";

import * as React from "react";
import { SkillEntry } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { generateId } from "@/types";
import { cn } from "@/lib/utils";

interface SkillsFormProps {
  entries: SkillEntry[];
  onChange: (entries: SkillEntry[]) => void;
}

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export function SkillsForm({ entries, onChange }: SkillsFormProps) {
  const [newSkill, setNewSkill] = React.useState("");

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const newEntry: SkillEntry = {
      id: generateId(),
      name: newSkill.trim(),
    };
    onChange([...entries, newEntry]);
    setNewSkill("");
  };

  const updateSkill = (id: string, name: string) => {
    onChange(entries.map((entry) => (entry.id === id ? { ...entry, name } : entry)));
  };

  const updateLevel = (id: string, level: string | undefined) => {
    onChange(
      entries.map((entry) => (entry.id === id ? { ...entry, level } : entry))
    );
  };

  const removeSkill = (id: string) => {
    onChange(entries.filter((entry) => entry.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base">Kỹ năng</Label>

      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập kỹ năng và nhấn Enter (VD: React, TypeScript, Node.js)"
          className="flex-1"
        />
        <Button onClick={addSkill} disabled={!newSkill.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20"
          >
            <span className="text-sm font-medium">{entry.name}</span>
            <select
              value={entry.level || ""}
              onChange={(e) => updateLevel(entry.id, e.target.value || undefined)}
              className="bg-transparent text-xs border-none focus:outline-none cursor-pointer"
            >
              <option value="">Cấp độ</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <button
              onClick={() => removeSkill(entry.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Thêm kỹ năng để CV của bạn nổi bật hơn
        </p>
      )}
    </div>
  );
}