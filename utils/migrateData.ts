import { supabase } from '../services/supabaseClient';

export async function migrateUserData(userId: string) {
  console.log('🔄 Iniciando migração de dados...');

  try {
    // 1. Buscar dados antigos do JSON
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('portfolio, allocations')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      return { success: false, error: profileError };
    }

    if (!profile) {
      console.log('Perfil não encontrado');
      return { success: false, error: 'Profile not found' };
    }

    let migratedPortfolio = 0;
    let migratedAllocations = 0;

    // 2. Migrar PORTFOLIO (se existir)
    if (profile.portfolio && Array.isArray(profile.portfolio)) {
      console.log(`📦 Migrando ${profile.portfolio.length} itens do portfolio...`);

      for (const item of profile.portfolio) {
        const { error } = await supabase
          .from('portfolio_assets')
          .insert({
            user_id: userId,
            asset_id: item.assetId || item.id || 'unknown',
            symbol: item.symbol || item.assetId || 'unknown',
            name: item.name,
            amount: item.quantity || 0,
            purchase_price: item.buyPrice,
            current_price: item.currentPrice
          });

        if (!error) {
          migratedPortfolio++;
        } else {
          console.error('Erro ao migrar item:', item, error);
        }
      }
    }

    // 3. Migrar ALLOCATIONS (se existir)
    if (profile.allocations && Array.isArray(profile.allocations)) {
      console.log(`📦 Migrando ${profile.allocations.length} logs de alocação...`);

      for (const log of profile.allocations) {
        const { error } = await supabase
          .from('allocation_logs')
          .insert({
            user_id: userId,
            coin: log.coin || log.name || 'unknown',
            protocol: log.protocol || 'unknown',
            wallet_address: log.walletAddress || log.wallet_address,
            protocol_url: log.protocolUrl || log.protocol_url,
            notes: log.notes
          });

        if (!error) {
          migratedAllocations++;
        } else {
          console.error('Erro ao migrar log:', log, error);
        }
      }
    }

    console.log(`✅ Migração concluída!`);
    console.log(`   Portfolio: ${migratedPortfolio} itens`);
    console.log(`   Allocations: ${migratedAllocations} logs`);

    return {
      success: true,
      migratedPortfolio,
      migratedAllocations
    };

  } catch (error) {
    console.error('Erro na migração:', error);
    return { success: false, error };
  }
}
