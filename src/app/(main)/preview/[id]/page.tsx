"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { CVData } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Loader2, Palette } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CVTemplate {
  id: string;
  name: string;
  html_template?: string;
}

export default function PreviewPage() {
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const cvId = params.id as string;

  const [cvData, setCVData] = React.useState<CVData | null>(null);
  const [cvName, setCVName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [templates, setTemplates] = React.useState<CVTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("default");

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

    const fetchTemplates = async () => {
      const { data } = await supabase
        .from('cv_templates')
        .select('id, name, html_template')
        .eq('is_active', true);
      if (data) {
        setTemplates(data);
      }
    };

    fetchCV();
    fetchTemplates();
  }, [user, cvId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">CV không tìm thấy</p>
            <Link href="/cv">
              <Button variant="outline">Quay lại</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderCVContent = () => {
    if (selectedTemplate !== "default" && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template?.html_template) {
        return (
          <div className="p-8" dangerouslySetInnerHTML={{ __html: template.html_template }} />
        );
      }
    }
    return renderDefaultTemplate();
  };

  const renderDefaultTemplate = () => (
    <div className="cv-template">
      <style>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
        .cv-template {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }
        .cv-template .section-title {
          color: #e11d48;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e11d48;
        }
        .cv-template .personal-section {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 32px;
        }
        .cv-template .personal-section .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
        }
        .cv-template .personal-section .name {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .cv-template .personal-section .title {
          font-size: 16px;
          color: #cbd5e1;
          margin-bottom: 16px;
        }
        .cv-template .personal-section .contact-info {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: #e2e8f0;
        }
        .cv-template .personal-section .contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cv-template .personal-section .personal-links {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }
        .cv-template .personal-section .personal-links a {
          color: #60a5fa;
          text-decoration: none;
          font-size: 13px;
        }
        .cv-template .cv-body {
          padding: 32px;
        }
        .cv-template .section {
          margin-bottom: 24px;
        }
        .cv-template .about-text {
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
        }
        .cv-template .experience-item, .cv-template .education-item {
          margin-bottom: 16px;
          padding-left: 16px;
          border-left: 3px solid #e11d48;
        }
        .cv-template .exp-header, .cv-template .edu-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }
        .cv-template .exp-company, .cv-template .edu-school {
          font-weight: 600;
          color: #1e293b;
        }
        .cv-template .exp-position, .cv-template .edu-degree {
          color: #64748b;
          font-size: 14px;
        }
        .cv-template .exp-date, .cv-template .edu-date {
          font-size: 12px;
          color: #94a3b8;
        }
        .cv-template .exp-description {
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
        }
        .cv-template .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cv-template .skill-tag {
          background: #fee2e2;
          color: #be123c;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }
        .cv-template .languages-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .cv-template .language-item {
          font-size: 14px;
          color: #475569;
        }
        .cv-template .language-item span {
          font-weight: 500;
          color: #1e293b;
        }
        .cv-template .project-item, .cv-template .cert-item {
          margin-bottom: 12px;
        }
        .cv-template .project-name, .cv-template .cert-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
        }
        .cv-template .project-desc, .cv-template .cert-issuer {
          font-size: 13px;
          color: #64748b;
        }
      `}</style>

      <div className="personal-section">
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {cvData.personal.avatar && (
            <img src={cvData.personal.avatar} alt="Avatar" className="avatar" />
          )}
          <div style={{ flex: 1 }}>
            <div className="name">{cvData.personal.fullName || 'Họ và tên'}</div>
            <div className="title">{cvData.personal.title || 'Vị trí mong muốn'}</div>
            <div className="contact-info">
              {cvData.personal.email && (
                <span className="contact-item">
                  <span>📧</span> {cvData.personal.email}
                </span>
              )}
              {cvData.personal.phone && (
                <span className="contact-item">
                  <span>📱</span> {cvData.personal.phone}
                </span>
              )}
              {cvData.personal.address && (
                <span className="contact-item">
                  <span>📍</span> {cvData.personal.address}
                </span>
              )}
            </div>
            {cvData.personal.personalLinks.length > 0 && (
              <div className="personal-links">
                {cvData.personal.personalLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label || link.url}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cv-body">
        {cvData.about && (
          <div className="section">
            <div className="section-title">Về tôi</div>
            <p className="about-text" dangerouslySetInnerHTML={{ __html: cvData.about }} />
          </div>
        )}

        {cvData.experience.length > 0 && (
          <div className="section">
            <div className="section-title">Kinh nghiệm làm việc</div>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="experience-item">
                <div className="exp-header">
                  <span className="exp-company">{exp.company}</span>
                  <span className="exp-date">
                    {exp.startDate} - {exp.endDate === "present" ? "Hiện tại" : exp.endDate || "Hiện tại"}
                  </span>
                </div>
                <div className="exp-position">{exp.position}</div>
                {exp.description && (
                  <p className="exp-description" dangerouslySetInnerHTML={{ __html: exp.description }} />
                )}
              </div>
            ))}
          </div>
        )}

        {cvData.education.length > 0 && (
          <div className="section">
            <div className="section-title">Học vấn</div>
            {cvData.education.map((edu, i) => (
              <div key={i} className="education-item">
                <div className="edu-header">
                  <span className="edu-school">{edu.school}</span>
                  <span className="edu-date">
                    {edu.startDate} - {edu.endDate === "present" ? "Hiện tại" : edu.endDate || "Hiện tại"}
                  </span>
                </div>
                <div className="edu-degree">
                  {edu.degree} {edu.field && `• ${edu.field}`}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </div>
                {edu.description && (
                  <p className="exp-description" dangerouslySetInnerHTML={{ __html: edu.description }} />
                )}
              </div>
            ))}
          </div>
        )}

        {cvData.skills.length > 0 && (
          <div className="section">
            <div className="section-title">Kỹ năng</div>
            <div className="skills-grid">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="skill-tag">
                  {skill.name}
                  {skill.level && ` (${skill.level})`}
                </span>
              ))}
            </div>
          </div>
        )}

        {cvData.languages.length > 0 && (
          <div className="section">
            <div className="section-title">Ngôn ngữ</div>
            <div className="languages-grid">
              {cvData.languages.map((lang, i) => (
                <div key={i} className="language-item">
                  <span>{lang.name}</span> - {lang.proficiency}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.projects.length > 0 && (
          <div className="section">
            <div className="section-title">Dự án nổi bật</div>
            {cvData.projects.map((proj, i) => (
              <div key={i} className="project-item">
                <div className="project-name">{proj.name}</div>
                {proj.description && <p className="project-desc" dangerouslySetInnerHTML={{ __html: proj.description }} />}
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#e11d48' }}>
                    Xem chi tiết →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {cvData.certificates.length > 0 && (
          <div className="section">
            <div className="section-title">Chứng chỉ</div>
            {cvData.certificates.map((cert, i) => (
              <div key={i} className="cert-item">
                <div className="cert-name">{cert.name}</div>
                <div className="cert-issuer">
                  {cert.issuer} {cert.year && `• ${cert.year}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href={`/cv/${cvId}/edit`} className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại chỉnh sửa
          </Link>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Palette className="w-4 h-4 mr-2" />
                  {selectedTemplate === "default" ? "Mẫu mặc định" : templates.find(t => t.id === selectedTemplate)?.name || "Chọn mẫu"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedTemplate("default")}>
                  Mẫu mặc định
                </DropdownMenuItem>
                {templates.map(template => (
                  <DropdownMenuItem key={template.id} onClick={() => setSelectedTemplate(template.id)}>
                    {template.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Tải PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {renderCVContent()}
        </div>
      </div>
    </div>
  );
}
