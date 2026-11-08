declare module 'claude-code' {
  interface PluginState {
    'token-tracker': { alerted: boolean; tokens: number | null }
  }
}
export type _TokenTracker = never
