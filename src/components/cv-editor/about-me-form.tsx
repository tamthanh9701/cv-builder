"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";

const ReactQuill = dynamic(
  () => import("react-quill").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-40 border rounded-md animate-pulse bg-muted" /> }
);

interface AboutMeFormProps {
  value: string;
  onChange: (value: string) => void;
}

export function AboutMeForm({ value, onChange }: AboutMeFormProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="about">Về tôi</Label>
      <ReactQuill
        value={value}
        onChange={onChange}
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
      <p className="text-xs text-muted-foreground">
        Giới hạn 200-300 từ để CV hiệu quả và dễ đọc
      </p>
    </div>
  );
}
