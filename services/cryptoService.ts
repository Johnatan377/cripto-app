import { CoinSearchResult } from '../types';
import { TOP_COINS } from '../data/coins';
import { RUNES_COINS } from '../data/runes';

// APIs
const COIN_LIST_URL = 'https://api.coingecko.com/api/v3/coins/list?include_platform=false';
const CRYPTOCOMPARE_BASE_URL = 'https://min-api.cryptocompare.com/data';
const CRYPTOCOMPARE_IMAGE_BASE = 'https://www.cryptocompare.com';
const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com/latest/dex';
const HYPERLIQUID_BASE_URL = 'https://api.hyperliquid.xyz/info';

const isContractAddress = (query: string) => {
  return query.startsWith('0x') && query.length > 20 || (query.length > 30 && !query.includes(' '));
};

let hyperliquidMap: Record<string, any> = {};
const searchCache: Record<string, CoinSearchResult[]> = {};

const initHyperliquid = async () => {
    if (Object.keys(hyperliquidMap).length > 0) return;
    try {
        const resp = await fetch(HYPERLIQUID_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'spotMetaAndAssetCtxs' })
        });
        const hlData = await resp.json();
        if (hlData && Array.isArray(hlData) && hlData[0].tokens) {
            // Include HYPE specifically if it's there
            hlData[0].tokens.forEach((t: any) => {
                const id = `hyp-${t.name}`;
                hyperliquidMap[id] = { id, name: t.name, symbol: t.name, isHyperliquid: true };
            });
            // Also ensure 'HYPE' is explicitly in the map if found
            if (!hyperliquidMap['hyp-HYPE']) {
                 hyperliquidMap['hyp-HYPE'] = { id: 'hyp-HYPE', name: 'Hyperliquid', symbol: 'HYPE', isHyperliquid: true };
            }
        }
    } catch (e) { console.warn("HL Init Fail", e); }
};

export const searchCoins = async (query: string): Promise<CoinSearchResult[]> => {
  const q = query.trim();
  if (!q || q.length < 2) return [];
  const qLower = q.toLowerCase();

  // 1. Check Local Search Cache
  if (searchCache[qLower]) return searchCache[qLower];

  // 2. Contract Address Search (DexScreener)
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

  const localCandidates = [
    ...TOP_COINS,
    ...RUNES_COINS,
    ...Object.values(hyperliquidMap)
  ].filter((c: any) => 
    c.symbol.toLowerCase().startsWith(qLower) || 
    c.name.toLowerCase().startsWith(qLower) ||
    c.id.toLowerCase() === qLower ||
    c.id.toLowerCase() === `hyp-${qLower}`
  );

  // 4. Remote Search (CoinGecko Search API + DexScreener Name Search)
  let remoteResults: CoinSearchResult[] = [];
  try {
    const [cgRes, dexRes] = await Promise.allSettled([
      fetch(`https://api.coingecko.com/api/v3/search?query=${q}`).then(r => r.ok ? r.json() : { coins: [] }),
      fetch(`${DEXSCREENER_BASE_URL}/search?q=${q}`).then(r => r.ok ? r.json() : { pairs: [] })
    ]);

    if (cgRes.status === 'fulfilled') {
      const data = cgRes.value;
      remoteResults = [...remoteResults, ...(data.coins || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        thumb: c.large || c.thumb || `https://assets.coincap.io/assets/icons/${c.symbol.toLowerCase()}@2x.png`
      }))];
    }

    if (dexRes.status === 'fulfilled') {
      const data = dexRes.value;
      if (data.pairs && data.pairs.length > 0) {
        // Only take the best pair for each unique base token from DexScreener
        const seenTokens = new Set();
        const dexResults: CoinSearchResult[] = [];
        
        data.pairs.forEach((p: any) => {
          const addr = p.baseToken.address;
          if (!seenTokens.has(addr)) {
            seenTokens.add(addr);
            dexResults.push({
              id: addr, // Use contract address as ID for simple price fetching later
              name: p.baseToken.name,
              symbol: p.baseToken.symbol,
              thumb: p.info?.imageUrl || `https://assets.coincap.io/assets/icons/${p.baseToken.symbol.toLowerCase()}@2x.png`
            });
          }
        });
        remoteResults = [...remoteResults, ...dexResults.slice(0, 10)]; // Limit DexScreener results to top 10 pairs
      }
    }
  } catch (e) {
    console.warn("Remote search partial failure", e);
  }

  // 5. Merge and Deduplicate
  const merged = [...localCandidates.map(c => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    thumb: `https://assets.coincap.io/assets/icons/${c.symbol.toLowerCase()}@2x.png`
  })), ...remoteResults];

  const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
  
  // Sort: Symbols starting with q first, then exact matches, then HL
  const sorted = unique.sort((a, b) => {
    const aSym = a.symbol.toLowerCase();
    const bSym = b.symbol.toLowerCase();
    const aId = a.id.toLowerCase();
    const bId = b.id.toLowerCase();

    if (aSym === qLower && bSym !== qLower) return -1;
    if (bSym === qLower && aSym !== qLower) return 1;
    
    // Prioritize HL for specific HL queries
    if (aId.startsWith('hyp-') && !bId.startsWith('hyp-')) return -1;
    if (!aId.startsWith('hyp-') && bId.startsWith('hyp-')) return 1;

    if (aSym.startsWith(qLower) && !bSym.startsWith(qLower)) return -1;
    if (!aSym.startsWith(qLower) && bSym.startsWith(qLower)) return 1;
    return 0;
  });

  const finalResults = sorted.slice(0, 50);
  searchCache[qLower] = finalResults;
  return finalResults;
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

  // B. Fetch Hyperliquid Data (Using allMids for efficiency and reliability)
  if (hyperliquidIds.length > 0) {
    try {
      if (Object.keys(hyperliquidMap).length === 0) await initHyperliquid();
      
      const resp = await fetch(HYPERLIQUID_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'allMids' })
      });
      const mids = await resp.json();

      hyperliquidIds.forEach(hid => {
        const symbol = hid.replace('hyp-', '');
        // allMids usually has keys like "HYPE", "BTC", etc.
        const priceStr = mids[symbol];
        
        if (priceStr) {
          const coinMeta = hyperliquidMap[hid] || { name: symbol, symbol: symbol };
          results.push({
            id: hid,
            name: coinMeta.name,
            symbol: coinMeta.symbol,
            image: hid === 'hyp-HYPE' ? 'https://hyperliquid.xyz/favicon.ico' : `https://api.dicebear.com/7.x/identicon/svg?seed=${coinMeta.symbol}`,
            current_price: parseFloat(priceStr),
            price_change_percentage_24h: 0 
          });
        }
      });
    } catch (e) { console.error("HL Price Error", e); }
  }

  // C. Fetch CryptoCompare Data (for regular IDs)
  if (regularIds.length > 0) {
    if (Object.keys(hyperliquidMap).length === 0) await initHyperliquid();

    const uniqueIds = Array.from(new Set(regularIds));
    const symbolsToFetch: string[] = [];
    const idToSymbolMap: Record<string, string> = {};

    uniqueIds.forEach(id => {
      const coin = TOP_COINS.find(c => c.id === id) || RUNES_COINS.find(c => c.id === id);
      if (coin) {
        symbolsToFetch.push(coin.symbol);
        idToSymbolMap[id] = coin.symbol;
      } else {
        // Fallback for custom added coins or symbols
        const symbol = id.length <= 6 ? id.toUpperCase() : id;
        symbolsToFetch.push(symbol);
        idToSymbolMap[id] = symbol;
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

            const meta = TOP_COINS.find(c => c.id === id) || RUNES_COINS.find(c => c.id === id) || { name: id, symbol: symbol };

            return {
              id: id,
              name: meta.name,
              symbol: meta.symbol,
              image: coinData && coinData.IMAGEURL ? `${CRYPTOCOMPARE_IMAGE_BASE}${coinData.IMAGEURL}` : `https://api.dicebear.com/7.x/identicon/svg?seed=${meta.symbol}`,
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
