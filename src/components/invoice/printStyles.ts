export const generatePrintHTML = (content: string, invoiceData: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Factura ${invoiceData.serie}-${invoiceData.numero}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #000;
        }
        .bg-gradient-to-r {
          background: linear-gradient(to right, #1e40af, #1d4ed8) !important;
          color: white !important;
          padding: 20px;
          margin-bottom: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .company-header {
          display: table !important;
          width: 100% !important;
          background: #1e40af !important;
          color: white !important;
          padding: 20px !important;
        }
        .company-logo {
          display: table-cell !important;
          width: 15% !important;
          vertical-align: middle !important;
          text-align: center !important;
        }
        .company-info {
          display: table-cell !important;
          vertical-align: top !important;
          width: 50% !important;
          padding-left: 20px !important;
        }
        .client-section {
          text-align: center !important;
          padding: 20px !important;
        }
        .company-footer {
          text-align: center !important;
          padding-top: 15px !important;
          margin-top: 20px !important;
          font-size: 12px !important;
        }
        .document-info {
          display: table-cell !important;
          vertical-align: top !important;
          width: 35% !important;
          text-align: right !important;
        }
        .document-box {
          background: white !important;
          color: #1e40af !important;
          padding: 15px !important;
          border: 2px solid #000 !important;
          display: inline-block !important;
          text-align: center !important;
          min-width: 200px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .logo-placeholder {
          background: white !important;
          padding: 10px !important;
          border-radius: 8px !important;
          display: inline-block !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .totals-section {
          border: 1px solid #000 !important;
          padding: 15px !important;
          margin-top: 20px !important;
        }
        .total-final {
          background: #e9ecef !important;
          padding: 10px !important;
          font-weight: bold !important;
          font-size: 18px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .total-row {
          display: table !important;
          width: 100% !important;
          margin-top: 10px !important;
        }
        .total-label {
          display: table-cell !important;
          text-align: left !important;
          padding: 10px !important;
          width: 60% !important;
        }
        .total-amount {
          display: table-cell !important;
          text-align: right !important;
          padding: 10px !important;
          width: 40% !important;
        }
        table {
          width: 100%;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
        th {
          background: linear-gradient(to right, #1e40af, #1d4ed8) !important;
          color: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .client-info {
          text-align: center !important;
          margin: 10px 0 !important;
        }
        .flex {
          display: block;
        }
        .flex > span:first-child {
          display: inline-block;
          width: 40%;
          font-weight: bold;
        }
        .flex > span:last-child {
          display: inline-block;
          width: 60%;
          text-align: right;
        }
        .text-center { text-align: center; }
        .text-right { text-right; }
        .font-bold { font-weight: bold; }
        .text-xs { font-size: 12px; }
        .text-lg { font-size: 18px; }
        .text-xl { font-size: 20px; }
        .text-2xl { font-size: 24px; }
        .text-3xl { font-size: 30px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .p-4 { padding: 16px; }
        .p-6 { padding: 24px; }
        .p-8 { padding: 32px; }
        .border { border: 1px solid #000 !important; }
        .border-2 { border: 2px solid #000 !important; }
        .border-black { border-color: #000 !important; }
        .border-b { }
        .border-t-2 { }
        .rounded-lg { border-radius: 8px; }
        .space-y-2 > * + * { margin-top: 8px; }
        .space-y-3 > * + * { margin-top: 12px; }
        .flex { display: flex !important; }
        .items-center { align-items: center !important; }
        .justify-center { justify-content: center !important; }
        .h-24 { height: 96px !important; }
        .max-w-full { max-width: 100% !important; }
        .max-h-full { max-height: 100% !important; }
        .object-contain { object-fit: contain !important; }
        @media print {
          body { margin: 0; }
          .flex { display: flex !important; }
          .items-center { align-items: center !important; }
          .justify-center { justify-content: center !important; }
          .h-24 { height: 96px !important; }
          .max-w-full { max-width: 100% !important; }
          .max-h-full { max-height: 100% !important; }
          .object-contain { object-fit: contain !important; }
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
};