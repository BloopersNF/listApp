# Release candidate — 2026-07-02

## Resumo da semana

O pacote desta quinta-feira melhora dois momentos críticos do MarketList: primeiro uso e confiança na recuperação de listas. A Home agora orienta o usuário sem listas e oferece modelos prontos para começar; a lixeira foi blindada contra dados locais mistos no `AsyncStorage`.

## Principais melhorias

- Estado vazio da Home com CTA para criar lista vazia.
- Modelos rápidos para compra da semana, churrasco, farmácia e faxina.
- Modelos criam listas com itens iniciais, usando o schema atual de `List` e `Item`.
- Lixeira resiliente a chaves internas do app como idioma, tema e preferência de ordenação.
- Listas deletadas ordenadas por exclusão mais recente.
- Restauração limpa o campo `DeletedAt`.

## Bugs corrigidos

- Corrigido risco de a lixeira falhar ao abrir quando `AsyncStorage` continha valores não-lista.
- Corrigido risco de limpeza em massa tentar processar configurações do usuário como listas.
- Corrigido risco de expiração remover pela chave errada quando `Id` e chave divergirem.

## Melhorias técnicas

- `HomeScreen` passou a ter `ListEmptyComponent` para onboarding.
- Criação de lista aceita nome e itens iniciais de template.
- Textos de templates foram adicionados em português, inglês, espanhol, francês e chinês.
- Botão flutuante de criação ganhou `accessibilityRole` e `accessibilityLabel`.
- `DeleteScreen` usa parser defensivo local e filtro explícito de chaves de configuração.

## Impacto esperado

- Aquisição/ativação: novos usuários têm um caminho mais claro para criar a primeira lista.
- Retenção: templates aumentam a chance de o usuário sair da primeira sessão com uma lista útil.
- UX: menos tela vazia e menos dependência de um botão `+` sem contexto.
- Estabilidade: lixeira mais previsível para revisar e restaurar listas.
- SEO futuro: os modelos criados no app podem virar inventário público de templates.

## Como revisar

1. Instalar dependências no checkout, se necessário.
2. Iniciar o app com `npm run android` ou `npm run ios`.
3. Limpar dados locais do app ou usar instalação nova.
4. Abrir a Home e confirmar que aparecem título, explicação, CTA e quatro modelos.
5. Tocar em "Compra da semana"; a lista deve abrir com itens iniciais.
6. Voltar para a Home e confirmar que a lista aparece no card normal.
7. Repetir com outro modelo e trocar idioma para validar traduções.
8. Criar uma lista manual pelo CTA de lista vazia.
9. Deletar uma lista, abrir a lixeira, restaurar e confirmar que ela volta para a Home.
10. Usar "Limpar Tudo" na lixeira e confirmar que configurações de idioma/tema permanecem.

## Comandos executados

- `npm pkg get scripts`: OK. Só há `start`, `android`, `ios`, `web`.
- `git diff --check`: OK. Sem erros de whitespace; avisos de CRLF esperados no Windows.
- `npx expo export --platform web --output-dir .expo-web-export-test`: falhou antes de compilar por falta de `@expo/metro-runtime@~5.0.5`.
- `npx expo export --platform android --output-dir .expo-android-export-test`: OK. Metro compilou 1271 módulos e exportou o bundle Android.
- Diretórios temporários `.expo-web-export-test` e `.expo-android-export-test`: removidos após validação.

## Riscos

- Não houve teste manual em dispositivo/emulador nesta execução.
- Templates usam preços zero; isso evita inventar preço, mas o conteúdo deve ser validado com usuários.
- Exportação web continua bloqueada até adicionar/configurar `@expo/metro-runtime`.
- Release Android ainda assina com debug keystore em `android/app/build.gradle`.
- `app.json` referencia `./assets/Icon.png` para iOS, arquivo não encontrado no checkout.
- `ios/MarketList/Info.plist` está com versão `1.0`, diferente de `1.1.2`.

## Pendências

- Revisão humana do fluxo de templates em dispositivo/emulador.
- Corrigir assinatura Android antes de produção.
- Corrigir ou confirmar assets iOS.
- Alinhar versões iOS/Android/Expo.
- Decidir se web faz parte do release; se sim, corrigir dependência web.

## Changelog público

- Novo início mais fácil: crie sua primeira lista a partir de modelos prontos.
- Adicionamos modelos para compra da semana, churrasco, farmácia e faxina.
- Melhoramos a lixeira para recuperar listas apagadas com mais segurança.
- Ajustamos a ordem das listas deletadas para mostrar as mais recentes primeiro.

## Texto de lançamento

Nova atualização do MarketList: ficou mais fácil começar sua lista. Agora você pode criar uma lista vazia ou escolher modelos prontos para compra da semana, churrasco, farmácia e faxina. Também melhoramos a lixeira para que apagar, revisar e restaurar listas seja mais confiável.
