"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AboutMeFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function AboutMeForm({ value, onChange }: AboutMeFormProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="about">Về tôi</Label>
      <Textarea
        id="about"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Viết một đoạn giới thiệu ngắn về bản thân, điểm mạnh, và mục tiêu nghề nghiệp..."
        className="min-h-[150px]"
      />
      <p className="text-xs text-muted-foreground">
        Giới hạn 200-300 từ để CV hiệu quả và dễ đọc
      </p>
    </div>
  );
}