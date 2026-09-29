import { faker } from '@faker-js/faker/locale/en';

const UNIT_NAME_MAX_LENGTH = 20;

/**
 * Random unit name: an English first name plus a nickname
 * ("<first name> <nickname>"), always fitting the varchar(20) column. The
 * bare first name is the fallback when no short nickname is drawn.
 */
export const generateUnitName = (): string => {
  const first = faker.person.firstName();
  for (let attempt = 0; attempt < 25; attempt++) {
    const nickname = faker.internet.displayName().replace(/[_.]/g, ' ');
    if (first.length + 1 + nickname.length <= UNIT_NAME_MAX_LENGTH) {
      return `${first} ${nickname}`;
    }
  }
  return first;
};
