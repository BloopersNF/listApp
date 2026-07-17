# Release candidate — 2026-07-16

## Resumo da semana

Nesta semana o MarketList evoluiu o fluxo principal de compra: primeiro uso, criação manual, lista vazia, lista recorrente, navegação inferior e acessibilidade dos controles de item. O app ficou mais claro para novos usuários e mais útil para compras recorrentes, mas ainda não está pronto para publicação em loja sem revisão humana de assinatura Android e configuração iOS.

## Principais melhorias

- Home com onboarding para primeiro uso, CTA e modelos rápidos.
- Modelos para compra da semana, churrasco, farmácia e faxina.
- Modal de criação manual com foco no campo, texto de apoio e CTAs textuais.
- Tela de lista com header contextual, voltar, nome, data, contagem, resumo de orçamento e ações compactas.
- Lista vazia com sugestões rápidas de itens comuns.
- Sugestões de itens frequentes baseadas apenas nas listas salvas no aparelho.
- Abas inferiores com labels localizados para Lixeira, Listas e Ajustes.
- Controles principais da lista com labels/roles de acessibilidade.

## Bugs corrigidos

- Lixeira protegida contra chaves não-lista e JSON inválido no `AsyncStorage`.
- Home preserva `languageMode` durante limpeza defensiva.
- Campo de item rejeita nomes compostos apenas por espaços.
- Export web voltou a passar com `@expo/metro-runtime@~5.0.5`.

## Melhorias técnicas

- Validação mínima de schema para listas na lixeira.
- Parser defensivo em fluxos que leem storage local.
- Adição manual e sugestões de item compartilham validação/persistência.
- Sugestões frequentes filtram itens já presentes na lista atual.
- Strings novas adicionadas em EN, PT-BR, ES, FR e CN.
- `ListScreen` passou a expor estado selecionado no modal de ordenação e estado checked nos itens.

## Impacto esperado

- Aquisição/ativação: novos usuários entendem melhor como começar e podem usar modelos prontos.
- Retenção: listas vazias podem reutilizar itens frequentes locais, acelerando compras recorrentes.
- Conversão/confiança: lixeira, confirmação de delete e resumo de orçamento reduzem medo de perda e aumentam clareza.
- UX/acessibilidade: navegação e controles críticos deixaram de depender só de ícones.
- SEO futuro: templates e intenções de compra seguem como base para páginas públicas futuras.

## Como revisar

1. Rodar `npm install` se necessário.
2. Iniciar o app com `npm run android`, `npm run ios` ou Expo Go quando aplicável.
3. Limpar dados locais do app para testar primeiro uso.
4. Abrir a Home e confirmar CTA, textos e quatro modelos.
5. Criar lista por modelo e validar itens iniciais.
6. Criar lista vazia e validar sugestões rápidas.
7. Criar listas adicionais, voltar a uma lista vazia e validar sugestões frequentes.
8. Abrir lista com itens e testar marcar/desmarcar, deletar, adicionar, ordenar e compartilhar.
9. Ativar leitor de tela ou inspetor de acessibilidade e validar labels dos botões de item.
10. Mover lista para lixeira, restaurar e apagar permanentemente.
11. Repetir em PT-BR e pelo menos EN, com tela pequena e tema escuro se disponível.

## Comandos executados

- `npm pkg get scripts`: OK; só há scripts Expo interativos.
- `npx expo config --json`: OK.
- `git diff --check`: OK; apenas avisos CRLF esperados no Windows.
- `npx expo export --platform web --output-dir .expo-web-export-test-20260716`: OK; 584 módulos.
- `npx expo export --platform android --output-dir .expo-android-export-test-20260716`: falhou no sandbox por permissão do `hermesc.exe`.
- `npx expo export --platform android --output-dir .expo-android-export-test-20260716` fora do sandbox: OK; 1272 módulos.
- `npm ls --depth=0`: OK.
- `npx expo install --check`: falhou no sandbox por rede; fora do sandbox reportou `expo@53.0.20` esperado `~53.0.27` e `react-native@0.79.5` esperado `0.79.6`.

## Riscos

- Android release ainda usa debug keystore em `android/app/build.gradle`; não publicar.
- iOS referencia `./assets/Icon.png` ausente em `app.json`.
- iOS nativo segue com versão/bundle desalinhados.
- Não houve QA manual em dispositivo/emulador nesta execução.
- Dependências Expo/React Native precisam alinhamento com SDK 53.
- Não há lint/test/typecheck automatizados.

## Pendências

- Revisão humana de assinatura Android.
- Correção/decisão sobre asset e metadados iOS.
- QA manual do RC em dispositivo/emulador.
- Decidir se atualização de `expo` e `react-native` entra antes do release.
- Validar moeda/data localizadas antes de prometer orçamento por região.

## Changelog público

- Começar uma lista ficou mais fácil com modelos rápidos e um fluxo de criação mais claro.
- A tela de compra agora mostra contexto, totais e ações no topo.
- Listas vazias podem sugerir itens comuns e itens que você já costuma usar.
- A navegação ficou mais clara com nomes nas abas.
- Os principais botões da lista agora são mais acessíveis para leitores de tela.

## Texto de lançamento

O MarketList ficou mais fácil para começar e mais claro durante a compra. Agora você pode criar listas a partir de modelos, receber sugestões rápidas, reaproveitar itens frequentes salvos no próprio aparelho e ver nome, totais e ações da compra no topo da lista. Também melhoramos a lixeira, a navegação por abas e a acessibilidade dos controles principais.
