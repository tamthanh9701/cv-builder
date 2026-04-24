"use client";

import * as React from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Settings, RefreshCw } from "lucide-react";
import { AIProviderType, AIProviderConfig, AppSettings, createDefaultSettings, DEFAULT_PROVIDERS } from "@/types/ai";
import { cn } from "@/lib/utils";

const PROVIDER_NAMES: Record<AIProviderType, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic Claude',
  openrouter: 'OpenRouter',
  litellm: 'LiteLLM',
  google: 'Google AI',
  vertexai: 'Vertex AI',
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [settings, setSettings] = React.useState<AppSettings>(createDefaultSettings());
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = React.useState<Record<string, boolean | null>>({});

  React.useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('settings')
        .single();

      if (data?.settings) {
        setSettings({ ...createDefaultSettings(), ...data.settings });
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleProviderChange = (type: AIProviderType, field: keyof AIProviderConfig, value: string | boolean) => {
    setSettings({
      ...settings,
      providers: {
        ...settings.providers,
        [type]: {
          ...settings.providers[type],
          [field]: value,
        },
      },
    });
    setTestResults({ ...testResults, [type]: null });
  };

  const handleActiveProviderChange = (type: AIProviderType) => {
    setSettings({
      ...settings,
      active_provider: type,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: 'app_settings',
          settings,
        });

      if (error) throw error;
      alert('Lưu cài đặt thành công!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Có lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleTestProvider = async (type: AIProviderType) => {
    const provider = settings.providers[type];
    if (!provider.api_key) {
      alert('Vui lòng nhập API key trước');
      return;
    }

    setTesting({ ...testing, [type]: true });
    setTestResults({ ...testResults, [type]: null });

    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, type }),
      });

      const data = await response.json();
      setTestResults({ ...testResults, [type]: data.success });
    } catch (error) {
      setTestResults({ ...testResults, [type]: false });
    } finally {
      setTesting({ ...testing, [type]: false });
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cài đặt AI</h1>
        <p className="text-muted-foreground mt-1">
          Cấu hình các AI provider và chọn provider mặc định
        </p>
      </div>

      <div className="mb-6">
        <Label className="text-base">Provider mặc định</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {(Object.keys(DEFAULT_PROVIDERS) as AIProviderType[]).map((type) => {
            const provider = settings.providers[type];
            if (!provider?.enabled) return null;
            return (
              <button
                key={type}
                onClick={() => handleActiveProviderChange(type)}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-colors",
                  settings.active_provider === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 hover:border-primary/50"
                )}
              >
                {PROVIDER_NAMES[type]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {(Object.keys(DEFAULT_PROVIDERS) as AIProviderType[]).map((type) => {
          const provider = settings.providers[type];
          const defaults = DEFAULT_PROVIDERS[type];

          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>{PROVIDER_NAMES[type]}</CardTitle>
                  {provider?.enabled && (
                    <Badge variant="secondary">Đã bật</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {provider?.enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestProvider(type)}
                      disabled={testing[type]}
                    >
                      {testing[type] ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Kiểm tra
                    </Button>
                  )}
                  <button
                    onClick={() => handleProviderChange(type, 'enabled', !provider?.enabled)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      provider?.enabled ? "bg-primary" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        provider?.enabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {testResults[type] !== null && (
                  <div className={cn(
                    "p-3 rounded-lg flex items-center gap-2",
                    testResults[type] ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  )}>
                    {testResults[type] ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    {testResults[type] ? 'Kết nối thành công!' : 'Kết nối thất bại. Kiểm tra API key.'}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={provider?.api_key || ''}
                      onChange={(e) => handleProviderChange(type, 'api_key', e.target.value)}
                      placeholder="sk-..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base URL</Label>
                    <Input
                      value={provider?.base_url || defaults.base_url}
                      onChange={(e) => handleProviderChange(type, 'base_url', e.target.value)}
                      placeholder="https://api.openai.com/v1"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Model</Label>
                    <Input
                      value={provider?.model || defaults.model}
                      onChange={(e) => handleProviderChange(type, 'model', e.target.value)}
                      placeholder="gpt-4o"
                    />
                  </div>
                </div>

                {type === 'vertexai' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                    <div className="space-y-2">
                      <Label>Project ID</Label>
                      <Input
                        value={provider?.vertex_project || ''}
                        onChange={(e) => handleProviderChange(type, 'vertex_project', e.target.value)}
                        placeholder="my-project"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={provider?.vertex_location || ''}
                        onChange={(e) => handleProviderChange(type, 'vertex_location', e.target.value)}
                        placeholder="us-central1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Service Account JSON</Label>
                      <Input
                        type="password"
                        value={provider?.vertex_credentials || ''}
                        onChange={(e) => handleProviderChange(type, 'vertex_credentials', e.target.value)}
                        placeholder='{"type": "service_account", ...}'
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Settings className="w-4 h-4 mr-2" />
          )}
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}