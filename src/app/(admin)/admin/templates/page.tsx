"use client";

import * as React from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Trash2, Eye, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description?: string;
  pdf_url?: string;
  html_template?: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminTemplatesPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', description: '' });
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('cv_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTemplates(data);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUpload = async () => {
    if (!user || !selectedFile || !formData.name) return;
    setUploading(true);

    try {
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cv-templates')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cv-templates')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('cv_templates')
        .insert({
          name: formData.name,
          description: formData.description,
          pdf_url: urlData.publicUrl,
          created_by: user.id,
          is_active: false,
        });

      if (insertError) throw insertError;

      setFormData({ name: '', description: '' });
      setSelectedFile(null);
      fetchTemplates();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Có lỗi khi tải lên mẫu CV');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    await supabase
      .from('cv_templates')
      .update({ is_active: !currentState })
      .eq('id', id);
    fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mẫu CV này?')) return;
    await supabase.from('cv_templates').delete().eq('id', id);
    fetchTemplates();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Quản lý mẫu CV</h1>
        <p className="text-muted-foreground mt-1">
          Tải lên và quản lý các mẫu CV cho người dùng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tải lên mẫu mới</CardTitle>
            <CardDescription>
              Tải lên file PDF để tạo mẫu CV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tên mẫu</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mẫu CV chuyên nghiệp"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả (tùy chọn)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về mẫu CV"
              />
            </div>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
              )}
            >
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p>Kéo thả file PDF vào đây hoặc click để chọn</p>
                </div>
              )}
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !formData.name || uploading}
              className="w-full"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Tải lên
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Danh sách mẫu ({templates.length})</h2>
          {templates.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Chưa có mẫu CV nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id} className={template.is_active ? 'border-primary' : ''}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.description || 'Không có mô tả'}
                        </div>
                        {template.pdf_url && (
                          <a
                            href={template.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Xem PDF
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.is_active ? (
                        <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Đang sử dụng
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(template.id, template.is_active)}
                        >
                          Kích hoạt
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}