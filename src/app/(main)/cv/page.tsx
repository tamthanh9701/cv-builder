"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, MoreVertical, Pencil, Trash2, Eye, Copy, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface CVItem {
  id: string;
  name: string;
  data: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function CVListPage() {
  const { user } = useAuth();
  const [cvs, setCVs] = React.useState<CVItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    const fetchCVs = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setCVs(data);
      }
      setLoading(false);
    };

    fetchCVs();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa CV này?')) return;

    const { error } = await supabase.from('cvs').delete().eq('id', id);
    if (!error) {
      setCVs(cvs.filter(cv => cv.id !== id));
    }
  };

  const handleDuplicate = async (cv: CVItem) => {
    if (!user) return;

    const { error } = await supabase.from('cvs').insert({
      user_id: user.id,
      name: `${cv.name} (Copy)`,
      data: cv.data,
    });

    if (!error) {
      const { data } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (data) setCVs(data);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lý CV</h1>
          <p className="text-muted-foreground mt-1">
            {cvs.length} CV đã tạo
          </p>
        </div>
        <Link href="/cv/upload-template">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Tải mẫu CV
          </Button>
        </Link>
        <Link href="/cv/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tạo CV mới
          </Button>
        </Link>
      </div>

      {cvs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có CV nào</h3>
            <p className="text-muted-foreground mb-4">
              Bắt đầu tạo CV đầu tiên của bạn ngay
            </p>
            <Link href="/cv/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tạo CV mới
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cvs.map((cv) => (
            <Card key={cv.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg truncate">{cv.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Cập nhật: {new Date(cv.updated_at).toLocaleDateString('vi-VN')}
                    </CardDescription>
                  </div>
                  {cv.is_default && <Badge variant="secondary">Mặc định</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Link href={`/cv/${cv.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Pencil className="w-4 h-4 mr-2" />
                    Sửa
                  </Button>
                </Link>
                <Link href={`/preview/${cv.id}`} className="flex-1">
                  <Button variant="ghost" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Xem
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDuplicate(cv)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Sao chép
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(cv.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}