export const numberToWords = (num: number): string => {
  const units = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (num === 0) return 'CERO';
  if (num === 100) return 'CIEN';

  let result = '';
  let integer = Math.floor(num);

  if (integer >= 1000000) {
    const millions = Math.floor(integer / 1000000);
    result += (millions === 1 ? 'UN MILLÓN ' : numberToWords(millions) + ' MILLONES ');
    integer %= 1000000;
    if (integer > 0) result += numberToWords(integer) + ' ';
  } else if (integer >= 1000) {
    const thousands = Math.floor(integer / 1000);
    if (thousands === 1) {
      result += 'MIL ';
    } else {
      result += numberToWords(thousands) + ' MIL ';
    }
    integer %= 1000;
    if (integer > 0) result += numberToWords(integer) + ' ';
  } else {
    if (integer >= 100) {
      result += hundreds[Math.floor(integer / 100)] + ' ';
      integer %= 100;
    }
    if (integer >= 20) {
      result += tens[Math.floor(integer / 10)];
      if (integer % 10 > 0) result += ' Y ' + units[integer % 10];
      result += ' ';
    } else if (integer >= 10) {
      result += teens[integer - 10] + ' ';
    } else if (integer > 0) {
      result += units[integer] + ' ';
    }
  }

  return result.trim();
};

export const getAmountInWords = (amount: number, currency: string): string => {
  const integer = Math.floor(amount);
  const decimal = Math.round((amount - integer) * 100);
  const currencyName = currency === 'PEN' ? 'SOLES' : 'DÓLARES AMERICANOS';
  
  return numberToWords(integer) + ' CON ' + decimal.toString().padStart(2, '0') + '/100 ' + currencyName;
};