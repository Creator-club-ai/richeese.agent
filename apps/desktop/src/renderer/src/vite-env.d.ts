/// <reference types="vite/client" />

import type { ContentOSApi } from '../../preload';

declare global {
  interface Window {
    contentOS: ContentOSApi;
  }
}

export {};
