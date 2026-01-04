// Local development client (replaces Base44 SDK)
import { localClient } from './localClient';

// Export local client as base44 for backwards compatibility
export const base44 = localClient;
