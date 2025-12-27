
import { Alert, UserTier, PortfolioData } from '../types';

let sharedAudioCtx: AudioContext | null = null;

/**
 * Inicializa o contexto de áudio em resposta a um gesto do usuário.
 * Essencial para que o som funcione em navegadores móveis (Safari/Chrome Mobile).
 */
export const initAudio = () => {
  if (sharedAudioCtx) return;
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    sharedAudioCtx = new AudioContextClass();
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    console.log("[Audio] Context initialized and resumed");
  } catch (e) {
    console.error("[Audio] Failed to init context", e);
  }
};

/**
 * Valida se o usuário pode adicionar um novo alerta com base no seu plano.
 */
export const canAddAlert = (
  userTier: UserTier, 
  currentAlerts: Alert[], 
  assetId: string,
  totalAssets: number
): { can: boolean; reason?: string } => {
  if (userTier === 'premium') return { can: true };

  // Máximo de 1 alerta por ativo no plano grátis
  const assetAlerts = currentAlerts.filter(a => a.assetId === assetId);
  if (assetAlerts.length >= 1) {
    return { can: false, reason: 'Plano Grátis permite apenas 1 alerta por ativo. Migre para o Premium!' };
  }

  return { can: true };
};

/**
 * Reproduz um som de alerta persistente (sereia) em loop por alguns segundos.
 */
export const playAlertSound = (volume: number = 0.1, durationMs: number = 4000) => {
  try {
    if (!sharedAudioCtx) initAudio();
    if (!sharedAudioCtx) return;

    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }

    const startTime = sharedAudioCtx.currentTime;
    const pulseCount = Math.floor(durationMs / 600); // Cada pulso de 0.6s

    for (let i = 0; i < pulseCount; i++) {
      const pulseStart = startTime + (i * 0.6);
      
      const oscillator = sharedAudioCtx.createOscillator();
      const gainNode = sharedAudioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(sharedAudioCtx.destination);

      // Som estilo sereia: Alternância rápida de frequências
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, pulseStart); // A5
      oscillator.frequency.exponentialRampToValueAtTime(1320, pulseStart + 0.3); // E6
      oscillator.frequency.exponentialRampToValueAtTime(880, pulseStart + 0.55);

      gainNode.gain.setValueAtTime(volume, pulseStart);
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.8, pulseStart + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, pulseStart + 0.55);

      oscillator.start(pulseStart);
      oscillator.stop(pulseStart + 0.55);
    }

    // Vibração no celular persistente (se suportado)
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }
  } catch (e) {
    console.warn("Audio Context failed", e);
  }
};

/**
 * Verifica quais alertas foram disparados com base nos novos preços de mercado.
 */
export const checkAlerts = (
  alerts: Alert[], 
  marketData: Record<string, any>
): { triggeredIds: string[]; messages: string[] } => {
  const triggeredIds: string[] = [];
  const messages: string[] = [];
  
  const EPSILON = 0.00000001;

  alerts.forEach(alert => {
    if (!alert.isActive) return;

    const currentPrice = marketData[alert.assetId]?.current_price;
    if (currentPrice === undefined || currentPrice === null) return;

    let triggered = false;
    let msg = '';
    const currencySym = alert.currency === 'brl' ? 'R$' : alert.currency === 'eur' ? '€' : '$';

    switch (alert.type) {
      case 'above':
        if (currentPrice >= (alert.targetValue + EPSILON)) {
          triggered = true;
          msg = `🚀 ${alert.symbol} subiu! Preço atual: ${currencySym}${currentPrice.toLocaleString('en-US')}. Alvo superado: ${currencySym}${alert.targetValue.toLocaleString('en-US')}`;
        }
        break;
      case 'below':
        if (currentPrice <= (alert.targetValue - EPSILON)) {
          triggered = true;
          msg = `⚠️ ${alert.symbol} caiu! Preço atual: ${currencySym}${currentPrice.toLocaleString('en-US')}. Alvo atingido: ${currencySym}${alert.targetValue.toLocaleString('en-US')}`;
        }
        break;
      case 'percent_change':
        const change = marketData[alert.assetId]?.price_change_percentage_24h;
        if (change === undefined) return;
        
        if (Math.abs(change) >= Math.abs(alert.targetValue)) {
          triggered = true;
          msg = `📉 Variação brusca em ${alert.symbol}: ${change.toFixed(2)}% (Alerta definido para ${alert.targetValue}%)`;
        }
        break;
    }

    if (triggered) {
      triggeredIds.push(alert.id);
      messages.push(msg);
    }
  });

  return { triggeredIds, messages };
};
