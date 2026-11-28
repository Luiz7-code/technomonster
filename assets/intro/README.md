# Arte exclusiva da introdução

A abertura atual percorre uma pintura panorâmica do mar poluído diante das casas, no estilo da capa. Primeiro mostra o lixo boiando, depois desliza lateralmente até revelar o personagem distante e só então aproxima a câmera. Água, margem e arquitetura compartilham a perspectiva da pintura.

- `panorama-mar-de-lixo.png`: cenário panorâmico atual.
- `lixo-flutuante-camadas.png`: quatro recortes pintados com transparência, usados em 76 objetos que boiam independentemente.
- `terraco-aproximacao.png`: arte de detalhe para o plano próximo.
- `broto-camada.png`: broto pintado com transparência real.
- `cais-abertura.png` e `cais-abertura-vertical.png`: propostas anteriores preservadas como registro, sem uso na abertura atual.

Gerados com a ferramenta integrada ImageGen. Referência estilística: `../title/cidade-sem-personagens.png`; as versões vertical e do broto usam o novo cais como referência. O personagem reutiliza `../title/monstrinho-camada.png`, sem alterações corporais ou de paleta.

`js/intro-art.js` desenha a cena e guarda uma versão fria da pintura em Canvas auxiliar. A câmera fica no mar até 2,4 s, percorre a paisagem até 7,2 s e aproxima o personagem até 9,9 s. O personagem já existe no cenário desde o primeiro quadro; a câmera o revela. A luz e as cores retornam gradualmente após a aproximação, junto ao broto. A introdução mantém 15,5 segundos, trilha, legendas e controles de pular. O desfecho passa por uma luz quente antes de revelar o menu. Movimento reduzido mantém a câmera fixa. Imagens ausentes usam a sequência vetorial existente. Nenhum recurso externo é carregado em tempo de execução.

## Prompts finais — ImageGen integrado

### Animação do broto

O broto começa após a aproximação da câmera (9,95 s). A semente aparece no chão; suas duas metades se abrem, o caule cresce e as folhas se desdobram com um pequeno atraso entre elas. Depois de 12,37 s, a ponta acompanha uma brisa discreta, mantendo a raiz fixa. O brilho verde de acessibilidade foi preservado.

As folhas e as metades da semente reutilizam recortes da arte original `broto-camada.png`, preparados uma vez em Canvas auxiliares. O caule é desenhado entre a raiz e as folhas; não há mais redimensionamento da planta inteira. Nenhuma região do cenário é deformada. Com movimento reduzido, a planta completa surge suavemente, sem crescimento ou balanço. Se a imagem faltar, o desenho em Canvas mantém a sequência funcionando.

### Cais horizontal

Create a NEW exclusive cinematic background for TechnoMonster, a hand-painted 2D environmental game. Input painting is STYLE reference only: match its sophisticated gouache brushwork, fine texture, terracotta roofs, plum shadows and amber sunset, but make a completely new composition at GROUND LEVEL BESIDE A CANAL. Landscape 16:9. Clear geographical separation: distant city buildings stand on DRY LAND well above a tall continuous stone embankment on the opposite shore, skyline across middle third. A narrow canal occupies lower LEFT foreground only, with murky water, a few small discarded bottles/cans and faint oily streaks painted naturally, never covering buildings. On RIGHT foreground a broad DRY cobblestone quay with clearly visible vertical masonry wall descending down to canal water. Quay walking surface is clearly visible, broad, flat and empty around normalized x .60 to .78, y .76 to .86 so a small character can later stand on it. Empty little soil crack near x .72 y .82 for a sprout to be animated later. Central composition must still read when sides are cropped on mobile. Sky upper 45 percent: dusky violet smoky cloud banks breaking around a warm amber sun high right, subtle distant factory smoke. Warm late-evening light on stone and windows; restrained moss vegetation, no lush flowers yet. Waterline stays well BELOW street and building foundations, unmistakable retaining walls. Low camera perspective, layered depth, exquisite cohesive indie game illustration. No characters, no trees in foreground, no people, NO text, logos, signs, UI, borders. No flooded buildings. Do not reuse the rooftop view from reference. Deliver a complete painted scene covering all edges.

### Cais vertical

Use case: precise-object-edit. Recompose this same hand-painted TechnoMonster canal/quay illustration into a PORTRAIT 9:16 cinematic background for phones. Preserve gouache style, city, sunset, environmental pollution and clear geography. Upper half sky and distant city standing on dry land above tall masonry embankment; water strictly below embankment. Lower left third canal with a few small floating bottles/cans and oily streaks; lower right two thirds broad dry cobblestone quay, vertical retaining edge clearly visible separating it from water. Keep empty walking surface around normalized x .60 y .81 for a character, and a small soil crack x .78 y .83. Sun high right. No characters, no people, no giant foreground bollards hiding the walking surface, no text or UI. Warm sunset version with violet shadows and amber light. Complete portrait canvas filled edge to edge, no borders. No flooded buildings.

### Broto

Create a tiny seedling sprite for the hand-painted TechnoMonster game, matching this illustration's gouache texture and warm sunset lighting. ONE delicate green sprout only: short gracefully curved stem, two small oval leaves with fine veins and visible brush pigment, a tiny split tan seed at the base. Olive/moss green shadows, muted yellow-green illuminated edges, organic irregular silhouettes. Front three-quarter view. Entire plant isolated on genuine transparent alpha, tightly cropped portrait framing with small transparent padding. NO soil patch, ground, stones, surrounding scenery, shadow, sky, border, text, glow, pot or extra plants. This will grow out of a crack in the depicted quay. Beautiful miniature painterly game asset, not flat vector clipart.
