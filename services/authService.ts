import { UserAccount, UserSettings, Alert, PortfolioItem } from '../types';
import { supabase } from './supabaseClient';
import { ADMIN_EMAILS } from '../constants';

/**
 * Conecta com o Google via Supabase OAuth
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
};

/**
 * Login com Email e Senha
 */
export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * Cadastro com Email e Senha
 */
/**
 * Cadastro com Email e Senha
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin
    },
  });
  if (error) throw error;
  return data;
};

/**
 * Salva ou atualiza o perfil do usuário (tier, settings) no Supabase
 */
/**
 * Salva ou atualiza o perfil do usuário (tier, settings) no Supabase
 */
export const syncUserProfile = async (userId: string, settings: UserSettings, email?: string, role?: string) => {
  // PROTEÇÃO ANTI-DOWNGRADE: Sempre buscar tier atual do banco ANTES de atualizar
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('tier, subscription_source, promo_code_used')
    .eq('id', userId)
    .single();

  // Se já tem premium/vip no banco, NUNCA downgrade para free
  if (currentProfile?.tier && 
      (currentProfile.tier === 'premium' || currentProfile.tier === 'vip') &&
      settings.tier === 'free') {
    console.log('[Auth] 🛡️ PROTEÇÃO: Impedindo downgrade não autorizado de', currentProfile.tier, 'para free');
    settings.tier = currentProfile.tier;
    settings.subscription_source = currentProfile.subscription_source;
    settings.promo_code_used = currentProfile.promo_code_used;
  }

  // Try to update first
  const { data: existingProfile } = await supabase.from('profiles').select('id, tier, role').eq('id', userId).single();

  // Protection against downgrading Tier
  const tierOrder = { 'free': 0, 'premium': 1, 'vip': 2 };
  let finalTier = settings.tier;
  if (existingProfile?.tier && tierOrder[existingProfile.tier as keyof typeof tierOrder] > tierOrder[settings.tier as keyof typeof tierOrder]) {
      console.log(`[Auth] Preventing tier downgrade from ${existingProfile.tier} to ${settings.tier}`);
      finalTier = existingProfile.tier;
  }

  // Protection against downgrading Role (if already Admin, keep it)
  let finalRole = role;
  if (existingProfile?.role === 'admin' && role !== 'admin') {
      console.log(`[Auth] Preserving Admin role for ${email}`);
      finalRole = 'admin';
  }

  const profileData: any = {
    email: email,
    role: finalRole,
    tier: finalTier,
    currency: settings.currency,
    theme: settings.theme,
    updated_at: new Date().toISOString(),
    subscription_source: settings.subscription_source,
    promo_code_used: settings.promo_code_used,
    subscription_active_since: settings.subscription_active_since
  };

  let error;
  if (existingProfile) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId, ...profileData });
    error = insertError;
  }

  // Security & Auto-Promotion Logic (ONLY Promote, NEVER Demote)
  if (email) {
    const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase());
    
    // Whitelisted email -> Force Admin Role (Auto-Promote/Heal)
    if (isAdminEmail) {
       if (role !== 'admin') {
           console.log(`[Auth] Auto-promoting ${email} to Admin`);
           await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
       }
    } 
  }

  if (error) {
    console.error(`[Auth] Erro ao sincronizar perfil para ${userId}:`, error);
  }
};

/**
 * Recupera o perfil do usuário do Supabase
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Erro ao buscar perfil:", error);
  }
  return data;
};

/**
 * Logout real via Supabase
 */
export const signOut = async () => {
  try {
    console.log('[Auth] 🚪 Iniciando logout completo...');

    // 1. Logout do Supabase Auth
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] ⚠️ Erro no signOut do Supabase:', error);
    }

    // 2. Limpar TODOS os dados do localStorage
    console.log('[Auth] 🧹 Limpando localStorage...');
    localStorage.clear();

    // 3. Limpar sessionStorage
    console.log('[Auth] 🧹 Limpando sessionStorage...');
    sessionStorage.clear();

    // 4. Limpar cookies
    console.log('[Auth] 🧹 Limpando cookies...');
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log('[Auth] ✅ Logout completo finalizado!');

    // 5. Recarregar página
    window.location.href = '/';

  } catch (error) {
    console.error('[Auth] ❌ Erro durante logout:', error);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
};

/**
 * Mapeia a sessão do Supabase para o nosso tipo UserAccount
 */
export const mapSupabaseUser = (sessionUser: any): UserAccount => {
  const email = sessionUser.email || '';
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  
  return {
    email: email,
    isLoggedIn: true,
    provider: sessionUser.app_metadata.provider || 'email',
    id: sessionUser.id,
    role: isAdmin ? 'admin' : (sessionUser.user_metadata?.role || 'user')
  };
};

export const getSavedAccount = (): UserAccount | null => {
  const saved = localStorage.getItem('user_account');
  return saved ? JSON.parse(saved) : null;
};

/**
 * Envia email de recuperação de senha
 */
export const resetPasswordForEmail = async (email: string) => {
  // Chamamos nossa Edge Function personalizada em vez do padrão do Supabase
  // para garantir que o email saia pelo nosso domínio profissional (Resend)
  const { error } = await supabase.functions.invoke('send-email', {
    body: { 
      to: email, 
      subject: 'Redefinição de Senha - Cryptofolio',
      // Para recuperação de senha real via Supabase Auth com link,
      // o ideal seria configurar o SMTP no painel do Supabase.
      // Como estamos usando a Edge Function para contornar o Spam,
      // vamos disparar o link oficial via Edge Function.
    }
  });

  // Nota: Para o link de redefinição funcionar 100% via Edge Function personalizada,
  // o Supabase Auth precisaria gerar o token. 
  // Por enquanto, vamos reverter para resetPasswordForEmail SE o usuário preferir
  // configurar o SMTP no painel do Supabase (mais seguro).
  
  const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  
  if (authError) throw authError;
};

/**
 * Salva o portfólio do usuário na nuvem (Debounced idealmente no frontend)
 */
export const saveUserPortfolio = async (userId: string, portfolio: PortfolioItem[], allocations: any[], alerts: Alert[] = []) => {
  if (!userId) return;
  
  const { error } = await supabase
    .from('profiles')
    .update({
      portfolio: portfolio,
      allocations: allocations,
      alerts: alerts,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) console.error("Erro ao salvar portfólio:", error);
};

/**
 * Carrega o portfólio do usuário da nuvem
 */
export const loadUserPortfolio = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('portfolio, allocations, alerts')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Erro ao carregar portfólio:", error);
    return null;
  }
  return data;
};
