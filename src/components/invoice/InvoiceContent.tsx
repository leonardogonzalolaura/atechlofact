import React from 'react';
import { useTax } from '../../contexts/TaxContext';
import { useCompany } from '../../contexts/CompanyContext';
import { getAmountInWords } from '../../utils/numberToWords';

interface InvoiceContentProps {
  invoiceData: any;
}

const InvoiceContent = ({ invoiceData }: InvoiceContentProps) => {
  const { taxConfig } = useTax();
  const { companyData } = useCompany();

  return (
    <div className="print-content">
      {/* Header SUNAT Standard */}
      <div className="p-4" style={{display: 'table', width: '100%'}}>
        <div style={{display: 'table-cell', width: '20%', verticalAlign: 'middle', textAlign: 'center', paddingRight: '10px'}}>
          {/* Logo de la empresa */}
          <div className="flex items-center justify-center h-24">
            {companyData.logo ? (
              <img src={companyData.logo} alt="Logo" className="max-w-full max-h-full object-contain" style={{width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%'}} />
            ) : (
              <svg className="w-20 h-20 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd"/>
              </svg>
            )}
          </div>
        </div>
        <div style={{display: 'table-cell', width: '50%', verticalAlign: 'top', paddingLeft: '15px', paddingRight: '15px'}}>
          <h1 className="text-xl font-bold mb-1 text-black">{companyData.razonSocial}</h1>
          <p className="text-sm text-black mb-1"><strong>RUC:</strong> {companyData.ruc}</p>
          <p className="text-sm text-black mb-1">{companyData.direccion}</p>
          <p className="text-sm text-black">{companyData.telefono} - {companyData.email}</p>
        </div>
        <div style={{display: 'table-cell', width: '30%', verticalAlign: 'top', textAlign: 'center', paddingLeft: '10px'}}>
          <div className="border-2 border-black p-3">
            <div className="font-bold text-sm mb-1 text-black">R.U.C. N° {companyData.ruc}</div>
            <div className="font-bold text-lg text-black">{invoiceData.tipoComprobante}</div>
            <div className="font-bold text-lg text-black">{invoiceData.serie} - {invoiceData.numero}</div>
          </div>
        </div>
      </div>

      {/* Información del cliente y documento - SUNAT Standard */}
      <div className="p-4">
        <div style={{display: 'table', width: '100%'}}>
          <div style={{display: 'table-cell', width: '70%', verticalAlign: 'top', paddingRight: '20px'}}>
            <div className="mb-3">
              <strong className="text-black">Señor(es):</strong> <span className="text-black">{invoiceData.cliente.razonSocial}</span>
            </div>
            <div className="mb-3">
              <strong className="text-black">{invoiceData.cliente.tipoDocumento}:</strong> <span className="text-black">{invoiceData.cliente.numeroDocumento}</span>
            </div>
            <div className="mb-3">
              <strong className="text-black">Dirección:</strong> <span className="text-black">{invoiceData.cliente.direccion}</span>
            </div>
          </div>
          <div style={{display: 'table-cell', width: '30%', verticalAlign: 'top'}}>
            <div className="mb-3">
              <strong className="text-black">Fecha de Emisión:</strong><br/>
              <span className="text-black">{new Date(invoiceData.fechaEmision).toLocaleDateString('es-PE')}</span>
            </div>
            {invoiceData.fechaVencimiento && (
              <div className="mb-3">
                <strong className="text-black">Fecha de Vencimiento:</strong><br/>
                <span className="text-black">{new Date(invoiceData.fechaVencimiento).toLocaleDateString('es-PE')}</span>
              </div>
            )}
            <div className="mb-3">
              <strong className="text-black">Moneda:</strong><br/>
              <span className="text-black">{invoiceData.moneda === 'PEN' ? 'SOLES' : 'DOLARES AMERICANOS'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de items - SUNAT Standard */}
      <div>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="bg-blue-600 text-white px-3 py-2 text-left font-bold text-sm">CANT.</th>
              <th className="bg-blue-600 text-white px-3 py-2 text-left font-bold text-sm">DESCRIPCIÓN</th>
              <th className="bg-blue-600 text-white px-3 py-2 text-right font-bold text-sm">P. UNITARIO</th>
              <th className="bg-blue-600 text-white px-3 py-2 text-right font-bold text-sm">IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item: any, index: number) => (
              <tr key={item.id}>
                <td className="px-3 py-2 text-sm text-center text-black">{item.cantidad.toFixed(2)}</td>
                <td className="px-3 py-2 text-sm text-black">{item.descripcion}</td>
                <td className="px-3 py-2 text-sm text-right text-black">{item.precio.toFixed(2)}</td>
                <td className="px-3 py-2 text-sm text-right text-black">{item.total.toFixed(2)}</td>
              </tr>
            ))}
            {/* Filas vacías para completar espacio */}
            {Array.from({length: Math.max(0, 8 - invoiceData.items.length)}).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td className="px-3 py-2 text-sm">&nbsp;</td>
                <td className="px-3 py-2 text-sm">&nbsp;</td>
                <td className="px-3 py-2 text-sm">&nbsp;</td>
                <td className="px-3 py-2 text-sm">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales - SUNAT Standard */}
      <div>
        <div style={{display: 'table', width: '100%'}}>
          <div style={{display: 'table-cell', width: '60%', verticalAlign: 'top', padding: '15px'}}>
            <div className="mb-4">
              <strong className="text-black text-xs">SON:</strong>
              <span className="text-black text-xs font-bold">{getAmountInWords(invoiceData.total, invoiceData.moneda)}</span>
            </div>
            {invoiceData.observaciones && (
              <div>
                <strong className="text-black">OBSERVACIONES:</strong><br/>
                <span className="text-black">{invoiceData.observaciones}</span>
              </div>
            )}
          </div>
          <div style={{display: 'table-cell', width: '40%', verticalAlign: 'top'}}>
            <div className="border border-black">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="px-3 py-2 text-sm font-bold text-black">SUB TOTAL</td>
                    <td className="px-3 py-2 text-sm text-right text-black">{invoiceData.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-sm font-bold text-black">{taxConfig.igvLabel} {(taxConfig.igvRate * 100).toFixed(0)}%</td>
                    <td className="px-3 py-2 text-sm text-right text-black">{invoiceData.igv.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="px-3 py-3 text-base font-bold text-black">TOTAL A PAGAR {invoiceData.moneda}</td>
                    <td className="px-3 py-3 text-base font-bold text-right text-black">{invoiceData.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer SUNAT */}
      <div className="mt-4 text-center text-xs text-gray-700 space-y-1">
        <p><strong>Representación Impresa de la {invoiceData.tipoComprobante} ELECTRÓNICA</strong></p>
        <p>Consulte su documento en: www.sunat.gob.pe</p>
        <p>Autorizado mediante Resolución de Intendencia N° 034-005-0000185/SUNAT</p>
      </div>
    </div>
  );
};

export default InvoiceContent;