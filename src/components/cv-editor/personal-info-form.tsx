"use client";

import * as React from "react";
import { PersonalInfo, PersonalLink } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    const newLinks = [...data.personalLinks, { label: "", url: "" }];
    onChange({ ...data, personalLinks: newLinks });
  };

  const updateLink = (index: number, field: keyof PersonalLink, value: string) => {
    const newLinks = data.personalLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    onChange({ ...data, personalLinks: newLinks });
  };

  const removeLink = (index: number) => {
    const newLinks = data.personalLinks.filter((_, i) => i !== index);
    onChange({ ...data, personalLinks: newLinks });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-dashed">
            {data.avatar ? (
              <img src={data.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-2xl">{data.fullName?.[0] || "?"}</span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
            <Upload className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Chức vụ / Vị trí mong muốn</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Senior Frontend Developer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="0912 345 678"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Địa chỉ</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Liên kết cá nhân</Label>
        {data.personalLinks.map((link, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="Nhãn (LinkedIn, GitHub, ...)"
              value={link.label}
              onChange={(e) => updateLink(index, "label", e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="URL"
              value={link.url}
              onChange={(e) => updateLink(index, "url", e.target.value)}
              className="flex-[2]"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeLink(index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addLink}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm liên kết
        </Button>
      </div>
    </div>
  );
}