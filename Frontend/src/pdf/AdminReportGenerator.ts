import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportStats {
  totalRevenue: number;
  totalBookings: number;
  averageTicket: number;
  newUsers: number;
}

interface ExportPDFParams {
  stats: ReportStats;
  reservationsData: any[];
  t: (key: string) => string;
}

export const exportAdminReportPDF = ({ stats, reservationsData, t }: ExportPDFParams) => {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [140, 230, 0]; // #8CE600
  const darkColor: [number, number, number] = [9, 9, 11]; // Zinc 950
  const lightGray: [number, number, number] = [249, 250, 251]; // Gray 50
  const borderColor: [number, number, number] = [226, 232, 240]; // Slate 200

  doc.setFillColor(...lightGray);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFillColor(...darkColor);
  doc.rect(0, 0, 210, 45, 'F');

  // Accent line
  doc.setFillColor(...primaryColor);
  doc.rect(0, 45, 210, 1.5, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('PLAYHUB', 15, 24);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('EXECUTIVE REPORT', 15, 32);

  doc.setTextColor(161, 161, 170); // Zinc 400
  doc.setFontSize(8);
  doc.text(`GERADO EM:`, 140, 20);
  doc.setTextColor(255, 255, 255);
  doc.text(`${new Date().toLocaleString('pt-BR')}`, 162, 20);

  doc.setTextColor(161, 161, 170);
  doc.text(`STATUS:`, 140, 26);
  doc.setTextColor(...primaryColor);
  doc.text(`CONFIDENCIAL`, 155, 26);

  doc.setTextColor(161, 161, 170);
  doc.text(`SISTEMA:`, 140, 32);
  doc.setTextColor(255, 255, 255);
  doc.text(`PlayHub Enterprise`, 155, 32);

  const drawPremiumCard = (x: number, y: number, w: number, h: number, title: string, value: string, iconColor: [number, number, number]) => {
    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 4, 4, 'FD');

    // Icon dot
    doc.setFillColor(...iconColor);
    doc.circle(x + 8, y + 9, 2, 'F');

    // Title
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), x + 12, y + 10);

    // Value
    doc.setTextColor(...darkColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + 6, y + 22);
  };

  const cardW = 42;
  const cardH = 32;
  const cardY = 55;
  const gap = 4;

  drawPremiumCard(15, cardY, cardW, cardH, t('admin.reports.summary.totalRevenue'), `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`, [16, 185, 129]);
  drawPremiumCard(15 + cardW + gap, cardY, cardW, cardH, t('admin.reports.summary.totalBookings'), stats.totalBookings.toString(), primaryColor);
  drawPremiumCard(15 + (cardW + gap) * 2, cardY, cardW, cardH, t('admin.reports.summary.averageTicket'), `R$ ${stats.averageTicket.toFixed(2)}`, [59, 130, 246]);
  drawPremiumCard(15 + (cardW + gap) * 3, cardY, cardW, cardH, t('admin.reports.summary.newUsers'), stats.newUsers.toString(), [168, 85, 247]);

  doc.setTextColor(...darkColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VISÃO GERAL DAS QUADRAS', 15, 102);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1.5);
  doc.line(15, 106, 25, 106);

  const sportsCount: Record<string, number> = {};
  reservationsData.forEach((r: any) => {
    const s = r.courtSport || 'Outros';
    sportsCount[s] = (sportsCount[s] || 0) + 1;
  });

  const sportEntries = Object.entries(sportsCount).sort((a, b) => b[1] - a[1]);

  autoTable(doc, {
    startY: 112,
    head: [['MODALIDADE', 'RESERVAS', 'PARTICIPAÇÃO']],
    body: sportEntries.map(([name, count]) => [
      name.toUpperCase(),
      count.toString(),
      `${((count / (stats.totalBookings || 1)) * 100).toFixed(1)}%`
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [100, 116, 139],
      fontStyle: 'bold',
      fontSize: 7,
      lineWidth: 0.1,
      lineColor: borderColor
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: darkColor,
      fontSize: 8,
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: borderColor
    },
    margin: { left: 15, right: 110 }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 115;

  doc.setTextColor(...darkColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALHAMENTO DE RESERVAS', 15, finalY + 20);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1.5);
  doc.line(15, finalY + 24, 25, finalY + 24);

  const tableData = reservationsData.slice(0, 50).map((r: any) => [
    new Date(r.startTime).toLocaleDateString('pt-BR'),
    (r.userName || 'N/A').toUpperCase(),
    (r.courtName || 'N/A').toUpperCase(),
    (r.courtSport || 'N/A').toUpperCase(),
    `R$ ${r.totalPrice}`,
    r.status === 2 ? 'CONFIRMADA' : r.status === 3 ? 'CANCELADA' : 'PENDENTE'
  ]);

  autoTable(doc, {
    startY: finalY + 30,
    head: [[
      t('admin.reports.pdf.date').toUpperCase(),
      t('admin.activities.table.user').toUpperCase(),
      t('admin.reports.pdf.court').toUpperCase(),
      'ESPORTE',
      t('admin.reports.pdf.value').toUpperCase(),
      t('admin.reports.pdf.status').toUpperCase()
    ]],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [250, 250, 250],
      textColor: [100, 116, 139],
      fontSize: 7,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [71, 85, 105], // Slate 600
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    },
    didDrawCell: (data) => {
      // Add subtle bottom border to rows
      if (data.row.section === 'body') {
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.1);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold', textColor: darkColor },
      1: { fontStyle: 'bold' },
      4: { cellWidth: 25, fontStyle: 'bold', textColor: [16, 185, 129] }, // Green for money
      5: { cellWidth: 30, fontStyle: 'bold' }
    }
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.line(15, 285, 195, 285);

    doc.setTextColor(161, 161, 170); // Zinc 400
    doc.setFontSize(7);
    doc.text(`PÁGINA ${i} DE ${pageCount}`, 180, 291);
    doc.text('PLAYHUB ENTERPRISE \u00A9 2026', 15, 291);
    doc.setTextColor(...primaryColor);
    doc.text('DOCUMENTO GERADO AUTOMATICAMENTE', 85, 291);
  }

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
