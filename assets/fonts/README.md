# Tipografia do TechnoMonster

As fontes são arquivos locais, sem CDN ou requisições externas durante o jogo. Os arquivos originais não foram modificados. A inspeção desta cópia do projeto não encontrou arquivo ou referência ativa a BostonAngel; por isso ela não é uma dependência.

## Famílias e procedência

| Arquivo | Uso | Fonte oficial | Licença local |
| --- | --- | --- | --- |
| Fraunces.ttf | Títulos e subtítulos | https://github.com/google/fonts/tree/main/ofl/fraunces | fraunces-OFL.txt |
| Fraunces-Italic.ttf | Logotipo | https://github.com/google/fonts/tree/main/ofl/fraunces | fraunces-OFL.txt |
| NunitoSans.ttf | Instruções, botões, HUD e números | https://github.com/google/fonts/tree/main/ofl/nunitosans | nunitosans-OFL.txt |

Baixadas do repositório oficial Google Fonts em 27/11/2026. Ambas usam SIL Open Font License 1.1; os avisos de autoria e o texto integral da licença acompanham os arquivos. Créditos também disponíveis no menu do jogo.

## Padrão de uso

`js/typography.js` centraliza famílias, pesos, tamanhos, espaçamento entre letras, quebra de linhas e ajuste de largura. Todos os desenhos de texto do Canvas passam por esse módulo, inclusive nos estilos alternativos preservados.

| Papel | Família | Tamanho de referência | Peso |
| --- | --- | --- | --- |
| Logotipo | Fraunces itálica | 64–70 px | 800 |
| Título de tela | Fraunces | 30–40 px | 750 |
| Subtítulo | Fraunces | 24–30 px | 700 |
| Texto/instrução | Nunito Sans | 18–20 px | 600 |
| Botão | Nunito Sans | 18–22 px | 800 |
| Rótulo/informação secundária | Nunito Sans | 12–16 px | 600–800 |
| Pontuação | Nunito Sans | 21–28 px | 850 |

Telas com composição virtual aplicam escala proporcional. Parágrafos usam entrelinha de aproximadamente 1,35–1,4; rótulos em caixa alta recebem espaçamento leve. Textos curtos ajustam o tamanho dentro do espaço disponível; nomes excepcionalmente largos podem terminar em reticências. Não há compressão horizontal dos glifos.

O HUD mantém rótulos e valores em linhas separadas, e reorganiza as colunas em telas estreitas. Botões de pausa, ecoponto, fim de jogo e teclado virtual compartilham as mesmas medidas entre desenho e detecção de cliques. `js/ui-screens.js` contém a apresentação dessas telas; física, colisões, geração, pontuação e persistência continuam nos módulos existentes.

O primeiro quadro aguarda as fontes locais, com limite de três segundos. Se um arquivo falhar, Georgia/Segoe UI/sans-serif são alternativas de segurança, sem bloquear o jogo.

## Validação

- Telas de título, tutorial, controles, recordes, créditos, nome, início, pausa, ecoponto, fim de jogo, introdução e HUD em 1440×900, 390×844, 800×600 e 844×390.
- Limites de texto, nomes de dez caracteres largos e pontuações de oito dígitos.
- Carregamento local das três fontes; alternativa com arquivos bloqueados.
- Navegação por teclado, botão de pausa e teclado virtual por mouse.
