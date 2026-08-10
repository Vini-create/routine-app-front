# Relatório do vídeo da landing

## Narrativa

Os quatro clipes em `src/components/landing/new_landing_video/` formam uma única jornada visual:

| Ordem | Arquivo (início) | Cena | Intervalo final |
| --- | --- | --- | ---: |
| 1 | `hf_20260801_003325` | aproximação da montanha e revelação do escalador | 0–8,04 s |
| 2 | `hf_20260801_011402` | escalada sob neve e dificuldade | 8,04–16,08 s |
| 3 | `hf_20260801_015007` | passagem por noite, amanhecer, dia e pôr do sol | 16,08–24,13 s |
| 4 | `hf_20260801_022537` | aproximação final e chegada ao topo | 24,13–32,17 s |

Os arquivos originais permanecem intactos no ambiente local. Como somam aproximadamente 199 MiB, ficam fora do Git; o deploy usa somente as variantes otimizadas em `public/videos/`. O script `scripts/process-landing-video.py` ordena os clipes pelo nome, concatena a história e gera os assets usados pelo navegador.

## Assets entregues

| Arquivo | Codec | Resolução | FPS | Keyframe | Tamanho aproximado |
| --- | --- | ---: | ---: | ---: | ---: |
| `public/videos/landing-scroll-desktop.mp4` | H.264 High | 1600×900 | 24 | 1 s | 15,6 MiB |
| `public/videos/landing-scroll-desktop.webm` | VP9 | 1600×900 | 24 | 1 s | 12,4 MiB |
| `public/videos/landing-scroll-mobile.mp4` | H.264 High | 540×960 | 24 | 0,5 s | 5,0 MiB |

As variantes usam `yuv420p` e não contêm áudio. Desktop oferece VP9 primeiro e mantém H.264 como fallback; mobile portrait usa um crop 9:16 dedicado e H.264 com decodificação por hardware. Em landscape, o desktop é selecionado. Posters WebP cobrem carregamento, falhas e movimento reduzido.

## Mapeamento do scroll

Os pontos editáveis ficam em `src/components/landing/storyConfig.ts`:

| Progresso | Tempo | Beat |
| ---: | ---: | --- |
| 0% | 0 s | sonho / montanha |
| 9% | 4,5 s | meta / aproximação do escalador |
| 16,5% | 8,04 s | caminho / início da dificuldade |
| 31,5% | 12 s | hábitos / escalada sob neve |
| 46,5% | 16,08 s | início do timelapse e fade de transição |
| 82% | 24,13 s | organização / subida final |
| 100% | 32,17 s | topo livre de texto |

O scrub usa `requestAnimationFrame`, interpolação e seeks limitados. No mobile, o GOP menor reduz o trabalho de decodificação ao buscar frames. A distância útil é de `1300svh` no desktop e `1120svh` no mobile; o timelapse ocupa 35,5% dela. Um fade calculado em tempo real oculta o corte entre a escalada e a passagem dos dias. O último frame permanece fixo por mais um viewport enquanto a introdução do produto sobe como card.

## Reprocessamento

O FFmpeg precisa incluir os decodificadores HEVC e o encoder `libx264`. Exemplo:

```bash
python scripts/process-landing-video.py --ffmpeg /caminho/para/ffmpeg --ffprobe /caminho/para/ffprobe
```

Após qualquer alteração de duração, os limites em `storyConfig.ts` também devem ser revisados.

Os quatro MP4 de origem precisam ser fornecidos localmente no diretório padrão acima ou por `--source-dir`. Eles não são necessários para executar, testar ou publicar a aplicação.
