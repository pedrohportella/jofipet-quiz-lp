import { describe, it, expect } from 'vitest';
import { parseWebhook } from './parse-webhook';

const textMessagePayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: 'WABA_ID_123',
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5511999998888',
              phone_number_id: 'PHONE_ID_999',
            },
            contacts: [{ wa_id: '5581988887777', profile: { name: 'Pedro' } }],
            messages: [
              {
                from: '5581988887777',
                id: 'wamid.HBgN1',
                timestamp: '1717000000',
                type: 'text',
                text: { body: 'Oi, tudo bem?' },
              },
            ],
          },
        },
      ],
    },
  ],
};

const mediaMessagePayload = {
  entry: [
    {
      id: 'WABA_ID_123',
      changes: [
        {
          field: 'messages',
          value: {
            metadata: { phone_number_id: 'PHONE_ID_999' },
            messages: [
              {
                from: '5581988887777',
                id: 'wamid.IMG1',
                timestamp: '1717000050',
                type: 'image',
                image: {
                  id: 'media_id_123',
                  mime_type: 'image/jpeg',
                  caption: 'Olha o pet',
                },
              },
              {
                from: '5581988887777',
                id: 'wamid.AUD1',
                timestamp: '1717000060',
                type: 'audio',
                audio: { id: 'media_audio_456', mime_type: 'audio/ogg' },
              },
            ],
          },
        },
      ],
    },
  ],
};

const statusPayload = {
  entry: [
    {
      id: 'WABA_ID_123',
      changes: [
        {
          field: 'messages',
          value: {
            metadata: { phone_number_id: 'PHONE_ID_999' },
            statuses: [
              {
                id: 'wamid.HBgN1',
                recipient_id: '5581988887777',
                status: 'delivered',
                timestamp: '1717000100',
              },
              {
                id: 'wamid.HBgN2',
                recipient_id: '5581988887777',
                status: 'failed',
                timestamp: '1717000200',
                errors: [
                  {
                    code: 131047,
                    title: 'Re-engagement message',
                    message: 'Cliente fora da janela 24h',
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

const templateStatusPayload = {
  entry: [
    {
      id: 'WABA_ID_123',
      changes: [
        {
          field: 'message_template_status_update',
          value: {
            message_template_id: 'tpl_42',
            message_template_name: 'jofi_boasvindas_quente',
            message_template_language: 'pt_BR',
            event: 'APPROVED',
          },
        },
      ],
    },
  ],
};

describe('parseWebhook', () => {
  it('extrai mensagem de texto + contato', () => {
    const r = parseWebhook(textMessagePayload);
    expect(r.messages).toHaveLength(1);
    expect(r.messages[0]).toMatchObject({
      waMessageId: 'wamid.HBgN1',
      from: '5581988887777',
      type: 'text',
      body: 'Oi, tudo bem?',
    });
    expect(r.contacts).toEqual([{ waId: '5581988887777', name: 'Pedro' }]);
    expect(r.phoneNumberId).toBe('PHONE_ID_999');
    expect(r.wabaId).toBe('WABA_ID_123');
  });

  it('preserva timestamp como inteiro', () => {
    const r = parseWebhook(textMessagePayload);
    expect(r.messages[0]!.timestamp).toBe(1717000000);
  });

  it('extrai mídia (imagem + áudio) com mime/caption', () => {
    const r = parseWebhook(mediaMessagePayload);
    expect(r.messages).toHaveLength(2);
    expect(r.messages[0]).toMatchObject({
      type: 'image',
      mediaId: 'media_id_123',
      mediaMimeType: 'image/jpeg',
      caption: 'Olha o pet',
    });
    expect(r.messages[1]).toMatchObject({
      type: 'audio',
      mediaId: 'media_audio_456',
      mediaMimeType: 'audio/ogg',
    });
  });

  it('extrai status delivered + failed com errorCode', () => {
    const r = parseWebhook(statusPayload);
    expect(r.statuses).toHaveLength(2);
    expect(r.statuses[0]!.status).toBe('delivered');
    expect(r.statuses[1]).toMatchObject({
      status: 'failed',
      errorCode: 131047,
      errorTitle: 'Re-engagement message',
    });
  });

  it('extrai template status update', () => {
    const r = parseWebhook(templateStatusPayload);
    expect(r.templateStatusUpdates).toHaveLength(1);
    expect(r.templateStatusUpdates[0]).toMatchObject({
      metaTemplateId: 'tpl_42',
      templateName: 'jofi_boasvindas_quente',
      language: 'pt_BR',
      newStatus: 'APPROVED',
    });
  });

  it('retorna vazio pra payload malformado', () => {
    const r = parseWebhook({});
    expect(r.messages).toEqual([]);
    expect(r.statuses).toEqual([]);
    expect(r.contacts).toEqual([]);
  });

  it('retorna vazio pra payload null', () => {
    const r = parseWebhook(null);
    expect(r.messages).toEqual([]);
  });

  it('mapeia tipo não-suportado pra "unsupported"', () => {
    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '5511999999999',
                    id: 'wamid.X',
                    timestamp: '1700000000',
                    type: 'order',
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const r = parseWebhook(payload);
    expect(r.messages[0]!.type).toBe('unsupported');
  });
});
