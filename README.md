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

| Folder        | Purpose                                             |
| ------------- | --------------------------------------------------- |
| `assets/`     | versioned images and icons                          |
| `components/` | reusable interface pieces                           |
| `config/`     | the only place that reads environment variables     |
| `contexts/`   | global state providers, such as authentication      |
| `hooks/`      | custom hooks, reused across screens                 |
| `pages/`      | one folder per screen                               |
| `services/`   | all communication with the API and with Firebase    |
| `types/`      | domain interfaces, organized by subject             |
| `styles/`     | design tokens and global styles                     |
| `utils/`      | helper functions, such as validation                |

The rule behind the layout: a component handles appearance, a service handles
talking to the API, a type describes the shape of the data. No component calls
the API directly, and no service decides how anything is displayed.

Every component and every page lives in `Name/index.tsx` inside its own folder.

Inside `services/`, `api/` describes the backend's own format and translates it
into the domain types, and `mocks/` holds fake data already in the domain
format.

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

Address of the API. Only read when `VITE_USAR_MOCK=false`, and required in that
case: the application fails on startup naming the missing variable, instead of
sending requests to a relative path.

Write it without a trailing slash — the services build paths as
`${VITE_API_URL}/api/...`.

### Firebase

Six variables configure authentication:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Only the first three are required to authenticate; the console hands all six
when you register a web app. Without them, sign-in falls back to fake data and
the Google button is rendered disabled, with an explanation.

The `apiKey` is not a secret: it identifies the project and ships in the public
bundle. What protects the project is token validation on the server.

In the Firebase console, three settings matter:

- enable **Email/password** and **Google** under Sign-in method;
- add the deployed domain under Authorized domains;
- set a **custom action URL** on the password reset template, pointing to
  `/esqueci-senha/nova`. Without it the reset link opens Firebase's own hosted
  page and never reaches the screen in this project.
