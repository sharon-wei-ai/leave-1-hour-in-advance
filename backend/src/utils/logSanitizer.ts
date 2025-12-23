/**
 * 日志脱敏工具
 * 过滤敏感信息：密钥、Token、PII（个人身份信息）等
 */

interface SanitizeOptions {
  /** 是否脱敏密钥 */
  sanitizeKeys?: boolean;
  /** 是否脱敏 Token */
  sanitizeTokens?: boolean;
  /** 是否脱敏 PII */
  sanitizePII?: boolean;
  /** 自定义脱敏规则 */
  customRules?: Array<{
    pattern: RegExp;
    replacement: string;
  }>;
}

const defaultOptions: Required<SanitizeOptions> = {
  sanitizeKeys: true,
  sanitizeTokens: true,
  sanitizePII: true,
  customRules: [],
};

/**
 * 敏感信息模式
 */
const SENSITIVE_PATTERNS = {
  // API 密钥模式
  apiKey: /(api[_-]?key|apikey)\s*[:=]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
  // Token 模式
  token: /(token|bearer|authorization)\s*[:=]\s*['"]?([a-zA-Z0-9_\-\.]{20,})['"]?/gi,
  // 密码模式
  password: /(password|pwd|pass)\s*[:=]\s*['"]?([^'"]+)['"]?/gi,
  // 邮箱模式（PII）
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // 手机号模式（PII，中国）
  phone: /\b1[3-9]\d{9}\b/g,
  // 身份证号模式（PII）
  idCard: /\b[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g,
  // 银行卡号模式
  bankCard: /\b\d{16,19}\b/g,
};

/**
 * 脱敏字符串
 */
function sanitizeString(str: string, options: Required<SanitizeOptions>): string {
  let result = str;

  // 脱敏 API 密钥
  if (options.sanitizeKeys) {
    result = result.replace(SENSITIVE_PATTERNS.apiKey, (_match, key) => {
      return `${key}: [REDACTED_API_KEY]`;
    });
    result = result.replace(SENSITIVE_PATTERNS.password, (_match, key) => {
      return `${key}: [REDACTED_PASSWORD]`;
    });
  }

  // 脱敏 Token
  if (options.sanitizeTokens) {
    result = result.replace(SENSITIVE_PATTERNS.token, (_match, key) => {
      return `${key}: [REDACTED_TOKEN]`;
    });
  }

  // 脱敏 PII
  if (options.sanitizePII) {
    result = result.replace(SENSITIVE_PATTERNS.email, () => '[REDACTED_EMAIL]');
    result = result.replace(SENSITIVE_PATTERNS.phone, () => '[REDACTED_PHONE]');
    result = result.replace(SENSITIVE_PATTERNS.idCard, () => '[REDACTED_ID_CARD]');
    result = result.replace(SENSITIVE_PATTERNS.bankCard, (match) => {
      // 只显示后 4 位
      return `****${String(match).slice(-4)}`;
    });
  }

  // 自定义规则
  for (const rule of options.customRules) {
    result = result.replace(rule.pattern, rule.replacement);
  }

  return result;
}

/**
 * 脱敏对象（递归处理）
 */
function sanitizeObject(obj: unknown, options: Required<SanitizeOptions>): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, options));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // 跳过敏感字段
    const lowerKey = key.toLowerCase();
    if (
      options.sanitizeKeys &&
      (lowerKey.includes('key') || lowerKey.includes('password') || lowerKey.includes('secret'))
    ) {
      sanitized[key] = '[REDACTED]';
    } else if (options.sanitizeTokens && lowerKey.includes('token')) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeObject(value, options);
    }
  }

  return sanitized;
}

/**
 * 日志脱敏主函数
 */
export function sanitizeLog(data: unknown, options: SanitizeOptions = {}): unknown {
  const mergedOptions: Required<SanitizeOptions> = {
    ...defaultOptions,
    ...options,
    customRules: [...defaultOptions.customRules, ...(options.customRules || [])],
  };

  return sanitizeObject(data, mergedOptions);
}

/**
 * 创建 Pino 日志脱敏序列化器
 */
export function createSanitizeSerializer(options: SanitizeOptions = {}) {
  return {
    req: (req: unknown) => sanitizeLog(req, options),
    res: (res: unknown) => sanitizeLog(res, options),
    err: (err: unknown) => sanitizeLog(err, options),
  };
}

