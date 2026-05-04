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
  const secondaryColor: [number, number, number] = [31, 41, 55]; // #1F2937
  const lightGray: [number, number, number] = [249, 250, 251];
  
  // --- Background Decor ---
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(0, 0, 210, 297, 'F');
  
  // --- Header ---
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Logo
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('PlayHub', 15, 25);
  
  // Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(t('admin.reports.pdf.reportTitle').toUpperCase(), 15, 35);
  
  // Metadata
  doc.setFontSize(8);
  doc.text(`${t('admin.reports.pdf.generatedAt')}: ${new Date().toLocaleString('pt-BR')}`, 145, 20);
  doc.text('Status: CONFIDENCIAL', 145, 25);
  doc.text('Versão: 2.0.4 (Enterprise)', 145, 30);

  // --- KPI Cards (Manual Drawing) ---
  const drawCard = (x: number, y: number, w: number, h: number, title: string, value: string, iconColor: [number, number, number]) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');
    
    // Left border accent
    doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.rect(x, y + 5, 2, h - 10, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), x + 6, y + 10);
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + 6, y + 20);
  };

  const cardW = 45;
  const cardH = 30;
  const cardY = 60;
  
  drawCard(15, cardY, cardW, cardH, t('admin.reports.summary.totalRevenue'), `R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`, [16, 185, 129]);
  drawCard(63, cardY, cardW, cardH, t('admin.reports.summary.totalBookings'), stats.totalBookings.toString(), primaryColor);
  drawCard(111, cardY, cardW, cardH, t('admin.reports.summary.averageTicket'), `R$ ${stats.averageTicket.toFixed(2)}`, [59, 130, 246]);
  drawCard(159, cardY, cardW, cardH, t('admin.reports.summary.newUsers'), stats.newUsers.toString(), [168, 85, 247]);

  // --- Statistics Section ---
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ANÁLISE DE DESEMPENHO', 15, 105);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(15, 108, 30, 108);

  // Simple Sport Distribution Table
  const sportsCount: Record<string, number> = {};
  reservationsData.forEach((r: any) => {
    const s = r.courtSport || 'Outros';
    sportsCount[s] = (sportsCount[s] || 0) + 1;
  });

  const sportEntries = Object.entries(sportsCount).sort((a, b) => b[1] - a[1]);

  autoTable(doc, {
    startY: 115,
    head: [['Modalidade', 'Reservas', '% Participação']],
    body: sportEntries.map(([name, count]) => [
      name,
      count.toString(),
      `${((count / (stats.totalBookings || 1)) * 100).toFixed(1)}%`
    ]),
    theme: 'plain',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 15, right: 110 }
  });

  // --- Detailed Table ---
  const finalY = (doc as any).lastAutoTable.finalY || 115;
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('admin.reports.pdf.bookingsDetail').toUpperCase(), 15, finalY + 20);
  
  const tableData = reservationsData.slice(0, 35).map((r: any) => [
    new Date(r.startTime).toLocaleDateString('pt-BR'),
    r.userName || 'N/A',
    r.courtName || 'N/A',
    r.courtSport || 'N/A',
    `R$ ${r.totalPrice}`,
    r.status === 2 ? 'CONFIRMADA' : r.status === 3 ? 'CANCELADA' : 'PENDENTE'
  ]);

  autoTable(doc, {
    startY: finalY + 25,
    head: [[
      t('admin.reports.pdf.date'), 
      t('admin.activities.table.user'), 
      t('admin.reports.pdf.court'), 
      'ESPORTE',
      t('admin.reports.pdf.value'), 
      t('admin.reports.pdf.status')
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 25 },
      4: { cellWidth: 20, fontStyle: 'bold' },
      5: { cellWidth: 30 }
    }
  });

  // --- Footer ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pageCount}`, 180, 292);
    doc.text('© 2026 PlayHub - Sistema de Gestão de Arenas Esportivas', 15, 292);
  }

  doc.save(`Relatorio_PlayHub_Executivo_${new Date().toISOString().split('T')[0]}.pdf`);
};
