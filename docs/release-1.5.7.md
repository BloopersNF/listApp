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

- Código do pacote: `ba7f78b2b79094034d4fd61badb3b9d050e50704`.
- [Build EAS concluído](https://expo.dev/accounts/bloopersnf/projects/listApp/builds/1d2a41eb-0993-4a61-aead-e730ca55b4fb), com a chave de upload Android já existente. Assinatura JAR verificada localmente.
- SHA-256 do AAB: `4A20D09545B5FFFE65E87CA25B85C239656CDAEFA7C4D207D62804E109E20A5A`.
- EAS Submit não tem chave de serviço Google Play cadastrada; o envio é feito pelo Play Console autenticado. `production-draft` permite preparar um envio por EAS no futuro quando a credencial estiver configurada, sem liberar a versão automaticamente.
- Declaração de Segurança dos dados corrigida e salva no Play Console para revisão: localização aproximada, interações no app, diagnóstico e identificadores; coleta/compartilhamento para anúncios, análise e prevenção de fraude; tráfego criptografado. O app não cria contas e as listas permanecem locais.
- Google Play validou o AAB como 9 (1.5.7), API 36 e quatro ABIs, sem perda de compatibilidade de dispositivos. Download estimado de 28,2 MB e atualização de 5,71 MB.
- A validação exibiu apenas um aviso não bloqueante sobre ausência de arquivo de desofuscação. Este build não usa ofuscação R8/ProGuard; não há mapping correspondente para anexar.

As categorias foram conferidas na [documentação de divulgação de dados do Google Mobile Ads SDK](https://developers.google.com/admob/android/privacy/play-data-disclosure) e nas [instruções do formulário do Google Play](https://support.google.com/googleplay/android-developer/answer/10787469). Nenhum SDK de Analytics remoto foi adicionado. O CSV de exemplo público do Google não contém o campo atual de criação de contas e foi recusado; a declaração foi concluída pelo formulário do Console.

## Resultado do envio

Em 2026-10-23, o Play Console confirmou **Alterações em análise** para a release de produção **1.5.7 (9)**, configurada para lançamento completo (100%) em todos os países de destino existentes, e para a atualização de Segurança dos dados.

A publicação gerenciada está **desativada**: após aprovação do Google, o lançamento completo pode ser publicado automaticamente. A versão ainda depende das verificações e da análise da loja; não foi declarada disponível antes dessa aprovação.

[Acompanhar no Play Console](https://play.google.com/console/u/0/developers/8108786316406306111/app/4974313587130494583/publishing).
