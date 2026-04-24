"use client";

import * as React from "react";
import { ProjectEntry } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/types";

interface ProjectsFormProps {
  entries: ProjectEntry[];
  onChange: (entries: ProjectEntry[]) => void;
}

export function ProjectsForm({ entries, onChange }: ProjectsFormProps) {
  const addEntry = () => {
    const newEntry: ProjectEntry = {
      id: generateId(),
      name: "",
      description: "",
    };
    onChange([...entries, newEntry]);
  };

  const updateEntry = (id: string, field: keyof ProjectEntry, value: string) => {
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
        <Label className="text-base">Dự án nổi bật</Label>
        <Button variant="outline" size="sm" onClick={addEntry}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm dự án
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

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Tên dự án</Label>
              <Input
                value={entry.name}
                onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
                placeholder="E-commerce Platform"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={entry.description}
                onChange={(e) => updateEntry(entry.id, "description", e.target.value)}
                placeholder="- Xây dựng website thương mại điện tử&#10;- Sử dụng React + Node.js&#10;- 10,000+ người dùng"
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Link (tùy chọn)</Label>
              <Input
                value={entry.link || ""}
                onChange={(e) => updateEntry(entry.id, "link", e.target.value)}
                placeholder="https://github.com/username/project"
              />
            </div>
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có dự án nổi bật. Thêm các dự án để thể hiện kinh nghiệm thực tế.
        </p>
      )}
    </div>
  );
}