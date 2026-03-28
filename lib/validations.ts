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
  FEE: {
    MIN_AMOUNT: 100,
    MAX_AMOUNT: 10000000,
    MIN_INSTALLMENTS: 1,
    MAX_INSTALLMENTS: 12,
    MIN_INSTALLMENT_AMOUNT: 100,
  },
  ACADEMIC_YEAR: {
    START_MONTH: 4,
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

export function validateFeeAmount(amount: number, options?: { fieldName?: string }): ValidationResult {
  const errors: string[] = []
  const fieldName = options?.fieldName || 'Amount'

  if (amount === undefined || amount === null || isNaN(amount)) {
    errors.push(`${fieldName} is required`)
    return { isValid: false, errors }
  }

  if (amount < VALIDATION_RULES.FEE.MIN_AMOUNT) {
    errors.push(`${fieldName} must be at least ₹${VALIDATION_RULES.FEE.MIN_AMOUNT.toLocaleString('en-IN')}`)
  }

  if (amount > VALIDATION_RULES.FEE.MAX_AMOUNT) {
    errors.push(`${fieldName} must not exceed ₹${VALIDATION_RULES.FEE.MAX_AMOUNT.toLocaleString('en-IN')}`)
  }

  return { isValid: errors.length === 0, errors }
}

export function validateInstallmentAmount(amount: number): ValidationResult {
  const errors: string[] = []

  if (amount === undefined || amount === null || isNaN(amount)) {
    errors.push('Installment amount is required')
    return { isValid: false, errors }
  }

  if (amount < VALIDATION_RULES.FEE.MIN_INSTALLMENT_AMOUNT) {
    errors.push(`Installment amount must be at least ₹${VALIDATION_RULES.FEE.MIN_INSTALLMENT_AMOUNT.toLocaleString('en-IN')}`)
  }

  if (amount > VALIDATION_RULES.FEE.MAX_AMOUNT) {
    errors.push(`Installment amount must not exceed ₹${VALIDATION_RULES.FEE.MAX_AMOUNT.toLocaleString('en-IN')}`)
  }

  if (!Number.isInteger(amount)) {
    errors.push('Installment amount must be a whole number')
  }

  return { isValid: errors.length === 0, errors }
}

export function validateNumberOfInstallments(count: number): ValidationResult {
  const errors: string[] = []

  if (count === undefined || count === null || isNaN(count)) {
    errors.push('Number of installments is required')
    return { isValid: false, errors }
  }

  if (count < VALIDATION_RULES.FEE.MIN_INSTALLMENTS) {
    errors.push(`Number of installments must be at least ${VALIDATION_RULES.FEE.MIN_INSTALLMENTS}`)
  }

  if (count > VALIDATION_RULES.FEE.MAX_INSTALLMENTS) {
    errors.push(`Number of installments must not exceed ${VALIDATION_RULES.FEE.MAX_INSTALLMENTS}`)
  }

  if (!Number.isInteger(count)) {
    errors.push('Number of installments must be a whole number')
  }

  return { isValid: errors.length === 0, errors }
}

export function validateDueDate(dueDate: string, options?: { required?: boolean; allowPast?: boolean }): ValidationResult {
  const errors: string[] = []

  if (!dueDate) {
    if (options?.required) {
      errors.push('Due date is required')
    }
    return { isValid: !options?.required, errors }
  }

  const date = new Date(dueDate)
  
  if (isNaN(date.getTime())) {
    errors.push('Please enter a valid due date')
    return { isValid: false, errors }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!options?.allowPast && date < today) {
    errors.push('Due date cannot be in the past')
  }

  return { isValid: errors.length === 0, errors }
}

export function validateInstallmentDates(dueDates: string[]): ValidationResult {
  const errors: string[] = []

  if (!dueDates || dueDates.length === 0) {
    errors.push('At least one installment due date is required')
    return { isValid: false, errors }
  }

  const dates = dueDates.map(d => new Date(d))
  
  for (let i = 0; i < dates.length; i++) {
    if (isNaN(dates[i].getTime())) {
      errors.push(`Invalid date for installment ${i + 1}`)
      continue
    }

    for (let j = i + 1; j < dates.length; j++) {
      if (dates[i].getTime() === dates[j].getTime()) {
        errors.push(`Installment ${i + 1} and ${j + 1} cannot have the same due date`)
      }
    }
  }

  return { isValid: errors.length === 0, errors }
}

export function validateInstallmentChronologicalOrder(dueDates: string[]): ValidationResult {
  const errors: string[] = []

  if (!dueDates || dueDates.length <= 1) {
    return { isValid: true, errors }
  }

  const dates = dueDates.map(d => new Date(d)).filter(d => !isNaN(d.getTime()))
  
  for (let i = 1; i < dates.length; i++) {
    if (dates[i] <= dates[i - 1]) {
      errors.push(`Installment ${i + 1} due date must be after installment ${i} due date`)
    }
  }

  return { isValid: errors.length === 0, errors }
}

export function validateInstallmentTotal(totalAmount: number, installmentAmounts: number[]): ValidationResult {
  const errors: string[] = []

  if (!totalAmount || totalAmount <= 0) {
    return { isValid: true, errors }
  }

  const sum = installmentAmounts.reduce((acc, amt) => acc + amt, 0)
  
  if (sum !== totalAmount) {
    errors.push(`Sum of installments (₹${sum.toLocaleString('en-IN')}) must equal total amount (₹${totalAmount.toLocaleString('en-IN')})`)
  }

  return { isValid: errors.length === 0, errors }
}

export function validatePaymentAmount(paymentAmount: number, remainingAmount: number): ValidationResult {
  const errors: string[] = []

  if (paymentAmount === undefined || paymentAmount === null || isNaN(paymentAmount)) {
    errors.push('Payment amount is required')
    return { isValid: false, errors }
  }

  if (paymentAmount <= 0) {
    errors.push('Payment amount must be greater than 0')
  }

  if (paymentAmount > remainingAmount) {
    errors.push(`Payment amount cannot exceed remaining amount (₹${remainingAmount.toLocaleString('en-IN')})`)
  }

  if (!Number.isInteger(paymentAmount)) {
    errors.push('Payment amount must be a whole number')
  }

  return { isValid: errors.length === 0, errors }
}

export function validateAcademicYear(academicYear: string): ValidationResult {
  const errors: string[] = []

  if (!academicYear) {
    errors.push('Academic year is required')
    return { isValid: false, errors }
  }

  const pattern = /^\d{4}-\d{2}$/
  if (!pattern.test(academicYear)) {
    errors.push('Academic year must be in format YYYY-YY (e.g., 2025-26)')
    return { isValid: false, errors }
  }

  const [startYear, endYearSuffix] = academicYear.split('-')
  const start = parseInt(startYear)
  const end = parseInt(`20${endYearSuffix}`)

  if (end !== start + 1) {
    errors.push('Academic year must be consecutive (e.g., 2025-26)')
  }

  if (start < 2020 || start > 2040) {
    errors.push('Academic year must be between 2020-21 and 2040-41')
  }

  return { isValid: errors.length === 0, errors }
}

export interface FeeStructureValidationData {
  standard: string
  academic_year: string
  total_amount: number
  number_of_installments: number
  installments: Array<{
    installment_number: number
    amount: number
    due_date: string
  }>
}

export function validateFeeStructure(data: FeeStructureValidationData): ValidationResult {
  const errors: string[] = []

  if (!data.standard) {
    errors.push('Class is required')
  }

  const academicYearResult = validateAcademicYear(data.academic_year)
  errors.push(...academicYearResult.errors)

  const amountResult = validateFeeAmount(data.total_amount, { fieldName: 'Total fee amount' })
  errors.push(...amountResult.errors)

  const installmentsResult = validateNumberOfInstallments(data.number_of_installments)
  errors.push(...installmentsResult.errors)

  if (data.installments && data.installments.length > 0) {
    const dueDates = data.installments.map(i => i.due_date)
    const dateOrderResult = validateInstallmentChronologicalOrder(dueDates)
    errors.push(...dateOrderResult.errors)

    const installmentAmounts = data.installments.map(i => i.amount)
    const totalMatchResult = validateInstallmentTotal(data.total_amount, installmentAmounts)
    errors.push(...totalMatchResult.errors)

    data.installments.forEach((inst, index) => {
      const instAmountResult = validateInstallmentAmount(inst.amount)
      instAmountResult.errors = instAmountResult.errors.map(e => `Installment ${index + 1}: ${e}`)
      errors.push(...instAmountResult.errors)

      const dueDateResult = validateDueDate(inst.due_date, { required: true, allowPast: false })
      dueDateResult.errors = dueDateResult.errors.map(e => `Installment ${index + 1}: ${e}`)
      errors.push(...dueDateResult.errors)
    })
  }

  return { isValid: errors.length === 0, errors }
}
