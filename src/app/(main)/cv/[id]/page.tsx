import { redirect } from 'next/navigation';

export default function CVDetailPage({ params }: { params: { id: string } }) {
  redirect(`/cv/${params.id}/edit`);
}