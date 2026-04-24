"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({ cvCount: 0, recentCVs: [] as any[] });
  const supabase = createClient();

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: cvs } = await supabase
        .from('cvs')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        cvCount: cvs?.length || 0,
        recentCVs: cvs || [],
      });
    };

    fetchData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Chào mừng {user?.email}! Quản lý CV của bạn dễ dàng với CV Builder.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số CV
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.cvCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              CV đã tạo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CV gần đây
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recentCVs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Trong 30 ngày gần đây
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Phân tích CV và đề xuất cải thiện với AI
            </p>
            <Link href="/cv/ai-analyze">
              <Button size="sm" variant="outline" className="border-primary/50">
                Phân tích CV ngay
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">CV của bạn</h2>
        <Link href="/cv/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tạo CV mới
          </Button>
        </Link>
      </div>

      {stats.recentCVs.length === 0 ? (
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
          {stats.recentCVs.map((cv) => (
            <Card key={cv.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{cv.name}</CardTitle>
                <CardDescription>
                  {new Date(cv.created_at).toLocaleDateString('vi-VN')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Link href={`/cv/${cv.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">Chỉnh sửa</Button>
                </Link>
                <Link href={`/preview/${cv.id}`} className="flex-1">
                  <Button variant="ghost" className="w-full">Xem trước</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}