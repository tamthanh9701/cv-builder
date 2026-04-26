"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { CVData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Save, Eye, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { id: "personal", title: "Cá nhân", icon: "👤" },
  { id: "about", title: "Giới thiệu", icon: "📝" },
  { id: "education", title: "Học vấn", icon: "🎓" },
  { id: "experience", title: "Kinh nghiệm", icon: "💼" },
  { id: "skills", title: "Kỹ năng", icon: "🛠️" },
  { id: "languages", title: "Ngôn ngữ", icon: "🌐" },
  { id: "projects", title: "Dự án", icon: "📁" },
  { id: "certificates", title: "Chứng chỉ", icon: "🏆" },
];

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
  const [currentStep, setCurrentStep] = React.useState(0);
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

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  const renderStepContent = () => {
    if (!cvData) return null;
    const step = STEPS[currentStep];
    switch (step.id) {
      case "personal":
        return (
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
        );
      case "about":
        return (
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
        );
      case "education":
        return (
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
        );
      case "experience":
        return (
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
        );
      case "skills":
        return (
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
        );
      case "languages":
        return (
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
        );
      case "projects":
        return (
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
        );
      case "certificates":
        return (
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
        );
      default:
        return null;
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

      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4 gap-2">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex flex-col items-center min-w-[80px] p-2 rounded-lg transition-all ${
                currentStep === index
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <span className="text-2xl">{step.icon}</span>
              <span className="text-xs mt-1 font-medium">{step.title}</span>
              {index < currentStep && (
                <Check className="w-3 h-3 mt-1 text-green-600" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-muted-foreground">
            Bước {currentStep + 1} / {STEPS.length}
          </span>
          <span className="text-sm font-medium">
            {STEPS[currentStep].icon} {STEPS[currentStep].title}
          </span>
        </div>
      </div>

      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      <div className="flex justify-between items-center mt-6 pt-6 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button onClick={nextStep}>
            Tiếp theo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving}>
            <Check className="w-4 h-4 mr-2" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        )}
      </div>
    </div>
  );
}