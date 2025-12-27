import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PortfolioItem, MissionLog } from "../types";

// CONSTANTS (matching Python script)
const MARGIN = 20; // ~2cm
const COLOR_PURPLE = "#9945FF";
const COLOR_CYAN = "#00CED1";
const COLOR_GREEN = "#14F195";
const COLOR_GOLD = "#FFD700";
const COLOR_GRAY = "#808080";
const COLOR_BEIGE = "#F5F5DC";

// DICTIONARY
const TEXTS = {
    pt: {
        title: "RELATÓRIO DE PORTIFÓLIO CRIPTO",
        generated: "Gerado em",
        summary: "RESUMO DO PORTFÓLIO",
        total: "TOTAL:",
        table: ['Criptomoeda', 'Quantidade', 'Valor Unitário (USD)', 'Valor Total (USD)'],
        protocols: "ATIVOS LOCALIZADOS EM PROTOCOLOS",
        cats: {
            liq: "Pools de Liquidez",
            lend: "Protocolos de Empréstimo",
            stake: "Staking",
            farm: "Yield Farming",
            exch: "Corretoras / Exchanges",
            wallet: "Carteiras"
        },
        labels: { proto: "Protocolo:", asset: "Ativo:", wallet: "Carteira:", site: "Site:" },
        footer: "Cryptfolio Arcade - Gerencie seu portfólio cripto com facilidade!",
        page: "Página",
        actions: { lend: "Fornecido", borrow: "Tomado" }
    },
    en: {
        title: "CRYPTO PORTFOLIO REPORT",
        generated: "Generated at",
        summary: "PORTFOLIO SUMMARY",
        total: "TOTAL:",
        table: ['Cryptocurrency', 'Quantity', 'Unit Price (USD)', 'Total Value (USD)'],
        protocols: "ASSETS IN PROTOCOLS",
        cats: {
            liq: "Liquidity Pools",
            lend: "Lending Protocols",
            stake: "Staking",
            farm: "Yield Farming",
            exch: "Exchanges",
            wallet: "Wallets"
        },
        labels: { proto: "Protocol:", asset: "Asset:", wallet: "Wallet:", site: "Website:" },
        footer: "Cryptfolio Arcade - Manage your crypto portfolio with ease!",
        page: "Page",
        actions: { lend: "Lend", borrow: "Borrow" }
    }
};

export const generatePDF = (
    portfolioItems: PortfolioItem[],
    marketData: Record<string, any>,
    allocationLogs: MissionLog[],
    logoBase64: string,
    language: 'pt' | 'en'
): Blob => {
    // 0. Select Language
    const T = TEXTS[language];

    // 1. Initialize Document (A4)
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    let currentY = 0; // Starts at 0 for the banner

    // --- HELPER: Draw Header ---
    const drawHeader = () => {
        // Black Strip Background (Top 40mm)
        doc.setFillColor(10, 10, 10); // Nearly Black
        doc.rect(0, 0, PAGE_WIDTH, 50, 'F');

        // Logo
        if (logoBase64) {
            try {
                // Centered Logo area - Increased Visibility
                const imgWidth = 80;   // Increased from 50
                const imgHeight = 20;  // Increased from 12 (approx 4:1 ratio)
                const x = (PAGE_WIDTH - imgWidth) / 2;
                doc.addImage(logoBase64, 'PNG', x, 8, imgWidth, imgHeight);
            } catch (e) {
                console.warn("PDF Logo Error", e);
            }
        }

        // Title (Centered below logo in the strip)
        currentY = 35; // Moved down slightly to accommodate larger logo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22); // Slightly smaller to fit if needed, or keep 24
        doc.setTextColor(255, 255, 255); // White
        doc.text(T.title, PAGE_WIDTH / 2, currentY, { align: "center" });

        // Date (Centered below title)
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200); // Light Gray
        const now = new Date().toLocaleString(language === 'pt' ? "pt-BR" : "en-US", { dateStyle: "short", timeStyle: "short" });
        doc.text(`${T.generated}: ${now}`, PAGE_WIDTH / 2, currentY, { align: "center" });

        currentY = 65; // Reset Y for body content (below strip)
    };

    // --- HELPER: Portfolio Summary Table ---
    const drawPortfolioSummary = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(COLOR_PURPLE);
        doc.text(T.summary, MARGIN, currentY);

        currentY += 5;

        // Prepare Data
        const tableBody = portfolioItems.map(item => {
            const currentPrice = marketData[item.assetId]?.current_price || 0;
            const totalValue = currentPrice * item.quantity;
            return [
                item.name || item.assetId,
                item.quantity.toFixed(4),
                `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            ];
        });

        // Calculate Total
        const grandTotal = portfolioItems.reduce((acc, item) => {
            const price = marketData[item.assetId]?.current_price || 0;
            return acc + (price * item.quantity);
        }, 0);

        tableBody.push(["", "", T.total, `$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`]);

        autoTable(doc, {
            startY: currentY,
            head: [T.table],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: COLOR_PURPLE, textColor: '#ffffff', fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fillColor: COLOR_BEIGE, textColor: '#000000', halign: 'center', overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 25 },
                2: { cellWidth: 35 },
                3: { cellWidth: 35 }
            },
            margin: { left: MARGIN, right: MARGIN },
            didParseCell: (data) => {
                // Style the Total Row
                if (data.row.index === tableBody.length - 1) {
                    data.cell.styles.fillColor = COLOR_GOLD;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        // Update Y after table
        // @ts-ignore
        currentY = doc.lastAutoTable.finalY + 15;
    };

    // --- HELPER: Protocols Section ---
    const drawProtocols = () => {
        // Check page break
        if (currentY > PAGE_HEIGHT - 50) {
            doc.addPage();
            currentY = MARGIN + 10;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(COLOR_PURPLE);
        doc.text(T.protocols, MARGIN, currentY);
        currentY += 10;

        const categories = Array.from(new Set(allocationLogs.map(l => l.categoria)));

        categories.forEach(cat => {
            if (currentY > PAGE_HEIGHT - 40) {
                doc.addPage();
                currentY = MARGIN + 10;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(COLOR_GREEN);

            let label = cat;
            // Robust Mapping (Handles common PT source terms)
            const lowerCat = cat.toLowerCase();

            if (lowerCat.includes('liqui')) label = T.cats.liq;
            else if (lowerCat.includes('lend') || lowerCat.includes('empr')) label = T.cats.lend;
            else if (lowerCat.includes('stak')) label = T.cats.stake;
            else if (lowerCat.includes('farm')) label = T.cats.farm;
            else if (lowerCat.includes('corr') || lowerCat.includes('exch')) label = T.cats.exch;
            else if (lowerCat.includes('wall') || lowerCat.includes('cart')) label = T.cats.wallet;

            doc.text(label, MARGIN, currentY);
            currentY += 8;

            const items = allocationLogs.filter(l => l.categoria === cat);

            items.forEach(log => {
                if (currentY > PAGE_HEIGHT - 30) {
                    doc.addPage();
                    currentY = MARGIN + 10;
                }

                doc.setFontSize(10);
                doc.setTextColor("#000000"); // Black

                // Line 1: Protocol
                doc.setFont("helvetica", "bold");
                doc.text(T.labels.proto, MARGIN, currentY);
                doc.setFont("helvetica", "normal");
                doc.text(log.nomeProtocolo, MARGIN + 25, currentY);
                currentY += 5;

                // Line 2: Moeda/Qtd
                doc.setFont("helvetica", "bold");
                doc.text(T.labels.asset, MARGIN, currentY);
                doc.setFont("helvetica", "normal");

                // Logic for Dual Assets (Pools & Lending)
                let amountText = `${log.quantidade} ${log.moeda}`;
                
                // Identify category type for this specific item
                const itemCat = log.categoria.toLowerCase();
                const isLend = itemCat.includes('lend') || itemCat.includes('empr');
                const isPool = itemCat.includes('liqui') || itemCat.includes('pool');

                if (log.moeda2) {
                    if (isLend) {
                        // Lending Format: Lend: X / Borrow: Y
                        amountText = `${T.actions.lend}: ${log.quantidade} ${log.moeda}   /   ${T.actions.borrow}: ${log.quantidade2 || 0} ${log.moeda2}`;
                    } else if (isPool) {
                        // Pool Format: X + Y
                        amountText = `${log.quantidade} ${log.moeda} + ${log.quantidade2 || 0} ${log.moeda2}`;
                    } else {
                        // Fallback
                         amountText = `${log.quantidade} ${log.moeda} + ${log.quantidade2 || 0} ${log.moeda2}`;
                    }
                }

                doc.text(amountText, MARGIN + 25, currentY);
                currentY += 5;

                // Line 3: Wallet
                doc.setFont("helvetica", "bold");
                doc.text(T.labels.wallet, MARGIN, currentY);
                doc.setFont("helvetica", "normal");
                doc.text(log.wallet, MARGIN + 25, currentY);
                currentY += 5;

                // Line 4: Website (New)
                if (log.protocolUrl) {
                    doc.setFont("helvetica", "bold");
                    doc.text(T.labels.site, MARGIN, currentY);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(COLOR_CYAN); // Blue for link feel
                    doc.text(log.protocolUrl, MARGIN + 25, currentY);
                    
                    // Add Clickable Link
                    doc.link(MARGIN + 25, currentY - 3, doc.getTextWidth(log.protocolUrl), 5, { url: log.protocolUrl });
                    
                    doc.setTextColor("#000000"); // Reset to black
                    currentY += 8;
                } else {
                    currentY += 3; // Minimal spacing if no URL
                }
            });

            currentY += 5; // Spacing between categories
        });
    };

    // --- HELPER: Footer ---
    const drawFooter = () => {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(COLOR_GRAY);

            const pageText = `${T.page} ${i} / ${totalPages}`;

            doc.text(T.footer, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: "center" });
            doc.text(pageText, PAGE_WIDTH / 2, PAGE_HEIGHT - 6, { align: "center" });
        }
    };

    // EXECUTE
    drawHeader();
    drawPortfolioSummary();
    drawProtocols();
    drawFooter();

    return doc.output("blob");
};
