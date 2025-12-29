
import { supabase } from './supabaseClient';
import { db } from './firebaseClient';
import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy,
    serverTimestamp,
    where
} from 'firebase/firestore';

export interface SupportMessage {
    id: string;
    created_at: any;
    name: string;
    email: string;
    message: string;
    read: boolean;
    user_id?: string;
    direction?: 'inbound' | 'outbound';
    parent_id?: string | null;
}


const COLLECTION_NAME = 'support_messages';

const formatDoc = (doc: any) => {
    const data = doc.data();
    const formatted: any = { id: doc.id, ...data };
    if (data.created_at && typeof data.created_at.toDate === 'function') {
        formatted.created_at = data.created_at.toDate().toISOString();
    }
    return formatted as SupportMessage;
};

export const sendSupportMessage = async (message: Omit<SupportMessage, 'id' | 'created_at' | 'read'>) => {
    try {
        const messagesCol = collection(db, COLLECTION_NAME);
        await addDoc(messagesCol, {
            ...message,
            read: false,
            created_at: serverTimestamp()
        });
        return true;
    } catch (err) {
        console.error('Error sending support message to Firebase:', err);
        return null;
    }
};

export const fetchSupportMessages = async () => {
    try {
        console.log('[MessageService] Fetching all support messages...');
        const messagesCol = collection(db, COLLECTION_NAME);
        
        // Buscar todos sem filtro para garantir visibilidade
        const messagesSnapshot = await getDocs(messagesCol);
        console.log(`[MessageService] Found ${messagesSnapshot.size} messages in Firestore`);
        
        const all = messagesSnapshot.docs.map(d => {
            const formatted = formatDoc(d);
            console.log(`[MessageService] Msg from: ${formatted.name} (${formatted.email}) - Read: ${formatted.read}`);
            return formatted;
        });
        
        // Ordenar em memória
        return all.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });
    } catch (err) {
        console.error('[MessageService] Error fetching support messages:', err);
        return [];
    }
};

export const markMessageAsRead = async (id: string) => {
    try {
        if (!id) return false;
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { read: true });
        return true;
    } catch (err) {
        console.error('Error marking message as read in Firebase:', err);
        return false;
    }
};

export const deleteSupportMessage = async (id: string) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
        return true;
    } catch (err) {
        console.error('Error deleting support message from Firebase:', err);
        return false;
    }
};

export const sendSupportReply = async (originalMessageId: string, replyMessage: string, userEmail: string, userName: string, userId: string, language: 'pt' | 'en' = 'pt') => {
    try {
        // 1. Insert Reply Record in Firebase
        const messagesCol = collection(db, COLLECTION_NAME);
        await addDoc(messagesCol, {
            user_id: userId,
            name: 'Suporte CryptoFolio',
            email: 'support@cryptofoliodefi.xyz',
            message: replyMessage,
            read: true,
            direction: 'outbound',
            parent_id: originalMessageId,
            created_at: serverTimestamp()
        });

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

        // 3. Send Real Email via Supabase Edge Function (keeping this as it requires no changes and is easier than migrating to SendGrid/Firebase Functions)
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
        console.error('Error sending support reply to Firebase:', err);
        return false;
    }
};
