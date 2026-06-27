# Plano 100% gratuito para deixar online

## Hospedagem do site
Use GitHub Pages. Ele publica os arquivos HTML, CSS e JS gratuitamente em um link público.

## Banco de dados em nuvem
Use Supabase Free. O banco PostgreSQL fica online e pode ser acessado de qualquer computador.

## Estrutura correta
- GitHub Pages: mostra o site.
- Supabase: guarda campeonatos, inscrições, denúncias, punições, resultados e artilheiros.
- Storage do Supabase: pode guardar anexos, súmulas e PDFs quando essa etapa for ativada.

## Observação importante
Esta versão funciona como protótipo no navegador usando localStorage. Para uso real, é necessário trocar o localStorage pelas chamadas do Supabase.

## Por que cada campeonato precisa ter ID
Cada denúncia, punição, inscrição, jogo e resultado leva um campo chamado campeonato_id. Isso garante que o Campeonato de Futsal não misture dados com o Campeonato de Campo ou outra taça.

## Custo
O início pode ser sem custo com os planos gratuitos. Porém, se no futuro houver muitos anexos, muitos acessos ou exigência oficial de backups avançados, pode ser necessário evoluir a infraestrutura.
