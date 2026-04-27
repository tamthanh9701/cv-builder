import type { Metadata } from 'next';
import './globals.css';
import '@/styles/components.css';
import { AuthProvider } from '@/lib/auth-provider';
import { I18nProvider } from '@/lib/i18n-provider';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'CV Builder — Tạo CV chuyên nghiệp',
  description: 'Xây dựng CV chuyên nghiệp với AI phân tích và mẫu CV đa dạng. Build professional CVs with AI analysis and templates.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
