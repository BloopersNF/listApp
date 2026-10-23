# MarketList 1.5.7 (Android 9)

## Notas para a loja

### Português (Brasil)

Tela inicial mais limpa, com acesso direto às suas listas. Melhoramos o carregamento dos anúncios, que respeitam a conclusão da compra, e adicionamos controles de privacidade quando aplicáveis.

### English

A cleaner home screen with direct access to your lists. Improved ad loading, full-screen ads that respect completed shopping sessions, and privacy controls where applicable.

## Validação

- 78 testes automatizados aprovados, incluindo consentimento, recuperação de erros, limite de frequência, expiração do cache e diagnóstico sem conteúdo das listas.
- Exportação Expo Android/iOS/web com Hermes aprovada.
- QA web móvel e desktop: criação de lista, adição por sugestão, conclusão, retorno, ajustes e exportação do diagnóstico.
- Build nativo Android 1.5.7 concluído. No emulador API 36.1: banner de teste carregado; lista criada; item digitado e item por sugestão adicionados; compras concluídas; primeira saída sem conflito com avaliação; segunda saída com intersticial de teste; fechamento do anúncio retoma a navegação.
- Área segura corrigida e validada no emulador: banner abaixo da barra de status e controles acima da navegação do sistema.

## Configuração da conta

- Mensagem europeia UMP publicada em 2026-10-23 para o app Android, em inglês e mais quatro idiomas, com consentimento, recusa e gerenciamento de opções.
- AdMob: app pronto, veiculação ativada e Central de políticas sem problemas ou limitações. `app-ads.txt` encontrado e verificado, com 100% das consultas autorizadas. Banner com refresh otimizado pelo Google e piso “Todos os preços”.
- Ajustada a área segura para evitar sobreposição do banner e dos controles com as barras do sistema no Android recente.
- O iOS permanece sem monetização até receber seus próprios IDs.
- O canal de publicação foi alterado para produção conforme autorização do usuário.
- Removido o bloco introdutório do topo da Home, tanto com listas existentes quanto no estado inicial vazio.

As métricas comerciais devem ser acompanhadas no AdMob após distribuição e propagação das configurações. Testes de integração não comprovam demanda nem aumento de receita.

## Estado da distribuição

Usuário autorizou explicitamente o envio do código ao projeto Expo/EAS da conta bloopersnf para compilar e assinar o AAB Android, seguido de publicação em produção no Google Play. A remoção do bloco introdutório da Home integra o mesmo pacote 1.5.7 (9).
