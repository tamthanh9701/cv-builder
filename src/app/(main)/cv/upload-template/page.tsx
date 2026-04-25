"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Sparkles, Loader2, CheckCircle, AlertCircle, ArrowRight, Trash2, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CVFile {
  type: string;
  name: string;
  content?: ArrayBuffer | string;
}

export default function UploadTemplatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = React.useState<'upload' | 'analyze' | 'save'>('upload');
  const [loading, setLoading] = React.useState(false);
  const [cvFiles, setCvFiles] = React.useState<CVFile[]>([]);
  const [templateName, setTemplateName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [templates, setTemplates] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('cv_templates')
      .select('*')
      .eq('is_active', true);
    if (data) {
      setTemplates(data);
    }
  };

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      type: file.type,
      name: file.name,
      content: undefined as ArrayBuffer | undefined,
    }));
    setCvFiles(prev => [...prev, ...newFiles]);

    acceptedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          setCvFiles(prev => prev.map((f, i) =>
            i === prev.length - acceptedFiles.length + index ? { ...f, content: result as string | ArrayBuffer } : f
          ));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  });

  const removeFile = (index: number) => {
    setCvFiles(cvFiles.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (cvFiles.length === 0) {
      alert('Vui lòng upload CV mẫu');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('analyze');

    try {
      let cvContent = '';
      const file = cvFiles[0];

      if (file.content) {
        if (file.type === 'text/plain') {
          cvContent = new TextDecoder().decode(file.content as ArrayBuffer);
        } else if (file.name.endsWith('.docx')) {
          cvContent = 'DOCX file content - AI will analyze structure';
        } else if (file.name.endsWith('.pdf')) {
          cvContent = 'PDF file content - AI will analyze structure';
        } else if (file.type.startsWith('image/')) {
          cvContent = 'Image file - AI will analyze visual layout';
        }
      }

      const response = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvContent,
          isTemplateAnalysis: true,
          fileType: file.type,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setStep('save');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user || !templateName) {
      alert('Vui lòng nhập tên mẫu CV');
      return;
    }

    setLoading(true);

    try {
      const file = cvFiles[0];
      let htmlTemplate = '';

      const response = await fetch('/api/ai/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        htmlTemplate = data.htmlTemplate || '';
      }

      const { error } = await supabase.from('cv_templates').insert({
        name: templateName,
        description: `Mẫu CV được phân tích từ file ${file.name}`,
        html_template: htmlTemplate,
        is_active: true,
        created_by: user.id,
      });

      if (error) throw error;

      alert('Đã lưu mẫu CV thành công!');
      router.push('/cv');
    } catch (err) {
      alert('Có lỗi khi lưu mẫu CV');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mẫu CV này?')) return;

    await supabase.from('cv_templates').delete().eq('id', id);
    fetchTemplates();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/cv" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Quay lại
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Upload className="w-8 h-8 text-primary" />
          Tải lên mẫu CV
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload CV mẫu có sẵn, AI sẽ phân tích và lưu lại để bạn có thể sử dụng
        </p>
      </div>

      <Tabs value={step} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" disabled>
            <Upload className="w-4 h-4 mr-2" />
            1. Tải lên
          </TabsTrigger>
          <TabsTrigger value="analyze" disabled>
            <Sparkles className="w-4 h-4 mr-2" />
            2. Phân tích
          </TabsTrigger>
          <TabsTrigger value="save" disabled>
            <CheckCircle className="w-4 h-4 mr-2" />
            3. Lưu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Tải lên CV mẫu</CardTitle>
              <CardDescription>
                Hỗ trợ PDF, DOCX, hoặc hình ảnh (PNG, JPG)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {isDragActive ? 'Thả file vào đây' : 'Kéo thả CV vào đây hoặc click để chọn'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Hỗ trợ: PDF, DOCX, PNG, JPG (tối đa 1 file)
                </p>
              </div>

              {cvFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>File đã chọn:</Label>
                  {cvFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-sm text-muted-foreground">({file.type})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={cvFiles.length === 0}
                className="w-full"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Phân tích với AI
              </Button>
            </CardContent>
          </Card>

          {templates.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Mẫu CV hiện có</CardTitle>
                <CardDescription>
                  Các mẫu CV đã được lưu trước đó
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/preview/template/${template.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analyze">
          <Card className="py-12">
            <CardContent className="text-center">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">Đang phân tích CV...</h2>
              <p className="text-muted-foreground">
                AI đang phân tích cấu trúc và nội dung CV mẫu. Vui lòng đợi trong giây lát.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="save">
          <Card>
            <CardHeader>
              <CardTitle>Lưu mẫu CV</CardTitle>
              <CardDescription>
                AI đã phân tích xong. Nhập tên để lưu mẫu CV này.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tên mẫu CV <span className="text-destructive">*</span></Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="VD: Mẫu CV IT Junior"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-medium mb-2">Thông tin file:</h4>
                <p className="text-sm">Tên: {cvFiles[0]?.name}</p>
                <p className="text-sm">Loại: {cvFiles[0]?.type}</p>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!templateName || loading}
                  className="flex-1"
                  size="lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {loading ? 'Đang lưu...' : 'Lưu mẫu CV'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('upload');
                    setCvFiles([]);
                  }}
                  size="lg"
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
