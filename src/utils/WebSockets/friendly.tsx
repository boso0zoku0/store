export const normalizeMessage = (raw: any) => ({
  id: raw.id,
  from_user_url_id: raw.from_user_url_id,
  to_user_url_id: raw.to_user_url_id,
  recipient: raw.recipient,
  sender: raw.sender,
  message: raw.message,
  created_at: raw.created_at,
  is_own: raw.is_own,
  interlocutor: raw.interlocutor,
  is_read_message: raw.is_read_message,
});