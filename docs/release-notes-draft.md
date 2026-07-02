# Rascunho de release semanal — MarketList

Atualizado em 2026-07-02.

## Melhorias feitas

- Home com onboarding para primeiro uso: quando não há listas, o app mostra proposta clara, CTA para criar lista vazia e modelos rápidos.
- Quatro modelos iniciais: compra da semana, churrasco, farmácia e faxina.
- Modelos criam listas reais com itens básicos já preenchidos.
- Correção de estabilidade na lixeira: configurações internas e dados inválidos do `AsyncStorage` não quebram mais a listagem de listas deletadas.
- Listas deletadas passam a ser exibidas por data de exclusão mais recente.
- Restaurar uma lista remove o marcador `DeletedAt`.

## Bugs corrigidos

- A tela de lixeira podia abortar ao tentar interpretar `selectedLanguage`, `listSortPreference` ou outros valores não-lista como JSON de lista.

## Melhorias de UX

- Novo usuário não cai mais em uma Home sem orientação.
- CTA textual deixa claro como criar a primeira lista.
- Templates reduzem o esforço para começar uma compra comum.
- Botão flutuante de criação ganhou label de acessibilidade.
- Lixeira ficou mais previsível para recuperar listas apagadas.

## Melhorias técnicas

- Home passou a usar `ListEmptyComponent` para o onboarding.
- Criação de lista aceita itens iniciais de template sem mudar o schema persistido.
- Templates usam a classe `Item` existente, mantendo compatibilidade com totais e checklist.
- Parser defensivo local em `DeleteScreen`.
- Validação mínima de schema de lista antes de processar dados do storage.
- Rotinas de expiração, restauração e limpeza em massa protegidas contra chaves de configuração.

## Impacto para usuários

Usuários novos conseguem começar em menos passos e entender o valor do app mais rápido. Usuários existentes ganham uma lixeira mais confiável para recuperar listas apagadas.

## Texto comercial para lançamento

O MarketList ficou mais fácil de começar e mais confiável para recuperar listas. Agora, ao abrir o app sem listas, você pode criar uma lista vazia ou escolher modelos prontos para compra da semana, churrasco, farmácia e faxina. Também melhoramos a lixeira para restaurar listas com mais segurança.

## Pendências antes da quinta-feira

- Validar o fluxo dos modelos em dispositivo/emulador.
- Corrigir a exportação web instalando/configurando `@expo/metro-runtime@~5.0.5`, se web fizer parte do pacote.
- Revisar assinatura de release Android; o release ainda usa debug keystore.
- Corrigir ou confirmar o ícone iOS em `app.json`.
- Alinhar versão iOS (`Info.plist`) com `1.1.2`.
