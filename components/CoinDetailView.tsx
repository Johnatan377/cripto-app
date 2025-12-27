import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { X, Loader2 } from 'lucide-react';
import { PortfolioData } from '../types';
import { fetchCoinHistory } from '../services/cryptoService';

interface Props {
    coin: PortfolioData | null;
    currency: string;
    onClose: () => void;
}

const TIME_RANGES = ['1H', '4H', '1D', '1W'] as const;
type TimeRange = typeof TIME_RANGES[number];

const CoinDetailView: React.FC<Props> = ({ coin, currency, onClose }) => {
    if (!coin) return null;

    const [selectedRange, setSelectedRange] = useState<TimeRange>('1D');
    const [candleData, setCandleData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [zoomState, setZoomState] = useState({ startIndex: 0, endIndex: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = React.useRef<{ x: number, startIndex: number, endIndex: number } | null>(null);
    const chartRef = React.useRef<HTMLDivElement>(null);

    const [yDomain, setYDomain] = useState<[number | 'auto', number | 'auto']>(['auto', 'auto']);
    const [isYDragging, setIsYDragging] = useState(false);
    const yDragStartRef = React.useRef<{ y: number, min: number, max: number } | null>(null);

    // Refs for Event Listeners to avoid stale closures
    const zoomStateRef = React.useRef(zoomState);
    const candleDataRef = React.useRef(candleData);

    useEffect(() => {
        zoomStateRef.current = zoomState;
        candleDataRef.current = candleData;
    }, [zoomState, candleData]);

    const currencySymbol = currency === 'brl' ? 'R$' : currency === 'eur' ? '€' : '$';

    useEffect(() => {
        if (coin) {
            loadHistory();
        }
    }, [coin, selectedRange]);

    const loadHistory = async () => {
        setLoading(true);
        const data = await fetchCoinHistory(coin.id, coin.symbol, selectedRange, currency);
        const processed = data.map((d: any) => ({
            ...d,
            wick: [d.low, d.high],
            body: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
            isUp: d.close >= d.open,
            color: d.close >= d.open ? '#00ffa3' : '#ff0055'
        }));
        setCandleData(processed);
        // Initialize Zoom - visualize last 30 candles
        setZoomState({
            startIndex: Math.max(0, processed.length - 30),
            endIndex: Math.max(0, processed.length - 1)
        });
        setYDomain(['auto', 'auto']); // Reset Y scale on new data
        setLoading(false);
    };

    const isProfit = coin.price_change_percentage_24h >= 0;

    // --- Interaction Handlers ---

    // --- Interaction Handlers ---

    // Manual Event Listener for Wheel to support non-passive prevention
    useEffect(() => {
        const node = chartRef.current;
        if (!node) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const dataLength = candleDataRef.current.length;
            if (dataLength === 0) return;

            const { startIndex, endIndex } = zoomStateRef.current;
            const currentLength = endIndex - startIndex;
            const zoomFactor = 0.1;
            const delta = Math.sign(e.deltaY) * Math.max(1, Math.floor(currentLength * zoomFactor));

            let newStart = startIndex - delta;
            let newEnd = endIndex + delta;

            // Constraint: Keep min 5 candles visible
            if (newEnd - newStart < 5) return;

            // Constraint: Bounds
            if (newStart < 0) newStart = 0;
            if (newEnd >= dataLength) newEnd = dataLength - 1;

            setZoomState({ startIndex: newStart, endIndex: newEnd });
        };

        node.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            node.removeEventListener('wheel', onWheel);
        };
    }, []);

    const handleDragStart = (clientX: number) => {
        if (isYDragging) return; // Don't conflict
        setIsDragging(true);
        dragStartRef.current = {
            x: clientX,
            startIndex: zoomState.startIndex,
            endIndex: zoomState.endIndex
        };
    };

    const handleDragMove = (clientX: number) => {
        if (isYDragging) return;
        if (!isDragging || !dragStartRef.current || !chartRef.current) return;

        const { x, startIndex, endIndex } = dragStartRef.current;
        const width = chartRef.current.clientWidth;
        const visibleCandles = endIndex - startIndex;

        // Calculate sensitivity - how many pixels move one candle?
        const pixelsPerCandle = width / visibleCandles;
        const moveX = x - clientX; // Drag left (positive move) should show later data (move window right)

        const candlesToMove = Math.round(moveX / pixelsPerCandle);

        let newStart = startIndex + candlesToMove;
        let newEnd = endIndex + candlesToMove;

        // Constraints
        const maxIndex = candleData.length - 1;
        if (newStart < 0) {
            newStart = 0;
            newEnd = visibleCandles;
        }
        if (newEnd > maxIndex) {
            newEnd = maxIndex;
            newStart = maxIndex - visibleCandles;
        }

        setZoomState({ startIndex: newStart, endIndex: newEnd });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        dragStartRef.current = null;
    };

    // --- Y-Axis Scaling Handlers ---

    const getVisibleMinMax = () => {
        const visibleData = candleData.slice(zoomState.startIndex, zoomState.endIndex + 1);
        if (visibleData.length === 0) return { min: 0, max: 100 };

        // Filter out 0 or bad data just in case
        const lows = visibleData.map(d => d.low).filter(v => v > 0);
        const highs = visibleData.map(d => d.high).filter(v => v > 0);

        if (lows.length === 0) return { min: 0, max: 100 };

        let min = Math.min(...lows);
        let max = Math.max(...highs);
        const padding = (max - min) * 0.1; // 10% padding for better look
        return { min: min - padding, max: max + padding };
    };

    const handleYDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        setIsYDragging(true);
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        // Determine current domain
        let currentMin = typeof yDomain[0] === 'number' ? yDomain[0] : 0;
        let currentMax = typeof yDomain[1] === 'number' ? yDomain[1] : 0;

        if (yDomain[0] === 'auto') {
            const { min, max } = getVisibleMinMax();
            currentMin = min;
            currentMax = max;
        }

        yDragStartRef.current = { y: clientY, min: currentMin, max: currentMax };
    };

    const handleYDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isYDragging || !yDragStartRef.current) return;
        e.stopPropagation();

        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const deltaY = yDragStartRef.current.y - clientY; // Drag up (positive) = ?

        // Logic: 
        // Drag Up (delta > 0) -> Zoom In (Range smaller). Drag Down (delta < 0) -> Zoom Out (Larger Range).

        const zoom = Math.exp(-deltaY * 0.005); // Exponential zoom feels more natural

        const center = (yDragStartRef.current.max + yDragStartRef.current.min) / 2;
        const originalHalfRange = (yDragStartRef.current.max - yDragStartRef.current.min) / 2;
        const newHalfRange = originalHalfRange * zoom;

        setYDomain([center - newHalfRange, center + newHalfRange]);
    };

    const handleYDragEnd = () => {
        setIsYDragging(false);
        yDragStartRef.current = null;
    };

    const resetYScale = () => {
        setYDomain(['auto', 'auto']);
    };

    return (
        <div className="w-full h-full min-h-[500px] bg-[#09090b] border border-white/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative text-white animate-in fade-in zoom-in-95 duration-300 select-none">

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
                <div className="mt-2 text-right hidden md:block opacity-50">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">PRO CHART</p>
                    <p className="text-[10px] text-white/20">🖱️ Drag Chart to Pan • 📜 Scroll to Zoom X</p>
                    <p className="text-[10px] text-white/20">↕️ Drag Price Scale to Zoom Y • Dbl Click to Reset</p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full relative p-6 flex flex-col bg-[#050505] overflow-hidden">
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

                <div
                    ref={chartRef}
                    className={`flex-1 w-full min-h-0 relative touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}

                    onMouseDown={(e) => handleDragStart(e.clientX)}
                    onMouseMove={(e) => {
                        handleDragMove(e.clientX);
                        handleYDragMove(e);
                    }}
                    onMouseUp={() => {
                        handleDragEnd();
                        handleYDragEnd();
                    }}
                    onMouseLeave={() => {
                        handleDragEnd();
                        handleYDragEnd();
                    }}
                    onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                    onTouchMove={(e) => {
                        handleDragMove(e.touches[0].clientX);
                        handleYDragMove(e);
                    }}
                    onTouchEnd={() => {
                        handleDragEnd();
                        handleYDragEnd();
                    }}
                >
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 size={48} className="animate-spin text-[#00ffa3]" />
                        </div>
                    ) : candleData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={candleData} margin={{ top: 10, right: 60, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        hide={true}
                                    />
                                    {/* Price Axis */}
                                    <YAxis
                                        domain={yDomain}
                                        orientation="right"
                                        tick={{ fontSize: 11, fill: '#666', fontWeight: 600, fontFamily: 'monospace' }}
                                        tickFormatter={(val) => val.toLocaleString('en-US')}
                                        axisLine={false}
                                        tickLine={false}
                                        width={60}
                                        yAxisId="price"
                                    />

                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length && !isDragging && !isYDragging) {
                                                const d = payload[0].payload;
                                                return (
                                                    <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-lg shadow-xl text-[10px] backdrop-blur-md z-50 pointer-events-none ring-1 ring-white/5">
                                                        <p className="text-white/40 mb-2 font-mono border-b border-white/5 pb-1">{d.date}</p>
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                                                            <span className="text-white/30">O</span> <span className={`${d.isUp ? 'text-[#00ffa3]' : 'text-[#ff0055]'}`}>{d.open.toLocaleString('en-US')}</span>
                                                            <span className="text-white/30">H</span> <span className={`${d.isUp ? 'text-[#00ffa3]' : 'text-[#ff0055]'}`}>{d.high.toLocaleString('en-US')}</span>
                                                            <span className="text-white/30">L</span> <span className={`${d.isUp ? 'text-[#00ffa3]' : 'text-[#ff0055]'}`}>{d.low.toLocaleString('en-US')}</span>
                                                            <span className="text-white/30">C</span> <span className={`${d.isUp ? 'text-[#00ffa3]' : 'text-[#ff0055]'}`}>{d.close.toLocaleString('en-US')}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />



                                    {/* Wicks Layer */}
                                    <Bar dataKey="wick" yAxisId="price" barSize={1} fill="#666" xAxisId={0} isAnimationActive={false} />

                                    {/* Body Layer */}
                                    <Bar
                                        dataKey="body"
                                        yAxisId="price"
                                        barSize={8}
                                        xAxisId={0}
                                        isAnimationActive={false}
                                        shape={(props: any) => {
                                            const { x, y, width, height, payload } = props;
                                            return (
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={height < 1 ? 1 : height}
                                                    fill={payload.color}
                                                    rx={0} // Sharp edges for pro look
                                                />
                                            );
                                        }}
                                    />

                                    {/* Controlled Brush */}
                                    <Brush
                                        dataKey="date"
                                        height={30}
                                        stroke="#333"
                                        fill="#000"
                                        tickFormatter={() => ""}
                                        travellerWidth={10}
                                        startIndex={zoomState.startIndex}
                                        endIndex={zoomState.endIndex}
                                        onChange={(range: any) => {
                                            if (range.startIndex !== undefined && range.endIndex !== undefined) {
                                                setZoomState({ startIndex: range.startIndex, endIndex: range.endIndex });
                                            }
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>

                            {/* Y-Axis Interaction Overlay */}
                            <div
                                className="absolute top-0 right-0 w-[60px] h-[calc(100%-30px)] z-30 cursor-ns-resize hover:bg-white/5 active:bg-white/10 transition-colors flex flex-col justify-between py-2 text-[10px] text-white/30 font-mono text-center select-none"
                                onMouseDown={handleYDragStart}
                                onDoubleClick={resetYScale}
                                onTouchStart={handleYDragStart}
                            >
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm font-bold">
                            No data available
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CoinDetailView;
