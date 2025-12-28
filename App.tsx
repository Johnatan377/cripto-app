
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus, RefreshCcw, Eye, EyeOff, Menu, X, Activity, Home, Coins, User, UserPlus, Trash2,
  TrendingUp, TrendingDown, Lock, Check, Loader2, DollarSign, Euro, Banknote, Palette, Bell, LogOut, Search,
  Zap, PieChart as PieChartIcon, BarChart3, Settings, Globe, FileText, LifeBuoy, Shield,
  Flame, Rocket, CheckCircle, AlertTriangle, Info, ShieldCheck, Heart, Star, MessageSquare, Smartphone,
  Users as UsersIcon, Copy, Trophy, Gift
} from 'lucide-react';
import {
  PortfolioItem, PortfolioData, UserSettings, LoadingState,
  CoinSearchResult, AppTheme, Alert, UserAccount, TickerAnnouncement
} from './types';
import { fetchMarketData, searchCoins } from './services/cryptoService';
import { canAddAlert, checkAlerts, playAlertSound, initAudio } from './services/alertService';
import { getSavedAccount, signOut, mapSupabaseUser, getUserProfile, syncUserProfile, saveUserPortfolio, loadUserPortfolio, getUserIdByReferralCode } from './services/authService';
import AlertManagerModal from './components/AlertManagerModal';
import { fetchTickerAnnouncements } from './services/tickerService';
// import { fetchSupportMessages } from './services/messageService';

import { INITIAL_PORTFOLIO_ITEMS, TRANSLATIONS, THEME_STYLES, STRIPE_PROMO_MONTHLY_LINK, STRIPE_FULL_PRICE_LINK, TICKER_COINS, ADMIN_EMAILS } from './constants';
import { supabase } from './services/supabaseClient';
import PortfolioPieChart from './components/PortfolioPieChart';
import AssetList from './components/AssetList';
import Modal from './components/Modal';
import { MissionLog } from './types';
import AllocationTypeView from './components/AllocationTypeView';
import LoginPage from './components/LoginPage';
import PremiumArcadeBanner from './components/PremiumArcadeBanner';
import ReferralInfoBanner from './components/ReferralInfoBanner';
import ChangePasswordModal from './components/ChangePasswordModal';
import CoinDetailView from './components/CoinDetailView';
import ReportView from './components/ReportView';
import AirdropScreen from './components/AirdropScreen';
import CoinDetailModal from './components/CoinDetailModal';
import SupportView from './components/SupportView';
import AdminView from './components/AdminView';


/** COMPONENTES DE FUNDO DINÂMICOS **/

const MatrixBackground = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const columns = Math.floor(width / 20);
    const drops = Array(columns).fill(1).map(() => Math.random() * -100); // Start above screen with offsets

    // Caracteres apenas números como solicitado
    const chars = '0123456789';

    const draw = () => {
      // Fundo semi-transparente para rastro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0F0'; // Verde Matrix
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        // Variação de cor para alguns caracteres (brilho)
        if (Math.random() > 0.98) {
          ctx.fillStyle = '#FFF';
        } else {
          ctx.fillStyle = '#0F0';
        }

        const x = i * 20;
        const y = drops[i] * 20;

        ctx.fillText(text, x, y);

        // Resetar gota ao chegar no fim da tela com aleatoriedade
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />;
};

const SpaceInvadersBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-black">
    {/* Twinkling Stars */}
    <div className="absolute inset-0" style={{
      backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px)',
      backgroundSize: '550px 550px, 350px 350px',
      backgroundPosition: '0 0, 40px 60px',
      opacity: 0.3
    }}></div>

    {/* Moving Invaders Grid */}
    <div className="absolute inset-0 flex flex-wrap justify-center content-start gap-8 pt-24 pb-10 px-10 opacity-30" style={{ animation: 'invader-move 5s infinite alternate ease-in-out' }}>
      {[...Array(30)].map((_, i) => {
        const colors = ['#f0abfc', '#22d3ee', '#facc15']; // Pink, Cyan, Yellow
        const color = colors[i % colors.length];
        const type = i % 3; // 3 different shapes

        return (
          <svg key={i} width="35" height="35" viewBox="0 0 12 8" className="animate-pulse" style={{ fill: color, animationDelay: `${i * 0.1}s` }}>
            {type === 0 && ( // Octopus (Existing)
              <>
                <rect x="2" y="0" width="1" height="1" /><rect x="8" y="0" width="1" height="1" />
                <rect x="3" y="1" width="1" height="1" /><rect x="7" y="1" width="1" height="1" />
                <rect x="2" y="2" width="7" height="1" />
                <rect x="1" y="3" width="2" height="1" /><rect x="4" y="3" width="3" height="1" /><rect x="8" y="3" width="2" height="1" />
                <rect x="0" y="4" width="11" height="1" />
                <rect x="0" y="5" width="1" height="1" /><rect x="2" y="5" width="7" height="1" /><rect x="10" y="5" width="1" height="1" />
                <rect x="0" y="6" width="1" height="1" /><rect x="2" y="6" width="1" height="1" /><rect x="8" y="6" width="1" height="1" /><rect x="10" y="6" width="1" height="1" />
                <rect x="3" y="7" width="2" height="1" /><rect x="6" y="7" width="2" height="1" />
              </>
            )}
            {type === 1 && ( // Squid (Taller)
              <>
                <rect x="4" y="0" width="3" height="1" />
                <rect x="1" y="1" width="9" height="1" />
                <rect x="0" y="2" width="11" height="1" />
                <rect x="0" y="3" width="3" height="1" /><rect x="5" y="3" width="1" height="1" /><rect x="8" y="3" width="3" height="1" />
                <rect x="0" y="4" width="11" height="1" />
                <rect x="2" y="5" width="1" height="1" /><rect x="4" y="5" width="3" height="1" /><rect x="8" y="5" width="1" height="1" />
                <rect x="1" y="6" width="1" height="1" /><rect x="9" y="6" width="1" height="1" />
                <rect x="2" y="7" width="1" height="1" /><rect x="8" y="7" width="1" height="1" />
              </>
            )}
            {type === 2 && ( // Crab (Wider)
              <>
                <rect x="1" y="0" width="2" height="1" /><rect x="8" y="0" width="2" height="1" />
                <rect x="2" y="1" width="7" height="1" />
                <rect x="1" y="2" width="9" height="1" />
                <rect x="0" y="3" width="2" height="1" /><rect x="3" y="3" width="5" height="1" /><rect x="9" y="3" width="2" height="1" />
                <rect x="0" y="4" width="11" height="1" />
                <rect x="2" y="5" width="7" height="1" />
                <rect x="1" y="6" width="1" height="1" /><rect x="9" y="6" width="1" height="1" />
                <rect x="0" y="7" width="1" height="1" /><rect x="10" y="7" width="1" height="1" />
              </>
            )}
          </svg>
        );
      })}
    </div>

    {/* Spaceship and Projectile - Bottom Section */}
    <div className="absolute bottom-10 -translate-x-1/2 flex flex-col items-center opacity-80 z-0 scale-75 sm:scale-100" style={{ animation: 'ship-patrol 4s infinite alternate ease-in-out' }}>
      {/* Projectile (Shooting Up) */}
      <div className="w-[4px] h-[12px] bg-[#39ff14] mb-2 opacity-0" style={{ animation: 'shoot 0.8s infinite linear', boxShadow: '0 0 4px #39ff14' }}></div>

      {/* Spaceship SVG */}
      <svg width="60" height="40" viewBox="0 0 13 8" className="fill-[#39ff14]" style={{ filter: 'drop-shadow(0 0 3px #39ff14)' }}>
        <rect x="6" y="0" width="1" height="1" />
        <rect x="5" y="1" width="3" height="1" />
        <rect x="5" y="2" width="3" height="1" />
        <rect x="1" y="3" width="11" height="1" />
        <rect x="0" y="4" width="13" height="1" />
        <rect x="0" y="5" width="13" height="1" />
        <rect x="0" y="6" width="13" height="1" />
        <rect x="0" y="7" width="13" height="1" />
      </svg>
    </div>

    <style>{`
        @keyframes invader-move {
            0% { transform: translateX(-10px); }
            100% { transform: translateX(10px); }
        }
        @keyframes shoot {
            0% { transform: translateY(0); opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translateY(-600px); opacity: 0; }
        }
        @keyframes ship-patrol {
            0% { left: 20%; }
            100% { left: 80%; }
        }
    `}</style>
  </div >
);

const TetrisBackground = () => {
  // Tetromino definitions
  const shapes = [
    { color: '#00f0f0', path: 'M0 0h4v1h-4z' }, // I (Cyan)
    { color: '#f0f000', path: 'M0 0h2v2h-2z' }, // O (Yellow)
    { color: '#a000f0', path: 'M1 0h1v1h1v1h-3v-1h1z' }, // T (Purple)
    { color: '#00f000', path: 'M1 0h2v1h-1v1h-2v-1h1z' }, // S (Green)
    { color: '#f00000', path: 'M0 0h2v1h1v1h-2v-1h-1z' }, // Z (Red)
    { color: '#0000f0', path: 'M0 0h1v2h2v1h-3z' }, // J (Blue)
    { color: '#f0a000', path: 'M2 0h1v3h-3v-1h2z' }  // L (Orange)
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-black">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      {/* Falling Tetrominoes */}
      {shapes.map((shape, i) => (
        <div key={i} className="absolute top-[-100px] opacity-20" style={{
          left: `${(i + 1) * 12}%`,
          animation: `tetris-fall ${20 + i * 2}s infinite linear`,
          animationDelay: `-${i * 5}s`
        }}>
          <svg width="60" height="60" viewBox="0 0 4 4" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
            <path d={shape.path} fill={shape.color} />
          </svg>
        </div>
      ))}

      {/* More Random Pieces */}
      {shapes.map((shape, i) => (
        <div key={`extra-${i}`} className="absolute top-[-100px] opacity-10" style={{
          left: `${(i) * 14 + 5}%`,
          animation: `tetris-fall-rotate ${25 + i * 3}s infinite linear`,
          animationDelay: `-${i * 6 + 7}s`
        }}>
          <svg width="50" height="50" viewBox="0 0 4 4">
            <path d={shape.path} fill={shape.color} />
          </svg>
        </div>
      ))}

      <style>{`
            @keyframes tetris-fall {
                0% { transform: translateY(-100px); }
                100% { transform: translateY(110vh); }
            }
            @keyframes tetris-fall-rotate {
                0% { transform: translateY(-100px) rotate(0deg); }
                50% { transform: translateY(50vh) rotate(180deg); }
                100% { transform: translateY(110vh) rotate(360deg); }
            }
         `}</style>
    </div>
  );
};

const GameBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-black">
    <div className="absolute inset-0 opacity-[0.6] hidden" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='224' height='400' viewBox='0 0 224 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle%3E .wall %7B fill: none; stroke: %234040ff; stroke-width: 4; stroke-linecap: round; %7D .pellet %7B stroke: %23F3BA2F; stroke-width: 4; stroke-dasharray: 0 16; stroke-linecap: round; fill: none; %7D %3C/style%3E%3C/defs%3E%3C!-- Full Screen Container Walls --%3E%3Cpath class='wall' d='M0 0 H224 V400 H0 Z M1 1 V399 H223 V1 H1 Z' stroke='none' fill='none' /%3E%3C!-- Extended Top Section --%3E%3Cpath class='wall' d='M24 20 H99 V40 H24 Z M125 20 H200 V40 H125 Z' /%3E%3C!-- Classic Maze Centered (Using transform) --%3E%3Cg transform='translate(0, 56)'%3E%3C!-- Main Outer Walls --%3E%3Cpath class='wall' d='M109 10 H115 V45 H109 Z M2 0 V98 H45 V52 H24 V24 H99 V45 H125 V24 H200 V52 H179 V98 H222 0' /%3E%3C!-- Inner Shapes --%3E%3Cpath class='wall' d='M24 64 H45 V85 H24 Z M64 64 H85 V125 H64 Z M139 64 H160 V125 H139 Z M179 64 H200 V85 H179 Z M99 64 H125 V85 H99 Z' /%3E%3Cpath class='wall' d='M2 110 H45 V160 H24 V177 H2 V110 Z M179 110 H222 V177 H200 V160 H179 V110 Z' /%3E%3Cpath class='wall' d='M85 110 H139 V160 H85 Z' /%3E%3Cpath class='wall' d='M24 189 H45 V227 H24 Z M179 189 H200 V227 H179 Z M64 189 H160 V205 H64 Z' /%3E%3Cpath class='wall' d='M2 239 V288 H222 V239 H215 V255 H200 V239 H179 V255 H160 V221 H139 V255 H85 V221 H64 V255 H45 V239 H24 V255 H9 V239 H2 Z' /%3E%3C/g%3E%3C!-- Extended Bottom Section --%3E%3Cpath class='wall' d='M24 360 H99 V380 H24 Z M125 360 H200 V380 H125 Z' /%3E%3C!-- DOT TRAILS (Pellets) --%3E%3Cpath class='pellet' d='M12 12 H212' /%3E%3Cpath class='pellet' d='M12 390 H212' /%3E%3Cpath class='pellet' d='M12 20 V380' /%3E%3Cpath class='pellet' d='M212 20 V380' /%3E%3Cpath class='pellet' d='M60 200 H164' /%3E%3C/svg%3E")`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      filter: 'drop-shadow(0 0 8px #4040ff)'
    }}></div>

    {/* Pac-Man (Yellow with Black Eye) */}
    <div className="absolute z-20" style={{
      width: '64px', height: '64px',
      animation: 'complex-patrol 120s infinite linear',
      left: '0', top: '0',
      willChange: 'left, top'
    }}>
      <div className="w-full h-full relative" style={{ animation: 'face-dir-complex 120s infinite step-end' }}>
        <div className="relative w-full h-full filter drop-shadow-[0_0_8px_rgba(247,147,26,0.8)]">
          <div className="absolute top-0 left-0 w-full h-[50%] overflow-hidden origin-bottom" style={{ animation: 'chomp-top 0.2s infinite alternate ease-in-out' }}>
            <div className="w-full h-[200%] bg-[#F7931A] rounded-full absolute top-0"></div>
          </div>
          <div className="absolute top-[50%] left-0 w-full h-[50%] overflow-hidden origin-top" style={{ animation: 'chomp-bottom 0.2s infinite alternate ease-in-out' }}>
            <div className="w-full h-[200%] bg-[#F7931A] rounded-full absolute top-[-100%]"></div>
          </div>
          {/* Black Eye */}
          <div className="absolute top-[15%] right-[25%] w-[8px] h-[8px] bg-black rounded-full z-20"></div>
        </div>
      </div>
    </div>

    {/* GHOSTS - ALWAYS UPRIGHT (No Rotation) */}

    {/* 1. Blue Ghost */}
    <div className="absolute z-10" style={{ width: '64px', height: '64px', animation: 'complex-patrol 120s infinite linear', animationDelay: '-115s', left: '0', top: '0' }}>
      <div className="w-full h-full relative p-1">
        <div className="w-full h-full bg-[#3B82F6] rounded-t-[50%] relative shadow-[0_0_10px_#3B82F6]" style={{ clipPath: 'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%, 83.33% 85%, 66.66% 100%, 50% 85%, 33.33% 100%, 16.66% 85%)' }}>
          <div className="absolute top-[18%] left-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
          <div className="absolute top-[18%] right-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
        </div>
      </div>
    </div>

    {/* 2. Red Ghost */}
    <div className="absolute z-10" style={{ width: '64px', height: '64px', animation: 'complex-patrol 120s infinite linear', animationDelay: '-105s', left: '0', top: '0' }}>
      <div className="w-full h-full relative p-1">
        <div className="w-full h-full bg-[#ef233c] rounded-t-[50%] relative shadow-[0_0_10px_#ef233c]" style={{ clipPath: 'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%, 83.33% 85%, 66.66% 100%, 50% 85%, 33.33% 100%, 16.66% 85%)' }}>
          <div className="absolute top-[18%] left-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
          <div className="absolute top-[18%] right-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
        </div>
      </div>
    </div>

    {/* 3. Yellow Ghost */}
    <div className="absolute z-10" style={{ width: '64px', height: '64px', animation: 'complex-patrol 120s infinite linear', animationDelay: '-95s', left: '0', top: '0' }}>
      <div className="w-full h-full relative p-1">
        <div className="w-full h-full bg-[#F3BA2F] rounded-t-[50%] relative shadow-[0_0_10px_#F3BA2F]" style={{ clipPath: 'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%, 83.33% 85%, 66.66% 100%, 50% 85%, 33.33% 100%, 16.66% 85%)' }}>
          <div className="absolute top-[18%] left-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
          <div className="absolute top-[18%] right-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
        </div>
      </div>
    </div>

    {/* 4. Purple Ghost */}
    <div className="absolute z-10" style={{ width: '64px', height: '64px', animation: 'complex-patrol 120s infinite linear', animationDelay: '-85s', left: '0', top: '0' }}>
      <div className="w-full h-full relative p-1">
        <div className="w-full h-full bg-[#A855F7] rounded-t-[50%] relative shadow-[0_0_10px_#A855F7]" style={{ clipPath: 'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%, 83.33% 85%, 66.66% 100%, 50% 85%, 33.33% 100%, 16.66% 85%)' }}>
          <div className="absolute top-[18%] left-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
          <div className="absolute top-[18%] right-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
        </div>
      </div>
    </div>

    {/* 5. Green Ghost */}
    <div className="absolute z-10" style={{ width: '64px', height: '64px', animation: 'complex-patrol 120s infinite linear', animationDelay: '-75s', left: '0', top: '0' }}>
      <div className="w-full h-full relative p-1">
        <div className="w-full h-full bg-[#22c55e] rounded-t-[50%] relative shadow-[0_0_10px_#22c55e]" style={{ clipPath: 'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%, 83.33% 85%, 66.66% 100%, 50% 85%, 33.33% 100%, 16.66% 85%)' }}>
          <div className="absolute top-[18%] left-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
          <div className="absolute top-[18%] right-[20%] w-[12px] h-[12px] bg-white rounded-full z-20 shadow-sm"><div className="w-[6px] h-[6px] bg-blue-900 rounded-full absolute top-[30%] right-[1px]"></div></div>
        </div>
      </div>
    </div>

    <style>{`
      /* Complex Patrol Path: Winding 9:16 Route */
      @keyframes complex-patrol {
        0%   { left: 5%; top: 15%; }             /* Start Top-Left (Lower) */
        10%  { left: 75%; top: 15%; }            /* Top-Right (Lower) */
        20%  { left: 75%; top: 35%; }           /* Down Right */
        30%  { left: 20%; top: 35%; }           /* Across Mid-Top */
        40%  { left: 20%; top: 60%; }           /* Down Left */
        50%  { left: 75%; top: 60%; }           /* Across Mid-Bot */
        60%  { left: 75%; top: 90%; }           /* Down Right (Bot) */
        70%  { left: 5%; top: 90%; }            /* Bottom-Left */
        80%  { left: 5%; top: 45%; }            /* Up Left */
        90%  { left: 40%; top: 45%; }           /* Center */
        95%  { left: 40%; top: 15%; }            /* Up Center (Lower) */
        100% { left: 5%; top: 15%; }             /* Back to Start (Lower) */
      }

      /* Facing Directions for Pac-Man ONLY */
      /* Facing Directions for Pac-Man ONLY */
      @keyframes face-dir-complex {
        0%   { transform: rotate(0deg); }    /* R */
        10%  { transform: rotate(90deg); }   /* D */
        20%  { transform: scaleX(-1); }      /* L (Mirrored instead of rotated 180deg) */
        30%  { transform: rotate(90deg); }   /* D */
        40%  { transform: rotate(0deg); }    /* R */
        50%  { transform: rotate(90deg); }   /* D */
        60%  { transform: scaleX(-1); }      /* L */
        70%  { transform: rotate(-90deg); }  /* U */
        80%  { transform: rotate(0deg); }    /* R */
        90%  { transform: rotate(-90deg); }  /* U */
        95%  { transform: scaleX(-1); }      /* L */
        100% { transform: scaleX(-1); }      /* L */
      }

      /* Counter Rotation for Pac-Man's 'B' */
      @keyframes counter-rotate-complex {
        0%   { transform: rotate(0deg); }
        10%  { transform: rotate(-90deg); }
        20%  { transform: rotate(-180deg); }
        30%  { transform: rotate(-90deg); }
        40%  { transform: rotate(0deg); }
        50%  { transform: rotate(-90deg); }
        60%  { transform: rotate(-180deg); }
        70%  { transform: rotate(90deg); }
        80%  { transform: rotate(0deg); }
        90%  { transform: rotate(90deg); }
        95%  { transform: rotate(-180deg); }
        100% { transform: rotate(-180deg); }
      }

      @keyframes chomp-top {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(-30deg); }
      }
      @keyframes chomp-bottom {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(30deg); }
      }
    `}</style>
  </div >
);

const NeonBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.1] z-0">
    <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-cyan-500 rounded-full blur-[120px] animate-pulse"></div>
    <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
  </div>
);





/** COMPONENTE PRINCIPAL **/

const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  let cleaned = value.trim().replace(/\s/g, '');
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts[parts.length - 1].length === 3) cleaned = cleaned.replace(/\./g, '');
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const ManageSubscriptionModal = ({ isOpen, onClose, onCancelSubscription }: { isOpen: boolean, onClose: () => void, onCancelSubscription: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handlePortal = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error("Sessão inválida. Faça login novamente.");

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Url não encontrada');
      }
    } catch (err: any) {
      console.error('Portal Error:', err);
      alert('Erro ao abrir portal: ' + (err.message || 'Tente novamente.'));
      // Fallback manual se falhar (ex: webhook não salvou ID ainda)
      if (confirm('Não foi possível abrir o portal automático. Deseja cancelar manualmente apenas no App? (A cobrança deve ser cancelada na Stripe separadamente)')) {
        onCancelSubscription();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Zap size={20} className="text-green-500 fill-green-500" /> ASSINATURA</h2>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-green-400 font-bold uppercase">Status</span>
            <span className="bg-green-500 text-black text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Ativo</span>
          </div>
          <p className="text-[10px] text-green-300/70">
            Você tem acesso total a todos os recursos.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePortal}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
            GERENCIAR ASSINATURA
          </button>

          <p className="text-[8px] text-white/30 text-center px-4">
            Você será redirecionado para o portal seguro da Stripe para gerenciar cobranças e cancelamentos.
          </p>
        </div>
      </div>
    </div>
  );
};

const formatTickerPrice = (price: number) => {
  if (!price) return '0.00';
  if (price >= 100) {
    return Math.round(price).toLocaleString('en-US');
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const XLogo = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TickerIcon = ({ name, size = 16 }: { name: string; size?: number }) => {
  switch (name) {
    case 'fire': return <Flame size={size} />;
    case 'rocket': return <Rocket size={size} />;
    case 'bell': return <Bell size={size} />;
    case 'check': return <CheckCircle size={size} />;
    case 'zap': return <Zap size={size} />;
    case 'alert': return <AlertTriangle size={size} />;
    case 'info': return <Info size={size} />;
    case 'shield': return <ShieldCheck size={size} />;
    case 'heart': return <Heart size={size} />;
    case 'star': return <Star size={size} />;
    default: return null;
  }
};

const App: React.FC = () => {
  const [tickerData, setTickerData] = useState<any[]>([]);

  // Carregar dados do Ticker
  useEffect(() => {
    const loadTicker = async () => {
      try {
        const data = await fetchMarketData(TICKER_COINS, 'usd');
        // Ordenar conforme ordem solicitada, se necessário, ou usar a ordem que vier
        // fetchMarketData pode não garantir ordem. Reordenar para garantir consistência.
        const orderMap = TICKER_COINS.reduce((acc, id, index) => { acc[id] = index; return acc; }, {} as Record<string, number>);
        // Ajuste para ids que podem vir diferentes
        // Simplesmente setamos o data.
        setTickerData(data);
      } catch (e) {
        console.error("Ticker fetch error", e);
      }
    };
    loadTicker();
    // Refresh ticker every 60s
    const interval = setInterval(loadTicker, 60000);
    return () => clearInterval(interval);
  }, []);

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('settings');
    const defaults: UserSettings = {
      coinGeckoApiKey: '', currency: 'usd', theme: 'black', language: 'en', privacyMode: false, tier: 'free'
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  // Track settings in a ref for use in non-reactive initialization logic
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);



  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const userAccountRef = useRef<UserAccount | null>(null);
  useEffect(() => { userAccountRef.current = userAccount; }, [userAccount]);

  const lastSyncHash = useRef<string>("");
  const isCloudSyncInitDone = useRef<boolean>(false);
  const lastLocalChange = useRef<number>(0);


  // Consolidate Cloud Data Initialization
  const initializeCloudData = useCallback(async (userId: string, session: any) => {
    // Reset sync lock for this user
    isCloudSyncInitDone.current = false;

    try {
      console.log("[Sync] Initializing cloud data for:", userId);

      const [portfolioData, profileData] = await Promise.all([
        loadUserPortfolio(userId),
        getUserProfile(userId)
      ]);

      if (portfolioData) {
        // 1. Update reference hash BEFORE updating state to block the "save back" effect
        lastSyncHash.current = JSON.stringify({
          portfolioItems: portfolioData.portfolio || [],
          allocationLogs: portfolioData.allocations || [],
          alerts: portfolioData.alerts || []
        });

        // 2. Set states
        if (portfolioData.portfolio) setPortfolioItems(portfolioData.portfolio);
        if (portfolioData.allocations) {
          setAllocationLogs(portfolioData.allocations);
          localStorage.setItem('allocation_mission_logs', JSON.stringify(portfolioData.allocations));
        }
        if (portfolioData.alerts) {
          setAlerts(portfolioData.alerts);
          localStorage.setItem('alerts', JSON.stringify(portfolioData.alerts));
        }
      }

      if (profileData) {
        // SECURITY: Ensure Admin status for whitelisted emails is enforced on every login
        const email = session.user.email;
        const isAdminEmail = email && ADMIN_EMAILS.includes(email.toLowerCase());
        let currentRole = profileData.role || 'user';

        if (isAdminEmail && currentRole !== 'admin') {
          console.log(`[Auth] Enforcing Admin status for ${email}`);
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
          currentRole = 'admin';
        }

        // Sync Account State
        setUserAccount(prev => prev ? { ...prev, role: currentRole } : null);

        // Consolidate settings merge
        let referrerId: string | null = null;
        const currentSettings = settingsRef.current;
        const mergedSettings = {
          ...currentSettings,
          // Critical: Always prefer Cloud Tier if valid, otherwise keep existing (don't default to Free easily)
          tier: (profileData.tier && profileData.tier !== 'free') ? profileData.tier : currentSettings.tier,
          theme: profileData.theme || currentSettings.theme,
          currency: profileData.currency || currentSettings.currency,
          language: profileData.language || currentSettings.language,
          referred_by: profileData.referred_by || currentSettings.referred_by,
          referral_code: profileData.referral_code || currentSettings.referral_code
        };

        setSettings(mergedSettings);
        localStorage.setItem('settings', JSON.stringify(mergedSettings));

        // Handle Referral Logic (only if missing in DB)
        const storedRefCode = typeof window !== 'undefined' ? sessionStorage.getItem('referral_code') : null;
        const metaRefCode = session.user.user_metadata?.referral_code_input;
        const hasReferralInput = !!(metaRefCode || storedRefCode);

        // Only write back to DB (syncUserProfile) if we actually have new referral info to save
        // OR if we merged something critical that was missing locally
        if ((!profileData.referral_code) || (!profileData.referred_by && hasReferralInput)) {

          if (!referrerId && storedRefCode) {
            const id = await getUserIdByReferralCode(storedRefCode);
            if (id) { referrerId = id; sessionStorage.removeItem('referral_code'); }
          }
          if (!referrerId && metaRefCode) {
            const id = await getUserIdByReferralCode(metaRefCode);
            if (id) referrerId = id;
          }

          // Update the object with potentially new referrer
          mergedSettings.referred_by = referrerId || mergedSettings.referred_by;

          await syncUserProfile(userId, mergedSettings, session.user.email, profileData.role || 'user');
          setSettings(mergedSettings); // Update again to be safe
        }

        // FIX: Ensure Referral Code Exists (Self-Healing) - DB fallback
        if (!mergedSettings.referral_code) {
          console.log("[Sync] Generating missing referral code...");
          const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();

          await supabase.from('profiles').update({ referral_code: newCode }).eq('id', userId);
          setSettings(prev => ({ ...prev, referral_code: newCode }));
        }
      }

      // 3. ONLY NOW release the save lock
      isCloudSyncInitDone.current = true;
      console.log("[Sync] Initialization complete.");

    } catch (e) {
      console.error("[Sync] Initialization failed:", e);
      // Keep isCloudSyncInitDone false to protect data
    }
  }, []);

  // Auth Effect - Consolidated
  useEffect(() => {
    let profileChannel: any = null;

    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Security check
        if (session.user.app_metadata.provider === 'email' && !session.user.email_confirmed_at) {
          signOut();
          return;
        }

        setUserAccount(mapSupabaseUser(session.user));
        await initializeCloudData(session.user.id, session);

        // Realtime Subscription
        profileChannel = supabase
          .channel(`profile-${session.user.id}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
            (payload: any) => {
              const newData = payload.new as any;
              if (!isCloudSyncInitDone.current) return;

              // PROTECTION: If we changed something locally in the last 4 seconds,
              // ignore incoming cloud data to avoid race conditions (like deleting an asset).
              const timeSinceLocalChange = Date.now() - lastLocalChange.current;
              if (timeSinceLocalChange < 4000) {
                console.log("[Realtime] Local change pending, skipping cloud update");
                return;
              }

              const newDataHash = JSON.stringify({
                portfolioItems: newData.portfolio || [],
                allocationLogs: newData.allocations || [],
                alerts: newData.alerts || []
              });

              // Also skip if data is identical to local
              if (newDataHash === lastSyncHash.current) {
                // Check if Tier or Role changed independently (e.g. from Admin Panel or Stripe)
                if (newData.tier && newData.tier !== settingsRef.current.tier) {
                  console.log("[Realtime] Tier updated remotely:", newData.tier);
                  setSettings(s => ({ ...s, tier: newData.tier }));
                }
                if (newData.role && userAccountRef.current && newData.role !== userAccountRef.current.role) {
                  console.log("[Realtime] Role updated remotely:", newData.role);
                  setUserAccount(prev => prev ? { ...prev, role: newData.role } : null);
                }
                return;
              }

              console.log("[Realtime] Profile updated remotely");
              lastSyncHash.current = newDataHash;

              // Update Tier if different
              if (newData.tier && newData.tier !== settingsRef.current.tier) {
                setSettings(s => ({ ...s, tier: newData.tier }));
              }

              // Update Role if different
              if (newData.role && userAccountRef.current && newData.role !== userAccountRef.current.role) {
                setUserAccount(prev => prev ? { ...prev, role: newData.role } : null);
              }

              if (newData.portfolio) setPortfolioItems(newData.portfolio);
              if (newData.allocations) {
                setAllocationLogs(newData.allocations);
                localStorage.setItem('allocation_mission_logs', JSON.stringify(newData.allocations));
              }
              if (newData.alerts) setAlerts(newData.alerts);
            }
          )
          .subscribe();
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecoveryOpen(true);

      if (session?.user) {
        if (session.user.app_metadata.provider === 'email' && !session.user.email_confirmed_at) {
          if (event !== 'SIGNED_OUT') signOut();
          return;
        }

        const currentUserId = userAccountRef.current?.id;
        const mappedUser = mapSupabaseUser(session.user);
        setUserAccount(mappedUser);

        // Re-init if account changed
        if (mappedUser.id !== currentUserId) {
          await initializeCloudData(session.user.id, session);
        }
      } else {
        setUserAccount(null);
        isCloudSyncInitDone.current = false;
        if (profileChannel) {
          supabase.removeChannel(profileChannel);
          profileChannel = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, [initializeCloudData]);



  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'portfolio' | 'allocation' | 'report' | 'airdrops' | 'support' | 'admin'>('portfolio');

  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const [showSupportToast, setShowSupportToast] = useState(false);
  const prevUnreadCount = useRef(0);

  // Support Messages Notification (Admin Polling)
  // Support Messages Notification REMOVED
  /*
  useEffect(() => {
    if (userAccount?.role !== 'admin') {
      setUnreadSupportCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const messages = await fetchSupportMessages();
        const unreadRows = messages.filter(m => !m.read);
        const count = unreadRows.length;

        // Show toast IF count increased
        if (count > prevUnreadCount.current && currentView !== 'admin') {
          setShowSupportToast(true);
          // Auto hide after 8s
          setTimeout(() => setShowSupportToast(false), 8000);
        }

        prevUnreadCount.current = count;
        setUnreadSupportCount(count);
      } catch (e) {
        console.error("Unread count fetch error", e);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [userAccount?.role, currentView]);
  */

  // Request Notification Permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);
  const [airdropKey, setAirdropKey] = useState(0);
  const [displayInBTC, setDisplayInBTC] = useState(false);
  const [announcements, setAnnouncements] = useState<TickerAnnouncement[]>([]);

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('portfolio');
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO_ITEMS;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Inicializar com alertas que JÁ dispararam para não tocar som na recarga da página
  const localFiredAlerts = useRef<Set<string>>(new Set(
    alerts.filter(a => a.triggeredAt).map(a => `${a.id}-${a.triggeredAt}`)
  ));

  // State for Allocations (lifted up for sync, but still managed by Child mostly)
  const [allocationLogs, setAllocationLogs] = useState<MissionLog[]>(() => {
    const saved = localStorage.getItem('allocation_mission_logs');
    return saved ? JSON.parse(saved) : [];
  });


  useEffect(() => {
    const currentHash = JSON.stringify({ portfolioItems, allocationLogs, alerts });

    // Always save to localStorage
    localStorage.setItem('portfolio', JSON.stringify(portfolioItems));
    localStorage.setItem('alerts', JSON.stringify(alerts));

    if (userAccount?.id) {
      if (!isCloudSyncInitDone.current) return;
      if (currentHash === lastSyncHash.current) return;

      // Update timestamp to signal we have a pending local change - IMMEDIATELY
      lastLocalChange.current = Date.now();

      const timeout = setTimeout(() => {
        saveUserPortfolio(userAccount.id!, portfolioItems, allocationLogs, alerts);
        lastSyncHash.current = currentHash;
        console.log("[Sync] Saved to cloud");
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [portfolioItems, allocationLogs, alerts, userAccount]);

  // SMART ALARM MONITORING LOOP
  useEffect(() => {
    const monitorAlerts = async () => {
      const activeAlerts = alerts.filter(a => a.isActive && !a.triggeredAt);

      // Auto-cleanup triggered alerts after 5 minutes
      const now = Date.now();
      const needsCleanup = alerts.some(a => a.triggeredAt && (now - a.triggeredAt > 300000));

      if (needsCleanup) {
        setAlerts(prev => prev.map(a =>
          (a.triggeredAt && (now - a.triggeredAt > 300000)) ? { ...a, isActive: false } : a
        ));
      }

      if (activeAlerts.length === 0) return;

      const currencies = Array.from(new Set(activeAlerts.map(a => a.currency)));

      for (const curr of currencies) {
        const currAlerts = activeAlerts.filter(a => a.currency === curr);
        const assetIds = Array.from(new Set(currAlerts.map(a => a.assetId)));

        try {
          const data = await fetchMarketData(assetIds, curr);
          const marketDataMap = data.reduce((acc, coin) => {
            acc[coin.id] = coin;
            return acc;
          }, {} as Record<string, any>);

          const { triggeredIds } = checkAlerts(currAlerts, marketDataMap);

          if (triggeredIds.length > 0) {
            // Update cloud with triggeredAt timestamp - this serves as the global signal
            setAlerts(prev => prev.map(a =>
              triggeredIds.includes(a.id) ? { ...a, triggeredAt: Date.now() } : a
            ));
          }
        } catch (e) {
          console.error(`Alert check failed for ${curr}:`, e);
        }
      }
    };

    const interval = setInterval(monitorAlerts, 30000);
    return () => clearInterval(interval);
  }, [alerts]);

  // Effect to handle alarm triggers (both local and cloud-initiated)
  useEffect(() => {
    const now = Date.now();
    alerts.forEach(alert => {
      if (alert.isActive && alert.triggeredAt) {
        const timeSinceTrigger = now - alert.triggeredAt;
        const triggerKey = `${alert.id}-${alert.triggeredAt}`;

        // If triggered in last 2 minutes and this device hasn't fired for THIS pulse yet
        if (timeSinceTrigger < 120000 && !localFiredAlerts.current.has(triggerKey)) {
          console.log(`[Alert] Persistent siren triggering for ${alert.symbol}`);

          // Play a longer siren and vibrate
          playAlertSound(0.1, 5000);

          const msg = `🚀 ALERTA: ${alert.symbol} atingiu o alvo!`;
          window.alert(msg);

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("CryptoFolio ALERTA! 🚀", {
              body: msg,
              icon: '/logo.png'
            });
          }

          localFiredAlerts.current.add(triggerKey);
        }
      }
    });

    // Simple cache cleanup
    if (localFiredAlerts.current.size > 50) localFiredAlerts.current.clear();
  }, [alerts]);

  // Create a listener for Allocation changes (hacky but works without Redux)
  // We can't easily listen to LS changes in same window.
  // Better approach: Pass a callback to AllocationTypeView?
  // Or just rely on the fact that when user adds an asset, they usually view portfolio?
  // Let's defer allocation sync improvements to next step if needed, but portfolio is critical.





  const [protocolCount, setProtocolCount] = useState(0);
  const [showPremiumBanner, setShowPremiumBanner] = useState(false);
  const [showPremiumInfo, setShowPremiumInfo] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false); // Para o modal de troca de senha

  const [marketData, setMarketData] = useState<Record<string, any>>({});
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAlertAsset, setSelectedAlertAsset] = useState<PortfolioData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isMobileAppModalOpen, setIsMobileAppModalOpen] = useState(false);
  const [showReferralInfo, setShowReferralInfo] = useState(false);
  const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://seudominio.com';


  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CoinSearchResult[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CoinSearchResult | null>(null);
  const [selectedChartAsset, setSelectedChartAsset] = useState<PortfolioData | null>(null);
  const [newAssetAmount, setNewAssetAmount] = useState('');
  const [newAssetBuyPrice, setNewAssetBuyPrice] = useState('');

  const styles = THEME_STYLES[settings.theme] || THEME_STYLES.black;


  const [isManageSubscriptionOpen, setIsManageSubscriptionOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);


  // Check for Referral and Payment Success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Capture Referral Code from URL
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('referral_code', ref.toUpperCase());
    }

    if (params.get('success') === 'true') {
      const activateStripePremium = async () => {
        const currentTier = settingsRef.current.tier;
        if (currentTier === 'premium') return; // Avoid redundant updates

        const newSettings: UserSettings = {
          ...settingsRef.current,
          tier: 'premium',
          subscription_source: 'stripe',
          subscription_active_since: new Date().toISOString()
        };

        setSettings(newSettings);
        localStorage.setItem('settings', JSON.stringify(newSettings));

        // Update cloud if logged in
        if (userAccountRef.current?.id) {
          await syncUserProfile(userAccountRef.current.id, newSettings, userAccountRef.current.email, userAccountRef.current.role);
        }

        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        alert('Pagamento confirmado! Premium ativado com sucesso. 🚀');
      };

      activateStripePremium();
    }
  }, []); // Run only once on mount

  // AUDIO UNLOCK FOR MOBILE
  useEffect(() => {
    const unlock = () => {
      // Initialize shared AudioContext on first user gesture
      initAudio();
      // Play a very subtle tone to confirm unlock and prime the system
      playAlertSound(0, 1);
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      console.log("[Audio] System unlocked by user gesture");
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  // Reset form when Add Modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedCoin(null);
      setNewAssetAmount('');
      setNewAssetBuyPrice('');
      setIsSearching(false);
    }
  }, [isAddModalOpen]);

  const loadData = useCallback(async () => {
    setLoadingState(LoadingState.LOADING);
    try {
      const ids = Array.from(new Set([...portfolioItems.map(i => i.assetId), 'bitcoin']));
      const data = await fetchMarketData(ids, settings.currency, settings.coinGeckoApiKey);
      const dataMap: Record<string, any> = {};
      data.forEach((c: any) => dataMap[c.id] = c);
      setMarketData(dataMap);
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) { setLoadingState(LoadingState.ERROR); }
  }, [portfolioItems, settings.currency, settings.coinGeckoApiKey]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const loadAnnouncements = useCallback(async () => {
    const data = await fetchTickerAnnouncements();
    setAnnouncements(data.filter(a => a.active));
  }, []);

  useEffect(() => {
    loadAnnouncements();
    const interval = setInterval(loadAnnouncements, 300000); // 5 min
    return () => clearInterval(interval);
  }, [loadAnnouncements]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        searchCoins(searchQuery).then(results => {
          setSearchResults(results);
          setIsSearching(false);
        }).catch(() => {
          setSearchResults([]);
          setIsSearching(false);
        });
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const portfolioData: PortfolioData[] = useMemo(() => {
    const totalVal = portfolioItems.reduce((acc, item) => {
      const price = marketData[item.assetId]?.current_price || 0;
      return acc + (price * item.quantity);
    }, 0);

    return portfolioItems.map(item => {
      const coin = marketData[item.assetId] || { current_price: 0, price_change_percentage_24h: 0, symbol: '...', image: '' };
      const currentVal = coin.current_price * item.quantity;
      const cost = (item.buyPrice || 0) * item.quantity;
      return {
        ...coin, id: item.assetId, name: item.name || item.assetId, quantity: item.quantity, buyPrice: item.buyPrice || 0,
        totalValue: currentVal, totalCost: cost, pnlValue: currentVal - cost,
        pnlPercentage: cost > 0 ? ((currentVal - cost) / cost) * 100 : 0,
        allocation: totalVal > 0 ? (currentVal / totalVal) * 100 : 0
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
  }, [portfolioItems, marketData]);

  const totalValueSum = useMemo(() => portfolioData.reduce((acc, c) => acc + c.totalValue, 0), [portfolioData]);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.tier === 'free' && portfolioItems.length >= 3) {
      setShowPremiumBanner(true);
      return;
    }
    if (!selectedCoin || !newAssetAmount) return;
    const qty = parseFormattedNumber(newAssetAmount);
    const bp = parseFormattedNumber(newAssetBuyPrice);
    setPortfolioItems(prev => [...prev, { assetId: selectedCoin.id, quantity: qty, buyPrice: bp, name: selectedCoin.name, image: selectedCoin.thumb }]);
    setIsAddModalOpen(false); setNewAssetAmount(''); setNewAssetBuyPrice(''); setSelectedCoin(null); setSearchQuery('');
  };

  const handleEditAsset = (asset: PortfolioData) => {
    setEditingAssetId(asset.id);
    setNewAssetAmount(asset.quantity.toString());
    setNewAssetBuyPrice(asset.buyPrice.toString());
    setSelectedCoin({
      id: asset.id,
      name: asset.name,
      symbol: asset.symbol,
      thumb: asset.image
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssetId || !newAssetAmount) return;
    const qty = parseFormattedNumber(newAssetAmount);
    const bp = parseFormattedNumber(newAssetBuyPrice);

    setPortfolioItems(prev => prev.map(item => {
      if (item.assetId === editingAssetId) {
        return { ...item, quantity: qty, buyPrice: bp };
      }
      return item;
    }));
    setIsEditModalOpen(false);
    setNewAssetAmount('');
    setNewAssetBuyPrice('');
    setSelectedCoin(null);
    setEditingAssetId(null);
  };

  const fillCurrentPrice = () => {
    if (!selectedCoin) {
      alert(settings.language === 'pt' ? "Selecione uma moeda antes!" : "Select a coin first!");
      return;
    }
    const currentPrice = marketData[selectedCoin.id]?.current_price;
    if (currentPrice) {
      setNewAssetBuyPrice(currentPrice.toString());
    } else {
      alert(settings.language === 'pt' ? "Preço não disponível no momento." : "Price not available at the moment.");
    }
  };

  const handleRemoveAsset = (id: string) => {
    setPortfolioItems(prev => prev.filter(p => p.assetId !== id));
  };

  const handleLogout = async () => {
    // Provide immediate local feedback by clearing the user state
    setUserAccount(null);
    setIsSidebarOpen(false);

    try {
      // Clear sensitive local data
      localStorage.removeItem('portfolio');
      localStorage.removeItem('settings');
      localStorage.removeItem('allocation_mission_logs');
      localStorage.removeItem('promo_start_time');
      localStorage.removeItem('user_account');

      // Reset application state to defaults
      setPortfolioItems(INITIAL_PORTFOLIO_ITEMS);
      setAllocationLogs([]);
      setSettings({
        coinGeckoApiKey: '',
        currency: 'usd',
        theme: 'black',
        language: settings.language, // Keep language for better UX
        privacyMode: false,
        tier: 'free'
      });

      // Perform server-side sign out (don't block the UI)
      signOut().catch(e => console.error("SignOut error:", e));

    } catch (e) {
      console.error("Logout cleanup error:", e);
    }
  };

  const isAtLimit = settings.tier === 'free' && portfolioItems.length >= 3;

  if (!userAccount) {
    return (
      <LoginPage
        onLoginSuccess={() => { }}
        initialLanguage={settings.language}
        onLanguageChange={(lang) => setSettings(s => ({ ...s, language: lang }))}
      />
    );
  }

  return (
    <div className={`relative flex items-center justify-center h-screen w-full bg-[#000] overflow-hidden font-sans`}>

      <div className={`relative w-full h-full sm:w-[400px] sm:h-[840px] sm:rounded-[48px] sm:border-[8px] sm:border-[#1a1a1a] md:w-full md:h-full md:rounded-none md:border-0 md:max-w-none overflow-hidden flex flex-col md:flex-row z-10 transition-all duration-500 ${['airdrops', 'allocation', 'report'].includes(currentView) ? 'bg-black text-white' : `${styles.bg} ${styles.text}`}`}>

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {!['airdrops', 'allocation', 'report'].includes(currentView) && (
            <>
              {settings.theme === 'game' && <GameBackground />}
              {settings.theme === 'matrix' && <MatrixBackground />}
              {settings.theme === 'neon' && <NeonBackground />}
              {settings.theme === 'dracula' && <SpaceInvadersBackground />}
              {settings.theme === 'tetris' && <TetrisBackground />}
              {(['sunset', 'ocean', 'forest', 'purple', 'gold', 'yellow']).includes(settings.theme) && (
                <div className={`absolute inset-0 opacity-[0.08] bg-gradient-to-br ${styles.gradient}`}></div>
              )}
            </>
          )}
        </div>

        {/* SIDEBAR - Web Adaptation */}
        <div className={`fixed inset-0 z-[100] md:static md:z-auto md:inset-auto md:w-[280px] md:border-r md:border-white/10 md:bg-black/20 ${isSidebarOpen ? 'flex' : 'hidden md:flex'}`}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
          <div className={`relative w-4/5 md:w-full h-full bg-[#0a0a0a] md:bg-black border-r-2 ${styles.border} md:border-none shadow-2xl md:shadow-none flex flex-col animate-in slide-in-from-left duration-300 md:animate-none`}>
            <div className="p-6 pt-12 flex flex-col gap-6">
              {/* Premium Badge (Mobile Only - Top of Sidebar) */}
              {settings.tier === 'premium' && (
                <div
                  className="md:hidden flex items-center justify-between px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all active:scale-95"
                  onClick={() => setIsManageSubscriptionOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-green-500 fill-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{TRANSLATIONS[settings.language].menu.premium_active}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[1px] h-3 bg-green-500/20" />
                    <span className="text-[9px] font-bold text-green-400/60 uppercase tracking-tighter">{TRANSLATIONS[settings.language].menu.manage}</span>
                  </div>
                </div>
              )}

              {/* Desktop Logo - Aligned with Top Bar */}
              <div className="hidden md:flex items-center justify-center h-24 mb-2 mt-6">
                <img src="/logo_cryptofolio_defi.png" alt="CryptoFolio DeFi" className="w-64 h-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              </div>

              <div className="flex items-center justify-between">
                {/* Top Close Button Removed */}
              </div>

              {/* Bottom Close Button (New) */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute bottom-6 right-6 p-4 bg-white/10 text-white rounded-full md:hidden z-50 hover:bg-white/20 transition-all shadow-lg active:scale-95 border border-white/10"
              >
                <X size={24} />
              </button>

            </div>




            <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
              <button onClick={() => { setCurrentView('portfolio'); setIsSidebarOpen(false); setSidebarTab(null); }} className={`w-full flex items-center gap-4 p-4 text-sm uppercase font-black rounded-xl transition-all ${currentView === 'portfolio' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}><Home size={22} /> {TRANSLATIONS[settings.language].menu.home}</button>
              <button onClick={() => { setCurrentView('allocation'); setIsSidebarOpen(false); setSidebarTab(null); }} className={`w-full flex items-center gap-4 p-4 text-sm uppercase font-black rounded-xl transition-all ${currentView === 'allocation' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}><PieChartIcon size={22} /> {TRANSLATIONS[settings.language].menu.asset_tracking}</button>
              <button onClick={() => { setCurrentView('airdrops'); setIsSidebarOpen(false); setSidebarTab(null); }} className={`w-full flex items-center gap-4 p-4 text-sm uppercase font-black rounded-xl transition-all ${currentView === 'airdrops' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}><span className="text-xl">🪂</span> Airdrop</button>
              <button onClick={() => { setCurrentView('report'); setIsSidebarOpen(false); setSidebarTab(null); }} className={`w-full flex items-center gap-4 p-4 text-sm uppercase font-black rounded-xl transition-all ${currentView === 'report' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}><FileText size={22} /> {TRANSLATIONS[settings.language].menu.report}</button>

              <button
                onClick={() => setIsMobileAppModalOpen(true)}
                className={`w-full flex items-center gap-4 p-4 text-sm uppercase font-black rounded-xl transition-all text-white/40 hover:text-white`}
              >
                <div className="relative">
                  <Smartphone size={22} />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                </div>
                {TRANSLATIONS[settings.language].menu.mobile_app}
              </button>

              <button onClick={() => setSidebarTab(sidebarTab?.startsWith('settings') ? null : 'settings')} className={`w-full flex items-center gap-4 p-4 text-sm uppercase font-black rounded-xl transition-all ${sidebarTab?.startsWith('settings') ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                <Settings size={22} /> {TRANSLATIONS[settings.language].menu.settings}
              </button>

              {sidebarTab?.startsWith('settings') && (
                <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <button onClick={() => setSidebarTab(sidebarTab === 'settings-themes' ? 'settings' : 'settings-themes')} className={`w-full flex items-center gap-4 p-3 text-xs uppercase font-bold rounded-xl transition-all ${sidebarTab === 'settings-themes' ? 'bg-yellow-400/10 text-yellow-400' : 'text-white/40 hover:text-white'}`}>
                    <Palette size={18} /> {TRANSLATIONS[settings.language].menu.themes}
                  </button>
                  {sidebarTab === 'settings-themes' && (
                    <div className="grid grid-cols-2 gap-2 p-2 bg-white/5 rounded-xl ml-4">
                      {(Object.keys(THEME_STYLES) as AppTheme[]).map(t => (
                        <button key={t} onClick={() => { setSettings(s => { const newSettings = { ...s, theme: t }; if (userAccount?.id) syncUserProfile(userAccount.id, newSettings, userAccount.email, userAccount.role); return newSettings; }); }} className={`p-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${settings.theme === t ? 'bg-yellow-400 border-yellow-400 text-black' : `bg-black border-white/10 text-white`}`}>{TRANSLATIONS[settings.language].themes[t] || t}</button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setSidebarTab(sidebarTab === 'settings-currency' ? 'settings' : 'settings-currency')} className={`w-full flex items-center gap-4 p-3 text-xs uppercase font-bold rounded-xl transition-all ${sidebarTab === 'settings-currency' ? 'bg-yellow-400/10 text-yellow-400' : 'text-white/40 hover:text-white'}`}>
                    <Coins size={18} /> {TRANSLATIONS[settings.language].menu.currency}
                  </button>
                  {sidebarTab === 'settings-currency' && (
                    <div className="flex gap-2 p-2 bg-white/5 rounded-xl ml-4">
                      {(['usd', 'brl', 'eur'] as const).map(curr => (
                        <button key={curr} onClick={() => { setSettings(s => { const newSettings = { ...s, currency: curr }; if (userAccount?.id) syncUserProfile(userAccount.id, newSettings, userAccount.email, userAccount.role); return newSettings; }); }} className={`flex-1 p-2 text-[10px] font-black uppercase rounded-lg border transition-all ${settings.currency === curr ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-black border-white/10 text-white/40'}`}>{curr}</button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setSettings(s => { const newLang = s.language === 'pt' ? 'en' : 'pt'; const newSettings: UserSettings = { ...s, language: newLang }; if (userAccount?.id) syncUserProfile(userAccount.id, newSettings, userAccount.email, userAccount.role); return newSettings; })} className={`w-full flex items-center gap-4 p-3 text-xs uppercase font-bold rounded-xl transition-all text-white/40 hover:text-white`}>
                    <Globe size={18} /> {settings.language === 'pt' ? 'PT' : 'EN'}
                  </button>
                </div>
              )}

              <button onClick={() => { setCurrentView('support'); setIsSidebarOpen(false); setSidebarTab(null); }} className={`w-full flex items-center gap-4 p-4 text-sm uppercase font-black rounded-xl transition-all ${currentView === 'support' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                <LifeBuoy size={22} /> {TRANSLATIONS[settings.language].menu.support}
              </button>

              <button onClick={() => setSidebarTab(sidebarTab === 'referral' ? null : 'referral')} className={`w-full flex items-center gap-4 p-4 text-sm uppercase font-black rounded-xl transition-all ${sidebarTab === 'referral' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                <UsersIcon size={22} /> {TRANSLATIONS[settings.language].referral.title}
              </button>

              {sidebarTab === 'referral' && (
                <div className="mx-2 p-4 space-y-4 animate-in slide-in-from-top-2 duration-300 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                  <p className="text-[10px] text-white/50 font-bold leading-relaxed uppercase tracking-wider">
                    {TRANSLATIONS[settings.language].referral.share_msg}
                  </p>

                  <div className="space-y-1.5">
                    <p className="text-[10px] text-yellow-400 font-extrabold uppercase tracking-[.2em] ml-1">
                      {TRANSLATIONS[settings.language].referral.your_code}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/60 border border-white/10 p-3.5 rounded-xl flex items-center justify-center shadow-inner">
                        <code className="text-white text-sm font-black tracking-[0.3em]">{settings.referral_code || '---'}</code>
                      </div>
                      <button
                        onClick={() => {
                          if (settings.referral_code) {
                            navigator.clipboard.writeText(settings.referral_code);
                            alert(TRANSLATIONS[settings.language].referral.copied);
                          }
                        }}
                        className="p-3.5 bg-yellow-400 text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-400/20"
                        title={TRANSLATIONS[settings.language].referral.copy}
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center shrink-0">
                      <Trophy size={18} className="text-yellow-400" />
                    </div>
                    <p className="text-[10px] font-black text-yellow-400 uppercase tracking-tight leading-tight">
                      {TRANSLATIONS[settings.language].referral.description}
                    </p>
                  </div>

                  {/* Link de Convite */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-[.2em] ml-1">
                      {TRANSLATIONS[settings.language].referral.share_link}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/40 border border-white/5 p-3 px-4 rounded-xl shadow-inner text-left">
                        <code className="text-[9px] text-white/40 font-mono block lowercase break-all">
                          {`${SITE_URL}/?ref=${settings.referral_code}`}
                        </code>
                      </div>
                      <button
                        onClick={() => {
                          if (settings.referral_code) {
                            navigator.clipboard.writeText(`${SITE_URL}/?ref=${settings.referral_code}`);
                            alert(TRANSLATIONS[settings.language].referral.copied);
                          }
                        }}
                        className="p-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                        title={TRANSLATIONS[settings.language].referral.copy}
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    {/* See Benefits Button */}
                    <button
                      onClick={() => setShowReferralInfo(true)}
                      className="w-full mt-2 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg flex items-center justify-center gap-2 group transition-all"
                    >
                      <Gift size={14} className="text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold text-purple-200 uppercase tracking-wider group-hover:text-white">
                        {settings.language === 'pt' ? 'Ver Benefícios' : 'See Benefits'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {userAccount?.role === 'admin' && (
                <button
                  onClick={() => { setCurrentView('admin'); setIsSidebarOpen(false); setSidebarTab(null); }}
                  className={`w-full flex items-center justify-between p-4 text-sm uppercase font-black rounded-xl transition-all ${currentView === 'admin' ? 'bg-yellow-400/10 text-yellow-400' : 'text-yellow-400/40 hover:text-yellow-400'}`}
                >
                  <div className="flex items-center gap-4">
                    <Shield size={22} /> ADMIN
                  </div>
                  {unreadSupportCount > 0 && (
                    <div className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse shadow-lg shadow-red-500/20 font-black">
                      {unreadSupportCount}
                    </div>
                  )}
                </button>
              )}

              <div className="h-px bg-white/5 my-4"></div>
              <button onClick={() => setSidebarTab(sidebarTab === 'profile' ? null : 'profile')} className={`w-full flex items-center gap-4 p-4 text-sm uppercase font-black rounded-xl transition-all ${sidebarTab === 'profile' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                <User size={22} /> {TRANSLATIONS[settings.language].menu.profile}
              </button>

              {sidebarTab === 'profile' && (
                <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-2">
                    <p className="text-[10px] text-white/50 uppercase font-bold">Email</p>
                    <p className="text-xs text-white truncate">{userAccount?.email}</p>
                  </div>

                  {settings.tier === 'premium' ? (
                    <button
                      onClick={() => setIsManageSubscriptionOpen(true)}
                      className="bg-green-500/10 border border-green-500/50 p-3 rounded-xl flex items-center gap-3 shadow-[0_0_10px_rgba(34,197,94,0.2)] w-full hover:bg-green-500/20 transition-colors cursor-pointer group mb-2"
                    >
                      <Zap size={18} className="text-green-500 fill-green-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex-1 text-left">{TRANSLATIONS[settings.language].menu.premium_active}</span>
                      <span className="text-[8px] text-green-500/50">{TRANSLATIONS[settings.language].menu.manage}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPremiumBanner(true)}
                      className="bg-yellow-400/10 border border-yellow-400/20 p-3 rounded-xl flex items-center gap-3 shadow-[0_0_10px_rgba(250,204,21,0.2)] w-full animate-pulse hover:bg-yellow-400/20 transition-colors cursor-pointer mb-2"
                    >
                      <Zap size={18} className="text-yellow-400" />
                      <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{TRANSLATIONS[settings.language].menu.be_premium}</span>
                    </button>
                  )}

                  <button onClick={() => { handleLogout(); setSidebarTab(null); }} className="w-full flex items-center gap-4 p-3 text-xs text-rose-500 uppercase font-black rounded-xl hover:bg-rose-500/10 transition-all"><LogOut size={18} /> {TRANSLATIONS[settings.language].menu.logout}</button>
                </div>
              )}

              {/* Follow Us Section */}
              <div className="mt-8 mb-4 px-2">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-center mb-3">
                  {settings.language === 'pt' ? 'Siga-nos' : 'Follow us'}
                </p>
                <a
                  href="https://x.com/cryptofoliodefi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="p-1.5 bg-black/40 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center">
                    <XLogo size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors">@cryptofoliodefi</span>
                </a>
              </div>
              <div className="mt-8 flex flex-col items-center justify-center transition-all duration-500 md:hidden">
                <img src="/logo_cryptofolio_defi.png" alt="CryptoFolio DeFi" className="w-64 h-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          {/* Top Black Bar (Desktop & Mobile) - "Roda Teto" + Ticker */}
          <div className="w-full h-auto md:h-24 bg-black flex-none border-b border-white/5 z-30 shrink-0 flex flex-col md:flex-row items-center overflow-hidden relative">

            {/* Coins Row */}
            <div className="w-full h-10 md:h-full flex items-center relative overflow-hidden">
              <div
                className="flex items-center animate-marquee hover:pause whitespace-nowrap"
                style={{ animationDuration: window.innerWidth < 768 ? '120s' : '150s' }}
              >
                {tickerData.map((coin, index) => (
                  <div key={coin.id + index} className="flex items-center gap-3 mx-8 md:mx-12 font-bold whitespace-nowrap">
                    {coin.image && <img src={coin.image} alt={coin.symbol} className="w-5 h-5 md:w-8 md:h-8 rounded-full" />}
                    <span className="uppercase text-white/50 text-[10px] md:text-sm">{coin.symbol}</span>
                    <span className="text-white text-xs md:text-lg">${formatTickerPrice(coin.current_price)}</span>
                    <span className={`text-[10px] md:text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                      {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                  </div>
                ))}

                {/* Announcements (Desktop Only - integrated in main flow) */}
                <div className="hidden md:flex items-center">
                  {announcements.map((ann, index) => (
                    <div key={ann.id + index + '_desktop'} className="flex items-center gap-3 px-6 py-2 mx-6 font-black whitespace-nowrap bg-yellow-400 text-black rounded-full shadow-[0_0_15px_rgba(250,204,21,0.3)] border border-yellow-500/50">
                      {ann.icon && <TickerIcon name={ann.icon} size={18} />}
                      <span className="uppercase text-xs tracking-tighter">
                        {settings.language === 'pt' ? ann.content_pt : ann.content_en}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Loop continuation for coins */}
                {tickerData.map((coin, index) => (
                  <div key={coin.id + index + '_copy'} className="flex items-center gap-3 mx-8 md:mx-12 font-bold whitespace-nowrap">
                    {coin.image && <img src={coin.image} alt={coin.symbol} className="w-5 h-5 md:w-8 md:h-8 rounded-full" />}
                    <span className="uppercase text-white/50 text-[10px] md:text-sm">{coin.symbol}</span>
                    <span className="text-white text-xs md:text-lg">${formatTickerPrice(coin.current_price)}</span>
                    <span className={`text-[10px] md:text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                      {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                  </div>
                ))}

                {/* Announcements Loop Copy (Desktop Only) */}
                <div className="hidden md:flex items-center">
                  {announcements.map((ann, index) => (
                    <div key={ann.id + index + '_desktop_copy'} className="flex items-center gap-3 px-6 py-2 mx-6 font-black whitespace-nowrap bg-yellow-400 text-black rounded-full shadow-[0_0_15px_rgba(250,204,21,0.3)] border border-yellow-500/50">
                      {ann.icon && <TickerIcon name={ann.icon} size={18} />}
                      <span className="uppercase text-xs tracking-tighter">
                        {settings.language === 'pt' ? ann.content_pt : ann.content_en}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Announcements Row - Independent on Mobile, Unified on Desktop */}
            <div className="w-full h-10 md:h-full flex items-center relative overflow-hidden md:hidden">
              <div
                className="flex items-center animate-marquee hover:pause whitespace-nowrap"
                style={{ animationDuration: '100s' }}
              >
                {announcements.map((ann, index) => (
                  <div key={ann.id + index} className="flex items-center gap-2 px-4 py-1.5 mx-3 font-black whitespace-nowrap bg-yellow-400 text-black rounded-full shadow-[0_0_10px_rgba(250,204,21,0.2)] border border-yellow-500/50">
                    {ann.icon && <TickerIcon name={ann.icon} size={14} />}
                    <span className="uppercase text-[9px] tracking-tighter">
                      {settings.language === 'pt' ? ann.content_pt : ann.content_en}
                    </span>
                  </div>
                ))}
                {/* Loop continuation for mobile announcements */}
                {announcements.map((ann, index) => (
                  <div key={ann.id + index + '_copy'} className="flex items-center gap-2 px-4 py-1.5 mx-3 font-black whitespace-nowrap bg-yellow-400 text-black rounded-full shadow-[0_0_10px_rgba(250,204,21,0.2)] border border-yellow-500/50">
                    {ann.icon && <TickerIcon name={ann.icon} size={14} />}
                    <span className="uppercase text-[9px] tracking-tighter">
                      {settings.language === 'pt' ? ann.content_pt : ann.content_en}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View Integrated */}
          </div>

          <header className="px-6 pt-6 flex items-center justify-between relative z-50 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSidebarOpen(true)} className={`p-2 transition-colors ${styles.iconColor} md:hidden`}><Menu size={24} /></button>

              {/* X Social Link */}
              {/* X Social Link Removed */}
            </div>



            <div className="flex items-center gap-4">
              {/* Premium Badge (Desktop Only) */}
              {settings.tier === 'premium' ? (
                <div
                  className="hidden md:flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all hover:bg-green-500/20"
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-green-500 fill-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{TRANSLATIONS[settings.language].menu.premium_active}</span>
                  </div>
                  <div className="w-[1px] h-3 bg-green-500/20" />
                  <button
                    onClick={() => setIsManageSubscriptionOpen(true)}
                    className="text-[9px] font-bold text-green-400/60 hover:text-green-400 uppercase tracking-tighter transition-colors"
                  >
                    {TRANSLATIONS[settings.language].menu.manage}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPremiumBanner(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-xl font-black text-[10px] uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:scale-105 transition-transform"
                >
                  <Zap size={14} className="fill-black" />
                  {TRANSLATIONS[settings.language].menu.be_premium}
                </button>
              )}

              <div className="flex items-center gap-2">

                {/* Language (Desktop Only) */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                    className={`p-2 transition-colors ${styles.iconColor}`}
                    title={TRANSLATIONS[settings.language].general.settings}
                  >
                    <Globe size={20} />
                  </button>

                  {isLanguageMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-[200] animate-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={() => {
                          setSettings(s => {
                            const newSettings: UserSettings = { ...s, language: 'pt' };
                            if (userAccount?.id) syncUserProfile(userAccount.id, newSettings);
                            return newSettings;
                          });
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-bold transition-colors flex items-center gap-2 ${settings.language === 'pt' ? 'text-cyan-400 bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                      >
                        <span className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center text-[8px] text-white">BR</span>
                        PT
                      </button>
                      <button
                        onClick={() => {
                          setSettings(s => {
                            const newSettings: UserSettings = { ...s, language: 'en' };
                            if (userAccount?.id) syncUserProfile(userAccount.id, newSettings);
                            return newSettings;
                          });
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-bold transition-colors flex items-center gap-2 ${settings.language === 'en' ? 'text-cyan-400 bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white">US</span>
                        EN
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSettings(s => ({ ...s, privacyMode: !s.privacyMode }))}
                  className={`p-2 transition-colors ${styles.iconColor} ${currentView === 'allocation' ? 'hidden md:block' : 'block'}`}
                >
                  {settings.privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button
                  onClick={loadData}
                  className={`p-2 transition-all active:rotate-180 ${styles.iconColor} ${loadingState === LoadingState.LOADING ? 'animate-spin' : ''} ${currentView === 'allocation' ? 'hidden md:block' : 'block'}`}
                >
                  <RefreshCcw size={20} />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4 custom-scrollbar relative z-[40]">
            {currentView === 'portfolio' ? (
              <div className="flex flex-col md:flex-row gap-6 h-full">

                {/* Left Column: Asset List */}
                <div className="w-full md:w-1/2 flex flex-col gap-4 order-2 md:order-1">

                  {isAtLimit && settings.tier !== 'premium' ? (
                    <button
                      onClick={() => setShowPremiumBanner(true)}
                      className={`w-full bg-black border-2 border-red-500/50 text-red-500 font-black py-3 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase text-[10px] tracking-widest shadow-xl opacity-80`}
                    >
                      <Lock size={20} strokeWidth={4} /> {TRANSLATIONS[settings.language].general.limit_reached}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (settings.tier === 'premium') {
                          setIsAddModalOpen(true);
                        } else {
                          setIsAddModalOpen(true);
                        }
                      }}
                      className={`w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-3 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase text-[10px] tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.6)] border border-cyan-400`}
                    >
                      <Plus size={20} strokeWidth={4} /> {TRANSLATIONS[settings.language].general.add_asset}
                    </button>
                  )}

                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <AssetList
                      data={portfolioData}
                      onRemove={handleRemoveAsset}
                      onEdit={handleEditAsset}
                      onAddAlert={(asset) => {
                        setSelectedAlertAsset(asset);
                        setIsAlertModalOpen(true);
                      }}
                      onManageAlerts={() => { }}
                      currency={settings.currency}
                      theme={settings.theme}
                      privacyMode={settings.privacyMode}
                      onSelect={(asset) => setSelectedChartAsset(asset)}
                    />
                  </div>
                </div>

                {/* Right Column: Chart */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-start md:justify-start md:pt-2 order-1 md:order-2 md:sticky md:top-0 h-min md:h-auto">
                  {selectedChartAsset ? (
                    <div className="w-full h-[600px] md:h-full">
                      <CoinDetailView
                        coin={selectedChartAsset}
                        currency={settings.currency}
                        onClose={() => setSelectedChartAsset(null)}
                      />
                    </div>
                  ) : (
                    <PortfolioPieChart
                      data={portfolioData}
                      totalValue={totalValueSum}
                      totalPnL={portfolioData.reduce((acc, c) => acc + c.pnlValue, 0)}
                      totalPnLPercentage={portfolioData.reduce((acc, c) => acc + c.totalCost, 0) > 0 ? (portfolioData.reduce((acc, c) => acc + c.pnlValue, 0) / portfolioData.reduce((acc, c) => acc + c.totalCost, 0)) * 100 : 0}
                      currency={settings.currency}
                      btcPrice={marketData['bitcoin']?.current_price}
                      theme={settings.theme}
                      privacyMode={settings.privacyMode}
                      displayInBTC={displayInBTC}
                      onToggleBTC={() => setDisplayInBTC(!displayInBTC)}
                      large
                    />
                  )}
                </div>
              </div>

            ) : currentView === 'report' ? (
              <ReportView
                language={settings.language}
                theme={settings.theme}
                portfolioItems={portfolioItems}
                marketData={marketData}
                allocationLogs={allocationLogs}
                currency={settings.currency}
              />
            ) : currentView === 'airdrops' ? (
              <AirdropScreen
                key={airdropKey}
                language={settings.language}
                theme={settings.theme}
                isPremium={settings.tier === 'premium'}
                onTriggerPremium={() => setShowPremiumBanner(true)}
              />
            ) : currentView === 'support' ? (
              <SupportView language={settings.language} userAccount={userAccount} />
            ) : currentView === 'admin' ? (
              <AdminView language={settings.language} userAccount={userAccount} />
            ) : (
              <AllocationTypeView
                key={userAccount ? userAccount.email : 'guest'} // Force re-mount on user change
                totalBalance={totalValueSum}
                currencySymbol={settings.currency === 'brl' ? 'R$' : settings.currency === 'eur' ? '€' : '$'}
                privacyMode={settings.privacyMode}
                onCountChange={setProtocolCount}
                onLimitReached={() => setShowPremiumBanner(true)}
                isPremium={settings.tier === 'premium'}
                onLogsChange={setAllocationLogs}
                externalLogs={allocationLogs}
                language={settings.language}
              />
            )}
          </main>

          <AlertManagerModal
            isOpen={isAlertModalOpen}
            onClose={() => setIsAlertModalOpen(false)}
            asset={selectedAlertAsset}
            alerts={alerts}
            userTier={settings.tier}
            language={settings.language}
            theme={settings.theme}
            parseNumber={parseFormattedNumber}
            onLimitReached={() => setShowPremiumBanner(true)}
            onAddAlert={(alertData) => {
              const newAlert: Alert = {
                ...alertData,
                id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
                createdAt: Date.now()
              };
              setAlerts(prev => [...prev, newAlert]);
            }}
            onRemoveAlert={(id) => {
              setAlerts(prev => prev.filter(a => a.id !== id));
            }}
          />

          {showReferralInfo && (
            <ReferralInfoBanner
              onClose={() => setShowReferralInfo(false)}
              settings={settings}
            />
          )}

          {showPremiumBanner && (
            <PremiumArcadeBanner
              language={settings.language}
              onUpgrade={() => {
                // Simulate upgrade for demo purposes
                setSettings(s => ({ ...s, tier: 'premium' }));
                setShowPremiumBanner(false);
              }}
              onClose={() => setShowPremiumBanner(false)}
              onRedeem={async (code) => {
                const cleanCode = code.trim().toUpperCase();

                const { data, error } = await supabase
                  .from('promo_codes')
                  .select('code')
                  .eq('code', cleanCode)
                  .eq('active', true)
                  .single();

                if (data && !error) {
                  // Update Local State
                  const newSettings: UserSettings = {
                    ...settingsRef.current,
                    tier: 'premium',
                    subscription_source: 'promo_code',
                    promo_code_used: cleanCode,
                    subscription_active_since: new Date().toISOString()
                  };

                  setSettings(newSettings);
                  localStorage.setItem('settings', JSON.stringify(newSettings));
                  localStorage.setItem('promo_redeemed', 'true');

                  // Update Cloud Profile if logged in
                  if (userAccountRef.current?.id) {
                    await syncUserProfile(userAccountRef.current.id, newSettings, userAccountRef.current.email, userAccountRef.current.role);
                  }

                  alert('JOGADOR VIP DETECTADO! ACESSO LIBERADO. 🚀');
                  setShowPremiumBanner(false);
                } else {
                  alert(`CÓDIGO INVÁLIDO: "${cleanCode}"\nTente: BETA2025`);
                }
              }}
            />
          )}

          <ChangePasswordModal
            isOpen={isRecoveryOpen}
            onClose={() => setIsRecoveryOpen(false)}
          />

          <ManageSubscriptionModal
            isOpen={isManageSubscriptionOpen}
            onClose={() => setIsManageSubscriptionOpen(false)}
            onCancelSubscription={async () => {
              const newSettings = { ...settings, tier: 'free' as const };
              setSettings(newSettings);
              localStorage.removeItem('promo_redeemed');
              if (userAccount?.id) {
                await syncUserProfile(userAccount.id, newSettings, userAccount.email, userAccount.role);
              }
              alert('Assinatura cancelada com sucesso.');
            }}
          />







          <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={TRANSLATIONS[settings.language].general.add_asset} theme={settings.theme}>
            <form onSubmit={handleAddAsset} className="h-full flex flex-col gap-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"><Search size={16} /></div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedCoin(null); }}
                  placeholder={TRANSLATIONS[settings.language].general.search_placeholder}
                  className={`w-full bg-black border-2 ${styles.border} rounded-xl p-4 pl-10 text-[10px] uppercase font-bold text-white outline-none focus:border-yellow-400 transition-colors`}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-yellow-400" />
                  </div>
                )}

                {!selectedCoin && searchQuery.length > 2 && !isSearching && (
                  <div className={`absolute top-full left-0 right-0 mt-2 bg-neutral-900 border-2 ${styles.border} rounded-xl shadow-2xl max-h-40 overflow-y-auto z-[100] custom-scrollbar`}>
                    {searchResults.length > 0 ? (
                      searchResults.map(c => (
                        <button key={c.id} type="button" onClick={() => { setSelectedCoin(c); setSearchQuery(c.name); setSearchResults([]); }} className="w-full flex items-center gap-3 p-4 text-sm font-black uppercase text-white/70 hover:text-white border-b border-white/5 last:border-none transition-colors">
                          <img src={c.thumb} className="w-10 h-10 rounded-full" /><span>{c.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-[9px] text-white/30 uppercase font-bold">
                        {TRANSLATIONS[settings.language].general.no_results}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-black text-white uppercase ml-1">{TRANSLATIONS[settings.language].general.quantity}</span>
                  <input type="text" inputMode="decimal" value={newAssetAmount} onChange={(e) => setNewAssetAmount(e.target.value)} placeholder="0.00" className={`w-full bg-black border-2 ${styles.border} rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-yellow-400 transition-colors`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <span className="text-xs font-black text-white uppercase">{TRANSLATIONS[settings.language].general.price_paid}</span>
                    <button
                      type="button"
                      onClick={fillCurrentPrice}
                      className="text-[9px] font-black uppercase text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20"
                    >
                      {settings.language === 'pt' ? 'ATUAL' : 'LATEST'}
                    </button>
                  </div>
                  <input type="text" inputMode="decimal" value={newAssetBuyPrice} onChange={(e) => setNewAssetBuyPrice(e.target.value)} placeholder="0.00" className={`w-full bg-black border-2 ${styles.border} rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-yellow-400 transition-colors`} />
                </div>
              </div>
              <button type="submit" disabled={!selectedCoin} className={`w-3/4 mx-auto block bg-transparent border border-cyan-400 ${settings.theme === 'white' ? 'text-black' : 'text-white'} font-black py-4 rounded-xl text-sm uppercase shadow-[0_0_15px_rgba(34,211,238,0.5)] active:scale-95 transition-all hover:bg-cyan-400/10 disabled:opacity-30 disabled:cursor-not-allowed mt-auto`}>{TRANSLATIONS[settings.language].general.confirm}</button>
            </form>
          </Modal>

          <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={TRANSLATIONS[settings.language].general.edit_asset} theme={settings.theme}>
            <form onSubmit={handleUpdateAsset} className="h-full flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <img src={selectedCoin?.thumb} className="w-8 h-8 rounded-full" />
                <span className={`font-black uppercase ${settings.theme === 'white' ? 'text-black' : 'text-white'}`}>{selectedCoin?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className={`text-xs font-black uppercase ml-1 ${settings.theme === 'white' ? 'text-black' : 'text-white'}`}>{TRANSLATIONS[settings.language].general.quantity}</span>
                  <input type="text" inputMode="decimal" value={newAssetAmount} onChange={(e) => setNewAssetAmount(e.target.value)} placeholder="0.00" className={`w-full bg-black border-2 ${styles.border} rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-yellow-400 transition-colors`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <span className={`text-xs font-black uppercase ${settings.theme === 'white' ? 'text-black' : 'text-white'}`}>{TRANSLATIONS[settings.language].general.price_paid}</span>
                    <button
                      type="button"
                      onClick={fillCurrentPrice}
                      className="text-[9px] font-black uppercase text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20"
                    >
                      {settings.language === 'pt' ? 'ATUAL' : 'LATEST'}
                    </button>
                  </div>
                  <input type="text" inputMode="decimal" value={newAssetBuyPrice} onChange={(e) => setNewAssetBuyPrice(e.target.value)} placeholder="0.00" className={`w-full bg-black border-2 ${styles.border} rounded-xl p-4 text-[10px] font-bold text-white outline-none focus:border-yellow-400 transition-colors`} />
                </div>
              </div>
              <button type="submit" className={`w-3/4 mx-auto block bg-transparent border border-cyan-400 ${settings.theme === 'white' ? 'text-cyan-600' : 'text-white'} font-black py-4 rounded-xl text-sm uppercase shadow-[0_0_15px_rgba(34,211,238,0.5)] active:scale-95 transition-all hover:bg-cyan-400/10 mt-auto`}>{TRANSLATIONS[settings.language].general.save_changes}</button>
            </form>
          </Modal>

          <Modal
            isOpen={isMobileAppModalOpen}
            onClose={() => setIsMobileAppModalOpen(false)}
            title={TRANSLATIONS[settings.language].menu.mobile_app}
            theme={settings.theme}
          >
            <div className="flex flex-col items-center justify-center p-6 text-center gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                {/* QR Code Gen using Google Charts API */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(SITE_URL)}`}
                  alt="QR Code"
                  className="w-48 h-48 md:w-64 md:h-64"
                />
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-bold uppercase tracking-widest ${settings.theme === 'white' ? 'text-black' : 'text-white'}`}>
                  {settings.language === 'pt' ? 'Acesse no seu Smartphone' : 'Access on your Smartphone'}
                </p>
                <div className="bg-black/40 border border-white/10 rounded-lg p-3 break-all">
                  <code className="text-cyan-400 text-xs">{SITE_URL}</code>
                </div>
                <p className="text-[10px] text-white/40 uppercase font-medium max-w-[250px] mx-auto leading-relaxed">
                  {settings.language === 'pt'
                    ? 'Aponte a câmera do seu celular para o código acima para abrir o app e sincronizar seus dados.'
                    : 'Point your phone camera at the code above to open the app and sync your data.'}
                </p>
              </div>
            </div>
          </Modal>

          {/* Support Toast Notification */}
          {showSupportToast && (
            <div className="fixed bottom-24 right-4 z-[500] animate-in slide-in-from-right-10 duration-500">
              <div
                onClick={() => { setCurrentView('admin'); setShowSupportToast(false); }}
                className="bg-yellow-400 text-black p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-black/10 active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="animate-bounce" size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-tight opacity-50">Nova Mensagem</p>
                  <p className="text-xs font-bold leading-tight">Você recebeu um novo<br />ticket de suporte!</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSupportToast(false); }}
                  className="p-2 -mr-2 opacity-20 hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default App;
