export const loginUrl = (
  token: string,
  siteUrl = process.env.SITE_URL ?? 'http://localhost:5173'
) => `${siteUrl.replace(/\/$/, '')}/auth?token=${encodeURIComponent(token)}`;

/** Plain-text chunks stay below Telegram's 4096-character message limit. */
export function balanceMessages(
  user: { balance: string; balanceSol: string },
  units: { name: string; balanceSol: string }[]
): string[] {
  const messages: string[] = [];
  let message = `💰 Баланс: ${user.balance}\n🪙 SOL: ${user.balanceSol}\n\nЮниты:`;
  if (!units.length) return [message + '\nЮнитов нет'];
  for (const unit of units) {
    const line = `\n${unit.name} — ${unit.balanceSol} SOL`;
    if (message.length + line.length > 4000) {
      messages.push(message);
      message = 'Юниты (продолжение):';
    }
    message += line;
  }
  return [...messages, message];
}
