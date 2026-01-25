-- Hardening RLS for messages table to prevent cross-chat injection

-- 1. Drop known existing policies (handling both potential names)
DROP POLICY IF EXISTS "Users can manage their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;

-- 2. Create the stricter policy
-- This ensures that for ALL operations (Select, Insert, Update, Delete):
-- 1. The message must belong to the user (auth.uid() = user_id)
-- 2. The chat referenced must also belong to the user (integrity check)
CREATE POLICY "Users can manage their own messages strict" ON messages
  FOR ALL
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );
