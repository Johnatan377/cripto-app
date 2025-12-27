
import { PaymentIntent, PaymentMethod, CreditCardInfo, UserAccount } from '../types';

/**
 * Simula a criação de uma intenção de pagamento
 */
export const createPaymentIntent = async (method: PaymentMethod): Promise<PaymentIntent> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const intent: PaymentIntent = {
    id: `pay_${Math.random().toString(36).substr(2, 9)}`,
    amount: 4.99,
    method,
    status: 'pending',
  };

  return intent;
};

/**
 * Simula a validação e processamento de um cartão de crédito
 */
export const processCreditCardPayment = async (card: CreditCardInfo): Promise<boolean> => {
  console.log("Processando cartão:", card.number.slice(-4));
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock: Validação simples
  if (card.number.length < 13 || card.cvv.length < 3) return false;
  return true;
};

/**
 * Simula a verificação do pagamento
 */
export const verifyPayment = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return true; 
};

/**
 * Salva o status premium com data de expiração (30 dias)
 */
export const savePremiumStatus = (card?: CreditCardInfo) => {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  settings.tier = 'premium';
  localStorage.setItem('settings', JSON.stringify(settings));

  const account = JSON.parse(localStorage.getItem('user_account') || '{}');
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  
  const updatedAccount: UserAccount = {
    ...account,
    cardInfo: card || account.cardInfo,
    subscriptionActiveUntil: now + thirtyDays,
    isLoggedIn: true
  };
  
  localStorage.setItem('user_account', JSON.stringify(updatedAccount));
  return { settings, account: updatedAccount };
};

/**
 * Verifica se a assinatura expirou e reverte para o plano free se necessário
 */
export const checkSubscriptionExpiry = (): { shouldDowngrade: boolean } => {
  const accountStr = localStorage.getItem('user_account');
  if (!accountStr) return { shouldDowngrade: false };

  const account: UserAccount = JSON.parse(accountStr);
  if (account.subscriptionActiveUntil && Date.now() > account.subscriptionActiveUntil) {
    // Expirou!
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    if (settings.tier === 'premium') {
      settings.tier = 'free';
      localStorage.setItem('settings', JSON.stringify(settings));
      return { shouldDowngrade: true };
    }
  }
  return { shouldDowngrade: false };
};
