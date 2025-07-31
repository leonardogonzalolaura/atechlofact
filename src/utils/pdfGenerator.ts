import jsPDF from 'jspdf';

interface CompanyData {
  ruc: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
}

interface CustomerData {
  tipoDocumento: string;
  numeroDocumento: string;
  razonSocial: string;
  direccion: string;
}

interface InvoiceItem {
  descripcion: string;
  cantidad: number;
  precio: number;
  total: number;
}

interface InvoiceData {
  tipoComprobante: string;
  serie: string;
  numero: string;
  fechaEmision: string;
  cliente: CustomerData;
  items: InvoiceItem[];
  subtotal: number;
  igv: number;
  total: number;
  observaciones?: string;
}

export const generateInvoicePDF = (invoiceData: InvoiceData, companyData: CompanyData): void => {
  const doc = new jsPDF();
  
  // Header - Datos de la empresa
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyData.razonSocial, 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUC: ${companyData.ruc}`, 15, 28);
  doc.text(companyData.direccion, 15, 34);
  
  // Tipo de comprobante
  doc.setFillColor(240, 240, 240);
  doc.rect(140, 10, 55, 20, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.tipoComprobante, 167, 18, { align: 'center' });
  doc.text(`${invoiceData.serie}-${invoiceData.numero}`, 167, 25, { align: 'center' });
  
  // Datos del cliente
  let yPos = 55;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', 15, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoiceData.cliente.tipoDocumento}: ${invoiceData.cliente.numeroDocumento}`, 15, yPos);
  doc.text(`Fecha: ${new Date(invoiceData.fechaEmision).toLocaleDateString('es-PE')}`, 140, yPos);
  
  yPos += 6;
  doc.text(`Cliente: ${invoiceData.cliente.razonSocial}`, 15, yPos);
  
  yPos += 6;
  doc.text(`Dirección: ${invoiceData.cliente.direccion}`, 15, yPos);
  
  // Tabla de items
  yPos += 15;
  
  // Header de la tabla
  doc.setFillColor(41, 128, 185);
  doc.rect(15, yPos, 180, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPCIÓN', 18, yPos + 5);
  doc.text('CANT.', 130, yPos + 5);
  doc.text('P. UNIT.', 150, yPos + 5);
  doc.text('TOTAL', 175, yPos + 5);
  
  yPos += 8;
  
  // Items
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  invoiceData.items.forEach((item, index) => {
    yPos += 6;
    doc.text(item.descripcion.substring(0, 50), 18, yPos);
    doc.text(item.cantidad.toString(), 135, yPos, { align: 'right' });
    doc.text(item.precio.toFixed(2), 165, yPos, { align: 'right' });
    doc.text(item.total.toFixed(2), 190, yPos, { align: 'right' });
  });
  
  // Totales
  yPos += 15;
  const totalsX = 140;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`S/ ${invoiceData.subtotal.toFixed(2)}`, 190, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text('IGV (18%):', totalsX, yPos);
  doc.text(`S/ ${invoiceData.igv.toFixed(2)}`, 190, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL:', totalsX, yPos);
  doc.text(`S/ ${invoiceData.total.toFixed(2)}`, 190, yPos, { align: 'right' });
  
  // Descargar el PDF
  const fileName = `${invoiceData.tipoComprobante}_${invoiceData.serie}-${invoiceData.numero}.pdf`;
  doc.save(fileName);
};