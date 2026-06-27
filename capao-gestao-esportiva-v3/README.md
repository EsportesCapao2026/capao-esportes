# Sistema Inteligente - Secretaria de Esportes de Capão da Canoa

Versão 3 do protótipo, com a lógica principal solicitada:

- Página inicial limpa, com título institucional.
- Campeonatos municipais exibidos em cards.
- Campeonatos criados pelo responsável no painel restrito.
- Cada campeonato tem suas próprias abas internas.
- Inscrições, denúncias, resultados, classificação, artilheiros e punições são separados por campeonato.
- Classificação e artilharia são calculadas automaticamente pelos resultados lançados.
- Equipes podem enviar denúncias dentro do campeonato.
- Dados oficiais ficam no painel restrito.

## Como testar no computador
Abra o arquivo `index.html` no navegador.

## Como colocar online gratuitamente
1. Criar conta no GitHub.
2. Criar um repositório.
3. Enviar todos os arquivos desta pasta.
4. Ativar GitHub Pages.
5. Criar uma conta no Supabase.
6. Criar um projeto gratuito.
7. Rodar o arquivo `sql/schema.sql` no Supabase.
8. Trocar o salvamento local do protótipo por chamadas ao Supabase.

## Atenção
O protótipo já demonstra a navegação e a lógica visual. Para uso oficial, precisa da etapa de conexão real com Supabase, autenticação e regras de permissão.
