
import { supabase } from './supabaseClient';

export interface SupportMessage {
    id: string;
    created_at: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    user_id?: string;
    direction?: 'inbound' | 'outbound';
    parent_id?: string | null;
}

export const sendSupportMessage = async (message: Omit<SupportMessage, 'id' | 'created_at' | 'read'>) => {
    try {
        const { error } = await supabase
            .from('support_messages')
            .insert(message);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Error sending support message:', err);
        return null;
    }
};

export const fetchSupportMessages = async () => {
    try {
        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as SupportMessage[];
    } catch (err) {
        console.error('Error fetching support messages:', err);
        return [];
    }
};

export const markMessageAsRead = async (id: string) => {
    try {
        if (!id) return false;
        
        const { error } = await supabase
            .from('support_messages')
            .update({ read: true })
            .eq('id', id);

        if (error) {
            console.error('Error marking message as read in DB:', error);
            throw error;
        }
        return true;
    } catch (err) {
        console.error('Error marking message as read:', err);
        return false;
    }
};

export const deleteSupportMessage = async (id: string) => {
    try {
        const { error } = await supabase
            .from('support_messages')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Error deleting support message:', err);
        return false;
    }
};

export const sendSupportReply = async (originalMessageId: string, replyMessage: string, userEmail: string, userName: string, language: 'pt' | 'en' = 'pt') => {
    try {
        // 1. Insert Reply Record
        const { error: dbError } = await supabase
            .from('support_messages')
            .insert({
                user_id: (await supabase.auth.getUser()).data.user?.id,
                name: 'Suporte CryptoFolio',
                email: 'support@cryptofoliodefi.xyz',
                message: replyMessage,
                read: true,
                direction: 'outbound',
                parent_id: originalMessageId
            });

        if (dbError) throw dbError;

        // 2. Prepare Email Content based on Language
        const subject = language === 'pt' 
            ? 'Resposta do Suporte - CryptoFolio DeFi' 
            : 'Support Response - CryptoFolio DeFi';

        const greeting = language === 'pt' ? `Olá, ${userName}` : `Hello, ${userName}`;
        const intro = language === 'pt' 
            ? 'Recebemos sua mensagem e aqui está nossa resposta:' 
            : 'We received your message and here is our response:';
        
        const footerTitle = language === 'pt' ? '⚠️ NÃO RESPONDA ESTE EMAIL' : '⚠️ DO NOT REPLY TO THIS EMAIL';
        const footerText = language === 'pt'
            ? 'Este é um email automático. Para continuar o atendimento, por favor utilize a área de suporte dentro do aplicativo.'
            : 'This is an automated email. To continue the support conversation, please use the support area within the application.';

        // 3. Send Real Email via Edge Function
        const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
                to: userEmail,
                subject: subject,
                html: `
                    <div style="font-family: sans-serif; color: #333;">
                        <h2>${greeting}</h2>
                        <p>${intro}</p>
                        <blockquote style="border-left: 4px solid #DAA520; padding-left: 10px; color: #555; background: #f9f9f9; padding: 10px;">
                            ${replyMessage.replace(/\n/g, '<br/>')}
                        </blockquote>
                        <br/>
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #777;">
                            <strong>${footerTitle}</strong><br/>
                            ${footerText}
                        </p>
                    </div>
                `
            }
        });

        if (emailError) throw emailError;

        return true;
    } catch (err) {
        console.error('Error sending support reply:', err);
        return false;
    }
};
