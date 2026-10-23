# MarketList 1.5.7 (Android 9)

## Notas para a loja

### Português (Brasil)

Melhoramos o carregamento e a estabilidade dos anúncios. Os anúncios de tela cheia passam a respeitar a conclusão da compra, sem interromper a abertura das listas. Novos controles de privacidade quando aplicáveis e melhorias gerais de estabilidade.

### English

Improved ad loading and stability. Full-screen ads now respect completed shopping sessions without interrupting list opening. Added privacy controls where applicable and general stability improvements.

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
- O canal padrão do projeto no Google Play é teste interno.

As métricas comerciais devem ser acompanhadas no AdMob após distribuição e propagação das configurações. Testes de integração não comprovam demanda nem aumento de receita.

## Estado da distribuição

O envio do código ao Expo/EAS para gerar o AAB assinado está aguardando autorização explícita solicitada pela revisão automática de permissões. Ainda não foi criada uma nova release no Google Play. A configuração de submissão existente aponta para teste interno.
