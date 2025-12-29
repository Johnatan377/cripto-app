
import { db } from './firebaseClient';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { supabase } from './supabaseClient'; // Keep for Email Edge Function

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
        const newMessage = {
            ...message,
            created_at: new Date().toISOString(), // Firestore needs explicit date if we sort by it
            read: false
        };

        await addDoc(collection(db, 'support_messages'), newMessage);
        return true;
    } catch (err) {
        console.error('Error sending support message (Firebase):', err);
        return null;
    }
};

export const fetchSupportMessages = async () => {
    try {
        const q = query(collection(db, 'support_messages'));
        // Firestore simple fetch. Ideally use orderBy('created_at', 'desc') but requires index.
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as SupportMessage[];

        // Sort in memory
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return data;
    } catch (err) {
        console.error('Error fetching support messages (Firebase):', err);
        return [];
    }
};

export const markMessageAsRead = async (id: string) => {
    try {
        if (!id) return false;
        
        const docRef = doc(db, 'support_messages', id);
        await updateDoc(docRef, { read: true });

        return true;
    } catch (err) {
        console.error('Error marking message as read (Firebase):', err);
        return false;
    }
};

export const deleteSupportMessage = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'support_messages', id));
        return true;
    } catch (err) {
        console.error('Error deleting support message (Firebase):', err);
        return false;
    }
};

export const sendSupportReply = async (originalMessageId: string, replyMessage: string, userEmail: string, userName: string, userId: string, language: 'pt' | 'en' = 'pt') => {
    try {
        // 1. Insert Reply Record -> FIREBASE
        const replyRecord = {
            user_id: userId,
            name: 'Suporte CryptoFolio',
            email: 'support@cryptofoliodefi.xyz',
            message: replyMessage,
            read: true,
            direction: 'outbound',
            parent_id: originalMessageId,
            created_at: new Date().toISOString()
        };

        await addDoc(collection(db, 'support_messages'), replyRecord);

        // 2. Prepare Email Content
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

        // 3. Send Real Email via Edge Function -> SUPABASE
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
