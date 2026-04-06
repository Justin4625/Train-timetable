# Train Timetable

Next.js app met aankomsttijden voor Rotterdam Centraal, geoptimaliseerd voor static export naar GitHub Pages.

## Lokaal draaien

Maak een `.env.local` met:

```bash
NS_API_KEY=your_ns_api_key
```

Start development:

```bash
npm ci
npm run dev
```

Build lokaal:

```bash
npm run build
```

## Deploy naar GitHub Pages

Deze repo gebruikt de workflow `/.github/workflows/deploy.yml`.

### 1) GitHub Pages instellen

- Ga naar `Settings` -> `Pages`
- Kies `Source: GitHub Actions`

### 2) Secret toevoegen

- Ga naar `Settings` -> `Secrets and variables` -> `Actions`
- Voeg repository secret toe: `NS_API_KEY`

### 3) Deploy starten

- Push naar branch `main`
- Of start handmatig via `Actions` -> `Deploy Next.js to GitHub Pages` -> `Run workflow`

## Belangrijk voor data

- GitHub Pages is statisch: er draait geen server-side API op runtime.
- Data wordt tijdens build opgehaald en als snapshot gepubliceerd.
- Wil je echte live updates per bezoeker, dan heb je een externe API/backend nodig (bijv. Vercel/Render/Cloudflare Worker).
