
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Resend sends a POST request with the email payload
    const payload = await req.json();
    
    console.log("Inbound Email Received:", JSON.stringify(payload, null, 2));

    // Validar estrutura básica do payload do Resend
    // O payload do Resend geralmente tem { "from": "...", "to": "...", "subject": "...", "text": "...", "html": "..." }
    // Mas para Webhooks, pode vir envolto. Verificar documentação ou logs.
    // Assumindo estrutura direta baseada em testes comuns.
    
    // Extrair dados relevantes
    // O campo 'from' geralmente vem como "Name <email@domain.com>" ou apenas "email@domain.com"
    const fromRaw = payload.from || '';
    const subject = payload.subject || '(Sem Assunto)';
    const messageBody = payload.text || payload.html || '(Mensagem vazia)';
    
    // Extrair email puramente
    const emailMatch = fromRaw.match(/<(.+)>/);
    const email = emailMatch ? emailMatch[1] : fromRaw;
    const nameMatch = fromRaw.match(/(^[^<]+)/);
    const name = nameMatch ? nameMatch[1].trim().replace(/"/g, '') : 'Usuário';

    console.log(`Processing message from: ${email} (${name})`);

    // 1. Tentar encontrar o usuário no Banco de Dados (profile ou auth)
    // Buscando na tabela profiles é mais seguro para relação com a app
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', email)
        .single();
    
    let userId = null;
    let finalName = name;

    if (profile) {
        userId = profile.id;
        finalName = profile.full_name || name;
        console.log(`User found in profiles: ${userId}`);
    } else {
        console.log(`User not found in profiles for email ${email}. Seeking in Auth User List...`);
        // Se não achar em profiles, tenta listar usuários (operação cara, mas fallback)
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        const authUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (authUser) {
            userId = authUser.id;
            console.log(`User found in Auth: ${userId}`);
        } else {
             console.warn(`No registered user found for email ${email}. Message will be unlinked.`);
        }
    }

    // 2. Inserir na tabela support_messages
    const { data: newMessage, error: insertError } = await supabase
        .from('support_messages')
        .insert({
            user_id: userId, // Pode ser null se for email externo desconhecido
            email: email,
            name: finalName,
            message: messageBody,
            direction: 'inbound', // Importante para diferenciar na UI
            read: false,
            subject: subject // Se houver coluna subject, senão concatena no corpo? 
            // Como não vi coluna subject no schema lido anteriormente, vou assumir append no body ou ignorar por enquanto.
            // O ideal seria: `[Assunto: ${subject}]\n\n${messageBody}`
        })
        .select()
        .single();

    if (insertError) {
        throw new Error(`Error inserting message: ${insertError.message}`);
    }

    console.log("Support message saved:", newMessage.id);

    return new Response(
      JSON.stringify({ message: "Inbound email processed successfully", id: newMessage.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error("Error processing inbound email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
