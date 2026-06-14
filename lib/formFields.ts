export type FormulaOperator = 'add' | 'subtract' | 'multiply' | 'divide';

export const FIELD_TYPES = ['text', 'number', 'date', 'textarea', 'dropdown', 'checkbox', 'formula'] as const;
export const OPTION_FIELD_TYPES = ['dropdown', 'checkbox'] as const;
export const FORMULA_OPERATORS: { value: FormulaOperator; label: string }[] = [
  { value: 'add', label: 'Addition (+)' },
  { value: 'subtract', label: 'Subtraction (-)' },
  { value: 'multiply', label: 'Multiplication (×)' },
  { value: 'divide', label: 'Division (÷)' },
];

export interface FormulaConfig {
  operator: FormulaOperator;
  operandLabels: string[];
}

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  pattern?: string;
  patternMessage?: string;
}

export interface FormFieldDefinition {
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  formula?: FormulaConfig;
  validation?: ValidationRules;
}

export type FormulaResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

export const isRequiredValue = (value: unknown) => value === true || value === 'true';

export const cleanOptions = (options?: string[]) =>
  options?.map((option) => String(option).trim()).filter(Boolean) ?? [];

export const getSelectedCheckboxOptions = (value: unknown) =>
  String(value ?? '')
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean);

export const isFormulaOperator = (value: unknown): value is FormulaOperator =>
  value === 'add' || value === 'subtract' || value === 'multiply' || value === 'divide';

export const normalizeFormulaConfig = (formula: unknown): FormulaConfig | undefined => {
  if (!formula || typeof formula !== 'object') return undefined;

  const config = formula as Partial<FormulaConfig>;
  if (!isFormulaOperator(config.operator)) return undefined;

  const operandLabels = Array.isArray(config.operandLabels)
    ? config.operandLabels.map((label) => String(label).trim()).filter(Boolean)
    : [];

  return {
    operator: config.operator,
    operandLabels: Array.from(new Set(operandLabels)),
  };
};

export const parseOptionalNumber = (value: unknown): number | undefined => {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const normalizeValidationRules = (validation: unknown): ValidationRules | undefined => {
  if (!validation || typeof validation !== 'object') return undefined;

  const raw = validation as Partial<ValidationRules>;
  const rules: ValidationRules = {};

  const minLength = parseOptionalNumber(raw.minLength);
  const maxLength = parseOptionalNumber(raw.maxLength);
  const min = parseOptionalNumber(raw.min);
  const max = parseOptionalNumber(raw.max);

  if (minLength !== undefined) rules.minLength = minLength;
  if (maxLength !== undefined) rules.maxLength = maxLength;
  if (min !== undefined) rules.min = min;
  if (max !== undefined) rules.max = max;

  if (typeof raw.minDate === 'string' && raw.minDate.trim()) {
    rules.minDate = raw.minDate.trim();
  }
  if (typeof raw.maxDate === 'string' && raw.maxDate.trim()) {
    rules.maxDate = raw.maxDate.trim();
  }
  if (typeof raw.pattern === 'string' && raw.pattern.trim()) {
    rules.pattern = raw.pattern.trim();
  }
  if (typeof raw.patternMessage === 'string' && raw.patternMessage.trim()) {
    rules.patternMessage = raw.patternMessage.trim();
  }

  return Object.keys(rules).length ? rules : undefined;
};

export const normalizeFormField = (field: unknown): FormFieldDefinition => {
  const raw = field as Partial<FormFieldDefinition>;
  const type = FIELD_TYPES.includes(raw?.type as (typeof FIELD_TYPES)[number]) ? raw.type! : 'text';
  const formula = type === 'formula' ? normalizeFormulaConfig(raw?.formula) : undefined;
  const validation = type === 'formula' ? undefined : normalizeValidationRules(raw?.validation);

  return {
    label: typeof raw?.label === 'string' ? raw.label : '',
    type,
    required: type === 'formula' ? false : isRequiredValue(raw?.required),
    options: Array.isArray(raw?.options) ? raw.options.map((option) => String(option)) : [],
    ...(formula ? { formula } : {}),
    ...(validation ? { validation } : {}),
  };
};

export const parseNumericValue = (value: unknown): number | null => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export const evaluateFormula = (operator: FormulaOperator, operands: number[]): FormulaResult => {
  if (operands.length < 2) {
    return { ok: false, error: 'Formula requires at least two numeric operands.' };
  }

  switch (operator) {
    case 'add':
      return { ok: true, value: operands.reduce((total, value) => total + value, 0) };
    case 'subtract':
      return {
        ok: true,
        value: operands.slice(1).reduce((result, value) => result - value, operands[0]),
      };
    case 'multiply':
      return { ok: true, value: operands.reduce((total, value) => total * value, 1) };
    case 'divide': {
      let result = operands[0];
      for (let index = 1; index < operands.length; index += 1) {
        const divisor = operands[index];
        if (divisor === 0) {
          return { ok: false, error: 'Division by zero is not allowed.' };
        }
        result /= divisor;
      }
      return { ok: true, value: result };
    }
    default:
      return { ok: false, error: 'Unsupported formula operator.' };
  }
};

export const computeFormulaFieldValue = (
  field: FormFieldDefinition,
  data: Record<string, unknown>
): FormulaResult => {
  if (field.type !== 'formula' || !field.formula) {
    return { ok: false, error: 'Invalid formula field configuration.' };
  }

  const { operator, operandLabels } = field.formula;
  if (operandLabels.length < 2) {
    return { ok: false, error: `Formula field "${field.label}" requires at least two operand fields.` };
  }

  const operands: number[] = [];
  for (const label of operandLabels) {
    const parsed = parseNumericValue(data[label]);
    if (parsed === null) {
      return { ok: false, error: `Operand field "${label}" must contain a valid number.` };
    }
    operands.push(parsed);
  }

  return evaluateFormula(operator, operands);
};

export const applyFormulaFields = (
  fields: FormFieldDefinition[],
  data: Record<string, string>
): { data: Record<string, string>; errors: string[] } => {
  const nextData = { ...data };
  const errors: string[] = [];

  fields.forEach((field) => {
    if (field.type !== 'formula' || !field.formula) return;

    const result = computeFormulaFieldValue(field, nextData);
    if (!result.ok) {
      errors.push(`${field.label}: ${result.error}`);
      return;
    }

    nextData[field.label] = String(result.value);
  });

  return { data: nextData, errors };
};

export const getMissingRequiredFields = (
  fields: FormFieldDefinition[],
  data: Record<string, unknown>
) =>
  fields
    .filter((field) => {
      if (field.type === 'formula') return false;
      if (!isRequiredValue(field.required)) return false;

      const value = data[field.label];
      if (field.type === 'checkbox') {
        return cleanOptions(field.options).length
          ? getSelectedCheckboxOptions(value).length === 0
          : value !== true && value !== 'true';
      }

      return !String(value ?? '').trim();
    })
    .map((field, index) => field.label || `Field ${index + 1}`);

export const validateFormulaFields = (
  fields: FormFieldDefinition[],
  data: Record<string, unknown>
): string[] => {
  const errors: string[] = [];

  fields.forEach((field) => {
    if (field.type !== 'formula' || !field.formula) return;

    const result = computeFormulaFieldValue(field, data);
    if (!result.ok) {
      errors.push(`${field.label}: ${result.error}`);
    }
  });

  return errors;
};

export const validateTemplateFormulaFields = (fields: FormFieldDefinition[]): string[] => {
  const errors: string[] = [];
  const numberLabels = new Set(
    fields.filter((field) => field.type === 'number' && field.label.trim()).map((field) => field.label.trim())
  );

  fields.forEach((field, index) => {
    if (field.type !== 'formula') return;

    if (!field.label.trim()) {
      errors.push(`Formula field ${index + 1} must have a label.`);
      return;
    }

    if (!field.formula) {
      errors.push(`Formula field "${field.label}" is missing formula configuration.`);
      return;
    }

    if (field.formula.operandLabels.length < 2) {
      errors.push(`Formula field "${field.label}" must reference at least two number fields.`);
      return;
    }

    field.formula.operandLabels.forEach((operandLabel) => {
      if (!numberLabels.has(operandLabel)) {
        errors.push(`Formula field "${field.label}" references invalid operand "${operandLabel}".`);
      }
      if (operandLabel === field.label.trim()) {
        errors.push(`Formula field "${field.label}" cannot reference itself.`);
      }
    });
  });

  return errors;
};

const isValidRegexPattern = (pattern: string) => {
  try {
    // eslint-disable-next-line no-new
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

export const validateTemplateFields = (fields: FormFieldDefinition[]): string[] => {
  const errors: string[] = [];
  const labels = new Set<string>();

  if (!fields.length) {
    errors.push('Add at least one form field.');
    return errors;
  }

  fields.forEach((field, index) => {
    const fieldName = field.label.trim() || `Field ${index + 1}`;

    if (!field.label.trim()) {
      errors.push(`Field ${index + 1} must have a label.`);
      return;
    }

    if (labels.has(field.label.trim())) {
      errors.push(`Duplicate field label "${field.label.trim()}".`);
      return;
    }
    labels.add(field.label.trim());

    if (OPTION_FIELD_TYPES.includes(field.type as (typeof OPTION_FIELD_TYPES)[number])) {
      const options = cleanOptions(field.options);
      if (!options.length) {
        errors.push(`Field "${fieldName}" must include at least one option.`);
      }
    }

    if (!field.validation) return;

    const { minLength, maxLength, min, max, minDate, maxDate, pattern } = field.validation;

    if (field.type === 'text' || field.type === 'textarea') {
      if (minLength !== undefined && minLength < 0) {
        errors.push(`Field "${fieldName}" min length cannot be negative.`);
      }
      if (maxLength !== undefined && maxLength < 0) {
        errors.push(`Field "${fieldName}" max length cannot be negative.`);
      }
      if (minLength !== undefined && maxLength !== undefined && minLength > maxLength) {
        errors.push(`Field "${fieldName}" min length cannot exceed max length.`);
      }
      if (pattern && !isValidRegexPattern(pattern)) {
        errors.push(`Field "${fieldName}" has an invalid pattern.`);
      }
    }

    if (field.type === 'number') {
      if (min !== undefined && max !== undefined && min > max) {
        errors.push(`Field "${fieldName}" min value cannot exceed max value.`);
      }
    }

    if (field.type === 'date') {
      if (minDate && maxDate && minDate > maxDate) {
        errors.push(`Field "${fieldName}" min date cannot be after max date.`);
      }
    }
  });

  return errors;
};

export const validateFieldValues = (
  fields: FormFieldDefinition[],
  data: Record<string, unknown>
): string[] => {
  const errors: string[] = [];

  fields.forEach((field) => {
    if (field.type === 'formula') return;

    const value = data[field.label];
    const stringValue = String(value ?? '').trim();
    if (!stringValue) return;

    const fieldName = field.label.trim() || 'Field';
    const rules = field.validation;
    if (!rules) return;

    if (field.type === 'text' || field.type === 'textarea') {
      if (rules.minLength !== undefined && stringValue.length < rules.minLength) {
        errors.push(`${fieldName} must be at least ${rules.minLength} characters.`);
      }
      if (rules.maxLength !== undefined && stringValue.length > rules.maxLength) {
        errors.push(`${fieldName} must be at most ${rules.maxLength} characters.`);
      }
      if (rules.pattern) {
        try {
          const regex = new RegExp(rules.pattern);
          if (!regex.test(stringValue)) {
            errors.push(rules.patternMessage || `${fieldName} has an invalid format.`);
          }
        } catch {
          errors.push(`${fieldName} has an invalid validation pattern configured.`);
        }
      }
    }

    if (field.type === 'number') {
      const numericValue = parseNumericValue(stringValue);
      if (numericValue === null) {
        errors.push(`${fieldName} must be a valid number.`);
        return;
      }
      if (rules.min !== undefined && numericValue < rules.min) {
        errors.push(`${fieldName} must be at least ${rules.min}.`);
      }
      if (rules.max !== undefined && numericValue > rules.max) {
        errors.push(`${fieldName} must be at most ${rules.max}.`);
      }
    }

    if (field.type === 'date') {
      if (rules.minDate && stringValue < rules.minDate) {
        errors.push(`${fieldName} cannot be before ${rules.minDate}.`);
      }
      if (rules.maxDate && stringValue > rules.maxDate) {
        errors.push(`${fieldName} cannot be after ${rules.maxDate}.`);
      }
    }

    if (field.type === 'dropdown') {
      const options = cleanOptions(field.options);
      if (options.length && !options.includes(stringValue)) {
        errors.push(`${fieldName} must be one of the configured options.`);
      }
    }

    if (field.type === 'checkbox' && field.options?.length) {
      const selected = getSelectedCheckboxOptions(value);
      const options = cleanOptions(field.options);
      const invalid = selected.filter((option) => !options.includes(option));
      if (invalid.length) {
        errors.push(`${fieldName} contains invalid option${invalid.length > 1 ? 's' : ''}.`);
      }
    }
  });

  return errors;
};

export const getFormulaOperatorLabel = (operator: FormulaOperator) =>
  FORMULA_OPERATORS.find((item) => item.value === operator)?.label ?? operator;
