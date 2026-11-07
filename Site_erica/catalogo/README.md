# Fio a Fio Crochê

Catálogo responsivo em Next.js, Tailwind CSS e Supabase. Os clientes criam conta para ver os produtos; apenas perfis com papel `admin` podem cadastrar ou excluir produtos. O acesso administrativo é verificado no middleware e novamente pelas políticas RLS do banco.

## Pré-requisitos

- Node.js 20.9 ou superior e npm.
- Projeto Supabase (plano gratuito funciona).

## Rodar localmente

1. No painel Supabase, crie um projeto e copie a URL e a chave publicável (anon key).
2. Em **SQL Editor**, execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql). Isso cria `perfis`, `produtos`, o bucket público de fotos, o perfil cliente automático e as políticas RLS.
3. Em **Authentication → URL Configuration**, configure `Site URL` como `http://localhost:3000` e adicione `http://localhost:3000/**` em Redirect URLs.
4. Copie `.env.example` para `.env.local` e informe os valores:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publicavel
   NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
   ```

   `NEXT_PUBLIC_WHATSAPP_NUMBER` deve incluir o código do país e DDD, somente números (ex.: `5511999999999`). Substitua pelo WhatsApp da loja.
5. Instale e execute:

   ```bash
   npm install
   npm run dev
   ```

6. Abra [http://localhost:3000](http://localhost:3000). O catálogo e as páginas internas exigem login. Configure o provedor de e-mail do Supabase para confirmação de cadastro e recuperação de senha.

## Criar o primeiro acesso de administradora

1. Cadastre o e-mail da dona da loja pela página `/cadastro` e confirme o endereço pelo e-mail recebido.
2. No Supabase, abra **SQL Editor** e execute (troque pelo e-mail real):

   ```sql
   update public.perfis
   set papel = 'admin'
   where id = (
     select id from auth.users
     where email = 'dona@exemplo.com'
   );
   ```

3. Confirme que uma linha foi atualizada. Saia e entre novamente no site para atualizar a sessão. O link **Gerenciar** e a rota `/admin` ficam disponíveis para essa conta.

Os novos cadastros recebem automaticamente o papel `cliente`. Não existe cadastro público de administrador; a elevação de papel deve ser feita por um operador confiável no Supabase. Nunca coloque a `service_role key` no frontend ou em `.env.local` público.

## Funcionalidades

- Busca de produtos, página de detalhes e botão de pedido com mensagem pronta no WhatsApp.
- Instagram da loja no cabeçalho e rodapé.
- Painel admin com cadastro, upload opcional de foto (JPG/PNG/WEBP, até 5 MB), confirmação para exclusão e avisos de sucesso/erro.
- Catálogo atualizado automaticamente por Supabase Realtime.
- Senhas gerenciadas e armazenadas com segurança pelo Supabase Auth; links de recuperação por e-mail.
- A tabela `perfis` não permite que o próprio usuário mude seu papel. RLS restringe inserção e exclusão de produtos e operações de upload/exclusão de imagens a admins.

## Publicar na Vercel

1. Envie esta pasta para um repositório Git e importe o repositório no [Vercel](https://vercel.com/).
2. Configure as mesmas três variáveis de ambiente em **Project Settings → Environment Variables** (Production, Preview e Development conforme necessário).
3. Use os comandos padrão `npm run build` para build e `npm run start` para execução local de produção.
4. Em **Authentication → URL Configuration** no Supabase, ajuste `Site URL` para a URL final do site e inclua a URL de produção e previews permitidos em Redirect URLs, por exemplo `https://seu-dominio.com/**`.
5. Faça o deploy. O bucket de imagens é público apenas para leitura; operações de upload e remoção são limitadas por RLS ao papel `admin`.

## Comandos

```bash
npm run dev       # desenvolvimento
npm run typecheck # verificação TypeScript
npm run lint      # ESLint
npm run build     # build de produção
npm run start     # servidor de produção local
```
