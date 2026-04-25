"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { EducationEntry } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { generateId } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

const ReactQuill = dynamic(
  () => import("react-quill").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-40 border rounded-md animate-pulse bg-muted" /> }
);

interface EducationFormProps {
  entries: EducationEntry[];
  onChange: (entries: EducationEntry[]) => void;
}

export function EducationForm({ entries, onChange }: EducationFormProps) {
  const addEntry = () => {
    const newEntry: EducationEntry = {
      id: generateId(),
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
    };
    onChange([...entries, newEntry]);
  };

  const updateEntry = (id: string, field: keyof EducationEntry, value: string) => {
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
        <Label className="text-base">Học vấn</Label>
        <Button variant="outline" size="sm" onClick={addEntry}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm trường
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
              <Label>Trường</Label>
              <Input
                value={entry.school}
                onChange={(e) => updateEntry(entry.id, "school", e.target.value)}
                placeholder="Đại học Bách Khoa TP.HCM"
              />
            </div>
            <div className="space-y-2">
              <Label>Bằng cấp</Label>
              <Input
                value={entry.degree}
                onChange={(e) => updateEntry(entry.id, "degree", e.target.value)}
                placeholder="Cử nhân / Kỹ sư / Thạc sĩ"
              />
            </div>
            <div className="space-y-2">
              <Label>Chuyên ngành</Label>
              <Input
                value={entry.field}
                onChange={(e) => updateEntry(entry.id, "field", e.target.value)}
                placeholder="Công nghệ thông tin"
              />
            </div>
            <div className="space-y-2">
              <Label>GPA</Label>
              <Input
                value={entry.gpa || ""}
                onChange={(e) => updateEntry(entry.id, "gpa", e.target.value)}
                placeholder="3.8 / 4.0"
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
              <div className="flex items-center gap-2">
                <Input
                  type="month"
                  value={entry.endDate}
                  onChange={(e) => updateEntry(entry.id, "endDate", e.target.value)}
                  disabled={entry.endDate === "present"}
                  className={entry.endDate === "present" ? "opacity-50" : ""}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`present-${entry.id}`}
                  checked={entry.endDate === "present"}
                  onCheckedChange={(checked) => {
                    updateEntry(entry.id, "endDate", checked ? "present" : "");
                  }}
                />
                <Label htmlFor={`present-${entry.id}`} className="text-sm font-normal cursor-pointer">
                  Đang học hiện tại
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mô tả (tùy chọn)</Label>
            <ReactQuill
              value={entry.description || ""}
              onChange={(content) => updateEntry(entry.id, "description", content)}
              theme="snow"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
              className="bg-white"
            />
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có thông tin học vấn. Nhấn &quot;Thêm trường&quot; để bắt đầu.
        </p>
      )}
    </div>
  );
}
