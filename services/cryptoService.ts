import { CoinSearchResult } from '../types';
import { TOP_COINS } from '../data/coins';
import { RUNES_COINS } from '../data/runes';

// APIs
const COIN_LIST_URL = 'https://api.coingecko.com/api/v3/coins/list?include_platform=false';
const CRYPTOCOMPARE_BASE_URL = 'https://min-api.cryptocompare.com/data';
const CRYPTOCOMPARE_IMAGE_BASE = 'https://www.cryptocompare.com';
const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest/dex';
const HYPERLIQUID_BASE_URL = 'https://api.hyperliquid.xyz/info';

// Cache key for the massive list
const CACHE_KEY = 'ALL_COINS_CACHE';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

let globalCoinList: any[] = [];
let hyperliquidMap: Record<string, any> = {};

// Initialize: Try to load from local storage or memory
const loadCoinList = async () => {
  if (globalCoinList.length > 0) return;

  let loadedData: any[] = [];
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        loadedData = data;
      }
    }
  } catch (e) {
    console.warn("Failed to load coin cache", e);
  }

  if (loadedData.length === 0) {
    try {
      const response = await fetch(COIN_LIST_URL);
      if (response.ok) {
        loadedData = await response.json();
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: loadedData }));
        } catch (e) { console.warn("Failed to save to localStorage", e); }
      } else {
        loadedData = TOP_COINS;
      }
    } catch (e) {
      loadedData = TOP_COINS;
    }
  }

  // Load Hyperliquid Coins (Dynamic)
  let hyperliquidCoins: any[] = [];
  try {
    const resp = await fetch(HYPERLIQUID_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'meta' })
    });
    const hlData = await resp.json();
    // Spot assets
    if (hlData && hlData.spotMeta && hlData.spotMeta.tokens) {
      hyperliquidCoins = hlData.spotMeta.tokens.map((t: any, index: number) => ({
        id: `hyp-${t.name}`, // Prefix to distinguish
        name: t.name,
        symbol: t.name,
        isHyperliquid: true,
        hlIndex: index // Store index if needed for price lookup
      }));
      // Save for pricing map
      hyperliquidCoins.forEach(c => hyperliquidMap[c.id] = c);
    }
  } catch (e) {
    console.warn("HL Fetch Fail", e);
  }

  // Merge: Runes -> Hyperliquid -> Global
  globalCoinList = [...RUNES_COINS, ...hyperliquidCoins, ...loadedData];
};

loadCoinList();

// Helper to check if string looks like a contract address
const isContractAddress = (query: string) => {
  // EVM (0x...) or Solana (Base58, usually 32-44 chars)
  return query.startsWith('0x') && query.length > 20 || (query.length > 30 && !query.includes(' '));
};

export const searchCoins = async (query: string, apiKey?: string): Promise<CoinSearchResult[]> => {
  const q = query.trim();
  const qLower = q.toLowerCase();

  // 1. Contract Address Search (DexScreener)
  if (isContractAddress(q)) {
    try {
      const response = await fetch(`${DEXSCREENER_BASE_URL}/tokens/${q}`);
      const data = await response.json();
      if (data.pairs && data.pairs.length > 0) {
        const bestPair = data.pairs.sort((a: any, b: any) => b.liquidity?.usd - a.liquidity?.usd)[0];
        return [{
          id: q,
          name: bestPair.baseToken.name,
          symbol: bestPair.baseToken.symbol,
          thumb: bestPair.info?.imageUrl || `https://assets.coincap.io/assets/icons/${bestPair.baseToken.symbol.toLowerCase()}@2x.png`
        }];
      }
    } catch (e) { console.error("DexScreener search failed", e); }
    return [];
  }

  // 2. Regular Text Search (Local Cache)
  if (globalCoinList.length === 0) await loadCoinList();

  // First, filter roughly to get candidates
  const candidates = globalCoinList.filter(c =>
    c.symbol.toLowerCase() === qLower ||
    c.name.toLowerCase().startsWith(qLower) ||
    c.id.toLowerCase() === qLower ||
    (qLower.length > 2 && c.name.toLowerCase().includes(qLower))
  );

  // Then, Sort by relevance
  const sorted = candidates.sort((a, b) => {
    const aSymbol = a.symbol.toLowerCase();
    const bSymbol = b.symbol.toLowerCase();
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aId = a.id.toLowerCase();
    const bId = b.id.toLowerCase();

    // 0. Hyperliquid Priority (if query is HYPE or similar)
    if (a.isHyperliquid && !b.isHyperliquid && aSymbol === qLower) return -1;
    if (!a.isHyperliquid && b.isHyperliquid && bSymbol === qLower) return 1;

    // 1. Exact Symbol Match (Winner)
    if (aSymbol === qLower && bSymbol !== qLower) return -1;
    if (bSymbol === qLower && aSymbol !== qLower) return 1;

    // 2. Exact ID Match 
    if (aId === qLower && bId !== qLower) return -1;
    if (bId === qLower && aId !== qLower) return 1;

    // 3. Exact Name Match
    if (aName === qLower && bName !== qLower) return -1;
    if (bName === qLower && aName !== qLower) return 1;

    // 4. Starts With Symbol (Better visual match)
    const aStartsSym = aSymbol.startsWith(qLower);
    const bStartsSym = bSymbol.startsWith(qLower);
    if (aStartsSym && !bStartsSym) return -1;
    if (!aStartsSym && bStartsSym) return 1;

    // 5. Shortest Symbol Length (Preference to "base" tickers over complex ones like "PENDLEWBTC")
    if (aSymbol.length !== bSymbol.length) return aSymbol.length - bSymbol.length;

    // 6. Shortest Name Length
    return aName.length - bName.length;
  });

  return sorted.slice(0, 50).map(coin => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    thumb: coin.isHyperliquid
      ? `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`
      : `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`
  }));
};

export const fetchMarketData = async (ids: string[], currency: string, apiKey?: string) => {
  const contractIds = ids.filter(id => isContractAddress(id));
  const hyperliquidIds = ids.filter(id => id.startsWith('hyp-'));
  const regularIds = ids.filter(id => !isContractAddress(id) && !id.startsWith('hyp-'));

  let results: any[] = [];

  // A. Fetch DexScreener Data (for contracts)
  if (contractIds.length > 0) {
    try {
      const dexPromises = contractIds.map(async (addr) => {
        try {
          const res = await fetch(`${DEXSCREENER_BASE_URL}/tokens/${addr}`);
          const data = await res.json();
          if (!data.pairs || data.pairs.length === 0) return null;
          const bestPair = data.pairs.sort((a: any, b: any) => b.liquidity?.usd - a.liquidity?.usd)[0];
          return {
            id: addr,
            name: bestPair.baseToken.name,
            symbol: bestPair.baseToken.symbol,
            image: bestPair.info?.imageUrl || `https://assets.coincap.io/assets/icons/${bestPair.baseToken.symbol.toLowerCase()}@2x.png`,
            current_price: parseFloat(bestPair.priceUsd),
            price_change_percentage_24h: bestPair.priceChange?.h24 || 0
          };
        } catch { return null; }
      });
      const dexResults = await Promise.all(dexPromises);
      results = [...results, ...dexResults.filter(r => r !== null)];
    } catch (e) {
      console.error("DexFetch Error", e);
    }
  }

  // B. Fetch Hyperliquid Data
  if (hyperliquidIds.length > 0) {
    try {
      // Fetch spot state
      const resp = await fetch(HYPERLIQUID_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'spotMetaAndAssetCtxs' })
      });
      const hlData = await resp.json();
      // hlData = [meta, assetCtxs]
      const spotTokens = hlData[0].tokens;
      const spotCtxs = hlData[1];

      hyperliquidIds.forEach(hid => {
        const coinMeta = hyperliquidMap[hid];
        if (coinMeta) {
          // specific logic to find price in ctxs
          // For simplified Hyperliquid, index maps to ctxs
          const ctx = spotCtxs[coinMeta.hlIndex];
          if (ctx) {
            results.push({
              id: hid,
              name: coinMeta.name,
              symbol: coinMeta.symbol,
              image: `https://assets.coincap.io/assets/icons/${coinMeta.symbol.toLowerCase()}@2x.png`,
              current_price: parseFloat(ctx.markPx),
              price_change_percentage_24h: 0 // HL API doesn't give clean 24h change in this endpoint simply
            });
          }
        }
      });

    } catch (e) { console.error("HL Price Error", e); }
  }

  // C. Fetch CryptoCompare Data (for regular IDs)
  if (regularIds.length > 0) {
    if (globalCoinList.length === 0) await loadCoinList();

    const uniqueIds = Array.from(new Set(regularIds));
    const symbolsToFetch: string[] = [];
    const idToSymbolMap: Record<string, string> = {};

    uniqueIds.forEach(id => {
      const coin = globalCoinList.find(c => c.id === id) || TOP_COINS.find(c => c.id === id);
      if (coin) {
        symbolsToFetch.push(coin.symbol);
        idToSymbolMap[id] = coin.symbol;
      } else {
        if (id.length <= 6) {
          symbolsToFetch.push(id.toUpperCase());
          idToSymbolMap[id] = id.toUpperCase();
        }
      }
    });

    if (symbolsToFetch.length > 0) {
      try {
        const fsyms = symbolsToFetch.join(',');
        const tsyms = currency.toUpperCase();

        const url = `${CRYPTOCOMPARE_BASE_URL}/pricemultifull?fsyms=${fsyms}&tsyms=${tsyms}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const marketResults = uniqueIds.map(id => {
            const symbol = idToSymbolMap[id] || id.toUpperCase();
            const symUpper = symbol.toUpperCase();

            let coinData = null;
            if (data.RAW && data.RAW[symUpper]) {
              coinData = data.RAW[symUpper][tsyms];
            }

            const meta = globalCoinList.find(c => c.id === id) || TOP_COINS.find(c => c.id === id) || { name: id, symbol: symbol };

            return {
              id: id,
              name: meta.name,
              symbol: meta.symbol,
              image: coinData && coinData.IMAGEURL ? `${CRYPTOCOMPARE_IMAGE_BASE}${coinData.IMAGEURL}` : `https://assets.coincap.io/assets/icons/${meta.symbol.toLowerCase()}@2x.png`,
              current_price: coinData ? coinData.PRICE : 0,
              price_change_percentage_24h: coinData ? coinData.CHANGEPCT24HOUR : 0
            };
          });
          results = [...results, ...marketResults];
        }
      } catch (e) { console.error("CryptoCompare Error", e); }
    }
  }

  return results;
};

// History Data Fetching with OHLC
export const fetchCoinHistory = async (id: string, symbol: string, range: '1H' | '4H' | '1D' | '1W', currency: string) => {
  const tsym = currency.toUpperCase();
  const fsym = symbol.toUpperCase();
  let limit = 100; // Default limit
  let aggregate = 1;
  let endpoint = 'histohour';

  // CryptoCompare logic
  switch (range) {
    case '1H':
      endpoint = 'histominute';
      limit = 2000; // Max limit to allow zooming out a bit, or 1440 for 24h
      aggregate = 1;
      break;
    case '4H':
      endpoint = 'histominute';
      limit = 2000;
      aggregate = 4; // 4 minute candles? No, user wants 4 Hour Candle if they select 4H?
      // Wait, standard convention: "1D" button usually means "1 Day Chart" where candles are maybe 1H or 15m.
      // BUT user said: "SE EU POR EM 4 HORAS. CADA VELA TEM Q SER DE 4 HORAS."
      // So Range = Candle Size.
      // IF Range = 4H, Candle = 4H.
      // We need enough data to scroll back.
      endpoint = 'histohour';
      aggregate = 4; // 1 data point per 4 hours
      limit = 2000; // 2000 * 4 hours = 8000 hours = ~333 days history
      break;
    case '1D':
      endpoint = 'histoday';
      limit = 2000; // 2000 days = ~5.5 years history. Good for "All" view.
      aggregate = 1;
      break;
    case '1W':
      endpoint = 'histoday';
      limit = 2000;
      aggregate = 7; // 1 data point per 7 days
      break;
  }

  try {
    const url = `${CRYPTOCOMPARE_BASE_URL}/v2/${endpoint}?fsym=${fsym}&tsym=${tsym}&limit=${limit}&aggregate=${aggregate}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.Response === 'Success') {
      return json.Data.Data.map((d: any) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volumeto,
        date: new Date(d.time * 1000).toLocaleString('en-US') // Optional format
      }));
    }
    return [];
  } catch (e) {
    console.error("History Fetch Error", e);
    return [];
  }
};
