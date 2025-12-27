import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return new Response(JSON.stringify({ error: "Missing Authorization Header" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }

    const token = authHeader.replace('Bearer ', '');
    console.log(`Received Token (prefix): ${token.substring(0, 10)}...`);

    // 1. Verify User with Auth Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error("Auth Error:", authError);
      return new Response(JSON.stringify({ error: `Auth Failed: ${authError?.message || 'User is null'}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Authenticated User: ${user.email} (${user.id})`);

    // 2. Use Service Role for DB Access (Bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let stripeCustomerId = null;
    try {
        let { data: profile, error: dbError } = await supabaseAdmin
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', user.id)
          .single()
        
        if (dbError) {
             console.error("DB Error (reading profile):", dbError);
        }
        stripeCustomerId = profile?.stripe_customer_id;
    } catch (err) {
        console.error("DB Exception:", err);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // SELF-HEALING
    if (!stripeCustomerId) {
       console.log(`ID missing for ${user.email}. Searching Stripe...`);
       try {
           const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
           
           if (existingCustomers.data.length > 0) {
               stripeCustomerId = existingCustomers.data[0].id;
               console.log(`Found ID ${stripeCustomerId} in Stripe. Updating DB...`);
               
               // Heal with Admin Client
               await supabaseAdmin.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', user.id);
           } else {
               return new Response(JSON.stringify({ error: "Você ainda não possui um registro na Stripe. Assine primeiro!" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, 
              })
           }
       } catch (searchError) {
           return new Response(JSON.stringify({ error: `Erro na busca Stripe: ${searchError.message}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, 
          })
       }
    }

    // 3. Create Portal Session
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${req.headers.get('origin') || 'http://localhost:5173'}`,
      })

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (stripeError) {
       console.error("Stripe Session Error:", stripeError);
       return new Response(JSON.stringify({ error: `Erro ao criar portal: ${stripeError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

  } catch (error) {
    console.error("Global Catch Error:", error);
    return new Response(JSON.stringify({ error: `System Error: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
