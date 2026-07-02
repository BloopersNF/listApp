# Product backlog — MarketList

Atualizado em 2026-07-02.

## Now

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
  Status: planejado.

- Descrição: Centralizar leitura segura de listas do `AsyncStorage` em helper compartilhado.
  Impacto esperado: médio.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: Home e Delete duplicam lista de chaves de configuração e parsing defensivo.
  Status: planejado.

## Next

- Descrição: Expandir modelos rápidos para "Compra do mês", "Feira", "Material escolar" e "Pet".
  Impacto esperado: médio/alto.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: AnyList/Listonic/Out of Milk reforçam ocasiões, templates e sugestões.
  Status: especificar itens e traduções.

- Descrição: Corrigir exportação web com `@expo/metro-runtime@~5.0.5`.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: `npx expo export --platform web` falhou antes de compilar por dependência ausente.
  Status: planejado.

- Descrição: Corrigir variáveis globais implícitas restantes e padronizar declarações.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: análise técnica; reduz risco em modo estrito e manutenção.
  Status: planejado.

## Later

- Descrição: Histórico de itens frequentes e botão "Adicionar de novo".
  Impacto esperado: alto.
  Esforço: médio.
  Risco: médio.
  Fonte ou justificativa: Listonic e Out of Milk destacam histórico como acelerador de listas recorrentes.
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
  Status: pendente.

- Descrição: `app.json` referencia `./assets/Icon.png` para iOS, mas o arquivo não aparece no checkout.
  Impacto esperado: alto para release iOS.
  Esforço: baixo.
  Risco: médio.
  Fonte ou justificativa: análise de release.
  Status: pendente.

- Descrição: `Info.plist` iOS está em `1.0`, enquanto `app.json`/Android estão em `1.1.2`.
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
  Fonte ou justificativa: chaves de config duplicadas em Home/Delete.
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

- Descrição: Melhorar modal de criação com `autoFocus`, exemplo e CTA textual.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: modal atual usa ícones grandes e pouco texto.
  Status: planejado.
