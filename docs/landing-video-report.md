# Relatório do vídeo da landing

## Original

- Arquivo: `background_interacting_landing_page/lv_0_20260630215405.mp4`
- Tamanho: 12.320.287 bytes (11,75 MiB)
- Resolução: 1918×1080 (aproximadamente 16:9)
- Duração: 12,933 s
- FPS: 30
- Frames: 388
- Vídeo: H.264 High, yuv420p progressivo, aproximadamente 7,51 Mb/s
- Áudio: AAC-LC estéreo, 44,1 kHz, aproximadamente 100 kb/s
- Perfil de cores: não sinalizado no arquivo
- Transparência: impossível no original; yuv420p não contém alpha

## Cenas observadas

| Cena | Tempo no vídeo | Percentual aproximado |
| --- | ---: | ---: |
| Capacete | 0–0,95 s | 0–7,35% |
| Foguete isolado | 0,95–1,95 s | 7,35–15,08% |
| Blueprint | 1,95–2,95 s | 15,08–22,81% |
| Peças e início da montagem | 2,95–7,70 s | 22,81–59,54% |
| Montagem em progresso | 7,70–10,55 s | 59,54–81,58% |
| Foguete completo | 10,55–12,933 s | 81,58–100% |

O mapeamento de scroll não é linear por cena: cenas curtas recebem mais espaço narrativo. Os intervalos editáveis estão centralizados em `src/components/landing/storyConfig.ts`.

## Correção do fundo

Os cantos do original mudavam de Y≈16 para Y≈21 durante a montagem. O pipeline converte temporariamente para RGBA, cria uma máscara suave com `colorkey` RGB (`similarity=0.06`, `blend=0.035`) e compõe o objeto sobre `#09090B`. RGB foi escolhido porque `chromakey` em YUV removia também os cromados neutros.

Depois da correção, amostras de 160×160 no canto superior esquerdo do master permaneceram em Y=24 em todos os segundos do vídeo. A máscara preservou visor, bandeira Winperium™, linhas do blueprint, motores, peças pequenas e reflexos escuros. Não foi aplicada transparência nem crop.

## Arquivos gerados

| Arquivo | Codec | Resolução | FPS | Configuração | Tamanho | Redução vs. original |
| --- | --- | ---: | ---: | --- | ---: | ---: |
| `public/videos/landing-scroll-master.mp4` | H.264 High | 1918×1080 | 30 | OpenH264 quality, alvo 28 Mb/s | 6.913.267 B | 43,89% |
| `public/videos/landing-scroll-desktop.webm` | VP9 Profile 0 | 1918×1080 | 30 | CRF 30, GOP 15 | 2.849.048 B | 76,88% |
| `public/videos/landing-scroll-desktop.mp4` | H.264 High | 1918×1080 | 30 | OpenH264 quality, alvo 6 Mb/s, GOP 15 | 5.631.025 B | 54,29% |
| `public/videos/landing-scroll-mobile.webm` | VP9 Profile 0 | 1280×720 | 30 | CRF 31, GOP 15 | 1.610.967 B | 86,92% |
| `public/videos/landing-scroll-mobile.mp4` | H.264 High | 1280×720 | 30 | OpenH264 quality, alvo 3,2 Mb/s, GOP 15 | 3.112.599 B | 74,74% |
| `public/videos/landing-scroll-preview.webm` | VP9 Profile 0 | 960×540 | 30 | CRF 34, primeiros 4 s | 290.501 B | 97,64% |

Os arquivos de navegador não contêm áudio. WebM é oferecido primeiro e MP4 funciona como fallback. Desktop e mobile são escolhidos antes da criação do elemento de vídeo, evitando baixar as duas variantes.

O FFmpeg disponível não inclui `libx264`, apenas `libopenh264`. Por isso os MP4 desta execução usam controle de qualidade/bitrate do OpenH264, não CRF. O script detecta `libx264` automaticamente e usa CRF 12 no master, CRF 22 no desktop e CRF 23 no mobile quando esse encoder estiver disponível.

## Keyframes e scrub

- GOP: 15 frames
- Intervalo: 0,5 s em 30 fps
- Verificação: keyframes presentes em 0,0; 0,5; 1,0; 1,5 s e assim por diante
- Sincronização: `requestAnimationFrame`, interpolação de 14% em direção ao tempo-alvo e seek limitado a aproximadamente 30 Hz
- O vídeo não possui `autoplay`, `loop` ou controles e nenhuma chamada a `play()` é feita

## Posters e comparação

- `public/images/landing-scroll-poster.webp`: 1918×1080, 85.420 bytes
- `public/images/landing-scroll-poster-mobile.webp`: 1280×720, 59.258 bytes
- Frames estáticos por cena: `public/images/landing-story-*.webp`
- Comparações: `artifacts/landing-video-comparison/`
- Folha de contato: `artifacts/landing-video-comparison/comparison-sheet.jpg`

Frames equivalentes foram comparados em 0,40; 1,40; 2,40; 4,50; 7,50; 10,80 e 12,20 s para original, master, WebM e MP4.

## Responsividade e fallback

- Desktop mantém o quadro 1918×1080 inteiro com `object-fit: contain`.
- Mobile usa 1280×720 sem crop e mantém os objetos centrais visíveis.
- Apenas a variante correspondente ao `matchMedia` é montada.
- Poster fica visível até `loadeddata` e permanece em falha de mídia.
- Em `prefers-reduced-motion`, o scrub não é montado; cada cena aparece como quadro estático com texto HTML.
- O master nunca é referenciado pela landing.
