export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[$--]/g, '')
    .trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

export function isNoSQLInjectionAttempt(input: string): boolean {
  const patterns = [
    /^\$/,
    /ObjectId/i,
    /\bwhere\b.*\$/i,
    /\$where/i,
    /\$eq\b/i,
    /\$ne\b/i,
    /\$gt\b/i,
    /\$lt\b/i,
    /\$in\b/i,
    /\$nin\b/i,
    /\$or\b/i,
    /\$and\b/i,
    /\$not\b/i,
    /\$exists\b/i,
    /\$type\b/i,
    /\$regex\b/i,
    /\/\$.*\//,
    /\.\$/,
    /\{\s*\$/,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

export function validatePhoneNumberStrict(phone: string): { valid: boolean; sanitized: string } {
  const sanitized = sanitizeInput(phone);
  
  if (isNoSQLInjectionAttempt(sanitized)) {
    return { valid: false, sanitized: '' };
  }
  
  const cleanPhone = sanitized.replace(/[\s\-\(\)]/g, '');
  
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return { valid: false, sanitized };
  }
  
  return { valid: true, sanitized: cleanPhone };
}

export function validateEmailStrict(email: string): { valid: boolean; sanitized: string } {
  const sanitized = sanitizeInput(email);
  
  if (isNoSQLInjectionAttempt(sanitized)) {
    return { valid: false, sanitized: '' };
  }
  
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailPattern.test(sanitized)) {
    return { valid: false, sanitized };
  }
  
  if (sanitized.length > 254) {
    return { valid: false, sanitized };
  }
  
  return { valid: true, sanitized };
}

export function validateNameStrict(name: string): { valid: boolean; sanitized: string } {
  const sanitized = sanitizeInput(name);
  
  if (isNoSQLInjectionAttempt(sanitized)) {
    return { valid: false, sanitized: '' };
  }
  
  const namePattern = /^[a-zA-Z\s'-]+$/;
  
  if (!namePattern.test(sanitized)) {
    return { valid: false, sanitized };
  }
  
  if (sanitized.length < 2 || sanitized.length > 100) {
    return { valid: false, sanitized };
  }
  
  return { valid: true, sanitized };
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function validateAndSanitizeQuery(query: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(query)) {
    if (typeof key === 'string') {
      const cleanKey = sanitizeInput(key);
      
      if (cleanKey !== key || isNoSQLInjectionAttempt(key)) {
        continue;
      }
      
      if (typeof value === 'string') {
        sanitized[cleanKey] = sanitizeInput(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[cleanKey] = value;
      } else if (Array.isArray(value)) {
        sanitized[cleanKey] = value.map(v => 
          typeof v === 'string' ? sanitizeInput(v) : v
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[cleanKey] = validateAndSanitizeQuery(value as Record<string, unknown>);
      }
    }
  }
  
  return sanitized;
}
