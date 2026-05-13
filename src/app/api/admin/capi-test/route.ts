import { NextResponse } from 'next/server';
import {
  buildUserData,
  readCapiConfig,
  sendCapiEvent,
} from '@/lib/meta-capi/client';

export const runtime = 'nodejs';

/**
 * Admin-only diagnostic endpoint for Meta CAPI configuration.
 * Returns the actual result of a test event push to Meta — useful when
 * Events Manager doesn't show "Server" events and you need to know why.
 *
 * GET /api/admin/capi-test
 *
 * Response:
 *   { configured: false, reason: "..." }  → env vars missing
 *   { configured: true, sent: false, status: 400, body: {...} } → Meta rejected
 *   { configured: true, sent: true, eventId: "..." } → success, event sent to Meta
 */
export async function GET() {
  const config = readCapiConfig();
  if (!config) {
    return NextResponse.json(
      {
        configured: false,
        reason: 'env vars missing',
        details: {
          pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '<not set>',
          accessTokenSet:
            typeof process.env.META_CAPI_ACCESS_TOKEN === 'string' &&
            process.env.META_CAPI_ACCESS_TOKEN.length > 0,
          accessTokenLength: process.env.META_CAPI_ACCESS_TOKEN?.length ?? 0,
        },
      },
      { status: 200 },
    );
  }

  const eventId = `capi_test_${Date.now()}`;
  const result = await sendCapiEvent(config, {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    event_source_url: 'https://jofipet-quiz-lp.vercel.app/admin/capi-test',
    user_data: buildUserData({
      email: 'capi-diagnostic@jofipet-quiz-lp.vercel.app',
      name: 'CAPI Diagnostic',
    }),
    custom_data: {
      content_name: 'capi_test',
      value: 0,
      currency: 'BRL',
    },
  });

  return NextResponse.json(
    {
      configured: true,
      sent: result.ok,
      status: result.status,
      eventId,
      pixelId: config.pixelId,
      accessTokenPreview: `${config.accessToken.slice(0, 8)}...${config.accessToken.slice(-4)}`,
      testEventCode: config.testEventCode ?? null,
      metaResponse: result.body,
    },
    { status: 200 },
  );
}
