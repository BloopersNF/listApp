**Configuração dos anúncios do MarketList**

O Android usa as unidades existentes. Builds de desenvolvimento usam `TestIds` do SDK. A inicialização aguarda a elegibilidade informada pelo UMP e não bloqueia a primeira tela.

O banner é adaptativo e deixa o refresh sob controle do SDK/AdMob. O intersticial mantém uma única carga em andamento, não aparece ao abrir uma lista e só pode ser exibido ao sair de uma lista concluída durante aquela visita. Não aparece com teclado, campos pendentes, edição ou modais abertos, nem na mesma visita em que foi solicitado review. Se não estiver pronto, a navegação continua imediatamente.

A política inicial é de uma exibição por execução do app, com intervalo mínimo de cinco minutos persistido entre execuções. O cache expira após 55 minutos. Erros transitórios têm até três novas tentativas com espera crescente de 30/60/120 segundos mais jitter; sair da tarefa ou colocar o app em background suspende as tentativas. Erros de configuração não entram nesse retry.

**Antes de distribuir o novo APK**, conclua no AdMob:

1. Publique as mensagens aplicáveis em **Privacidade e mensagens** para o App ID Android existente. Teste o fluxo UMP em dispositivo de teste, incluindo escolhas restritivas. Se o SDK não confirmar `canRequestAds`, o app não solicita anúncios; uma falha sem consentimento anterior pode impedir anúncios até a próxima tentativa após retornar ao app.
2. Confira aprovação, prontidão, Central de políticas e eventuais limites de veiculação.
3. Confira o status de verificação do app e de `app-ads.txt`, o publisher ID e a URL rastreada. O site publicado na loja deve apontar para o domínio que hospeda o arquivo.
4. Na unidade de banner, confira refresh **Otimizado pelo Google**. Não adicionar um segundo timer de atualização no JavaScript.
5. Revise pisos globais/por país e bloqueios. Compare com “Todos os preços” quando adequado e avalie receita total, correspondência e exibição por unidade/país, sem confundir as métricas.
6. Ative a receita no nível da impressão para receber os eventos `paid`. O valor da bridge v16 já está em unidade monetária, não em micros.

Essas configurações dependem da conta e não são alteradas pelo código. A integração não garante preenchimento ou aumento de receita. Mediação exige ainda contas/fontes elegíveis, adaptadores nativos compatíveis e revisão dos parceiros de consentimento; nenhum adaptador de rede externa foi incluído sem essa configuração.

O botão **Ajustes → Privacidade dos anúncios** aparece quando o UMP exige esse ponto de acesso. Abrir o formulário invalida o inventário anterior e reavalia a elegibilidade. As opções não são convertidas manualmente em autorização de personalização; os sinais são tratados pelo SDK.

Em **Ajustes → Sobre → Compartilhar diagnóstico**, o usuário pode exportar contadores, eventos recentes, erros por código e receita por moeda. Os dados ficam no AsyncStorage do aparelho, com limite de 80 eventos; não há envio automático nem conteúdo/IDs das listas. Não se trata de Analytics remoto nem de um relatório oficial de correspondência: use AdMob para conciliar solicitações e impressões. A bridge Android v16 não expõe evento de impressão de intersticial; `opened` não é tratado como impressão.

Para validação, usar `npm test`, exportação Expo para as plataformas e build nativo Android. Testar com os IDs de teste: carga lenta, ausência de anúncio, erro de show, retorno do background, consentimento, conclusão/saída da lista, navegação rápida e persistência do intervalo. Anúncios de teste comprovam integração, não demanda comercial.

O iOS permanece com monetização desativada, conforme solicitado. O plist contém o App ID de exemplo oficial do Google para evitar uma configuração nativa ausente; esse ID não habilita solicitações no app. Para ativar futuramente, configurar juntos no ambiente de build:

```dotenv
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-<publisher>~<app-ios>
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-<publisher>/<banner-ios>
EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID=ca-app-pub-<publisher>/<interstitial-ios>
```

Usar IDs iOS reais e próprios; a configuração rejeita grupos incompletos e os IDs Android conhecidos. Executar o prebuild controlado/reconciliar o projeto iOS para atualizar `GADApplicationIdentifier`, revisar ATT quando aplicável e gerar um novo binário. Alterações de manifesto, plist, mensagens e adaptadores não são entregues só com atualização JavaScript.

Fontes: [UMP](https://developers.google.com/admob/android/privacy), [intersticiais](https://developers.google.com/admob/android/interstitial), [refresh](https://support.google.com/admob/answer/3245199?hl=en), [receita por impressão](https://developers.google.com/admob/android/impression-level-ad-revenue), [App ID de exemplo iOS](https://developers.google.com/admob/ios/quick-start).
