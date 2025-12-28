
import { supabase } from './supabaseClient';
import { AirdropProject } from '../types';

export const fetchAirdrops = async (): Promise<AirdropProject[]> => {
    try {
        console.log("airdropService: Fetching airdrops...");
        const { data, error, status, statusText } = await supabase
            .from('airdrops')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('airdropService: Supabase Error:', { error, status, statusText });
            return [];
        }

        console.log(`airdropService: Successfully fetched ${data?.length || 0} airdrops.`);
        return data as AirdropProject[];
    } catch (err) {
        console.error('airdropService: Unexpected error:', err);
        return [];
    }
};

export const getAirdropById = async (id: string): Promise<AirdropProject | null> => {
    try {
        const { data, error } = await supabase
            .from('airdrops')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching airdrop details:', error);
            return null;
        }

        return data as AirdropProject;
    } catch (err) {
        console.error('Unexpected error fetching airdrop details:', err);
        return null;
    }
}

export const createAirdrop = async (project: Omit<AirdropProject, 'id' | 'created_at'>): Promise<AirdropProject | null> => {
    try {
        console.log("AdminView: Attempting to create airdrop with payload:", project);
        const { data, error } = await supabase
            .from('airdrops')
            .insert(project)
            .select()
            .single();

        if (error) {
            console.error('Error creating airdrop (Supabase):', error);
            console.error('Error Details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return null;
        }

        console.log("AdminView: Airdrop created successfully:", data);
        return data as AirdropProject;
    } catch (err: any) {
        console.error('Unexpected error creating airdrop (Network/Code):', err);
        if (err?.message) console.error("Error Message:", err.message);
        return null;
    }
};

export const updateAirdrop = async (id: string, updates: Partial<AirdropProject>): Promise<AirdropProject | null> => {
    try {
        const { data, error } = await supabase
            .from('airdrops')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating airdrop:', error);
            return null;
        }

        return data as AirdropProject;
    } catch (err) {
        console.error('Unexpected error updating airdrop:', err);
        return null;
    }
};

export const deleteAirdrop = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('airdrops')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting airdrop:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Unexpected error deleting airdrop:', err);
        return false;
    }
};
