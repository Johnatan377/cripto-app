import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface PortfolioAsset {
  id: string;
  user_id: string;
  asset_id: string;
  symbol: string;
  name?: string;
  amount?: number;
  purchase_price?: number;
  current_price?: number;
  created_at: string;
  updated_at: string;
}

export function usePortfolioRealtime(userId: string | null) {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    if (!userId) {
      setAssets([]);
      setLoading(false);
      return;
    }

    console.log('🔍 Buscando assets para user_id:', userId);

    const { data, error } = await supabase
      .from('portfolio_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar ativos:', error);
    } else {
      setAssets(data || []);
      console.log('📊 Assets encontrados:', data);
    }
    setLoading(false);
  };

  const addAsset = async (asset: Omit<PortfolioAsset, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return;

    const { error } = await supabase
      .from('portfolio_assets')
      .insert({
        ...asset,
        user_id: userId
      });

    if (error) {
      console.error('Erro ao adicionar ativo:', error);
      throw error;
    }
  };

  const removeAsset = async (assetId: string) => {
    const { error } = await supabase
      .from('portfolio_assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao remover ativo:', error);
      throw error;
    }
  };

  const updateAsset = async (assetId: string, updates: Partial<Omit<PortfolioAsset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const { error } = await supabase
      .from('portfolio_assets')
      .update(updates)
      .eq('id', assetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao atualizar ativo:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!userId) {
      setAssets([]);
      setLoading(false);
      return;
    }

    fetchAssets();

    const channel: RealtimeChannel = supabase
      .channel('portfolio-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_assets',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Mudança detectada:', payload);
          fetchAssets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    removeAsset,
    refresh: fetchAssets
  };
}
