import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'https://esm.sh/resend@2.0.0';

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  captchaToken: string;
}

interface HCaptchaVerifyResponse {
  success: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseContactEmailRequest(value: unknown): ContactEmailRequest | null {
  if (!isRecord(value)) {
    return null;
  }

  const { firstName, lastName, email, message, captchaToken } = value;

  if (
    typeof firstName !== 'string'
    || typeof lastName !== 'string'
    || typeof email !== 'string'
    || typeof message !== 'string'
    || typeof captchaToken !== 'string'
  ) {
    return null;
  }

  if (!firstName || !lastName || !email || !message || !captchaToken) {
    return null;
  }

  return {
    firstName,
    lastName,
    email,
    message,
    captchaToken,
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  try {
    const requestBody = parseContactEmailRequest(await req.json());

    if (!requestBody) {
      return jsonResponse({ error: 'All form fields and hCaptcha are required.' }, 400);
    }

    const {
      firstName,
      lastName,
      email,
      message,
      captchaToken,
    } = requestBody;

    const hCaptchaSecret = Deno.env.get('HCAPTCHA_SECRET');
    const toEmail = Deno.env.get('CONTACT_FORM_TO_EMAIL');
    const fromEmail = Deno.env.get('CONTACT_FORM_FROM_EMAIL');

    if (!hCaptchaSecret || !resend || !toEmail || !fromEmail) {
      return jsonResponse({
        error: 'Contact form is not configured yet. Missing email or captcha environment variables.',
      }, 500);
    }

    const captchaResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: hCaptchaSecret,
        response: captchaToken,
      }),
    });

    const captchaResult = await captchaResponse.json() as HCaptchaVerifyResponse;

    if (!captchaResult.success) {
      return jsonResponse({ error: 'hCaptcha verification failed. Please try again.' }, 400);
    }

    await resend.emails.send({
      from: `Nice Guy University Contact <${fromEmail}>`,
      to: [toEmail],
      reply_to: email.trim(),
      subject: '[Nice Guy University] Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${firstName.trim()} ${lastName.trim()} (${email.trim()})</p>
        <div>
          <strong>Message:</strong>
          <p>${message.trim().replace(/\n/g, '<br>')}</p>
        </div>
        <hr>
        <p><em>This message was sent via the Nice Guy University contact form.</em></p>
      `,
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Please try again.' }, 500);
  }
});
