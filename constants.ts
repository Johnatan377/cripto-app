
import { PortfolioItem, ThemeStyle, AppTheme } from './types';

// Ticker Coins List
export const TICKER_COINS = [
  'bitcoin', 
  'ethereum', 
  'solana', 
  'ripple', 
  'binancecoin', 
  'cardano', 
  'hyp-Hyperliquid', 
  'pendle', 
  'ethena', // ENA
  'aster', // ASTER
  'zcash', // ZEC
  'sui'
];

export const COLORS = ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00', '#FF0000', '#8A2BE2', '#FF8C00'];

export const AVAILABLE_TOKENS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
];

export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [];

export const STRIPE_PROMO_MONTHLY_LINK = 'https://buy.stripe.com/14A6oGcIf4uB0e15kOcfK05'; // R$ 9,90 Mensal (Brazil Promo)
export const STRIPE_FULL_PRICE_LINK = 'https://buy.stripe.com/14AbJ037FbX3gcZ4gKcfK06'; // R$ 19,90 Mensal (Brazil Full)
export const STRIPE_USD_PROMO_LINK = 'https://buy.stripe.com/9B6bJ0aA75yF2m928CcfK03'; // $ 1,99 USD Mensal (USD Promo)
export const STRIPE_USD_FULL_LINK = 'https://buy.stripe.com/14A28qaA74uBe4R00ucfK07'; // $ 3,99 USD Mensal (USD Full)


export const TRANSLATIONS: Record<string, any> = {
  pt: {
    themes: {
      game: 'Pac-Crypto',
      black: 'OLED Black',
      matrix: 'Matrix',
      neon: 'Cyberpunk',
      gold: 'Luxury Gold',
      sunset: 'Sunset',
      ocean: 'Ocean Deep',
      forest: 'Amazon Forest',
      purple: 'Royal Purple',
      dracula: 'SPACE INVADERS',
      tetris: 'TETRIS'
    },
    menu: {
      home: 'HOME',
      asset_tracking: 'RASTREIO DE ATIVOS',
      report: 'RELATÓRIO CRIPTO',
      themes: 'TEMAS',
      currency: 'MOEDA',
      logout: 'SAIR',
      menu_title: 'MENU',
      manage: 'GERENCIAR',
      premium_active: 'PREMIUM ATIVADO',
      be_premium: 'SEJA PREMIUM',
      settings: 'CONFIGURAÇÕES',
      profile: 'PERFIL',
      mobile_app: 'APP MOBILE',
      support: 'SUPORTE'
    },
    general: {
      total_balance: 'SALDO TOTAL',
      add_asset: 'NOVO ATIVO',
      edit_asset: 'EDITAR ATIVO',
      search_placeholder: 'PROCURAR...',
      quantity: 'Quantidade',
      price_paid: 'Preço Pago',
      confirm: 'CONFIRMAR',
      save_changes: 'SALVAR ALTERAÇÕES',
      cancel: 'CANCELAR',
      delete: 'EXCLUIR',
      edit: 'EDITAR',
      success_payment: 'Pagamento confirmado! Premium ativado com sucesso. 🚀',
      cancel_confirm: 'Tem certeza que deseja cancelar sua assinatura Premium?',
      subscription_canceled: 'Assinatura cancelada com sucesso.',
      premium_desc: 'Pagamento confirmado. Aproveite acesso ilimitado!',
      no_results: 'Nenhum resultado encontrado',
      limit_reached: 'LIMITE ATINGIDO'
    },
    auth: {
      login: 'Acessar Conta',
      register: 'Criar Conta',
      email: 'Endereço de E-mail',
      password: 'Senha',
      confirm_password: 'Confirmar Senha',
      forgot_password: 'Esqueceu sua senha?',
      back_to_login: '← Voltar para o Login',
      reset_password: 'Redefinir Senha',
      or_continue_with: 'Ou continue com',
      referral_code: 'Código de Indicação',
      secure_connection: 'CONEXÃO CRIPTOGRAFADA SEGURA'
    },
    landing: {
      hero_title: 'Pare de perder dinheiro em protocolos que você ',
      hero_highlight: 'esqueceu.',
      hero_desc: 'No mundo multi-chain, seu capital está espalhado em dezenas de redes. O CryptoFolio DeFi é a sua central de comando para integrar o invisível.',
      feature_1_title: 'Visibilidade Total',
      feature_1_desc: 'Enxergue seu patrimônio em uma única tela, da Ethereum à Hyperliquid.',
      feature_2_title: 'Memória Infalível',
      feature_2_desc: 'Nunca mais deixe airdrops ou yield farms moferem por esquecimento.'
    },
    allocation: {
      title: 'RASTREIO DE ATIVOS',
      total_missions: 'Total Missões',
      register_entry: 'REGISTRAR ENTRADA',
      choose_type: 'Escolha o Tipo',
      select: '-- SELECIONE --',
      protocol_name: 'Nome do Protocolo',
      connected_wallet: 'CARTEIRA LINKADA NO PROTOCOLO',
      confirm_deposit: 'CONFIRMAR DEPÓSITO',
      mission_inventory: 'INVENTÁRIO DE MISSÕES',
      no_active_missions: 'Nenhuma missão ativa',
      asset_qty: 'Ativo/Quant.',
      link_address: 'Endereço de Link',
      protocol_url: 'Site do Protocolo',
      go_to_site: 'IR AO SITE',
      delete_record: 'EXCLUIR REGISTRO',
      sector: 'SETOR',
      system_report: 'SISTEMA DE RELATÓRIO CRIPTO APP',
      retro_system: 'SISTEMA DE ALOCAÇÃO RETRÔ',
      operational: 'ESTADO: OPERACIONAL // AGUARDANDO INPUT',
      edit_qty: 'EDITAR QUANTIDADE',
      slots: 'SLOTS',
      categories: {
        'Pool de Liquidez': 'Pool de Liquidez',
        'Empréstimo': 'Empréstimo',
        'DeFi de Stable': 'DeFi de Stable',
        'Staker': 'Staker',
        'Corretoras': 'Corretoras',
        'Protocolos da Airdrop': 'Protocolos da Airdrop',
        'Prediction Market': 'Prediction Market',
        'PerpDex': 'PerpDex',
        'Outros': 'Outros'
      }
    },
    support: {
      title: 'SUPORTE AO CLIENTE',
      name: 'Nome',
      email: 'E-mail',
      message: 'Mensagem',
      send: 'ENVIAR MENSAGEM',
      placeholder_msg: 'Como podemos ajudar?',
      sent_msg: 'MENSAGEM ENVIADA COM SUCESSO! RESPONDEREMOS EM BREVE.'
    },
    referral: {
      title: 'INDIQUE UM AMIGO',
      description: 'Ganhe 1 MÊS VIP grátis!',
      share_msg: 'Indique amigos e ganhe 1 mês de acesso Premium para cada um que se tornar assinante. É win-win!',
      your_code: 'SEU CÓDIGO:',
      share_link: 'LINK DE CONVITE:',
      copy: 'COPIAR',
      copied: 'COPIADO!'
    }
  },
  en: {
    themes: {
      game: 'Pac-Crypto',
      black: 'OLED Black',
      matrix: 'Matrix',
      neon: 'Cyberpunk',
      gold: 'Luxury Gold',
      sunset: 'Sunset',
      ocean: 'Ocean Deep',
      forest: 'Amazon Forest',
      purple: 'Royal Purple',
      dracula: 'SPACE INVADERS',
      tetris: 'TETRIS'
    },
    menu: {
      home: 'HOME',
      asset_tracking: 'ASSET TRACKING',
      report: 'CRYPTO REPORT',
      themes: 'THEMES',
      currency: 'CURRENCY',
      logout: 'LOGOUT',
      menu_title: 'MENU',
      manage: 'MANAGE',
      premium_active: 'PREMIUM ACTIVE',
      be_premium: 'GO PREMIUM',
      settings: 'SETTINGS',
      profile: 'PROFILE',
      mobile_app: 'MOBILE APP',
      support: 'SUPPORT'
    },
    general: {
      total_balance: 'TOTAL BALANCE',
      add_asset: 'NEW ASSET',
      edit_asset: 'EDIT ASSET',
      search_placeholder: 'SEARCH...',
      quantity: 'Quantity',
      price_paid: 'Price Paid',
      confirm: 'CONFIRM',
      save_changes: 'SAVE CHANGES',
      cancel: 'CANCEL',
      delete: 'DELETE',
      edit: 'EDIT',
      success_payment: 'Payment confirmed! Premium activated successfully. 🚀',
      cancel_confirm: 'Are you sure you want to cancel your Premium subscription?',
      subscription_canceled: 'Subscription canceled successfully.',
      premium_desc: 'Payment confirmed. Enjoy unlimited access!',
      no_results: 'No results found',
      limit_reached: 'LIMIT REACHED'
    },
    auth: {
      login: 'Access Account',
      register: 'Create Account',
      email: 'Email Address',
      password: 'Password',
      confirm_password: 'Confirm Password',
      forgot_password: 'Forgot your password?',
      back_to_login: '← Back to Login',
      reset_password: 'Reset Password',
      or_continue_with: 'Or continue with',
      referral_code: 'Referral Code',
      secure_connection: 'SECURE ENCRYPTED CONNECTION'
    },
    landing: {
      hero_title: 'Stop losing money in protocols you ',
      hero_highlight: 'forgot.',
      hero_desc: 'In a multi-chain world, your capital is scattered across dozens of networks. CryptoFolio DeFi is your command center to integrate the invisible.',
      feature_1_title: 'Total Visibility',
      feature_1_desc: 'View your assets on a single screen, from Ethereum to Hyperliquid.',
      feature_2_title: 'Unfailing Memory',
      feature_2_desc: 'Never let airdrops or yield farms rot by forgetting again.'
    },
    allocation: {
      title: 'ASSET TRACKING',
      total_missions: 'Total Missions',
      register_entry: 'REGISTER ENTRY',
      choose_type: 'Choose Type',
      select: '-- SELECT --',
      protocol_name: 'Protocol Name',
      connected_wallet: 'WALLET LINKED TO PROTOCOL',
      confirm_deposit: 'CONFIRM DEPOSIT',
      mission_inventory: 'MISSION INVENTORY',
      no_active_missions: 'No active missions',
      asset_qty: 'Asset/Qty.',
      link_address: 'Link Address',
      protocol_url: 'Protocol Website',
      go_to_site: 'GO TO SITE',
      delete_record: 'DELETE RECORD',
      sector: 'SECTOR',
      system_report: 'CRYPTO APP REPORT SYSTEM',
      retro_system: 'RETRO ALLOCATION SYSTEM',
      operational: 'STATUS: OPERATIONAL // AWAITING INPUT',
      edit_qty: 'EDIT QUANTITY',
      slots: 'SLOTS',
      categories: {
        'Pool de Liquidez': 'Liquidity Pool',
        'Empréstimo': 'Lending',
        'DeFi de Stable': 'Stable DeFi',
        'Staker': 'Staker',
        'Corretoras': 'Exchanges',
        'Protocolos da Airdrop': 'Airdrop Protocols',
        'Prediction Market': 'Prediction Market',
        'PerpDex': 'PerpDex',
        'Outros': 'Others'
      }
    },
    referral: {
      title: 'REFER A FRIEND',
      description: 'Get 1 MONTH VIP for free!',
      share_msg: 'Refer friends and get 1 month of Premium access for each one who becomes a subscriber. It\'s win-win!',
      your_code: 'YOUR CODE:',
      share_link: 'INVITE LINK:',
      copy: 'COPY',
      copied: 'COPIED!'
    },
    support: {
      title: 'CUSTOMER SUPPORT',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'SEND MESSAGE',
      placeholder_msg: 'How can we help?',
      sent_msg: 'MESSAGE SENT SUCCESSFULLY! WE WILL REPLY SOON.'
    }
  }
};

export const THEME_STYLES: Record<AppTheme, ThemeStyle> = {
  black: {
    bg: 'bg-black',
    card: 'bg-neutral-900',
    text: 'text-white',
    subText: 'text-neutral-500',
    border: 'border-neutral-800',
    accent: 'bg-white',
    accentHover: 'hover:bg-neutral-200',
    accentText: 'text-black',
    iconColor: 'text-white',
    gradient: 'from-neutral-900 to-black'
  },
  game: {
    bg: 'bg-transparent',
    card: 'bg-black/60',
    text: 'text-yellow-400',
    subText: 'text-blue-500',
    border: 'border-blue-600',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-500',
    accentText: 'text-white',
    iconColor: 'text-yellow-400',
    gradient: 'from-black to-blue-900/40',
    specialEffect: 'font-arcade'
  },
  tetris: {
    bg: 'bg-black',
    card: 'bg-zinc-900/80',
    text: 'text-fuchsia-400',
    subText: 'text-cyan-400',
    border: 'border-fuchsia-500/50',
    accent: 'bg-cyan-500',
    accentHover: 'hover:bg-cyan-400',
    accentText: 'text-black',
    iconColor: 'text-yellow-400',
    gradient: 'from-black to-purple-900/20',
    specialEffect: 'font-arcade'
  },
  matrix: {
    bg: 'bg-black/80',
    card: 'bg-black/90',
    text: 'text-green-400',
    subText: 'text-green-900',
    border: 'border-green-600',
    accent: 'bg-green-700',
    accentHover: 'hover:bg-green-600',
    accentText: 'text-white',
    iconColor: 'text-green-500',
    gradient: 'from-black to-green-900/20'
  },
  neon: {
    bg: 'bg-slate-950/40',
    card: 'bg-slate-900/60',
    text: 'text-cyan-300',
    subText: 'text-fuchsia-400',
    border: 'border-cyan-500/30',
    accent: 'bg-fuchsia-600',
    accentHover: 'hover:bg-fuchsia-500',
    accentText: 'text-white',
    iconColor: 'text-cyan-400',
    gradient: 'from-cyan-900/20 to-fuchsia-900/20'
  },
  sunset: {
    bg: 'bg-orange-950/40',
    card: 'bg-orange-900/60',
    text: 'text-orange-50',
    subText: 'text-orange-400',
    border: 'border-orange-700/30',
    accent: 'bg-red-500',
    accentHover: 'hover:bg-red-600',
    accentText: 'text-white',
    iconColor: 'text-yellow-400',
    gradient: 'from-orange-600/20 to-red-900/40'
  },
  gold: {
    bg: 'bg-black/40',
    card: 'bg-neutral-900/60',
    text: 'text-amber-200',
    subText: 'text-amber-600',
    border: 'border-amber-500/20',
    accent: 'bg-amber-600',
    accentHover: 'hover:bg-amber-500',
    accentText: 'text-white',
    iconColor: 'text-amber-400',
    gradient: 'from-amber-400/10 to-amber-900/10'
  },
  ocean: {
    bg: 'bg-cyan-950/40',
    card: 'bg-cyan-900/50',
    text: 'text-cyan-50',
    subText: 'text-cyan-400',
    border: 'border-cyan-700/30',
    accent: 'bg-cyan-600',
    accentHover: 'hover:bg-cyan-500',
    accentText: 'text-white',
    iconColor: 'text-cyan-400',
    gradient: 'from-cyan-600/20 to-blue-900/40'
  },
  dracula: {
    bg: 'bg-black',
    card: 'bg-[#111111]/90',
    text: 'text-[#39ff14]',
    subText: 'text-[#0f0]',
    border: 'border-[#39ff14]',
    accent: 'bg-[#39ff14]',
    accentHover: 'hover:bg-[#32cd32]',
    accentText: 'text-black',
    iconColor: 'text-[#39ff14]',
    gradient: 'from-black to-[#051a05]',
    specialEffect: 'font-arcade'
  },
  forest: {
    bg: 'bg-green-950/40',
    card: 'bg-green-900/60',
    text: 'text-green-50',
    subText: 'text-green-400',
    border: 'border-green-700/30',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-500',
    accentText: 'text-white',
    iconColor: 'text-emerald-400',
    gradient: 'from-green-600/20 to-emerald-900/40'
  },
  blue: {
    bg: 'bg-slate-900',
    card: 'bg-slate-800',
    text: 'text-slate-100',
    subText: 'text-slate-400',
    border: 'border-slate-700',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    accentText: 'text-white',
    iconColor: 'text-blue-400',
    gradient: 'from-slate-800 to-slate-900'
  },
  purple: {
    bg: 'bg-purple-950/40',
    card: 'bg-purple-900/60',
    text: 'text-purple-50',
    subText: 'text-purple-400',
    border: 'border-purple-700/30',
    accent: 'bg-purple-600',
    accentHover: 'hover:bg-purple-500',
    accentText: 'text-white',
    iconColor: 'text-purple-400',
    gradient: 'from-purple-600/20 to-fuchsia-900/40'
  },
  white: {
    bg: 'bg-gray-50',
    card: 'bg-white',
    text: 'text-gray-900',
    subText: 'text-gray-500',
    border: 'border-gray-200',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    accentText: 'text-white',
    iconColor: 'text-blue-600',
    gradient: 'from-white to-gray-100'
  },
  yellow: {
    bg: 'bg-[#ca8a04]',
    card: 'bg-[#b47c03]',
    text: 'text-black',
    subText: 'text-black/60',
    border: 'border-black/20',
    accent: 'bg-black',
    accentHover: 'hover:bg-zinc-800',
    accentText: 'text-[#facc15]',
    iconColor: 'text-black',
    gradient: 'from-[#facc15]/40 to-[#ca8a04]/20'
  }
};

export const ADMIN_EMAILS = [
  'cryptofolio.defi@gmail.com'
];
