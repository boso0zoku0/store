export const normalizeMessage = (raw: any) => ({
  id: raw.id,
  from_url_id: raw.from_url_id,
  to_url_id: raw.to_url_id,
  recipient: raw.recipient,
  sender: raw.sender,
  message: raw.message,
  created_at: raw.created_at,
  is_own: raw.is_own,
  is_read_message: raw.is_read_message,
});