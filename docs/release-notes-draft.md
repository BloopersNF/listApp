# Rascunho de release semanal — MarketList

Atualizado em 2026-07-02.

## Melhorias feitas

- Correção de estabilidade na lixeira: configurações internas e dados inválidos do `AsyncStorage` não quebram mais a listagem de listas deletadas.
- Listas deletadas passam a ser exibidas por data de exclusão mais recente.
- Restaurar uma lista agora remove o marcador `DeletedAt`.

## Bugs corrigidos

- A tela de lixeira podia abortar ao tentar interpretar `selectedLanguage`, `listSortPreference` ou outros valores não-lista como JSON de lista.

## Melhorias de UX

- Lixeira mais previsível para recuperar listas apagadas.
- Ordem de listas deletadas mais útil, com itens recentes primeiro.

## Melhorias técnicas

- Parser defensivo local em `DeleteScreen`.
- Validação mínima de schema de lista antes de processar dados do storage.
- Rotinas de expiração, restauração e limpeza em massa protegidas contra chaves de configuração.

## Impacto para usuários

Usuários têm mais confiança ao apagar e restaurar listas. A lixeira deve continuar funcionando mesmo depois de alterar idioma, tema ou ordenação de listas.

## Texto comercial para lançamento

O MarketList ficou mais confiável: melhoramos a lixeira para que listas apagadas sejam exibidas e restauradas com mais segurança, sem conflito com configurações internas do app.

## Pendências antes da quinta-feira

- Executar app em dispositivo/emulador com `node_modules` instalado.
- Revisar assinatura de release Android; o release ainda usa debug keystore.
- Corrigir ou confirmar o ícone iOS em `app.json`.
- Alinhar versão iOS (`Info.plist`) com `1.1.2`.
- Decidir se o release inclui apenas bugfix ou também ajustes de onboarding.
