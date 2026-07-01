# Rotina AI

Frontend web mobile-first para o SaaS Rotina AI, construído com Next.js App Router, React, TypeScript e Tailwind CSS.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## API

O projeto já lê a URL base da API a partir do `.env` existente:

```bash
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_USE_MOCK_API=true
```

Enquanto `NEXT_PUBLIC_API_URL` estiver vazio, o app usa fallbacks locais seguros para manter a interface navegável. Quando o backend estiver pronto, preencha `NEXT_PUBLIC_API_URL` e ajuste `NEXT_PUBLIC_USE_MOCK_API=false`.

Procure por `API_CONNECTION_POINT` para localizar os pontos preparados para integração com FastAPI, autenticação, IA, rotina, hábitos, perfil e check-ins.

## Vídeos da landing page

O vídeo original é preservado em `background_interacting_landing_page/`. A landing usa apenas as variantes otimizadas em `public/videos`.

```bash
python3 scripts/process-landing-video.py
```

O script requer `ffmpeg` e `ffprobe`, não altera o original e recria master, WebM/MP4 desktop e mobile, posters e frames de comparação. Detalhes técnicos e tempos das cenas estão em `docs/landing-video-report.md`.

## Privacidade

O frontend evita coletar dados sensíveis desnecessários. Dados de perfil e preferências persistentes devem ir para o backend em produção, com consentimento e controles adequados.
