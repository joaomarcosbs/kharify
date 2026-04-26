// ============================================
// CPF Validator (Módulo 11 — padrão numérico)
// ============================================

function isValidCpf(cpf: string): boolean {
  // Remove formatação
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;

  // Rejeitar sequências repetidas (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Cálculo do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  // Cálculo do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;

  return true;
}

// ============================================
// CNPJ Alfanumérico Validator (Módulo 11)
// ============================================

const WEIGHTS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const WEIGHTS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function charToValue(char: string): number {
  return char.charCodeAt(0) - 48;
}

function isValidCnpj(cnpj: string): boolean {
  // Remove formatação (pontos, barras, traços)
  const cleaned = cnpj.replace(/[.\-\/]/g, '').toUpperCase();

  if (cleaned.length !== 14) return false;

  // Verificar formato: 12 alfanuméricos + 2 numéricos
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cleaned)) return false;

  const base = cleaned.substring(0, 12);

  // Rejeitar sequências repetidas numéricas (ex: 00.000.000/0000-00)
  if (/^(\d)\1{11}$/.test(base)) return false;

  // Converter caracteres para valores numéricos
  const values = Array.from(base).map(charToValue);

  // Cálculo do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += values[i] * WEIGHTS_DV1[i];
  }
  let remainder = sum % 11;
  const dv1 = remainder < 2 ? 0 : 11 - remainder;

  if (dv1 !== parseInt(cleaned[12])) return false;

  // Cálculo do 2º dígito verificador (incluindo dv1)
  const valuesWithDv1 = [...values, dv1];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += valuesWithDv1[i] * WEIGHTS_DV2[i];
  }
  remainder = sum % 11;
  const dv2 = remainder < 2 ? 0 : 11 - remainder;

  if (dv2 !== parseInt(cleaned[13])) return false;

  return true;
}

// ============================================
// Validador combinado: aceita CPF (11) ou CNPJ (14)
// ============================================

export function isValidDocument(value: string): boolean {
  const cleaned = value.replace(/[.\-\/]/g, '');

  if (cleaned.length === 11) return isValidCpf(value);
  if (cleaned.length === 14) return isValidCnpj(value);

  return false;
}
