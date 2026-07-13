# Product backlog — MarketList

Atualizado em 2026-07-13.

## Now

- Descrição: Validar em dispositivo/emulador o novo header contextual da tela de lista.
  Impacto esperado: médio/alto.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: melhoria implementada em 2026-07-13; precisa confirmar layout, voltar, ordenação, compartilhamento e resumo de totais em telas pequenas.
  Status: pronto para QA.

- Descrição: Validar em dispositivo real o novo modal de criação manual de lista.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: melhoria implementada em 2026-07-10; precisa confirmar foco automático, teclado, botões textuais e layout em telas pequenas.
  Status: pronto para QA.

- Descrição: Confirmar em dispositivo real o fluxo de primeiro uso com modelos rápidos na Home.
  Impacto esperado: alto.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: melhoria implementada em 2026-07-02; precisa validação manual de layout/toque.
  Status: pronto para QA.

- Descrição: Adicionar confirmação ou desfazer ao deletar lista pela Home.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: exclusão atual é imediata; a lixeira reduz dano, mas não reduz susto.
  Status: implementado em 2026-07-03 com confirmação antes de mover para a lixeira.

- Descrição: Centralizar leitura segura de listas do `AsyncStorage` em helper compartilhado.
  Impacto esperado: médio.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: Home e Delete duplicam lista de chaves de configuração e parsing defensivo.
  Status: planejado.

- Descrição: Validar em dispositivo real o novo estado vazio da tela de lista com sugestões rápidas.
  Impacto esperado: médio/alto.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: melhoria implementada em 2026-07-08; precisa validar toque, grade e textos em tela pequena.
  Status: pronto para QA.

## Next

- Descrição: Adicionar header contextual na tela de lista com voltar, nome, data/quantidade/total e ações compactas.
  Impacto esperado: médio/alto.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: Product Agent de 2026-07-10 e 2026-07-13; a lista não mostrava contexto nem navegação clara após a criação.
  Status: implementado em 2026-07-13.

- Descrição: Expandir modelos rápidos para "Compra do mês", "Feira", "Material escolar" e "Pet".
  Impacto esperado: médio/alto.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: AnyList/Listonic/Out of Milk reforçam ocasiões, templates e sugestões.
  Status: especificar itens e traduções.

- Descrição: Melhorar o estado vazio dentro de uma lista recém-criada com sugestões de primeiros itens ou CTA para modelos.
  Impacto esperado: médio/alto.
  Esforço: baixo/médio.
  Risco: baixo.
  Fonte ou justificativa: Product Agent de 2026-07-03; após criar lista, a tela interna ainda mostra apenas mensagem vazia.
  Status: implementado em 2026-07-08 com sugestões rápidas de itens comuns.

- Descrição: Corrigir exportação web com `@expo/metro-runtime@~5.0.5`.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: `npx expo export --platform web` falhou antes de compilar por dependência ausente.
  Status: corrigido e validado em 2026-07-10.

- Descrição: Corrigir variáveis globais implícitas restantes e padronizar declarações.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: análise técnica; reduz risco em modo estrito e manutenção.
  Status: planejado.

- Descrição: Melhorar modal de criação com `autoFocus`, exemplo de nome, retorno do teclado e CTA textual.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: Product Agent de 2026-07-03; modal atual depende de ícones grandes e pouco texto.
  Status: implementado em 2026-07-10.

## Later

- Descrição: Histórico de itens frequentes e botão "Adicionar de novo".
  Impacto esperado: alto.
  Esforço: médio.
  Risco: médio.
  Fonte ou justificativa: Listonic, AnyList e Out of Milk destacam histórico/favoritos como acelerador de listas recorrentes; Research Agent de 2026-07-10 reforçou como melhor aposta de retenção sem sync.
  Status: discovery.

- Descrição: Ordenação por categoria/corredor com categorias padrão.
  Impacto esperado: médio.
  Esforço: médio.
  Risco: médio.
  Fonte ou justificativa: AnyList, OurGroceries e Listonic usam agrupamento/aisles para reduzir tempo no mercado.
  Status: discovery.

- Descrição: Métrica local/analytics futura para listas criadas a partir de modelos.
  Impacto esperado: médio.
  Esforço: médio.
  Risco: médio.
  Fonte ou justificativa: templates viraram alavanca de ativação; precisa medir uso antes de expandir muito.
  Status: bloquear até decisão de analytics/privacidade.

## Big bets

- Descrição: Páginas públicas de templates indexáveis em PT-BR com CTA para abrir no app.
  Impacto esperado: alto.
  Esforço: alto.
  Risco: médio.
  Fonte ou justificativa: Out of Milk usa templates públicos; SEO por intenção pode abrir aquisição orgânica.
  Status: proposta futura.

- Descrição: Ofertas externas rotuladas por origem, com alertas e possível afiliado/cashback.
  Impacto esperado: alto.
  Esforço: alto.
  Risco: alto.
  Fonte ou justificativa: Flipp, Pelando, Promobit e Buscapé indicam demanda por economia, mas confiança exige rotulagem.
  Status: bloquear até estratégia humana.

## Bugs

- Descrição: Lixeira quebrava ao encontrar `selectedLanguage`, `listSortPreference` ou JSON inválido no `AsyncStorage`.
  Impacto esperado: alto.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: análise técnica de 2026-07-02.
  Status: corrigido em 2026-07-02.

- Descrição: `npx expo export --platform web` falha por falta de `@expo/metro-runtime@~5.0.5`.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: validação de build em 2026-07-02.
  Status: corrigido e validado em 2026-07-10.

- Descrição: A limpeza da Home podia remover `languageMode` do `AsyncStorage`, resetando a preferência auto/manual de idioma.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: Engineering Agent de 2026-07-03; `LanguageContext` grava `languageMode`, mas Home/Delete não tratavam essa chave como configuração.
  Status: corrigido em 2026-07-03.

- Descrição: `app.json` referencia `./assets/Icon.png` para iOS, mas o arquivo não aparece no checkout.
  Impacto esperado: alto para release iOS.
  Esforço: baixo.
  Risco: médio.
  Fonte ou justificativa: análise de release.
  Status: pendente.

- Descrição: Campo de item aceitava nomes compostos apenas por espaços.
  Impacto esperado: baixo/médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: revisão técnica de 2026-07-08 ao centralizar adição de itens.
  Status: corrigido em 2026-07-08.

- Descrição: Versões estão desalinhadas: `app.json`/Android em `1.3.2`, `package.json` em `1.1.2` e `Info.plist` iOS em `1.0`.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: médio.
  Fonte ou justificativa: análise de release.
  Status: pendente.

## Tech debt

- Descrição: Criar storage service com namespace de listas e configs.
  Impacto esperado: médio.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: chaves de config duplicadas em Home/Delete; Engineering Agent de 2026-07-13 apontou risco de apagar futuras preferências/dados de libs por allowlist incompleta.
  Status: planejado.

- Descrição: Normalizar listas antigas ao carregar, recalculando totais quando itens salvos não tiverem `priceCents` ou campos novos.
  Impacto esperado: alto.
  Esforço: médio.
  Risco: médio.
  Fonte ou justificativa: Engineering Agent de 2026-07-13; o modelo tem `recalculateTotals()`, mas a tela aceita dados antigos diretamente.
  Status: planejado.

- Descrição: Adicionar traduções para `loading` em todos os idiomas.
  Impacto esperado: baixo/médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: Engineering Agent de 2026-07-13 encontrou uso de `getText('loading')` sem chave correspondente.
  Status: planejado.

- Descrição: Adicionar cleanup para listeners e timeout do intersticial na `ListScreen`.
  Impacto esperado: médio.
  Esforço: baixo/médio.
  Risco: baixo.
  Fonte ou justificativa: Engineering Agent de 2026-07-10; anúncio pode disparar depois da tela perder foco.
  Status: planejado.

- Descrição: Adicionar scripts `lint`, `test` e/ou `typecheck`.
  Impacto esperado: médio.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: `package.json` só tem scripts Expo.
  Status: planejado.

- Descrição: Revisar permissões Android e assinatura de release.
  Impacto esperado: alto.
  Esforço: médio.
  Risco: médio.
  Fonte ou justificativa: release usa debug keystore e permissões precisam revisão antes de loja.
  Status: precisa revisão humana.

## Growth

- Descrição: Link compartilhável com preview útil para WhatsApp.
  Impacto esperado: alto.
  Esforço: médio/alto.
  Risco: médio.
  Fonte ou justificativa: compartilhamento social pode virar aquisição orgânica.
  Status: discovery.

- Descrição: Não exibir intersticial antes do usuário obter valor inicial.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: médio.
  Fonte ou justificativa: ads cedo podem reduzir ativação; agora há fluxo de templates para proteger.
  Status: precisa decisão de monetização.

## SEO

- Descrição: Criar inventário de templates com títulos e descrições indexáveis.
  Impacto esperado: alto.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: Out of Milk e referências editoriais usam páginas por intenção.
  Status: especificar fora do app nativo.

- Descrição: Melhorar metadados de loja com promessa clara: lista simples, orçamento, templates e recuperação.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: novo posicionamento do app ficou mais claro com templates e lixeira.
  Status: planejado.

## UX

- Descrição: Estado vazio da Home com CTA e quatro modelos rápidos.
  Impacto esperado: alto.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: análise de produto e concorrentes; reduz atrito da primeira lista.
  Status: implementado em 2026-07-02.

- Descrição: Rótulos nas abas ou tooltips/acessibilidade para Delete/Home/Config.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: `tabBarShowLabel:false` reduz descoberta para usuário novo.
  Status: planejado.

- Descrição: Header contextual da lista com voltar, nome, data, contagem e resumo de orçamento.
  Impacto esperado: médio/alto.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: melhora orientação logo após criar/abrir uma lista e deixa sort/share como ações compactas.
  Status: implementado em 2026-07-13.

- Descrição: Estado vazio da tela de lista com sugestões rápidas de itens comuns.
  Impacto esperado: médio/alto.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: AnyList/Listonic usam sugestões para acelerar criação; lacuna aparecia logo após criar lista vazia.
  Status: implementado em 2026-07-08.

- Descrição: Modal de criação manual com título, texto de apoio, placeholder de exemplo, foco automático e botões textuais.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: reduz atrito para criar a primeira lista manual e substitui botões apenas por ícones.
  Status: implementado em 2026-07-10.
