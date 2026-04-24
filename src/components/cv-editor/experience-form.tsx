"use client";

import * as React from "react";
import { ExperienceEntry } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/types";

interface ExperienceFormProps {
  entries: ExperienceEntry[];
  onChange: (entries: ExperienceEntry[]) => void;
}

export function ExperienceForm({ entries, onChange }: ExperienceFormProps) {
  const addEntry = () => {
    const newEntry: ExperienceEntry = {
      id: generateId(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    onChange([...entries, newEntry]);
  };

  const updateEntry = (id: string, field: keyof ExperienceEntry, value: string) => {
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
        <Label className="text-base">Kinh nghiệm làm việc</Label>
        <Button variant="outline" size="sm" onClick={addEntry}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm công ty
        </Button>
      </div>

      {entries.map((entry, index) => (
        <div key={entry.id} className="p-4 border rounded-lg space-y-4 bg-gray-50">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeEntry(entry.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Công ty</Label>
              <Input
                value={entry.company}
                onChange={(e) => updateEntry(entry.id, "company", e.target.value)}
                placeholder="Công ty ABC"
              />
            </div>
            <div className="space-y-2">
              <Label>Vị trí</Label>
              <Input
                value={entry.position}
                onChange={(e) => updateEntry(entry.id, "position", e.target.value)}
                placeholder="Senior Developer"
              />
            </div>
            <div className="space-y-2">
              <Label>Ngày bắt đầu</Label>
              <Input
                type="month"
                value={entry.startDate}
                onChange={(e) => updateEntry(entry.id, "startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ngày kết thúc</Label>
              <Input
                type="month"
                value={entry.endDate}
                onChange={(e) => updateEntry(entry.id, "endDate", e.target.value)}
                placeholder="Đang làm nếu chưa kết thúc"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mô tả công việc</Label>
            <Textarea
              value={entry.description}
              onChange={(e) => updateEntry(entry.id, "description", e.target.value)}
              placeholder="- Phát triển tính năng mới&#10;- Tham gia code review&#10;- Làm việc với team 5 người"
              className="min-h-[120px]"
            />
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có kinh nghiệm làm việc. Nhấn &quot;Thêm công ty&quot; để bắt đầu.
        </p>
      )}
    </div>
  );
}