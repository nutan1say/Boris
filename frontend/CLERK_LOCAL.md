# Clerk local setup (Boris)

This app uses **@clerk/react** with Create React App. Accountless CLI keys are not available for CRA/React — add a Dashboard publishable key.

## 1. Create a Clerk application

1. Sign up / sign in at [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Create an application (email + social providers as you like)
3. Open **Configure → API keys**
4. Copy the **Publishable key** (`pk_test_...`)

## 2. Env file

In `frontend/.env`:

```env
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

Restart the dev server after changing `.env` (`yarn start`).

Never put `CLERK_SECRET_KEY` in the frontend.

## 3. Allow localhost

In the Clerk Dashboard:

| Setting | Value |
|---------|--------|
| App / home URL | `http://localhost:3000` |
| Allowed origins / domains | `http://localhost:3000` |
| Sign-in / sign-up redirects | Back to `http://localhost:3000` |

Paths may appear under **Configure → Domains** or **Paths** depending on Dashboard version.

## 4. Run and verify

```bash
cd frontend
yarn start
# optional:
npx -y clerk@latest doctor
```

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **Sign up**, create a user
3. Confirm the **UserButton** avatar appears in the landing header
4. **Play** should open `/play` only when signed in

## 5. Later (production)

When you want a permanent app link:

```bash
npx -y clerk@latest auth login
npx -y clerk@latest deploy
```

Unclaimed / test keys are for local development only.
