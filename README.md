# StyleMirror AR

AI-powered personalized fashion app with augmented reality try-on.

## Features

- 👗 AI Virtual Try-On – see clothes on a photorealistic body model
- 🪞 AR Try-On – live camera overlay via WebXR
- 👨‍👩‍👧‍👦 Family Profiles – manage style for your whole family
- 🎨 Color Analysis – AI skin-tone matching
- 🤖 AI Stylist – GPT-powered chat recommendations
- 💰 Price Comparison – find the best deal across stores
- 📊 Body Modeling – AI measurements from photos

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **3D/AR**: Three.js, @react-three/fiber, WebXR
- **AI**: OpenAI GPT-4o, custom body modeling
- **Auth**: NextAuth.js with Prisma adapter
- **DB**: PostgreSQL + Prisma ORM
- **State**: Zustand + React Query

## Getting Started

```bash
cp .env.example .env.local
# Fill in your environment variables

npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for all required variables.
