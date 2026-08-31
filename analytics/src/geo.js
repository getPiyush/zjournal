'use strict';

const geoip = require('geoip-lite');

/**
 * geoip-lite's bundled database has no country/city data for private,
 * loopback, or reserved ranges, so those normalize to a clear "local" marker
 * instead of silently returning null.
 */
function normalizeIp(rawIp) {
  if (!rawIp) return null;
  let ip = rawIp.trim();
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  if (ip === '::1' || ip === '127.0.0.1') return 'local';
  return ip;
}

function extractIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress;
}

function locate(rawIp) {
  const ip = normalizeIp(rawIp);
  if (!ip || ip === 'local') return null;

  const result = geoip.lookup(ip);
  if (!result) return null;

  return {
    country: result.country || null,
    region: result.region || null,
    city: result.city || null,
    timezone: result.timezone || null,
    ll: result.ll || null,
  };
}

module.exports = { extractIp, normalizeIp, locate };
