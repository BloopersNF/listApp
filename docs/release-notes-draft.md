# Rascunho de release semanal — MarketList 1.4.3

Atualizado em 2026-07-17.

## Melhorias feitas

- Home com onboarding para primeiro uso: quando não há listas, o app mostra proposta clara, CTA para criar lista vazia e modelos rápidos.
- Quatro modelos iniciais: compra da semana, churrasco, farmácia e faxina.
- Modelos criam listas reais com itens básicos já preenchidos.
- Correção de estabilidade na lixeira: configurações internas e dados inválidos do `AsyncStorage` não quebram mais a listagem de listas deletadas.
- Listas deletadas passam a ser exibidas por data de exclusão mais recente.
- Restaurar uma lista remove o marcador `DeletedAt`.
- Home agora pede confirmação antes de mover uma lista para a lixeira.
- Preferência de idioma automático/manual (`languageMode`) é preservada durante a limpeza defensiva do `AsyncStorage`.
- Tela de lista vazia agora mostra título, orientação e sugestões rápidas de itens comuns.
- Sugestões rápidas adicionam arroz, feijão, leite, pão, ovos ou frutas com um toque, usando o mesmo schema de item existente.
- Campo de item passou a rejeitar nomes compostos apenas por espaços.
- Modal de criação manual de lista ganhou título, texto de apoio, placeholder com exemplo, foco automático no campo e botões textuais de cancelar/criar.
- Tela de lista ganhou header contextual com voltar, nome da lista, data, contagem de itens, resumo de orçamento e ações compactas de ordenar/compartilhar.
- Tela de lista vazia agora pode sugerir itens frequentes a partir de outras listas salvas no próprio aparelho.
- Loading da tela de lista passou a ter tradução explícita em todos os idiomas suportados.
- A navegação inferior agora mostra rótulos localizados para Lixeira, Listas e Ajustes.
- Os controles principais da tela de lista agora têm labels/roles de acessibilidade para marcar item, deletar item, adicionar item e escolher ordenação.
- Home, Lixeira e sugestões frequentes agora usam uma camada compartilhada de leitura segura de listas salvas no aparelho.
- Export web voltou a passar no estado atual com `@expo/metro-runtime@~5.0.5` instalado.

## Bugs corrigidos

- A tela de lixeira podia abortar ao tentar interpretar `selectedLanguage`, `listSortPreference` ou outros valores não-lista como JSON de lista.
- A Home podia apagar `languageMode` durante a limpeza de dados corrompidos, fazendo o modo de idioma voltar ao padrão.
- A Home deixou de executar limpeza automatica destrutiva de registros desconhecidos; dados invalidos agora sao filtrados durante a leitura.
- Era possível adicionar item sem nome real usando apenas espaços.
- Export web falhava por dependência ausente de runtime do Metro; o bundle web passou em 2026-07-10.

## Melhorias de UX

- Novo usuário não cai mais em uma Home sem orientação.
- CTA textual deixa claro como criar a primeira lista.
- Templates reduzem o esforço para começar uma compra comum.
- Botão flutuante de criação ganhou label de acessibilidade.
- Lixeira ficou mais previsível para recuperar listas apagadas.
- Exclusão de lista ficou menos arriscada: o usuário confirma antes de enviar para a lixeira e vê que pode restaurar por 7 dias.
- Criar uma lista vazia ficou menos travado: o usuário recebe sugestões acionáveis para adicionar o primeiro item.
- Criar uma lista manual ficou mais claro: o modal orienta o nome, foca o campo automaticamente e troca ícones isolados por CTAs com texto.
- Abrir uma lista ficou mais orientado: o usuário vê onde está, consegue voltar claramente e acompanha total, pendente e progresso no topo.
- Compras recorrentes ficaram mais rápidas: ao criar uma lista vazia, o app pode sugerir itens já usados em listas anteriores, sem exigir conta, internet ou sincronização.
- A navegação ficou mais clara para novos usuários: as abas deixaram de depender apenas de ícones.
- A tela de lista ficou mais acessível: leitores de tela agora conseguem identificar os controles principais de item e o estado selecionado da ordenação.

## Melhorias técnicas

- Home passou a usar `ListEmptyComponent` para o onboarding.
- Criação de lista aceita itens iniciais de template sem mudar o schema persistido.
- Templates usam a classe `Item` existente, mantendo compatibilidade com totais e checklist.
- Parser defensivo local em `DeleteScreen`.
- Validação mínima de schema de lista antes de processar dados do storage.
- Rotinas de expiração, restauração e limpeza em massa protegidas contra chaves de configuração.
- `languageMode` entrou na allowlist de configurações em Home e Lixeira.
- Lógica de mover lista para lixeira na Home foi extraída para funções nomeadas, com tratamento de erro visível ao usuário.
- Adição manual e adição por sugestão na tela de lista agora compartilham a mesma validação e persistência.
- Estado vazio da lista foi extraído para render dedicado com chips acessíveis e traduções nos cinco idiomas suportados.
- Modal de criação agora usa foco via `ref`, submissão pelo teclado e botões acessíveis com texto.
- Novas strings do modal foram adicionadas em EN, PT-BR, ES, FR e CN.
- `ListScreen` passou a receber `navigation`, usar botão de voltar próprio e renderizar resumo derivado de `Items`, `TotalPrice`, `TotalUncheckedPrice` e `TotalCheckedPrice`.
- Adicionada string `backToLists` em EN, PT-BR, ES, FR e CN.
- `ListScreen` agora lê listas válidas do `AsyncStorage`, ignora chaves de configuração, descarta listas deletadas e monta ranking local de itens frequentes.
- A seção de sugestões frequentes filtra itens já presentes na lista atual para evitar duplicidade visual.
- Adicionadas strings `loading`, `frequentItemSuggestionsTitle`, `frequentItemSuggestionsSubtitle` e `addFrequentItem` em EN, PT-BR, ES, FR e CN.
- `MainScreen` passou a exibir `tabBarLabel` e `tabBarAccessibilityLabel` localizados para as três abas principais.
- Adicionadas strings `tabTrash`, `tabLists` e `tabSettings` em EN, PT-BR, ES, FR e CN.
- `ListScreen` passou a declarar `accessibilityRole`, `accessibilityLabel`, `accessibilityState` em controles de item e modal de ordenação.
- Adicionadas strings `checkedItemAccessibilityLabel`, `uncheckedItemAccessibilityLabel`, `deleteItemAccessibilityLabel` e `addItemAccessibilityLabel` em EN, PT-BR, ES, FR e CN.
- Criado `src/utils/listStorage.js` para centralizar chaves de configuracao, validacao de schema de listas, leitura segura de listas e ranking baseado em listas validas.
- `HomeScreen`, `DeleteScreen` e `ListScreen` passaram a reutilizar a mesma validacao de lista salva, reduzindo divergencia entre Home, Lixeira e sugestoes frequentes.

## Impacto para usuários

Usuários novos conseguem começar em menos passos e entender o valor do app mais rápido. Usuários existentes ganham uma lixeira mais confiável para recuperar listas apagadas e menos risco de remover uma lista por toque acidental.

Usuários que criam uma lista vazia agora têm um caminho imediato para adicionar o primeiro item, reduzindo a chance de abandonar a tela sem registrar nada. Usuários que preferem começar do zero também recebem um modal mais claro para nomear a compra e seguir adiante com menos dúvida.

Ao abrir uma lista, o usuário agora entende rapidamente qual compra está editando, quanto já planejou gastar e quais ações estão disponíveis, o que melhora confiança no fluxo principal.

## Texto comercial para lançamento

O MarketList ficou mais fácil de começar e mais confiável para recuperar listas. Agora, ao abrir o app sem listas, você pode criar uma lista vazia ou escolher modelos prontos para compra da semana, churrasco, farmácia e faxina. Se preferir criar do zero, o novo modal orienta o nome da lista e já foca o campo para você começar. E, se criar uma lista vazia, sugestões rápidas ajudam a adicionar os primeiros itens com um toque. Também melhoramos a exclusão: antes de enviar uma lista para a lixeira, o app pede confirmação e lembra que ela pode ser restaurada.

A tela de compra também ficou mais clara: cada lista mostra nome, data, contagem de itens, total planejado e ações rápidas no topo.

E, para compras recorrentes, listas vazias agora podem mostrar itens que você costuma usar, calculados apenas a partir das listas salvas no seu aparelho.

A navegação também ficou mais direta: as abas agora dizem claramente onde ficam Listas, Lixeira e Ajustes.

Os principais controles da lista também ficaram mais acessíveis para quem usa leitor de tela: marcar item, deletar item, adicionar item e escolher ordenação agora têm nomes e estados claros.

Por baixo, o app tambem ficou mais confiavel: Home, Lixeira e sugestoes de itens frequentes agora leem listas salvas pelo mesmo caminho seguro, evitando que preferencias ou dados invalidos interfiram nos fluxos principais.

## Pendências para revisão do RC

- Validar o fluxo dos modelos em dispositivo/emulador.
- Validar a nova grade de sugestões rápidas em telas pequenas.
- Validar o novo modal de criação manual em dispositivo/emulador, incluindo teclado e telas pequenas.
- Validar o novo header contextual da lista em dispositivo/emulador, incluindo telas pequenas, tema escuro, voltar, ordenar e compartilhar.
- Validar sugestões de itens frequentes em dispositivo/emulador, incluindo listas antigas, idiomas e tema escuro.
- Validar os rótulos das abas em dispositivo/emulador, incluindo tema escuro e idiomas longos.
- Validar os labels de acessibilidade da tela de lista com leitor de tela ou inspetor de acessibilidade.
- Validar a nova leitura compartilhada de listas em dispositivo/emulador, cobrindo Home, Lixeira, expiracao, restauracao e sugestoes frequentes.
- Revisar assinatura de release Android; o release ainda usa debug keystore.
- Corrigir ou confirmar o ícone iOS em `app.json`.
- Alinhar versões/bundle IDs iOS: a versão compartilhada/Android está em `1.4.3`, mas Xcode/Info.plist ainda apontam versão/bundle antigos.
- Resolver warnings do `npx expo install --check`: `expo` e `react-native` estão abaixo das versões esperadas pelo SDK 53.
