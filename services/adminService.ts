import { supabase } from './supabaseClient';

export interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  activeUsers: number; // Users with recent activity (if trackable) or just total
  referralUsers: number; // Users who used a referral code
  validPayments: number; // Premium users with stripe_customer_id
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    const { data, error } = await supabase.rpc('get_admin_stats');

    if (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }

    return data as AdminStats;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      premiumUsers: 0,
      freeUsers: 0,
      activeUsers: 0,
      referralUsers: 0,
      validPayments: 0
    };
  }
};
