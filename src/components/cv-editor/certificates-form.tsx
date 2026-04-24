"use client";

import * as React from "react";
import { CertificateEntry } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/types";

interface CertificatesFormProps {
  entries: CertificateEntry[];
  onChange: (entries: CertificateEntry[]) => void;
}

export function CertificatesForm({ entries, onChange }: CertificatesFormProps) {
  const addEntry = () => {
    const newEntry: CertificateEntry = {
      id: generateId(),
      name: "",
      issuer: "",
      year: "",
    };
    onChange([...entries, newEntry]);
  };

  const updateEntry = (id: string, field: keyof CertificateEntry, value: string) => {
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
        <Label className="text-base">Chứng chỉ</Label>
        <Button variant="outline" size="sm" onClick={addEntry}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm chứng chỉ
        </Button>
      </div>

      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-3 items-center p-3 border rounded-lg bg-gray-50">
          <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Tên chứng chỉ</Label>
            <Input
              value={entry.name}
              onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
              placeholder="AWS Solutions Architect"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Tổ chức cấp</Label>
            <Input
              value={entry.issuer}
              onChange={(e) => updateEntry(entry.id, "issuer", e.target.value)}
              placeholder="Amazon Web Services"
            />
          </div>
          <div className="w-24 space-y-1">
            <Label className="text-xs">Năm</Label>
            <Input
              value={entry.year}
              onChange={(e) => updateEntry(entry.id, "year", e.target.value)}
              placeholder="2024"
            />
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

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có chứng chỉ. Thêm các chứng chỉ chuyên môn để tăng uy tín.
        </p>
      )}
    </div>
  );
}