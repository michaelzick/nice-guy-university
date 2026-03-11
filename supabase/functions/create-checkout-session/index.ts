import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13?target=deno';

type CheckoutCourse = {
  id: string;
  title: string;
  price: number;
  sale_price: number | null;
  thumbnail_url: string | null;
};

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing ${name} for checkout configuration.`);
  }
  return value;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown checkout error';
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = getRequiredEnv('STRIPE_SECRET_KEY');
    const supabaseUrl = getRequiredEnv('SUPABASE_URL');
    const supabaseServiceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing auth token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { courseIds } = await req.json();

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No courses provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch courses from DB
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, price, sale_price, thumbnail_url')
      .in('id', courseIds);

    if (coursesError || !courses || courses.length === 0) {
      return new Response(JSON.stringify({ error: 'Courses not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const origin = req.headers.get('origin') || 'http://127.0.0.1:8080';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: (courses as CheckoutCourse[]).map((course) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            images: course.thumbnail_url ? [course.thumbnail_url] : [],
          },
          unit_amount: Math.round((course.sale_price || course.price) * 100),
        },
        quantity: 1,
      })),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        user_id: user.id,
        course_ids: courseIds.join(','),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
