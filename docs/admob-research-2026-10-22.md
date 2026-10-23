**Pesquisa e diagnóstico de monetização do MarketList — 22/10/2026**

A prioridade é recuperar a entrega e o aproveitamento dos anúncios, depois otimizar a receita por usuário. O painel indica correspondência muito baixa; o código também contém decisões que podem reduzir as oportunidades de impressão. São problemas distintos e precisam de medições distintas.

Esta análise combina a captura enviada, o checkout local, documentação oficial do Google e da biblioteca instalada, uma pesquisa acadêmica e estudos de caso. O código local pode diferir do binário publicado. Não foram consultados relatórios autenticados do AdMob nem executados anúncios nativos reais. As configurações da conta citadas abaixo são verificações pendentes, não causas confirmadas.

**O que os números permitem concluir.** A captura mostra aproximadamente 1.100 solicitações, correspondência de 1,46%, 9 impressões e eCPM de US$ 0,34. Se todas as métricas tiverem o mesmo período, filtros e escopo, a estimativa é:

| Etapa | Cálculo aproximado | Leitura |
| --- | --- | --- |
| Solicitações atendidas | 1.100 × 1,46% ≈ 16 | A maior perda ocorre antes de haver anúncio disponível. |
| Taxa de exibição | 9 ÷ 16 ≈ 56% | Há também uma possível perda entre receber e exibir. |
| Impressões por solicitação | 9 ÷ 1.100 ≈ 0,82% | Cerca de 8 impressões a cada 1.000 solicitações. |
| Receita compatível com o eCPM | 9 × US$ 0,34 ÷ 1.000 ≈ US$ 0,0031 | O painel pode arredondar esse valor para US$ 0,00. |

Os números são arredondados e a taxa de exibição acima é inferida, não obtida do relatório. Validar com solicitações e solicitações correspondidas exatas. Não combinar denominadores de rede, mediação e partner bidding: as definições e a contagem podem variar. O Google define correspondência como solicitações atendidas / solicitações e exibição como impressões / solicitações atendidas. [Glossário oficial](https://support.google.com/admob/table/16327896?hl=en).

Para um mesmo recorte: receita ≈ solicitações × correspondência × exibição × eCPM / 1.000. Aumentar solicitações sem demanda ou sem oportunidade de exibição não resolve esse produto. Com tão poucas impressões, o eCPM também é uma base frágil para decisões.

**Achados confirmados no checkout.** Os efeitos sobre o resultado publicado ainda precisam ser medidos.

| Prioridade | Evidência local | Efeito provável e recomendação |
| --- | --- | --- |
| Alta | `App.js:50–62`: inicialização disputa com timeout de 3 segundos; ao expirar, `global.AdMobEnabled` fica falso. | Uma inicialização mais lenta elimina a monetização naquela execução mesmo que a promessa nativa termine depois. Inicializar uma vez, sem bloquear a primeira tela, e publicar o resultado em estado reativo. Isso melhora disponibilidade; não prova a causa da baixa correspondência, pois pode impedir a própria solicitação. |
| Alta | `src/screens/listScreen.js:175–231`: carrega ao receber foco e chama `show()` em `LOADED`. | O anúncio pode interromper a leitura/edição iniciada após a abertura. Separar pré-carregamento de decisão de exibição e usar uma pausa natural. |
| Alta | `src/utils/interstitialLifecycle.js:4,69–76`: após 3 segundos remove listeners; `listScreen.js:207–209` encerra a tentativa daquela instância. | Uma carga que termina depois não é aproveitada. O cleanup evita anúncios tardios, mas o limite é curto para usar como política de inventário. Manter o anúncio carregado em um gerenciador e usá-lo apenas na próxima oportunidade válida. |
| Alta | `AdBanner.js:20` e `listScreen.js:187`: `requestNonPersonalizedAdsOnly: true`; não encontrei fluxo de `AdsConsent` em `App.js`/`src`. | Todo tráfego é solicitado com restrição de personalização. Implementar UMP e respeitar os sinais e escolhas aplicáveis; avaliar a restrição fixa apenas depois. Não assumir que removê-la autoriza personalização ou garante mais receita. |
| Alta para iOS | `app.json:22–23` repete o App ID Android no campo iOS; os componentes usam as mesmas unidades nos dois sistemas; o `Info.plist` versionado não contém `GADApplicationIdentifier`. | Configurar apps e unidades próprios por plataforma e verificar o resultado no binário final. O prebuild pode modificar o plist; o estado do arquivo local não comprova o estado do app distribuído. |
| Média | `listScreen.js:88`: `adLoadedRef` pertence à instância da tela. | A proteção comentada como “sessão” não é um limite global de sessão. Implementar intervalo e contagem de exibições no gerenciador central. |
| Média | Banner registra somente carregamento/erro; intersticial registra eventos no console. Não encontrei captura de receita por impressão nem funil persistente. | Não há evidência suficiente para distinguir falta de demanda, erro, timeout local e falha de exibição. Instrumentar antes de ajustar pressão publicitária. |

Há boas decisões a preservar: banner adaptativo ancorado, localizado acima do navegador em `stackScreen.js`, IDs de teste em desenvolvimento e limpeza de listeners ao sair da tela. As flags Android de otimização de inicialização/carregamento já estão habilitadas no manifesto. Não encontrei um timer JavaScript de refresh nem um loop agressivo de retry no fluxo ativo; portanto, não atribuo as 1.100 solicitações a isso.

`src/components/InterstitialAdManager.js` contém uma implementação antiga, mas não está importado no fluxo ativo encontrado. A correção relevante passa por `listScreen.js` e `interstitialLifecycle.js`.

**Verificações da conta com maior poder de explicar 1,46% de correspondência.** A documentação relaciona baixa correspondência a restrições de entrega, pisos, bloqueios, implementação e variações de demanda. Não existe uma taxa ideal universal para todos os países e formatos. [Motivos comuns segundo o AdMob](https://support.google.com/admob/answer/9655701?hl=en-GB).

1. Conferir Central de políticas, status de aprovação do app, limitações de veiculação e histórico de mudanças. Registrar a mensagem exata antes de alterar o código. O painel enviado não comprova uma limitação.
2. Conferir verificação do app e `app-ads.txt`. Quando a verificação é exigida, o app precisa passar por ela e pela avaliação de prontidão para veicular plenamente. [Verificação oficial](https://support.google.com/admob/answer/14538460?hl=en).
3. Validar App ID, unidade, formato e plataforma no app publicado; também conferir vínculo com a loja. Erros de plataforma ou formato possuem diagnóstico próprio. [Problemas de configuração](https://support.google.com/admob/answer/9905175?hl=en).
4. Inspecionar pisos globais e por país. Um piso alto pode excluir quase toda a demanda disponível. Para diagnosticar o caso atual, comparar a configuração existente com Google otimizado em “Todos os preços” ou piso desativado, conforme disponível. Depois escolher pela receita total, não só pelo eCPM. [Pisos de eCPM](https://support.google.com/admob/answer/3418058?hl=en).
5. Revisar bloqueios desnecessários e tipos de criativo permitidos, preservando adequação do público e restrições obrigatórias. Confirmar público infantil quando aplicável; a classificação etária da loja, isoladamente, não determina esse tratamento.
6. Abrir relatórios por unidade/formato, país, plataforma, versão, fonte e restrição de veiculação. Analisar cada dimensão separadamente antes de cruzamentos que deixem amostras minúsculas. A dimensão de restrição ajuda a separar NPA, anúncios limitados e outros tratamentos; não substitui a Central de políticas. [Relatórios de restrição](https://support.google.com/admob/answer/10922726?hl=en).

A [ficha pública do MarketList](https://play.google.com/store/apps/details?id=com.marketlist.app) aponta para `https://bloopersnf.github.io/`. Tentei consultar esse domínio e `/app-ads.txt`, mas a ferramenta web não conseguiu obter as páginas e o terminal não resolveu o host. Isso não demonstra que o arquivo esteja ausente: o resultado permanece **não verificado**. A confirmação útil é o status e a URL rastreada no próprio AdMob, com publisher ID correto. [Diagnóstico de app-ads.txt](https://support.google.com/admob/answer/9776740?hl=en).

**Fluxo recomendado para o app.** O SDK pode levar até seu próprio limite de inicialização, documentado como 30 segundos. Não é necessário manter o splash aberto durante esse tempo: a interface pode estar disponível enquanto os anúncios aguardam consentimento e inicialização. [Inicialização do SDK](https://developers.google.com/admob/android/quick-start).

Uma implementação central deve seguir esta sequência:

1. Atualizar as informações de consentimento e apresentar formulários quando necessários; disponibilizar opções de privacidade quando exigidas.
2. Verificar `canRequestAds`, inicializar o SDK uma única vez e atualizar os consumidores via Context/store, evitando a flag global não reativa.
3. Pré-carregar no máximo um intersticial quando houver probabilidade razoável de uma oportunidade próxima. Manter uma única carga em andamento e respeitar expiração.
4. Ao ocorrer uma pausa válida, verificar app em primeiro plano, anúncio pronto, intervalo, limite de sessão e ausência de teclado, edição, modal ou outro anúncio.
5. Se não estiver pronto, continuar a tarefa imediatamente. `LOADED` atualiza disponibilidade; não dispara `show()` automaticamente.
6. Após exibição/fechamento/falha, atualizar o estado e liberar a instância. Só preparar outro anúncio se ainda houver oportunidade provável de uso.

O Google recomenda pré-carregar intersticiais e exibi-los em pausas naturais. Sua documentação informa expiração de uma hora para esse formato; não transformar o prazo em um timer que requisita anúncios continuamente sem oportunidade. [Intersticiais Android](https://developers.google.com/admob/android/interstitial), [iOS](https://developers.google.com/admob/ios/interstitial).

Para MarketList, a hipótese inicial é uma transição explícita após concluir uma tarefa, com os dados já salvos e antes da próxima tela. Abrir uma lista para consultá-la, digitar ou marcar produtos não deve disparar tela cheia. O momento exato deve ser validado com uso real; não basta escolher um botão e exibir depois que o usuário já retomou outra atividade. A orientação oficial trata anúncios inesperados após carregar conteúdo como implementação inadequada. [Orientações de intersticiais](https://support.google.com/admob/answer/6201362?hl=en).

Como ponto inicial de experimento, considerar no máximo um intersticial por sessão e intervalo de cinco minutos entre exibições. São parâmetros propostos para este produto, não limites ideais publicados pelo Google. Se as sessões forem curtas e sem pausas naturais, manter apenas banner pode gerar resultado melhor por retenção.

Para erros transitórios, uma proposta de engenharia é retry com espera crescente e variação aleatória, por exemplo 30/60/120 segundos, com poucas tentativas e apenas em primeiro plano e com oportunidade prevista. Separar `no-fill` de rede e configuração. Falhas de ID/plataforma exigem correção; `no-fill` não se resolve repetindo imediatamente a mesma solicitação. Esses intervalos são hipótese operacional, não garantia de mais preenchimento. Não aplicar esse retry por cima do refresh automático de banners.

**Consentimento e personalização.** `requestNonPersonalizedAdsOnly: true` não substitui consentimento. O Google explica que anúncios não personalizados ainda podem usar identificadores para frequência e relatórios, exigindo consentimento onde aplicável. [Personalizados e não personalizados](https://support.google.com/admob/answer/7676680/personalized-and-non-personalized-ads).

Usar os sinais do UMP e as escolhas efetivas do usuário para permitir a modalidade elegível. `canRequestAds` autoriza iniciar solicitações no fluxo do SDK; não significa, isoladamente, consentimento para personalização. Se a coleta falhar, consultar a elegibilidade que o SDK informa com base no estado disponível; não inventar uma escolha. [UMP oficial](https://developers.google.com/admob/android/privacy), [integração da biblioteca](https://docs.page/invertase/react-native-google-mobile-ads/european-user-consent).

Confirmei no pacote local 16.0.0 as APIs `gatherConsent`, `getConsentInfo` e `showPrivacyOptionsForm`. O plugin Expo dessa versão aceita `delayAppMeasurementInit`; a configuração deve ser validada também no projeto nativo gerado. Qualquer expansão de uso de dados deve manter a política de privacidade e as declarações da loja coerentes com o comportamento final.

**Banner e oportunidades de impressão.** Manter inicialmente o banner adaptativo existente e avaliar sua visibilidade real em telas pequenas, com teclado, modais e fonte ampliada. Reservar espaço estável e distância dos controles usados para marcar, excluir ou navegar. O objetivo é exposição útil sem cliques acidentais.

Conferir no painel se o refresh está em “Otimizado pelo Google”. O Google recomenda esse modo; o SDK atualiza banners conforme a configuração e só faz refresh automático quando estão visíveis. Não adicionar um segundo timer JavaScript nem recriar o componente a cada navegação para forçar solicitações. [Refresh automático](https://support.google.com/admob/answer/3245199?hl=en), [implementação de banner](https://developers.google.com/admob/android/banner).

Depois de estabilizar o funil, testar um posicionamento alternativo por vez, com unidade identificável e espaço adequado. Não preencher toda tela com formatos adicionais de uma vez. Native ou inline adaptativo podem ser experimentos futuros; rewarded depende de um benefício opcional real. Para um app de consulta rápida no mercado, app open e intersticiais adicionais precisam demonstrar valor líquido antes de adoção.

**Mediação e concorrência entre compradores.** Após resolver bloqueios e erros, avaliar AdMob Mediation com um conjunto pequeno de fontes elegíveis para os países, formatos e volume reais. Não encontrei adaptadores externos declarados nas configurações inspecionadas; isso não revela toda a configuração da conta.

Adicionar uma fonte exige configuração no painel, dependências/adaptadores compatíveis, validação da inicialização e das mensagens de privacidade. Só ativar a rede no painel não completa a integração. Esperar a inicialização dos adaptadores antes da primeira carga e conferir latência, estabilidade, preenchimento e receita incremental. [Mediação Google](https://developers.google.com/admob/android/mediation), [mediação na biblioteca React Native](https://docs.page/invertase/react-native-google-mobile-ads/mediation).

**Medição necessária para decidir.** Criar uma linha de base por versão e registrar eventos operacionais leves, sem nomes de listas, produtos ou conteúdo digitado:

| Evento/medida proposto | Finalidade |
| --- | --- |
| Inicialização iniciada/concluída/falhou e duração | Identificar sessões sem disponibilidade e latência. |
| Elegibilidade de solicitar e modalidade/restrição permitida | Separar problemas de consentimento de carga. |
| Oportunidade, carga iniciada, carregou e duração | Relacionar inventário solicitado ao uso esperado. |
| Erro com código, domínio e mensagem sanitizada | Separar falta de anúncio, rede e configuração. |
| Exibição solicitada, abriu, fechou, falhou ou foi pulada | Explicar perdas de inventário e checar limites. |
| Impressão quando exposta e evento de receita | Conciliar uso e monetização com o relatório do AdMob. |
| Versão, plataforma, formato, placement e variante | Comparar resultados e localizar regressões. |

Consultar detalhes nativos de `LoadAdError`/`ResponseInfo` e o Ad Inspector em dispositivos de teste. Capturar apenas os campos que a bridge instalada expõe; detalhes adicionais podem exigir atualização ou alteração nativa. [Erros de carga](https://developers.google.com/admob/android/ad-load-errors), [Ad Inspector](https://developers.google.com/admob/android/ad-inspector).

Na versão 16.0.0 instalada, o banner expõe `onAdImpression` e `onPaid`; intersticiais expõem `AdEventType.PAID` e `OPENED`. O callback Android de impressão de tela cheia está sem implementação na bridge local: não inventar `AdEventType.IMPRESSION`, nem tratar `OPENED` como contagem oficial de impressão. Conciliar com AdMob e usar o evento pago para receita. O tipo local de `PaidEvent` possui `value`, `currency` e `precision`; no Android o valor já é convertido de micros para unidade monetária. Não dividir novamente por um milhão. Documentação atual da biblioteca contém APIs posteriores à v16. [Receita por impressão](https://developers.google.com/admob/android/impression-level-ad-revenue).

O projeto inicializa o SDK web de Firebase, mas isso não confirma Analytics nativo, Remote Config ou atribuição de receita configurados. Verificar/integrar esses pré-requisitos antes de esperar que os experimentos apareçam no console.

Métricas principais: receita de anúncios por usuário ativo diário, receita por sessão e receita acumulada por coorte em 7/30 dias. Acompanhar também solicitações por sessão, correspondência, exibição, impressões por usuário, eCPM, latência p50/p95, erros, retenção D1/D7/D30, conclusão de tarefas e estabilidade. Lucro requer considerar custos e aquisição, além da receita bruta publicitária.

**O que a pesquisa sustenta e seus limites.**

| Evidência | Resultado relatado | Aplicação ao MarketList |
| --- | --- | --- |
| Gao et al., 2020, [estudo de avaliações de apps](https://arxiv.org/abs/2008.12112) | Analisou 36.309 avaliações relacionadas a anúncios e identificou frequência e variedade entre as preocupações mais frequentes. | Medir pressão publicitária e experiência. É análise observacional de avaliações, não ensaio que fornece um cap ideal nem previsão de receita. |
| [Vinwap / Firebase](https://firebase.google.com/case-studies/vinwap) | O caso relata cerca de 30% de aumento na receita após teste A/B de placements, sem queda significativa de retenção. | Testar posicionamento com controle e retenção. É caso de apps de wallpaper, publicado pelo fornecedor; o ganho não pode ser transferido para este app. |
| [Invincibles Studio / AdMob](https://admob.google.com/home/resources/admob-mediation-drives-plus-14-percent-ads-arpdeu-for-invincibles-studio/) | O caso relata teste de mediação, +14% na receita de anúncios por usuário engajado diário e +9% no CPM. | Concorrência entre fontes merece teste após corrigir a base. É um jogo e um caso selecionado pelo fornecedor; ARPDEU não é a mesma métrica que ARPDAU. |
| [Tutorial oficial de frequência](https://firebase.google.com/docs/tutorials/optimize-ad-frequency) | Propõe variantes de frequência e avaliação conjunta de receita e retenção. | Usar o método experimental; não copiar frequências de jogos para um utilitário de compras. |

**Plano de execução e critérios de aceite.**

| Ordem | Entrega | Como verificar |
| --- | --- | --- |
| 1 | Exportar linha de base e revisar conta, aprovação, app-ads.txt, pisos e restrições. | Ter contagens exatas e status registrados; identificar se a perda se concentra em país, formato, versão ou fonte. |
| 2 | UMP, estado reativo e inicialização única sem desabilitação definitiva aos 3 s. | Em rede lenta, a tela continua utilizável e os anúncios ficam elegíveis quando o SDK termina; nenhuma duplicação de inicialização/carga. |
| 3 | Gerenciador de intersticial com pré-carga, oportunidade explícita e frequência global. | Carga lenta não causa popup tardio; sair da tela/background não mostra anúncio; sem anúncio pronto, a ação continua. |
| 4 | Telemetria, receita por impressão e diagnóstico nativo. | Distinguir `no-fill`, falha de rede, configuração, falha de show e oportunidade pulada; conciliar tendências com AdMob sem dupla contagem. |
| 5 | Experimentos separados de placement/frequência, depois piso e mediação. | Escolher pela receita por usuário e retenção com amostra suficiente; não por eCPM ou correspondência isolados. |

Testar consentimento necessário/não necessário e recusa, inicialização lenta, offline/reconexão, `no-fill`, erro ao exibir, navegação rápida, background, retorno e expiração do inventário. Usar IDs/dispositivos de teste; validar as plataformas separadamente. Anúncios de teste comprovam integração, não demanda comercial.

Rodar experimentos por usuário com variante estável, uma hipótese por vez e rollback disponível. Definir previamente o ganho mínimo relevante e a queda de retenção tolerada. Observar ciclos completos de uso, ao menos D7 quando pertinente, e dimensionar a amostra com a variabilidade real. Com nove impressões, dividir o tráfego em várias variantes não produz uma decisão confiável. Comparações antes/depois podem ajudar no diagnóstico, mas não isolam sazonalidade e mudança de público. [Experimentos de frequência no Firebase](https://firebase.google.com/docs/tutorials/optimize-ad-frequency/step-2).

Nesta pesquisa, executei `node --test tests/interstitialLifecycle.test.cjs`: **4 testes passaram**. Eles confirmam o comportamento local de cancelamento, timeout, carregamento e erro; não validam anúncios reais, correspondência ou receita. A entrega desta tarefa é este diagnóstico e plano pesquisado; o código do app e as configurações da conta não foram alterados.
