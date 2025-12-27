import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"

serve(async (req) => {
  try {
    const cryptoProvider = Stripe.createSubtleCryptoProvider();

    // 1. Verify Configuration inside the handler (Lazy Init)
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing critical environment variables");
      return new Response("Server Configuration Error: Missing Keys", { status: 500 });
    }

    // 2. Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 3. Verify Signature
    const signature = req.headers.get('Stripe-Signature')

    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    const body = await req.text()
    
    // 4. Construct Event
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET, undefined, cryptoProvider);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    let message = "Event received";

    // 5. Handle Event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const customerEmail = session.customer_details?.email

      message = "Processing complete";
      
      if (customerEmail) {
        console.log(`Processing premium upgrade for: ${customerEmail}`)

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Using Admin API to list users (Increased limit to find user)
        const { data, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        
        if (userError || !data) {
           console.error('Failed to list users from Supabase:', userError);
           message = `Error listing users: ${userError?.message}`;
        } else {
             const user = data.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());

             if (user) {
               console.log(`Found user ${user.id} for email ${customerEmail}. upgrading...`);
               
               // Strategy 1: Update Auth Metadata
               await supabase.auth.admin.updateUserById(
                 user.id,
                 { user_metadata: { tier: 'premium' } }
               )
    
               // Strategy 2: Update 'profiles' table (Correct one used by App)
               // Added stripe_customer_id to allow portal access later
               const { error: dbError } = await supabase
                 .from('profiles')
                 .update({ 
                    tier: 'premium',
                    stripe_customer_id: session.customer 
                 })
                 .eq('id', user.id)
    
               if (dbError) {
                 // Try create if not exists
                 await supabase
                   .from('profiles')
                   .insert({ 
                      id: user.id, 
                      tier: 'premium', 
                      stripe_customer_id: session.customer,
                      updated_at: new Date().toISOString() 
                   })
               }
    
               console.log(`User ${user.id} upgraded successfully!`)
               message = `Success: User ${customerEmail} upgraded to Premium.`;

               // --- Referral System Logic (Updated & Clean) ---
               try {
                 let padrinhoId = null;

                 // A. Check if already linked in DB (Best Source)
                 const { data: profile } = await supabase
                   .from('profiles')
                   .select('referred_by')
                   .eq('id', user.id)
                   .single();

                 if (profile?.referred_by) {
                   padrinhoId = profile.referred_by;
                   console.log(`[Referral] User ${user.id} is already linked to ${padrinhoId}`);
                 } 
                 // B. Fallback to metadata input if not linked
                 else if (user.user_metadata?.referral_code_input) {
                    const code = user.user_metadata.referral_code_input;
                    console.log(`[Referral] User ${user.id} has code input: ${code}`);
                    
                    const { data: padrinhoByCode } = await supabase
                       .from('profiles')
                       .select('id')
                       .eq('referral_code', code)
                       .single();
                    
                    if (padrinhoByCode) {
                        padrinhoId = padrinhoByCode.id;
                        await supabase.from('profiles').update({ referred_by: padrinhoId }).eq('id', user.id);
                    }
                 }

                 if (padrinhoId) {
                     const { data: padrinho } = await supabase
                       .from('profiles')
                       .select('id, stripe_customer_id, tier, premium_until')
                       .eq('id', padrinhoId)
                       .single();

                     if (padrinho) {
                       console.log(`[Referral] Processing bonus for padrinho: ${padrinho.id}`);
                       const REFERRAL_SIMULATION_MODE = Deno.env.get('REFERRAL_SIMULATION_MODE') === 'true';

                       if (REFERRAL_SIMULATION_MODE) {
                         console.log(`[Referral][SIMULATION] Would award bonus.`);
                       } else {
                         // Award Bonus Logic
                         if (padrinho.tier === 'premium' && padrinho.stripe_customer_id) {
                           // Credit for Premium Users (R$ 19,90)
                           await stripe.customers.createBalanceTransaction(padrinho.stripe_customer_id, {
                             amount: -1990, 
                             currency: 'brl',
                             description: `Bônus indicação: ${customerEmail}`
                           });
                           console.log(`[Referral] Awarded Credit to ${padrinho.id}`);
                         } else {
                           // Time extension for Free Users (30 days)
                           const now = new Date();
                           const currentUntil = padrinho.premium_until ? new Date(padrinho.premium_until) : now;
                           const baseDate = currentUntil > now ? currentUntil : now;
                           const newUntil = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

                           await supabase
                             .from('profiles')
                             .update({ 
                               tier: 'premium', 
                               premium_until: newUntil.toISOString() 
                             })
                             .eq('id', padrinho.id);
                           console.log(`[Referral] Awarded 30 days to ${padrinho.id}`);
                         }
                       }
                     } else {
                       console.log(`[Referral] Padrinho profile not found for ID: ${padrinhoId}`);
                     }
                 } else {
                    console.log(`[Referral] No referrer found for user ${user.id}`);
                 }
               } catch (refErr) {
                 console.error("[Referral] Fatal error in referral processing:", refErr);
               }
               // --- End Referral Logic ---
             } else {
               console.log(`User with email ${customerEmail} not found in Supabase Auth.`)
               message = `Error: User ${customerEmail} NOT FOUND in ${data.users.length} users checked.`;
             }
        }
      } else {
          console.log("No customer email in session, skipping.");
          message = "No customer email in session.";
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer;

      if (stripeCustomerId) {
          console.log(`Processing cancellation for customer: ${stripeCustomerId}`);
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

          const { error: dbError } = await supabase
            .from('profiles')
            .update({ tier: 'free' })
            .eq('stripe_customer_id', stripeCustomerId);

          if (dbError) {
              console.error(`Error downgrading user ${stripeCustomerId}:`, dbError);
              message = `Error downgrading: ${dbError.message}`;
          } else {
              console.log(`User ${stripeCustomerId} downgraded to free.`);
              message = `Success: User ${stripeCustomerId} downgraded to Free.`;
          }
      }
    }

    return new Response(JSON.stringify({ received: true, debug_message: message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error("Unexpected error in webhook handler:", err);
    return new Response(`Server Error: ${err.message}`, { status: 500 })
  }
})
