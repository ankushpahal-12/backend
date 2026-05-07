/**
 * API Versioning Middleware
 * Manages API versions and deprecation
 */

/**
 * API version definitions with deprecation info
 */
const API_VERSIONS = {
  v1: {
    status: 'deprecated',
    sunsetDate: new Date('2025-12-31'),
    message: 'API v1 is deprecated. Please upgrade to v2.',
    supportedEndpoints: ['/api/v1/users', '/api/v1/transactions', '/api/v1/wallets'],
  },
  v2: {
    status: 'current',
    releaseDate: new Date('2024-06-01'),
    message: 'Current stable API version',
    improvements: [
      'Enhanced security',
      'Better error handling',
      'Improved rate limiting',
    ],
  },
  v3: {
    status: 'beta',
    releaseDate: new Date('2026-01-01'),
    message: 'API v3 is in beta. Subject to change.',
    newFeatures: ['GraphQL support', 'WebSocket streaming'],
  },
};

const SUPPORTED_VERSIONS = Object.keys(API_VERSIONS);

/**
 * Middleware to handle API versioning
 */
function apiVersionMiddleware(req, res, next) {
  // Get version from header, query, or path
  let version =
    req.get('API-Version') ||
    req.query.apiVersion ||
    extractVersionFromPath(req.path);

  // Default to current version
  if (!version) {
    version = 'v2';
  }

  // Validate version
  if (!SUPPORTED_VERSIONS.includes(version)) {
    return res.status(400).json({
      error: 'Invalid API version',
      code: 'INVALID_API_VERSION',
      supportedVersions: SUPPORTED_VERSIONS,
      currentVersion: 'v2',
      timestamp: new Date().toISOString(),
    });
  }

  // Attach version to request
  req.apiVersion = version;
  req.apiVersionInfo = API_VERSIONS[version];

  // Add deprecation headers for deprecated versions
  const versionInfo = API_VERSIONS[version];

  if (versionInfo.status === 'deprecated') {
    res.setHeader('Sunset', versionInfo.sunsetDate.toUTCString());
    res.setHeader('Deprecation', 'true');
    res.setHeader(
      'Warning',
      `299 - "${versionInfo.message}"`,
    );
  }

  if (versionInfo.status === 'beta') {
    res.setHeader('Warning', `299 - "${versionInfo.message}"`);
    res.setHeader('X-API-Beta', 'true');
  }

  // Add version info header
  res.setHeader('X-API-Version', version);

  next();
}

/**
 * Extract version from URL path
 */
function extractVersionFromPath(path) {
  const match = path.match(/\/api\/(v\d+)\//);
  return match ? match[1] : null;
}

/**
 * Middleware to enforce minimum version
 */
function enforceMinimumVersion(minVersion) {
  return (req, res, next) => {
    const currentVersion = parseInt(req.apiVersion.substring(1));
    const minimum = parseInt(minVersion.substring(1));

    if (currentVersion < minimum) {
      return res.status(400).json({
        error: 'API version no longer supported',
        code: 'VERSION_NO_LONGER_SUPPORTED',
        minimumVersion: minVersion,
        currentVersion: req.apiVersion,
        message: `Please upgrade to ${minVersion} or later`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}

/**
 * Middleware for version-specific behavior
 */
function versionSpecificHandler(versionHandlers) {
  return (req, res, next) => {
    const version = req.apiVersion;
    const handler = versionHandlers[version];

    if (handler) {
      handler(req, res, next);
    } else {
      next();
    }
  };
}

/**
 * Get API version status
 */
function getVersionStatus(version) {
  if (!SUPPORTED_VERSIONS.includes(version)) {
    throw new Error('Invalid version');
  }

  return {
    version,
    ...API_VERSIONS[version],
    supported: true,
  };
}

/**
 * Get all versions info
 */
function getAllVersionsInfo() {
  return SUPPORTED_VERSIONS.map((v) => ({
    version: v,
    ...API_VERSIONS[v],
  }));
}

module.exports = {
  apiVersionMiddleware,
  enforceMinimumVersion,
  versionSpecificHandler,
  getVersionStatus,
  getAllVersionsInfo,
  extractVersionFromPath,
  SUPPORTED_VERSIONS,
  API_VERSIONS,
};
