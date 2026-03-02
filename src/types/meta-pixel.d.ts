interface Window {
  fbq: (type: string, event: string, params?: Record<string, unknown>) => void;
  _fbq: unknown;
}
