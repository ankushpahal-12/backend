/**
 * WAF (Web Application Firewall) Middleware
 * Detects and blocks common web attacks
 */

/**
 * Detect SQL Injection patterns
 */
function detectSQLInjection(input) {
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)|(\bDROP\b.*\bTABLE\b)|(\bINSERT\b.*\bINTO\b)/i,
    /(\bOR\b\s*1\s*=\s*1)|(\bAND\b\s*1\s*=\s*1)/i,
    /(\bDELETE\b.*\bFROM\b)|(\bUPDATE\b.*\bSET\b)/i,
    /(\bEXEC\b.*\()|(\bEXECUTE\b.*\()/i,
    /(\bCAST\b.*\()|(\bCONVERT\b.*\()/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Detect NoSQL Injection patterns
 */
function detectNoSQLInjection(input) {
  const noSqlPatterns = [
    /\{\s*[\$\w]+\s*:/i, // { $gt: ... }
    /\$where/i,
    /function\s*\(/i,
    /\{\s*\$regex\s*:/i,
    /\{\s*\$ne\s*:/i,
  ];

  return noSqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Detect XSS (Cross-Site Scripting) patterns
 */
function detectXSS(input) {
  const xssPatterns = [
    /<script[^>]*>|<\/script>/i,
    /javascript:/i,
    /on(load|error|focus|click|blur|submit|mouse)/i,
    /<iframe|<embed|<object/i,
    /<iframe|<frame|<frameset/i,
    /eval\(/i,
    /expression\s*\(/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Detect Command Injection patterns
 */
function detectCommandInjection(input) {
  const commandPatterns = [
    /[;&|`$()]/,
    /\$\{.*\}/,
    /\.\.\//,
    /~\/|\/\.\.\//,
    /\/bin\/|\/etc\/|\/usr\/bin\//i,
  ];

  return commandPatterns.some((pattern) => pattern.test(input));
}

/**
 * Detect Path Traversal patterns
 */
function detectPathTraversal(input) {
  const pathPatterns = [
    /\.\.\//g,
    /\.\.\\/g,
    /%2e%2e/i,
    /%252e/i,
    /\.\.%2f/i,
  ];

  return pathPatterns.some((pattern) => pattern.test(input));
}

/**
 * Main WAF Middleware
 * Blocks malicious requests and logs attempts
 */
function wafMiddleware(req, res, next) {
  const { method, path, query, body, ip } = req;

  // Only check state-changing requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return next();
  }

  // Combine query and body into single string
  let allInput = '';

  if (query && typeof query === 'object') {
    allInput += JSON.stringify(query);
  }

  if (body && typeof body === 'object') {
    allInput += JSON.stringify(body);
  }

  // Add path to check
  allInput += path;

  // Perform checks
  const checks = [
    { name: 'SQL_INJECTION', detector: detectSQLInjection },
    { name: 'NOSQL_INJECTION', detector: detectNoSQLInjection },
    { name: 'XSS', detector: detectXSS },
    { name: 'COMMAND_INJECTION', detector: detectCommandInjection },
    { name: 'PATH_TRAVERSAL', detector: detectPathTraversal },
  ];

  for (const check of checks) {
    if (check.detector(allInput)) {
      const details = {
        threat: check.name,
        ip,
        method,
        path,
        timestamp: new Date().toISOString(),
        input: allInput.substring(0, 100), // First 100 chars
      };

      console.warn('[WAF] Attack blocked:', details);

      // Log to audit system
      if (req.app.locals.auditLog) {
        req.app.locals.auditLog({
          action: 'WAF_BLOCK',
          threat: check.name,
          ip,
          path,
          userId: req.user?.id,
          severity: 'CRITICAL',
        });
      }

      return res.status(400).json({
        error: 'Malicious input detected',
        code: 'WAF_BLOCKED',
        reason: check.name,
        timestamp: new Date().toISOString(),
      });
    }
  }

  next();
}

module.exports = {
  wafMiddleware,
  detectSQLInjection,
  detectNoSQLInjection,
  detectXSS,
  detectCommandInjection,
  detectPathTraversal,
};
