export const loginUrl = (
  token: string,
  siteUrl = process.env.SITE_URL ?? 'http://localhost:5173'
) => `${siteUrl.replace(/\/$/, '')}/auth?token=${encodeURIComponent(token)}`;

/** Plain-text chunks stay below Telegram's 4096-character message limit. */
export function balanceMessages(
  user: { balance: string; balance_sol: string },
  units: { name: string; balance_sol: string }[]
): string[] {
  const messages: string[] = [];
  let message = `💰 Баланс: ${user.balance}\n🪙 SOL: ${user.balance_sol}\n\nЮниты:`;
  if (!units.length) return [message + '\nЮнитов нет'];
  for (const unit of units) {
    const line = `\n${unit.name} — ${unit.balance_sol} SOL`;
    if (message.length + line.length > 4000) {
      messages.push(message);
      message = 'Юниты (продолжение):';
    }
    message += line;
  }
  return [...messages, message];
}
