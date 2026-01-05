// Export selected client (mock or HTTP) as base44
// Use clientSelector to switch between mock and real API
import { getCurrentClient } from './clientSelector.js';

export const base44 = getCurrentClient();
