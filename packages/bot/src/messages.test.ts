import { expect, test } from 'bun:test';
import { balanceMessages, loginUrl } from './messages';

test('login links point to the token exchange route and encode the token', () => {
  const url = new URL(loginUrl('a+b/&?', 'https://example.test/'));
  expect(url.pathname).toBe('/auth');
  expect(url.searchParams.get('token')).toBe('a+b/&?');
});

test('balance includes both user balances and every named unit within message limits', () => {
  const user = { balance: '123.45', balance_sol: '6.78' };
  const units = Array.from({ length: 300 }, (_, i) => ({
    name: `Капибара #${i + 1}`,
    balance_sol: '12.34'
  }));
  const messages = balanceMessages(user, units);
  expect(messages.length).toBeGreaterThan(1);
  expect(messages[0]).toContain('123.45');
  expect(messages[0]).toContain('6.78');
  for (const message of messages) expect(message.length).toBeLessThanOrEqual(4096);
  const lines = messages.join('\n').split('\n');
  for (const unit of units) {
    expect(lines.filter((line) => line === `${unit.name} — ${unit.balance_sol} SOL`)).toHaveLength(
      1
    );
  }
  expect(balanceMessages(user, [])[0]).toContain('Юнитов нет');
});
