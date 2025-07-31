// Validadores para documentos peruanos

export const validateRUC = (ruc: string): { isValid: boolean; message?: string } => {
  // Limpiar espacios y guiones
  const cleanRuc = ruc.replace(/[\s-]/g, '');
  
  // Verificar longitud
  if (cleanRuc.length !== 11) {
    return { isValid: false, message: 'El RUC debe tener 11 dígitos' };
  }
  
  // Verificar que solo contenga números
  if (!/^\d+$/.test(cleanRuc)) {
    return { isValid: false, message: 'El RUC solo debe contener números' };
  }
  
  // Verificar primer dígito (tipo de contribuyente)
  const firstDigit = cleanRuc[0];
  if (!['1', '2'].includes(firstDigit)) {
    return { isValid: false, message: 'RUC inválido: debe comenzar con 1 o 2' };
  }
  
  // Algoritmo de validación del dígito verificador
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanRuc[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  if (checkDigit !== parseInt(cleanRuc[10])) {
    return { isValid: false, message: 'RUC inválido: dígito verificador incorrecto' };
  }
  
  return { isValid: true };
};

export const validateDNI = (dni: string): { isValid: boolean; message?: string } => {
  // Limpiar espacios y guiones
  const cleanDni = dni.replace(/[\s-]/g, '');
  
  // Verificar longitud
  if (cleanDni.length !== 8) {
    return { isValid: false, message: 'El DNI debe tener 8 dígitos' };
  }
  
  // Verificar que solo contenga números
  if (!/^\d+$/.test(cleanDni)) {
    return { isValid: false, message: 'El DNI solo debe contener números' };
  }
  
  // Verificar que no sean todos números iguales
  if (/^(\d)\1{7}$/.test(cleanDni)) {
    return { isValid: false, message: 'DNI inválido: no puede tener todos los dígitos iguales' };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Formato de email inválido' };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
  // Limpiar espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Verificar longitud (7-9 dígitos para teléfonos peruanos)
  if (cleanPhone.length < 7 || cleanPhone.length > 9) {
    return { isValid: false, message: 'El teléfono debe tener entre 7 y 9 dígitos' };
  }
  
  // Verificar que solo contenga números
  if (!/^\d+$/.test(cleanPhone)) {
    return { isValid: false, message: 'El teléfono solo debe contener números' };
  }
  
  return { isValid: true };
};

// Validador para códigos de productos
export const validateProductCode = (code: string): { isValid: boolean; message?: string } => {
  if (!code.trim()) {
    return { isValid: false, message: 'El código del producto es requerido' };
  }
  
  if (code.length < 3 || code.length > 20) {
    return { isValid: false, message: 'El código debe tener entre 3 y 20 caracteres' };
  }
  
  // Permitir solo letras, números y algunos caracteres especiales
  if (!/^[A-Za-z0-9\-_]+$/.test(code)) {
    return { isValid: false, message: 'El código solo puede contener letras, números, guiones y guiones bajos' };
  }
  
  return { isValid: true };
};

// Validador para precios
export const validatePrice = (price: number): { isValid: boolean; message?: string } => {
  if (price <= 0) {
    return { isValid: false, message: 'El precio debe ser mayor a 0' };
  }
  
  if (price > 999999.99) {
    return { isValid: false, message: 'El precio no puede exceder 999,999.99' };
  }
  
  // Verificar que tenga máximo 2 decimales
  if (!/^\d+(\.\d{1,2})?$/.test(price.toString())) {
    return { isValid: false, message: 'El precio puede tener máximo 2 decimales' };
  }
  
  return { isValid: true };
};

// Validador para stock
export const validateStock = (stock: number): { isValid: boolean; message?: string } => {
  if (stock < 0) {
    return { isValid: false, message: 'El stock no puede ser negativo' };
  }
  
  if (!Number.isInteger(stock)) {
    return { isValid: false, message: 'El stock debe ser un número entero' };
  }
  
  if (stock > 999999) {
    return { isValid: false, message: 'El stock no puede exceder 999,999 unidades' };
  }
  
  return { isValid: true };
};

// Función para consultar RUC en SUNAT (real)
export const consultRUC = async (ruc: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  const validation = validateRUC(ruc);
  if (!validation.isValid) {
    return { success: false, message: validation.message };
  }
  
  try {
    const response = await fetch(`/api/sunat/ruc?ruc=${ruc}`);
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, message: result.error || 'Error al consultar RUC' };
    }
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: 'Error de conexión al consultar RUC' };
  }
};

// Función para consultar DNI en RENIEC (real)
export const consultDNI = async (dni: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  const validation = validateDNI(dni);
  if (!validation.isValid) {
    return { success: false, message: validation.message };
  }
  
  try {
    const response = await fetch(`/api/reniec/dni?dni=${dni}`);
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, message: result.error || 'Error al consultar DNI' };
    }
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: 'Error de conexión al consultar DNI' };
  }
};