"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { CVData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PersonalInfoForm,
  AboutMeForm,
  EducationForm,
  ExperienceForm,
  SkillsForm,
  LanguagesForm,
  ProjectsForm,
  CertificatesForm,
} from "@/components/cv-editor";
import { Save, Eye, ArrowLeft, FileText, User, GraduationCap, Briefcase, Lightbulb, Globe, FolderGit2, Award, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditCVPage() {
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const cvId = params.id as string;

  const [cvData, setCVData] = React.useState<CVData | null>(null);
  const [cvName, setCVName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const fetchCV = async () => {
      if (!user || !cvId) return;

      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('id', cvId)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setCVData(data.data);
        setCVName(data.name);
      }
      setLoading(false);
    };

    fetchCV();
  }, [user, cvId]);

  const handleSave = async () => {
    if (!user || !cvData) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('cvs')
        .update({ name: cvName, data: cvData })
        .eq('id', cvId);

      if (error) throw error;
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving CV:', error);
      alert('Có lỗi khi lưu CV');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">CV không tìm thấy hoặc bạn không có quyền truy cập</p>
            <Link href="/cv">
              <Button variant="outline">Quay lại danh sách CV</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/cv" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa CV</h1>
            <Input
              value={cvName}
              onChange={(e) => setCVName(e.target.value)}
              className="font-medium text-lg border-none bg-transparent px-0 h-auto py-1 focus:ring-0 mt-2"
              placeholder="Tên CV..."
            />
          </div>
          <div className="flex gap-2">
            <Link href={`/preview/${cvId}`}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Xem trước
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
        {lastSaved && (
          <p className="text-sm text-muted-foreground mt-2">
            Đã lưu: {lastSaved.toLocaleTimeString('vi-VN')}
          </p>
        )}
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full overflow-auto">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Cá nhân</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Giới thiệu</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Học vấn</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Kinh nghiệm</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Kỹ năng</span>
          </TabsTrigger>
          <TabsTrigger value="languages" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Ngôn ngữ</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Dự án</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Chứng chỉ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm
                data={cvData.personal}
                onChange={(personal) => setCVData({ ...cvData, personal })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>Giới thiệu bản thân</CardTitle>
            </CardHeader>
            <CardContent>
              <AboutMeForm
                value={cvData.about}
                onChange={(about) => setCVData({ ...cvData, about })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Học vấn</CardTitle>
            </CardHeader>
            <CardContent>
              <EducationForm
                entries={cvData.education}
                onChange={(education) => setCVData({ ...cvData, education })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Kinh nghiệm làm việc</CardTitle>
            </CardHeader>
            <CardContent>
              <ExperienceForm
                entries={cvData.experience}
                onChange={(experience) => setCVData({ ...cvData, experience })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Kỹ năng</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillsForm
                entries={cvData.skills}
                onChange={(skills) => setCVData({ ...cvData, skills })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle>Ngôn ngữ</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguagesForm
                entries={cvData.languages}
                onChange={(languages) => setCVData({ ...cvData, languages })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Dự án nổi bật</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectsForm
                entries={cvData.projects}
                onChange={(projects) => setCVData({ ...cvData, projects })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Chứng chỉ</CardTitle>
            </CardHeader>
            <CardContent>
              <CertificatesForm
                entries={cvData.certificates}
                onChange={(certificates) => setCVData({ ...cvData, certificates })}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}