'use client';

import jsPDF from 'jspdf';
import { Devis, Facture, Client, CompanySettings } from './types';
import { formatCurrency, formatDate } from './utils';

export function generateDevisPDF(
  devis: Devis,
  client: Client | undefined,
  settings: CompanySettings
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const primaryColor = '#E85D04';
  const textColor = '#1A1A1A';
  const secondaryColor = '#6B7280';

  // Header - Company Info
  doc.setFontSize(24);
  doc.setTextColor(29, 29, 29);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.name || 'Mon Entreprise', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor);

  if (settings.address) doc.text(settings.address, 20, 32);
  if (settings.postalCode || settings.city) doc.text(`${settings.postalCode || ''} ${settings.city || ''}`.trim(), 20, 37);
  if (settings.email) doc.text(settings.email, 20, 42);
  if (settings.phone) doc.text(settings.phone, 20, 47);
  if (settings.siret) doc.text(`SIRET: ${settings.siret}`, 20, 52);

  // DEVIS Title
  doc.setFontSize(28);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', pageWidth - 20, 25, { align: 'right' });

  doc.setFontSize(12);
  doc.setTextColor(textColor);
  doc.text(devis.number, pageWidth - 20, 32, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(`Date: ${formatDate(devis.date)}`, pageWidth - 20, 38, { align: 'right' });
  doc.text(`Valide jusqu'au: ${formatDate(devis.validUntil)}`, pageWidth - 20, 43, { align: 'right' });

  // Divider
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 60, pageWidth - 20, 60);

  // Client Info
  let y = 70;
  doc.setFontSize(11);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 20, y);

  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'normal');
  if (client) {
    doc.text(client.name, 20, y);
    y += 5;
    if (client.address) { doc.text(client.address, 20, y); y += 5; }
    if (client.postalCode || client.city) { doc.text(`${client.postalCode || ''} ${client.city || ''}`.trim(), 20, y); y += 5; }
    if (client.email) { doc.text(client.email, 20, y); y += 5; }
    if (client.phone) doc.text(client.phone, 20, y);
  } else {
    doc.text('Client non renseigné', 20, y);
  }

  // Table Header
  y = 110;
  doc.setFillColor(240, 237, 232);
  doc.rect(20, y - 5, pageWidth - 40, 10, 'F');

  doc.setFontSize(9);
  doc.setTextColor(secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 22, y);
  doc.text('QTE', 120, y);
  doc.text('PRIX HT', 140, y);
  doc.text('TVA', 165, y);
  doc.text('TOTAL TTC', pageWidth - 22, y, { align: 'right' });

  // Table Rows
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor);

  devis.lines.forEach((line) => {
    if (y > 250) {
      doc.addPage();
      y = 30;
    }

    doc.setFontSize(9);
    // Truncate long descriptions
    const desc = line.name?.length > 35 ? line.name.substring(0, 32) + '...' : (line.name || '-');
    doc.text(desc, 22, y);
    doc.text(String(line.quantity), 122, y);
    doc.text(formatCurrency(line.unitPrice), 142, y);
    doc.text(`${line.tvaRate}%`, 167, y);
    doc.text(formatCurrency(line.totalTTC), pageWidth - 22, y, { align: 'right' });

    if (line.description) {
      y += 4;
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      const desc2 = line.description.length > 40 ? line.description.substring(0, 37) + '...' : line.description;
      doc.text(desc2, 22, y);
    }

    y += 10;
    doc.setTextColor(textColor);

    // Separator line
    doc.setDrawColor(229, 226, 221);
    doc.setLineWidth(0.2);
    doc.line(22, y - 5, pageWidth - 22, y - 5);
  });

  // Totals
  y += 5;
  doc.setDrawColor(229, 226, 221);
  doc.setLineWidth(0.5);
  doc.line(130, y, pageWidth - 20, y);
  y += 8;

  const subtotal = devis.lines.reduce((sum, line) => sum + line.totalHT, 0);
  const discount = subtotal * (devis.discountPercent / 100);
  const totalTVA = devis.lines.reduce((sum, line) => sum + (line.totalTTC - line.totalHT), 0) * (1 - devis.discountPercent / 100);
  const totalTTC = subtotal - discount + totalTVA;

  doc.setFontSize(10);
  doc.text('Sous-total HT:', 100, y);
  doc.text(formatCurrency(subtotal), pageWidth - 22, y, { align: 'right' });

  if (devis.discountPercent > 0) {
    y += 6;
    doc.setTextColor('#059669');
    doc.text(`Remise (${devis.discountPercent}%):`, 100, y);
    doc.text(`-${formatCurrency(discount)}`, pageWidth - 22, y, { align: 'right' });
  }

  y += 6;
  doc.setTextColor(textColor);
  doc.text('TVA:', 100, y);
  doc.text(formatCurrency(totalTVA), pageWidth - 22, y, { align: 'right' });

  y += 10;
  doc.setFillColor(232, 93, 4);
  doc.rect(95, y - 5, pageWidth - 115, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL TTC:', 100, y + 2);
  doc.text(formatCurrency(totalTTC), pageWidth - 22, y + 2, { align: 'right' });

  // Payment Conditions
  if (devis.paymentConditions) {
    y += 20;
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Conditions de paiement:', 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(devis.paymentConditions, 20, y);
  }

  // Notes
  if (devis.notes) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor);
    const noteLines = doc.splitTextToSize(devis.notes, pageWidth - 50);
    doc.text(noteLines, 20, y);
  }

  // Legal Mentions
  if (settings.legalMentions) {
    y = 270;
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    const legalLines = doc.splitTextToSize(settings.legalMentions, pageWidth - 40);
    doc.text(legalLines, 20, y);
  }

  return doc;
}

export function generateFacturePDF(
  facture: Facture,
  client: Client | undefined,
  settings: CompanySettings
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const primaryColor = '#E85D04';
  const textColor = '#1A1A1A';
  const secondaryColor = '#6B7280';

  // Header - Company Info
  doc.setFontSize(24);
  doc.setTextColor(29, 29, 29);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.name || 'Mon Entreprise', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor);

  if (settings.address) doc.text(settings.address, 20, 32);
  if (settings.postalCode || settings.city) doc.text(`${settings.postalCode || ''} ${settings.city || ''}`.trim(), 20, 37);
  if (settings.email) doc.text(settings.email, 20, 42);
  if (settings.phone) doc.text(settings.phone, 20, 47);
  if (settings.siret) doc.text(`SIRET: ${settings.siret}`, 20, 52);

  // FACTURE Title
  doc.setFontSize(28);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth - 20, 25, { align: 'right' });

  doc.setFontSize(12);
  doc.setTextColor(textColor);
  doc.text(facture.number, pageWidth - 20, 32, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(`Date: ${formatDate(facture.date)}`, pageWidth - 20, 38, { align: 'right' });
  doc.text(`Échéance: ${formatDate(facture.dueDate)}`, pageWidth - 20, 43, { align: 'right' });

  // Status badge
  const statusColors: Record<string, string[]> = {
    paid: ['#059669', '#D1FAE5'],
    partial: ['#D97706', '#FEF3C7'],
    unpaid: ['#DC2626', '#FEE2E2'],
  };
  const statusColor = statusColors[facture.status] || statusColors.unpaid;
  doc.setFillColor(parseInt(statusColor[1].slice(1, 3), 16), parseInt(statusColor[1].slice(3, 5), 16), parseInt(statusColor[1].slice(5, 7), 16));
  doc.roundedRect(pageWidth - 45, 47, 25, 8, 2, 2, 'F');
  doc.setTextColor(parseInt(statusColor[0].slice(1, 3), 16), parseInt(statusColor[0].slice(3, 5), 16), parseInt(statusColor[0].slice(5, 7), 16));
  doc.setFontSize(8);
  doc.text(facture.status === 'paid' ? 'PAYÉE' : facture.status === 'partial' ? 'PARTIEL' : 'IMPAYÉE', pageWidth - 32.5, 52.5, { align: 'center' });

  // Divider
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 60, pageWidth - 20, 60);

  // Client Info
  let y = 70;
  doc.setFontSize(11);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 20, y);

  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'normal');
  if (client) {
    doc.text(client.name, 20, y);
    y += 5;
    if (client.address) { doc.text(client.address, 20, y); y += 5; }
    if (client.postalCode || client.city) { doc.text(`${client.postalCode || ''} ${client.city || ''}`.trim(), 20, y); y += 5; }
    if (client.email) { doc.text(client.email, 20, y); y += 5; }
    if (client.phone) doc.text(client.phone, 20, y);
  } else {
    doc.text('Client non renseigné', 20, y);
  }

  // Table Header
  y = 110;
  doc.setFillColor(240, 237, 232);
  doc.rect(20, y - 5, pageWidth - 40, 10, 'F');

  doc.setFontSize(9);
  doc.setTextColor(secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 22, y);
  doc.text('QTE', 120, y);
  doc.text('PRIX HT', 140, y);
  doc.text('TVA', 165, y);
  doc.text('TOTAL TTC', pageWidth - 22, y, { align: 'right' });

  // Table Rows
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor);

  facture.lines.forEach((line) => {
    if (y > 250) {
      doc.addPage();
      y = 30;
    }

    doc.setFontSize(9);
    const desc = line.name?.length > 35 ? line.name.substring(0, 32) + '...' : (line.name || '-');
    doc.text(desc, 22, y);
    doc.text(String(line.quantity), 122, y);
    doc.text(formatCurrency(line.unitPrice), 142, y);
    doc.text(`${line.tvaRate}%`, 167, y);
    doc.text(formatCurrency(line.totalTTC), pageWidth - 22, y, { align: 'right' });

    if (line.description) {
      y += 4;
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      const desc2 = line.description.length > 40 ? line.description.substring(0, 37) + '...' : line.description;
      doc.text(desc2, 22, y);
    }

    y += 10;
    doc.setTextColor(textColor);

    // Separator line
    doc.setDrawColor(229, 226, 221);
    doc.setLineWidth(0.2);
    doc.line(22, y - 5, pageWidth - 22, y - 5);
  });

  // Totals
  y += 5;
  doc.setDrawColor(229, 226, 221);
  doc.setLineWidth(0.5);
  doc.line(130, y, pageWidth - 20, y);
  y += 8;

  const subtotal = facture.lines.reduce((sum, line) => sum + line.totalHT, 0);
  const discount = subtotal * (facture.discountPercent / 100);
  const totalTVA = facture.lines.reduce((sum, line) => sum + (line.totalTTC - line.totalHT), 0) * (1 - facture.discountPercent / 100);
  const totalTTC = subtotal - discount + totalTVA;

  doc.setFontSize(10);
  doc.text('Sous-total HT:', 100, y);
  doc.text(formatCurrency(subtotal), pageWidth - 22, y, { align: 'right' });

  if (facture.discountPercent > 0) {
    y += 6;
    doc.setTextColor('#059669');
    doc.text(`Remise (${facture.discountPercent}%):`, 100, y);
    doc.text(`-${formatCurrency(discount)}`, pageWidth - 22, y, { align: 'right' });
  }

  y += 6;
  doc.setTextColor(textColor);
  doc.text('TVA:', 100, y);
  doc.text(formatCurrency(totalTVA), pageWidth - 22, y, { align: 'right' });

  y += 10;
  doc.setFillColor(232, 93, 4);
  doc.rect(95, y - 5, pageWidth - 115, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL TTC:', 100, y + 2);
  doc.text(formatCurrency(totalTTC), pageWidth - 22, y + 2, { align: 'right' });

  // Payment Status
  y += 20;
  doc.setTextColor(textColor);
  doc.setFontSize(10);
  doc.text(`Payé: ${formatCurrency(facture.paidAmount || 0)}`, 20, y);
  doc.text(`Reste à payer: ${formatCurrency(totalTTC - (facture.paidAmount || 0))}`, 80, y);

  // Notes
  if (facture.notes) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor);
    const noteLines = doc.splitTextToSize(facture.notes, pageWidth - 50);
    doc.text(noteLines, 20, y);
  }

  // Legal Mentions
  if (settings.legalMentions) {
    y = 270;
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    const legalLines = doc.splitTextToSize(settings.legalMentions, pageWidth - 40);
    doc.text(legalLines, 20, y);
  }

  return doc;
}