export const VALIDATION_RULES = {
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^[6-9]\d{9}$/,
    INTERNATIONAL_PATTERN: /^\+?[1-9]\d{1,14}$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  },
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    MAX_LENGTH: 254,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  ROLL_NUMBER: {
    PATTERN: /^[A-Za-z0-9]{1,20}$/,
  },
  EMPLOYEE_ID: {
    PATTERN: /^[A-Za-z0-9-]{1,30}$/,
  },
} as const

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePhoneNumber(phone: string, options?: { required?: boolean; allowInternational?: boolean }): ValidationResult {
  const errors: string[] = []
  const trimmed = phone?.trim() || ''
  
  if (!trimmed) {
    if (options?.required) {
      errors.push('Phone number is required')
    }
    return { isValid: !options?.required, errors }
  }
  
  if (trimmed.length < VALIDATION_RULES.PHONE.MIN_LENGTH) {
    errors.push(`Phone number must be at least ${VALIDATION_RULES.PHONE.MIN_LENGTH} digits`)
  }
  
  if (trimmed.length > VALIDATION_RULES.PHONE.MAX_LENGTH) {
    errors.push(`Phone number must not exceed ${VALIDATION_RULES.PHONE.MAX_LENGTH} digits`)
  }
  
  const pattern = options?.allowInternational 
    ? VALIDATION_RULES.PHONE.INTERNATIONAL_PATTERN 
    : VALIDATION_RULES.PHONE.PATTERN
  
  if (!pattern.test(trimmed.replace(/\s/g, ''))) {
    if (options?.allowInternational) {
      errors.push('Please enter a valid phone number')
    } else {
      errors.push('Please enter a valid 10-digit Indian mobile number starting with 6-9')
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validatePassword(password: string, options?: { requireSpecialChars?: boolean }): ValidationResult {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Password is required')
    return { isValid: false, errors }
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
  }
  
  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    errors.push(`Password must not exceed ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`)
  }
  
  if (options?.requireSpecialChars !== false) {
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)')
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateEmail(email: string, options?: { required?: boolean }): ValidationResult {
  const errors: string[] = []
  const trimmed = email?.trim() || ''
  
  if (!trimmed) {
    if (options?.required) {
      errors.push('Email is required')
    }
    return { isValid: !options?.required, errors }
  }
  
  if (trimmed.length > VALIDATION_RULES.EMAIL.MAX_LENGTH) {
    errors.push(`Email must not exceed ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`)
  }
  
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(trimmed)) {
    errors.push('Please enter a valid email address')
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  const errors: string[] = []
  const trimmed = name?.trim() || ''
  
  if (!trimmed) {
    errors.push(`${fieldName} is required`)
    return { isValid: false, errors }
  }
  
  if (trimmed.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    errors.push(`${fieldName} must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`)
  }
  
  if (trimmed.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    errors.push(`${fieldName} must not exceed ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`)
  }
  
  if (!VALIDATION_RULES.NAME.PATTERN.test(trimmed)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`)
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateRollNumber(rollNumber: string): ValidationResult {
  const errors: string[] = []
  const trimmed = rollNumber?.trim() || ''
  
  if (!trimmed) {
    errors.push('Roll number is required')
    return { isValid: false, errors }
  }
  
  if (!VALIDATION_RULES.ROLL_NUMBER.PATTERN.test(trimmed)) {
    errors.push('Roll number can only contain letters and numbers (max 20 characters)')
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateEmployeeId(employeeId: string): ValidationResult {
  const errors: string[] = []
  const trimmed = employeeId?.trim() || ''
  
  if (!trimmed) {
    errors.push('Employee ID is required')
    return { isValid: false, errors }
  }
  
  if (!VALIDATION_RULES.EMPLOYEE_ID.PATTERN.test(trimmed)) {
    errors.push('Employee ID can only contain letters, numbers, and hyphens (max 30 characters)')
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateStandard(standard: string): ValidationResult {
  const errors: string[] = []
  
  if (!standard) {
    errors.push('Class is required')
    return { isValid: false, errors }
  }
  
  const validClasses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  if (!validClasses.includes(standard)) {
    errors.push('Please select a valid class (1-12)')
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateDivision(division: string, standard?: string): ValidationResult {
  const errors: string[] = []
  
  if (!division) {
    errors.push('Division is required')
    return { isValid: false, errors }
  }
  
  const validDivisions = ['A', 'B', 'C', 'D']
  const validHigherDivisions = ['Science-A', 'Science-B', 'Science-C', 'Science-D', 'Commerce-A', 'Commerce-B', 'Commerce-C', 'Commerce-D']
  
  if (standard && parseInt(standard) > 10) {
    if (!validHigherDivisions.includes(division)) {
      errors.push('Please select a valid division for higher secondary')
    }
  } else {
    if (!validDivisions.includes(division)) {
      errors.push('Please select a valid division (A-D)')
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateDateOfBirth(dob: string, options?: { required?: boolean; minAge?: number; maxAge?: number }): ValidationResult {
  const errors: string[] = []
  
  if (!dob) {
    if (options?.required) {
      errors.push('Date of birth is required')
    }
    return { isValid: !options?.required, errors }
  }
  
  const date = new Date(dob)
  const today = new Date()
  
  if (isNaN(date.getTime())) {
    errors.push('Please enter a valid date of birth')
    return { isValid: false, errors }
  }
  
  if (date > today) {
    errors.push('Date of birth cannot be in the future')
    return { isValid: false, errors }
  }
  
  const age = Math.floor((today.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  
  if (options?.minAge && age < options.minAge) {
    errors.push(`Age must be at least ${options.minAge} years`)
  }
  
  if (options?.maxAge && age > options.maxAge) {
    errors.push(`Age must not exceed ${options.maxAge} years`)
  }
  
  return { isValid: errors.length === 0, errors }
}

export function sanitizePhoneNumber(phone: string): string {
  return phone?.replace(/[\s\-\(\)]/g, '') || ''
}

export function sanitizeInput(value: string): string {
  return value?.trim() || ''
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }
  return phone
}

export function validateStudentData(data: {
  phone_number: string
  full_name: string
  email: string
  roll_number: string
  standard: string
  division: string
  parent_contact?: string
  date_of_birth?: string
  password: string
}): ValidationResult {
  const errors: string[] = []
  
  const phoneResult = validatePhoneNumber(data.phone_number, { required: true })
  errors.push(...phoneResult.errors)
  
  const nameResult = validateName(data.full_name, 'Full name')
  errors.push(...nameResult.errors)
  
  const emailResult = validateEmail(data.email, { required: true })
  errors.push(...emailResult.errors)
  
  const rollResult = validateRollNumber(data.roll_number)
  errors.push(...rollResult.errors)
  
  const standardResult = validateStandard(data.standard)
  errors.push(...standardResult.errors)
  
  const divisionResult = validateDivision(data.division, data.standard)
  errors.push(...divisionResult.errors)
  
  const passwordResult = validatePassword(data.password)
  errors.push(...passwordResult.errors)
  
  if (data.parent_contact) {
    const parentResult = validatePhoneNumber(data.parent_contact)
    errors.push(...parentResult.errors)
  }
  
  if (data.date_of_birth) {
    const dobResult = validateDateOfBirth(data.date_of_birth, { minAge: 3, maxAge: 25 })
    errors.push(...dobResult.errors)
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateFacultyData(data: {
  phone_number: string
  full_name: string
  email: string
  employee_id: string
  department: string
  subject: string
  password: string
}): ValidationResult {
  const errors: string[] = []
  
  const phoneResult = validatePhoneNumber(data.phone_number, { required: true })
  errors.push(...phoneResult.errors)
  
  const nameResult = validateName(data.full_name, 'Full name')
  errors.push(...nameResult.errors)
  
  const emailResult = validateEmail(data.email, { required: true })
  errors.push(...emailResult.errors)
  
  const employeeResult = validateEmployeeId(data.employee_id)
  errors.push(...employeeResult.errors)
  
  const passwordResult = validatePassword(data.password)
  errors.push(...passwordResult.errors)
  
  if (!data.department) {
    errors.push('Department is required')
  }
  
  if (!data.subject) {
    errors.push('Subject is required')
  }
  
  return { isValid: errors.length === 0, errors }
}

export function generatePasswordFromPhone(phone: string): string {
  const sanitized = sanitizePhoneNumber(phone)
  return `School@${sanitized.slice(-4)}`
}
