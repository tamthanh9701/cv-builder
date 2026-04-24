"use client";

import * as React from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Sparkles, Loader2, CheckCircle, AlertCircle, ArrowRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CVFile {
  type: string;
  name: string;
  content?: string;
}

interface AnalysisResult {
  suggestions: string;
  improvedCV: any;
}

export default function AIAnalyzePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [step, setStep] = React.useState<'upload' | 'analyze' | 'result'>('upload');
  const [loading, setLoading] = React.useState(false);
  const [jobUrl, setJobUrl] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [cvFiles, setCvFiles] = React.useState<CVFile[]>([]);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      type: file.name,
      name: file.name,
    }));
    setCvFiles([...cvFiles, ...newFiles]);

    acceptedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCvFiles(prev => prev.map((f, i) => 
          i === prev.length + index ? { ...f, content: e.target?.result as string } : f
        ));
      };
      reader.readAsText(file);
    });
  }, [cvFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 2,
  });

  const removeFile = (index: number) => {
    setCvFiles(cvFiles.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!jobDescription || cvFiles.length === 0) {
      alert('Vui lòng upload CV và nhập mô tả công việc');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('analyze');

    try {
      const cvContent = cvFiles.map(f => f.content || f.name).join('\n\n');

      const response = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvContent,
          jobDescription,
          targetJobUrl: jobUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!user || !result) return;

    try {
      const { error } = await supabase.from('cvs').insert({
        user_id: user.id,
        name: `CV phân tích - ${new Date().toLocaleDateString('vi-VN')}`,
        data: result.improvedCV,
      });

      if (error) throw error;
      alert('Đã tạo CV mới từ kết quả phân tích!');
      window.location.href = '/cv';
    } catch (err) {
      alert('Có lỗi khi tạo CV');
    }
  };

  const copySuggestions = () => {
    if (result?.suggestions) {
      navigator.clipboard.writeText(result.suggestions);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Phân tích CV với AI
        </h1>
        <p className="text-muted-foreground mt-2">
          Tải lên CV và cung cấp thông tin công việc để AI phân tích và đề xuất cải thiện
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
          <TabsTrigger value="result" disabled>
            <CheckCircle className="w-4 h-4 mr-2" />
            3. Kết quả
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Tải lên CV của bạn</CardTitle>
              <CardDescription>
                Hỗ trợ PDF, DOCX, hoặc TXT
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
                  Hỗ trợ: PDF, DOCX, TXT (tối đa 2 files)
                </p>
              </div>

              {cvFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Files đã chọn:</Label>
                  {cvFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Link công việc (tùy chọn)</Label>
                  <Input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://itviec.com/jobs/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mô tả công việc <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Dán mô tả công việc hoặc yêu cầu tuyển dụng vào đây..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!jobDescription || cvFiles.length === 0}
                className="w-full"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Bắt đầu phân tích
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze">
          <Card className="py-12">
            <CardContent className="text-center">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">Đang phân tích CV...</h2>
              <p className="text-muted-foreground">
                AI đang so sánh CV của bạn với yêu cầu công việc. Vui lòng đợi trong giây lát.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="result">
          {error ? (
            <Card className="border-destructive">
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-destructive">Có lỗi xảy ra</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => setStep('upload')}>Thử lại</Button>
              </CardContent>
            </Card>
          ) : result ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Đề xuất cải thiện</CardTitle>
                    <CardDescription>Các điểm cần chỉnh sửa trong CV để phù hợp hơn với công việc</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={copySuggestions}>
                    <Copy className="w-4 h-4 mr-2" />
                    Sao chép
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {result.suggestions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Xem trước CV đã cải thiện</CardTitle>
                  <CardDescription>
                    CV bên dưới là phiên bản được AI gợi ý cải thiện
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <h3 className="text-xl font-bold mb-4">
                      {result.improvedCV?.personal?.fullName || 'Tên ứng viên'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {result.improvedCV?.personal?.title || 'Vị trí ứng tuyển'}
                    </p>
                    {result.improvedCV?.about && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-primary mb-1">Về tôi</h4>
                        <p className="text-sm">{result.improvedCV.about}</p>
                      </div>
                    )}
                    {result.improvedCV?.experience?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-primary mb-1">Kinh nghiệm</h4>
                        {result.improvedCV.experience.map((exp: any, i: number) => (
                          <div key={i} className="text-sm mb-2">
                            <strong>{exp.position}</strong> - {exp.company}
                            <br />
                            <span className="text-muted-foreground">{exp.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={handleApplyChanges} className="flex-1" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tạo CV từ kết quả này
                </Button>
                <Button variant="outline" onClick={() => setStep('upload')} size="lg">
                  Phân tích lại
                </Button>
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}