import type { GreenApiNotification, Session } from '../types';

const apiUrl = (session: Session, method: string) =>
  `${session.baseUrl}/waInstance${session.idInstance}/${method}/${session.apiTokenInstance}`;

export async function validateCredentials(
  idInstance: string,
  apiTokenInstance: string,
): Promise<{ baseUrl: string; accountData: unknown }> {
  const serverNumber = idInstance.toString().slice(0, 4);
  const baseUrl = `https://${serverNumber}.api.green-api.com`;
  const response = await fetch(
    `${baseUrl}/waInstance${idInstance}/getSettings/${apiTokenInstance}`,
  );

  if (!response.ok) {
    throw new Error('Некорректные учетные данные GREEN-API');
  }

  return { baseUrl, accountData: await response.json() };
}

export async function receiveNotification(session: Session): Promise<GreenApiNotification | null> {
  const response = await fetch(apiUrl(session, 'receiveNotification'));

  if (response.status === 204 || response.status === 408) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GREEN-API: HTTP ${response.status}`);
  }

  return response.json();
}

export async function deleteNotification(session: Session, receiptId: string | number) {
  const response = await fetch(
    `${apiUrl(session, 'deleteNotification')}/${receiptId}`,
    { method: 'DELETE' },
  );
  if (!response.ok && response.status !== 404) {
    throw new Error(`Не удалось удалить уведомление: HTTP ${response.status}`);
  }
}

export async function sendMessage(session: Session, chatId: string, message: string) {
  const response = await fetch(apiUrl(session, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });

  if (!response.ok) {
    throw new Error(`GREEN-API: HTTP ${response.status}`);
  }

  return response.json() as Promise<{ idMessage?: string }>;
}
