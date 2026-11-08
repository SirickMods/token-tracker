import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const LIMIT = 250_000
const alerted = atom({ plugin: 'token-tracker', key: 'alerted' } as const, false)
const used = atom({ plugin: 'token-tracker', key: 'tokens' } as const, null)

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const { context } = await $.session.usage()
    if (context.tokens !== undefined) await update($, used, () => context.tokens ?? 0)
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)

    const { context } = await $.session.usage()
    const tokens = context.tokens ?? 0
    await update($, used, () => tokens)

    const wasAlerted = await read($, alerted)
    if (tokens < LIMIT) {
      // back under the limit (after /compact or /clear): re-arm the alert
      if (wasAlerted) await update($, alerted, () => false)
      return result
    }
    if (wasAlerted) return result
    await update($, alerted, () => true)

    const msg = `This chat has reached ${fmt(tokens)} tokens (alert set at ${fmt(LIMIT)}).`
    $.ui.toast(msg, { timeoutMs: 15000 })
    $.ui.notify(msg, { title: 'Token limit reached' }).catch(() => {})
    $.ui.ask(`${msg} Consider starting a new chat or running /compact. Acknowledge?`, ['OK', 'Dismiss']).catch(() => {})

    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const tokens = await read($, used)

    if (tokens === null) {
      return (
        <Box>
          <Text dimColor>Tokens: updates after the next reply</Text>
        </Box>
      )
    }

    const pct = Math.min(100, Math.round((tokens / LIMIT) * 100))
    const filled = Math.round(pct / 5)
    const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
    const color = pct >= 100 ? 'red' : pct >= 80 ? 'yellow' : 'green'

    return (
      <Box>
        <Text color={color}>
          Tokens: {fmt(tokens)} / {fmt(LIMIT)} {bar} {pct}%
        </Text>
      </Box>
    )
  })
}
