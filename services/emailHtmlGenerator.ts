import { PortfolioItem, MissionLog } from "../types";

export const generateEmailHTML = (
    portfolioItems: { asset: string; quantity: number; totalValue: number }[],
    totalValue: number,
    allocationLogs: MissionLog[],
    logoBase64: string,
    language: 'pt' | 'en',
    currency: 'usd' | 'brl' | 'eur'
): string => {

    // 1. Formatters
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(val);
    };

    const formatDate = () => {
        return new Date().toLocaleString('en-US');
    };

    // 2. Aggregate Data
    const totalAssets = portfolioItems.length;
    // Group logs by Protocol
    const protocolGroups: Record<string, MissionLog[]> = {};
    allocationLogs.forEach(log => {
        const key = log.nomeProtocolo || 'Unknown';
        if (!protocolGroups[key]) protocolGroups[key] = [];
        protocolGroups[key].push(log);
    });
    const totalProtocols = Object.keys(protocolGroups).length;

    // 3. Generate Portfolio Table Rows
    const portfolioTableRows = portfolioItems.map(item => `
        <tr>
            <td>${item.asset}</td>
            <td>${item.quantity.toFixed(4)}</td>
            <td>${formatCurrency(item.totalValue / item.quantity)}</td>
            <td>${formatCurrency(item.totalValue)}</td>
        </tr>
    `).join('');

    // 4. Generate Protocol Cards
    const protocolCards = Object.entries(protocolGroups).map(([protocolName, logs]) => {
        const type = logs[0].categoria || 'Pool de Liquidez'; // Default or pick from first
        const wallet = logs[0].wallet || '0x...';

        const tokensList = logs.map(log => `
            <div style="margin-bottom: 4px; color: #333;">• <strong>${log.quantidade} ${log.moeda}</strong></div>
        `).join('');

        return `
        <div class="protocol-card">
            <div class="protocol-badge">${protocolName.toUpperCase()}</div>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div class="info-item" style="flex: 1;">
                    <div class="info-label">Tipo</div>
                    <div class="info-value">${type}</div>
                </div>
                <div class="info-item" style="flex: 2;">
                    <div class="info-label">Tokens Alocados</div>
                    <div style="margin-top: 5px;">
                        ${tokensList}
                    </div>
                </div>
            </div>
            <div class="info-item" style="margin-top: 15px;">
                <div class="info-label">Carteira Conectada</div>
                <div class="wallet-address">${wallet}</div>
            </div>
        </div>
        `;
    }).join('');

    // 5. Construct Final HTML
    return `
<!DOCTYPE html>
<html>
<head>
<style>
body{font-family:Segoe UI,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);padding:40px 20px;margin:0}
.container{max-width:1200px;margin:0 auto;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden}
.header{background:linear-gradient(135deg,#1e3c72,#2a5298,#7b2ff7);padding:60px 40px;text-align:center}
.logo{max-width:300px;width:90%;filter:drop-shadow(0 10px 25px rgba(0,0,0,.3));margin-bottom:20px}
.title{color:#00f2ff;font-size:2.5em;font-weight:700;margin:20px 0 10px;text-shadow:2px 2px 4px rgba(0,0,0,.3)}
.subtitle{color:rgba(255,255,255,.9);font-size:1.1em}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin:30px 40px}
.stat-card{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:25px;border-radius:12px;text-align:center}
.stat-value{font-size:1.8em;font-weight:700;margin:10px 0}
.stat-label{font-size:.9em;opacity:.9;text-transform:uppercase;letter-spacing:1px}
.section{margin:0 40px 45px}
.section-title{color:#2a5298;font-size:1.8em;font-weight:700;margin-bottom:25px;padding-bottom:12px;border-bottom:3px solid #7b2ff7}
table{width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,.1)}
thead{background:linear-gradient(135deg,#667eea,#764ba2)}
th{padding:15px;color:#fff;font-weight:600;text-align:left}
td{padding:15px;border-bottom:1px solid #e0e0e0;color:#333}
tbody tr:hover{background:#f8f9ff}
.total-row{background:linear-gradient(135deg,#ffd700,#ffed4e);font-weight:700;font-size:1.1em}
.total-row td{color:#1e3c72;border:none}
.protocol-card{background:linear-gradient(135deg,#f8f9ff,#e8ecff);border-radius:12px;padding:25px;margin-bottom:20px;border-left:5px solid #7b2ff7}
.protocol-badge{background:linear-gradient(135deg,#00f2ff,#7b2ff7);color:#fff;padding:8px 16px;border-radius:20px;font-weight:600;display:inline-block;margin-bottom:15px;font-size: 0.9em;}
.info-item{background:#fff;padding:12px;border-radius:8px;}
.info-label{color:#666;font-size:.85em;font-weight:600;text-transform:uppercase}
.info-value{color:#2a5298;font-size:1.1em;font-weight:700;margin-top:5px}
.wallet-address{font-family:Courier New,monospace;background:#f5f5f5;padding:8px 12px;border-radius:6px;color:#7b2ff7;word-break:break-all;font-size:0.9em}
</style>
</head>
<body>
<div class="container">
<div class="header">
${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Logo">` : ''}
<h1 class="title">RELATÓRIO DE PORTFÓLIO CRIPTO</h1>
<p class="subtitle">Gerado em: ${formatDate()}</p>
</div>
<div class="stats-grid">
<div class="stat-card"><div class="stat-label">Valor Total</div><div class="stat-value">${formatCurrency(totalValue)}</div></div>
<div class="stat-card"><div class="stat-label">Ativos</div><div class="stat-value">${totalAssets}</div></div>
<div class="stat-card"><div class="stat-label">Protocolos</div><div class="stat-value">${totalProtocols}</div></div>
</div>
<div class="section">
<h2 class="section-title">📊 RESUMO DO PORTIFÓLIO</h2>
<table>
<thead><tr><th>Criptomoeda</th><th>Qtd.</th><th>Preço (Unit)</th><th>Total</th></tr></thead>
<tbody>
${portfolioTableRows}
<tr class="total-row"><td colspan="3"><strong>TOTAL:</strong></td><td><strong>${formatCurrency(totalValue)}</strong></td></tr>
</tbody>
</table>
</div>
<div class="section">
<h2 class="section-title">🔗 ATIVOS LOCALIZADOS EM PROTOCOLOS</h2>
<h3 style="color:#00f2ff;font-size:1.4em;margin-bottom:20px;font-weight:600">💧 Pools de Liquidez</h3>
${protocolCards}
</div>
</div>
</body>
</html>
    `;
};
