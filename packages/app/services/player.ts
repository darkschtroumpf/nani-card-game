import { getItem, setItem } from './storage';

const NICKNAME_KEY = 'nani_nickname';

export async function getNickname(): Promise<string> {
  const stored = await getItem(NICKNAME_KEY);
  return stored || 'Joueur';
}

export async function setNickname(name: string): Promise<void> {
  await setItem(NICKNAME_KEY, name);
}
