# Product backlog — MarketList

Atualizado em 2026-07-02.

## Now

- Descrição: Empty state da Home com proposta de valor, CTA textual "Criar lista" e sugestão de primeira lista.
  Impacto esperado: alto.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: análise de produto; primeira ativação está pouco orientada.
  Status: pronto para próxima execução.

- Descrição: Centralizar leitura segura de listas do `AsyncStorage` em helper compartilhado.
  Impacto esperado: médio.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: bug corrigido hoje mostrou duplicação de schema entre Home e Delete.
  Status: planejado.

## Next

- Descrição: Templates rápidos para "Compra da semana", "Churrasco", "Farmácia", "Faxina" e "Material escolar".
  Impacto esperado: alto.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: AnyList/Listonic/Out of Milk reforçam templates, histórico e ocasiões.
  Status: especificar conteúdo e traduções.

- Descrição: Confirmação ou desfazer ao deletar lista pela Home.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: exclusão atual é imediata, apesar de existir lixeira.
  Status: planejado.

- Descrição: Corrigir variáveis globais implícitas (`Tab`, `getAllKeys`).
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: análise técnica; risco de vazamento global/crash em modo estrito.
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

## Big bets

- Descrição: Páginas públicas de templates indexáveis em PT-BR com CTA para abrir no app.
  Impacto esperado: alto.
  Esforço: alto.
  Risco: médio.
  Fonte ou justificativa: Out of Milk usa templates públicos; Good Housekeeping/The Strategist mostram valor de conteúdo SEO evergreen.
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
  Fonte ou justificativa: análise técnica e memória da automação.
  Status: corrigido em 2026-07-02.

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
  Fonte ou justificativa: release usa debug keystore e permissões potencialmente excessivas.
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
  Fonte ou justificativa: análise de produto; ads cedo podem reduzir ativação.
  Status: precisa decisão de monetização.

## SEO

- Descrição: Criar inventário de templates com títulos e descrições indexáveis.
  Impacto esperado: alto.
  Esforço: médio.
  Risco: baixo.
  Fonte ou justificativa: Out of Milk e referências editoriais usam páginas por intenção.
  Status: especificar fora do app nativo.

- Descrição: Melhorar metadados de loja com promessa clara: lista simples, orçamento e recuperação.
  Impacto esperado: médio.
  Esforço: baixo.
  Risco: baixo.
  Fonte ou justificativa: Play Store Guide atual é genérico e desatualizado em versão.
  Status: planejado.

## UX

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

- Descrição: Ajustar inputs de item/preço/quantidade para telas pequenas e idiomas longos.
  Impacto esperado: médio.
  Esforço: médio.
  Risco: médio.
  Fonte ou justificativa: layout atual usa percentuais apertados.
  Status: discovery.
