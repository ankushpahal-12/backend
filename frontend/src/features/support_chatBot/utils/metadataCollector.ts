/**
 * Legacy compatibility shim.
 * All monitoring code now lives in the monitoring/ directory.
 * This re-exports from there so any old import paths still resolve.
 */
export { collectMetadata } from '../monitoring/metadataCollector';
export type { DeviceMetadata } from '../monitoring/metadataCollector';
