import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface AllocationLog {
  id: string;
  user_id: string;
  coin: string;
  amount: number;
  category: string;
  protocol: string;
  wallet_address?: string;
  protocol_url?: string;
  notes?: string;
  coin2?: string;
  amount2?: number;
  created_at: string;
  updated_at: string;
}

export function useAllocationRealtime(userId: string | null) {
  const [logs, setLogs] = useState<AllocationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('allocation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar logs:', error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const addLog = async (log: Omit<AllocationLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return;

    const { error } = await supabase
      .from('allocation_logs')
      .insert({
        ...log,
        user_id: userId
      });

    if (error) {
      console.error('Erro ao adicionar log:', error);
      throw error;
    }
  };

  const removeLog = async (logId: string) => {
    const { error } = await supabase
      .from('allocation_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao remover log:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    fetchLogs();

    const channel: RealtimeChannel = supabase
      .channel('allocation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'allocation_logs',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    logs,
    loading,
    addLog,
    removeLog,
    refresh: fetchLogs
  };
}
