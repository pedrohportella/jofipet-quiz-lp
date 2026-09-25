import { LeadDetailClient } from './lead-detail-client';

interface PageProps {
  params: { leadId: string };
}

export default function AdminLeadDetailPage({ params }: PageProps) {
  return <LeadDetailClient leadId={params.leadId} />;
}
