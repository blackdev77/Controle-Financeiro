-- =========================================================================
-- Arquivo: 001_security_rls.sql
-- Propósito: Implementar blindagem de segurança no banco de dados (Nota 10)
-- Como usar: Copie todo este conteúdo, cole no SQL Editor do Supabase e clique em "Run".
-- =========================================================================

-- 1. Habilitar RLS (Row Level Security) em todas as tabelas contendo dados sensíveis
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Segurança para Transações (transactions)
-- Isso garante que um usuário (hacker) jamais consiga buscar, inserir, alterar ou deletar transações que não pertençam a ele.
CREATE POLICY "Usuários podem ver suas próprias transações" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias transações" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias transações" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem excluir suas próprias transações" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- 3. Políticas de Segurança para Categorias (categories)
CREATE POLICY "Usuários podem ver suas próprias categorias" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias categorias" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias categorias" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem excluir suas próprias categorias" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- 4. Políticas de Segurança para Contas (accounts)
CREATE POLICY "Usuários podem ver suas próprias contas" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias contas" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias contas" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem excluir suas próprias contas" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- PRONTO! Após executar este script, seu banco de dados estará protegido contra IDOR e falhas de controle de acesso.
