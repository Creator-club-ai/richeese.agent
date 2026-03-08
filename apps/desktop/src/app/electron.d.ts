import type { OpsApi } from '../lib/contracts';

declare global {
  interface Window {
    marketingOps: OpsApi;
  }
}

export {};