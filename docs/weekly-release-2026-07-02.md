# Release candidate — 2026-07-02

## Resumo da semana

O pacote atual está focado em confiabilidade antes de novas frentes grandes. A principal entrega desta quinta-feira é a correção da lixeira do MarketList, que agora trata melhor dados locais mistos no `AsyncStorage`.

Observação: a memória da automação menciona documentação e melhorias de onboarding da execução anterior, mas este checkout atual não continha a pasta `docs` nem alterações visíveis de templates na Home. Este release candidate documenta apenas o que está presente neste worktree.

## Principais melhorias

- Lixeira resiliente a chaves internas do app como idioma, tema e preferência de ordenação.
- Validação de dados antes de tratar qualquer valor do `AsyncStorage` como lista.
- Listas deletadas ordenadas por exclusão mais recente.
- Restauração limpa o campo `DeletedAt`.

## Bugs corrigidos

- Corrigido risco de a lixeira falhar ao abrir quando `AsyncStorage` continha valores não-lista.
- Corrigido risco de limpeza em massa tentar processar configurações do usuário como listas.
- Corrigido risco de expiração remover pela chave errada quando `Id` e chave divergirem.

## Melhorias técnicas

- Adicionado parser defensivo local em `DeleteScreen`.
- Criado filtro explícito de chaves de configuração.
- Removido `JSON.parse` direto dos fluxos de listagem, expiração, restauração e limpeza da lixeira.

## Impacto esperado

- Estabilidade: menos falhas silenciosas em recuperação de listas.
- Retenção: mais confiança para apagar e restaurar listas.
- UX: lixeira mais previsível e ordenada.
- Arquitetura: evidencia necessidade de helper compartilhado de storage para próximas features.

## Como revisar

1. Instalar dependências no checkout ou usar ambiente local com `node_modules`.
2. Iniciar o app com `npm run android` ou `npm run ios`.
3. Criar uma lista e adicionar alguns itens.
4. Alterar idioma e ordenação para garantir criação de chaves de configuração.
5. Deletar a lista na Home.
6. Abrir a aba de lixeira; a lista deve aparecer.
7. Restaurar a lista; ela deve voltar para a Home.
8. Deletar novamente e usar "clear all"; configurações de idioma/tema/ordenação devem permanecer.
9. Opcional: ajustar data `DeletedAt` para mais de 7 dias e confirmar remoção automática.

## Comandos executados

- `npm pkg get scripts`: OK. Só há `start`, `android`, `ios`, `web`.
- `git diff --check`: OK. Sem erros de whitespace; aviso de CRLF esperado no Windows.
- `rg -n "JSON\\.parse|USER_CONFIG_KEYS|getStoredList|AsyncStorage\\.getItem" src\\screens\\deleteScreen.js`: OK. `JSON.parse` está encapsulado em `getStoredList`.
- Verificação de `node_modules`: ausente neste worktree.

## Riscos

- Build de app não foi executado porque este worktree não tem `node_modules`.
- Não há scripts automatizados de lint, test, typecheck ou build em `package.json`.
- Release Android ainda assina com debug keystore em `android/app/build.gradle`.
- `app.json` referencia `./assets/Icon.png` para iOS, arquivo não encontrado no checkout.
- `ios/MarketList/Info.plist` está com versão `1.0`, diferente de `1.1.2`.
- Permissões Android devem ser revisadas antes de submissão.

## Pendências

- Revisão humana do fluxo da lixeira em dispositivo/emulador.
- Corrigir assinatura Android antes de produção.
- Corrigir/confirmar assets iOS.
- Alinhar versões iOS/Android/Expo.
- Decidir se o próximo release inclui onboarding/templates ou fica apenas como bugfix.

## Changelog público

- Melhoramos a lixeira para recuperar listas apagadas com mais segurança.
- Ajustamos a ordem das listas deletadas para mostrar as mais recentes primeiro.
- Corrigimos um problema em que configurações internas do app podiam atrapalhar a tela de listas apagadas.

## Texto de lançamento

Nova atualização do MarketList: a lixeira ficou mais confiável. Agora fica mais seguro apagar, revisar e restaurar listas, mesmo depois de alterar idioma, tema ou preferências de ordenação. Antes de publicar, ainda vamos validar o build e revisar os detalhes finais de release.
