import { supabase } from './supabaseClient';
import { UserSettings } from '../types';

/**
 * 🔥 SERVIÇO DE PROFILE - SEMPRE BUSCA DO BANCO
 * 
 * Este serviço garante que os dados do usuário sejam SEMPRE
 * buscados do Supabase, evitando dados em cache desatualizados.
 */

/**
 * Busca o perfil completo do usuário do banco de dados
 * @param userId - ID do usuário
 * @returns Profile data ou null se não encontrado
 */
export const fetchUserProfile = async (userId: string) => {
  if (!userId) {
    console.warn('[ProfileService] fetchUserProfile chamado sem userId');
    return null;
  }

  try {
    console.log('[ProfileService] 🔍 Buscando profile para userId:', userId);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116 = not found (ok se for primeiro login)
      if (error.code !== 'PGRST116') {
        console.error('[ProfileService] ❌ Erro ao buscar profile:', error);
      }
      return null;
    }

    console.log('[ProfileService] ✅ Profile encontrado:', {
      id: data.id,
      email: data.email,
      role: data.role,
      tier: data.tier,
      subscription_source: data.subscription_source
    });

    return data;
  } catch (error) {
    console.error('[ProfileService] ❌ Erro inesperado:', error);
    return null;
  }
};

/**
 * Converte os dados do profile do Supabase para UserSettings
 * @param profileData - Dados do profile do banco
 * @param currentSettings - Settings atuais (para preservar dados não salvos no banco)
 * @returns UserSettings merged
 */
export const profileToSettings = (
  profileData: any,
  currentSettings: UserSettings
): UserSettings => {
  if (!profileData) {
    console.log('[ProfileService] ⚠️ profileData é null, usando settings atuais');
    return currentSettings;
  }

  console.log('[ProfileService] 📊 Merge de settings:', {
    banco_tier: profileData.tier,
    local_tier: currentSettings.tier,
    final_tier: profileData.tier || currentSettings.tier
  });

  return {
    ...currentSettings,
    // SEMPRE priorizar tier do banco se existir
    tier: profileData.tier || currentSettings.tier || 'free',
    theme: profileData.theme || currentSettings.theme || 'black',
    currency: profileData.currency || currentSettings.currency || 'usd',
    language: profileData.language || currentSettings.language || 'en',
    subscription_source: profileData.subscription_source || currentSettings.subscription_source,
    promo_code_used: profileData.promo_code_used || currentSettings.promo_code_used,
    subscription_active_since: profileData.subscription_active_since || currentSettings.subscription_active_since
  };
};

/**
 * Atualiza APENAS os campos do profile (não sobrescreve portfolio/allocations)
 * @param userId - ID do usuário
 * @param settings - Settings para atualizar
 * @param email - Email do usuário
 * @param role - Role do usuário
 */
export const updateUserProfile = async (
  userId: string,
  settings: UserSettings,
  email?: string,
  role?: string
) => {
  if (!userId) {
    console.warn('[ProfileService] updateUserProfile chamado sem userId');
    return;
  }

  try {
    console.log('[ProfileService] 💾 Atualizando profile para:', userId);

    // 1. Buscar profile atual para evitar downgrade acidental de Tier
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    // 2. Lógica de proteção contra downgrade
    const tierOrder: Record<string, number> = { 'free': 0, 'premium': 1, 'vip': 2 };
    let finalTier = settings.tier;

    if (existingProfile?.tier && tierOrder[existingProfile.tier] > tierOrder[settings.tier]) {
      console.log(`[ProfileService] 🛡️ Prevenindo downgrade de ${existingProfile.tier} para ${settings.tier}`);
      finalTier = existingProfile.tier as any; // Cast para evitar conflito de tipos se 'vip' não estiver em UserSettings
    }

    const updateData: any = {
      email: email,
      role: role,
      tier: finalTier, // Usar o tier protegido
      currency: settings.currency,
      theme: settings.theme,
      language: settings.language,
      subscription_source: settings.subscription_source,
      promo_code_used: settings.promo_code_used,
      subscription_active_since: settings.subscription_active_since,
      updated_at: new Date().toISOString(),
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('[ProfileService] ❌ Erro ao atualizar profile:', error);
    } else {
      console.log('[ProfileService] ✅ Profile atualizado com sucesso (Tier: ' + finalTier + ')');
    }
  } catch (error) {
    console.error('[ProfileService] ❌ Erro inesperado ao atualizar:', error);
  }
};

/**
 * Cria um profile inicial para um novo usuário
 * @param userId - ID do usuário
 * @param email - Email do usuário
 * @param role - Role inicial
 * @param settings - Settings iniciais
 */
export const createUserProfile = async (
  userId: string,
  email: string,
  role: string,
  settings: UserSettings
) => {
  try {
    console.log('[ProfileService] 🆕 Criando profile para:', email);

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        role: role,
        tier: settings.tier || 'free',
        currency: settings.currency || 'usd',
        theme: settings.theme || 'black',
        language: settings.language || 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[ProfileService] ❌ Erro ao criar profile:', error);
    } else {
      console.log('[ProfileService] ✅ Profile criado com sucesso');
    }
  } catch (error) {
    console.error('[ProfileService] ❌ Erro inesperado ao criar:', error);
  }
};
