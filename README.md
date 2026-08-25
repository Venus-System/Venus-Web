# Venus

An application that reads a cosmetic's ingredient list and explains what each
ingredient does for the person's skin, for the planet, and for the people who
produce it.

**Live application:** https://venus-web-application.vercel.app/

Interdisciplinary project for Germinare. React interface written in TypeScript,
built with Vite and routed by React Router.

## Running the project

Requires Node 18 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Vite serves the app at `http://localhost:5173`.

Other commands:

```bash
npm run build     # type check with tsc, then a production build into dist/
npm run preview   # serves dist/ locally, to inspect the build
```

## Structure of `src/`

| Folder        | Purpose                                            |
| ------------- | -------------------------------------------------- |
| `components/` | reusable interface pieces                          |
| `pages/`      | one folder per screen                              |
| `services/`   | all communication with the API                     |
| `types/`      | domain interfaces, organized by subject            |
| `styles/`     | design tokens and global styles                    |
| `utils/`      | helper functions, such as validation               |

The rule behind the layout: a component handles appearance, a service handles
talking to the API, a type describes the shape of the data. No component calls
the API directly, and no service decides how anything is displayed.

Every component and every page lives in `Name/index.tsx` inside its own folder.

The project is under construction: only `components/`, `pages/` and `styles/`
exist today. The remaining folders arrive as the screens are built.

## Environment variables

Example values live in `.env.example`. Copy that file to `.env` before running.

### `VITE_USAR_MOCK`

Decides where the data comes from.

- `true` — services return fake data, kept in `src/services/mocks/`
- `false` — services call the real API, at the address in `VITE_API_URL`

The whole application is built with `VITE_USAR_MOCK=true`, because the API is not
ready yet. The service function signatures are already the final ones, so
flipping the switch to `false` should not change any screen.

### `VITE_API_URL`

Address of the API. Only read when `VITE_USAR_MOCK=false`.
