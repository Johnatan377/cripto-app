import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Brush } from 'recharts';
import { X, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { PortfolioData } from '../types';
import { fetchCoinHistory } from '../services/cryptoService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    coin: PortfolioData | null;
    currency: string;
}

// Custom Shape for Candlestick
const Candlestick = (props: any) => {
    const { x, y, width, height, low, high, open, close } = props;
    const isGrowing = close > open;
    const color = isGrowing ? '#22c55e' : '#ef4444'; // Green : Red
    const ratio = Math.abs(high - low) / height;

    // Calculate Wick Positions
    // Recharts passes 'y' as the top-most visual point (which corresponds to max value if inverted axis?)
    // Actually Recharts Y axis: 0 is bottom. But SVG coords: 0 is top.
    // We need to map values to pixels carefully or trust Recharts passed props.
    // Recharts Custom Shape for Bar passes x, y, width, height based on the "value" (usually top/bottom).
    // But for Candle we need O, H, L, C.
    // We will trick Recharts: Data Key = High. 
    // Custom Shape gets the Data Point.

    // Actually simpler:
    // Render a path drawing the wick line from High to Low.
    // Render a rect for the Body from Open to Close.
    // We need the scale helper.
    // BUT Recharts custom shape receives `payload` with the full data object!

    // NOTE: This is a simplified approach, for perfect scaling we need the Y-Scale function. 
    // Since we don't have easy access to scale in custom shape prop without wrapper,
    // We will assume a ComposedChart with ErrorBar might be easier, OR just simple Rects using absolute div logic? No, SVG.
    // Let's use the standard "trick":
    // We can't easily get the Y-coordinate of O/C/L inside the shape prop unless we pass them as [min, max] tuples to Bar?
    // Let's stick to a simpler approximation or use a library designed for this if Recharts struggles.
    // However, users do this in Recharts by passing [min, max] to Bar, and handling the rest.

    // BETTER APPROACH FOR RECHARTS CANDLESTICK:
    // Use <Bar dataKey="range" ... /> where range is [min, max]. 
    // But for Candle we have 4 points.
    // So standard practice is:
    // Draw Wick as a separate Line or ErrorBar.
    // Draw Body as the Bar [Open, Close].

    // Let's rely on constructing the data properly:
    // Body = [Math.min(open, close), Math.max(open, close)]
    // We will visualize "Body" using Bar.
    // We will visualize "Wick" using Scatter or ErrorBar? 
    // Or just draw the whole thing in one custom shape if we can access scales.
    // Since we can't easily access scales, let's try the [Open, Close] Bar + ErrorBar method?
    // Actually, let's use the `shape` prop which receives the `y` and `height` calculated by Recharts for the value passed to `dataKey`.
    // If we pass `dataKey="high"`, Recharts calculates Y for High.
    // If we pass `dataKey` as an array `[low, high]`, Recharts calculates Y and Height for that range. This is perfect for the Wick.
    // But we need the Body too.

    // PLAN:
    // 1. Bar Chart with dataKey="low" (invisible base? no)
    // Let's use `ComposedChart`.
    // Series A (Wick): Bar or ErrorBar for High-Low range.
    // Series B (Body): Bar for Open-Close range.

    // Wait, Recharts `Bar` accepts array `[min, max]`.
    // So:
    // <Bar dataKey="wickRange" shape={<WickShape />} />
    // <Bar dataKey="bodyRange" shape={<BodyShape />} />

    // Let's try to simplify. User wants specific "1D = 1 Candle".
    // Let's assume we use a ComposedChart.
    // We prepare data: 
    // bodyMin = min(open, close), bodyMax = max(open, close).
    // wickMin = low, wickMax = high.
    // But purely custom shape is cleaner if we can render it.

    return (
        <g stroke={color} fill={color} strokeWidth="2">
            {/* Wick */}
            <line x1={x + width / 2} y1={props.y_high} x2={x + width / 2} y2={props.y_low} />
            {/* Body */}
            <rect x={x} y={props.y_open} width={width} height={Math.abs(props.y_open - props.y_close)} fill={isGrowing ? 'none' : color} />
        </g>
    );
};
// Correction: The props `y_high` etc don't exist by default.
// We will simply use TWO Bars. One for wicks (thin), one for body (thick).
// Wick: [Low, High]
// Body: [Min(O,C), Max(O,C)]
// Color logic: determined by Open < Close.

const TIME_RANGES = ['1H', '4H', '1D', '1W'] as const;
type TimeRange = typeof TIME_RANGES[number];

const CoinDetailModal: React.FC<Props> = ({ isOpen, onClose, coin, currency }) => {
    if (!isOpen || !coin) return null;

    const [selectedRange, setSelectedRange] = useState<TimeRange>('1D');
    const [candleData, setCandleData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const currencySymbol = currency === 'brl' ? 'R$' : currency === 'eur' ? '€' : '$';

    useEffect(() => {
        if (coin) {
            loadHistory();
        }
    }, [coin, selectedRange]);

    const loadHistory = async () => {
        setLoading(true);
        const data = await fetchCoinHistory(coin.id, coin.symbol, selectedRange, currency);
        // Process data for Recharts [min, max] usage
        const processed = data.map((d: any) => ({
            ...d,
            // Ranges for Bar chart
            wick: [d.low, d.high],
            body: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
            isUp: d.close >= d.open,
            color: d.close >= d.open ? '#00ffa3' : '#ff0055' // Neon Green : Neon Red
        }));
        setCandleData(processed);
        setLoading(false);
    };

    const isProfit = coin.price_change_percentage_24h >= 0;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-6xl h-[90vh] bg-[#09090b] border border-white/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative text-white">

                {/* Close */}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 text-white">
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="p-8 pb-4 flex items-start justify-between bg-white/[0.02] border-b border-white/5">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            {coin.image && <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full ring-2 ring-white/10" />}
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-2">
                                    {coin.symbol} <span className="text-xs font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded">USDT</span>
                                </h2>
                                <span className="text-sm font-bold text-white/40">{coin.name}</span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-4 mt-2">
                            <span className={`text-5xl font-black tracking-tight ${isProfit ? 'text-[#00ffa3] drop-shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-[#ff0055] drop-shadow-[0_0_10px_rgba(255,0,85,0.3)]'}`}>
                                {currencySymbol}{coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </span>
                            <div className={`px-2 py-1 rounded text-sm font-black uppercase tracking-widest ${isProfit ? 'bg-[#00ffa3]/10 text-[#00ffa3]' : 'bg-[#ff0055]/10 text-[#ff0055]'}`}>
                                {isProfit ? '+' : ''}{Math.abs(coin.price_change_percentage_24h).toFixed(2)}% (24h)
                            </div>
                        </div>
                    </div>

                    {/* Instructions Hint */}
                    <div className="mt-2 text-right hidden md:block">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Interactive Chart</p>
                        <p className="text-[10px] text-white/20">Scroll to Zoom • Drag Bottom Bar</p>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 w-full relative p-6 flex flex-col bg-[#050505]">
                    {/* Controls */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-bold text-white/40 uppercase tracking-wide">Timeframe</span>
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                            {TIME_RANGES.map(range => (
                                <button
                                    key={range}
                                    onClick={() => setSelectedRange(range)}
                                    className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${selectedRange === range ? 'bg-[#00ffa3] text-black shadow-[0_0_10px_rgba(0,255,163,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-0 relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={48} className="animate-spin text-[#00ffa3]" />
                            </div>
                        ) : candleData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={candleData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        hide={true}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        orientation="right"
                                        tick={{ fontSize: 12, fill: '#888', fontWeight: 600 }}
                                        tickFormatter={(val) => val.toLocaleString('en-US')}
                                        axisLine={false}
                                        tickLine={false}
                                        width={60}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload;
                                                return (
                                                    <div className="bg-[#111] border border-white/20 p-4 rounded-xl shadow-2xl text-xs backdrop-blur-xl">
                                                        <p className="text-white/60 mb-2 font-bold uppercase tracking-wider border-b border-white/10 pb-2">{d.date}</p>
                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                                                            <span className="text-white/40 font-bold">OPEN</span> <span className="font-mono text-white text-right">{currencySymbol}{d.open.toLocaleString('en-US')}</span>
                                                            <span className="text-white/40 font-bold">HIGH</span> <span className="font-mono text-white text-right">{currencySymbol}{d.high.toLocaleString('en-US')}</span>
                                                            <span className="text-white/40 font-bold">LOW</span> <span className="font-mono text-white text-right">{currencySymbol}{d.low.toLocaleString('en-US')}</span>
                                                            <span className="text-white/40 font-bold">CLOSE</span> <span className={`font-mono text-right font-bold ${d.isUp ? 'text-[#00ffa3]' : 'text-[#ff0055]'}`}>{currencySymbol}{d.close.toLocaleString('en-US')}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    {/* Wicks Layer */}
                                    <Bar dataKey="wick" barSize={2} fill="#666" xAxisId={0} />
                                    {/* Body Layer */}
                                    <Bar
                                        dataKey="body"
                                        barSize={12}
                                        xAxisId={0}
                                        shape={(props: any) => {
                                            const { x, y, width, height, payload } = props;
                                            return (
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={height < 1 ? 1 : height}
                                                    fill={payload.color}
                                                    rx={1}
                                                />
                                            );
                                        }}
                                    />
                                    {/* Zoom Slider - Brighter & Zoomed In */}
                                    <Brush
                                        dataKey="date"
                                        height={40}
                                        stroke="#00ffa3"
                                        fill="#1a1a1a"
                                        tickFormatter={() => ""}
                                        alwaysShowText={false}
                                        travellerWidth={20}
                                        // Start zoomed in on the last 30 candles
                                        startIndex={Math.max(0, candleData.length - 30)}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm font-bold">
                                No data available
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CoinDetailModal;
