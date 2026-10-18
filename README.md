# Arkanoid · C64 Arcade

[![Build and deploy game](https://github.com/mauricekastelijn/arkanoid-game/actions/workflows/deploy.yml/badge.svg)](https://github.com/mauricekastelijn/arkanoid-game/actions/workflows/deploy.yml)

**[PLAY ARKANOID](https://mauricekastelijn.github.io/arkanoid-game/)**

A C64-inspired Arkanoid recreation for your phone or desktop. Crisp pixel graphics, a Vaus-style paddle, synthesized arcade sound, eight handcrafted brick layouts and a ninth-round guardian battle. This browser recreation uses original graphics and audio and is not an exact port of the original game's levels.

## How to play

1. Tap **START GAME**.
2. **Move:** drag across the board on your phone, move the mouse over the board, or hold the **◀ / ▶** buttons.
3. **Launch:** tap the board or **LAUNCH**, or press **Space**.
4. Bounce the ball off your paddle and destroy all breakable bricks. Hitting nearer a paddle edge sends the ball at a wider angle.
5. Collect falling capsules with the paddle. In laser mode, hold **FIRE** or **Space**.
6. Tap **Ⅱ** to pause. Switching tabs or apps pauses automatically.

| Desktop controls | Action |
| --- | --- |
| Mouse, Left / Right arrows, A / D | Move paddle |
| Space | Launch a ball or fire lasers |
| P / Escape | Pause / resume |

You start with **three ships**. Losing the last ball costs one ship; losing just one of several balls does not. Silver bricks take **two hits**; gold bricks are **unbreakable** and do not have to be destroyed. Clear eight brick rounds, then defeat the guardian. Every 20,000 points awards another ship. Your best score is saved on your device.

### Power-ups

| Capsule | Effect |
| --- | --- |
| **E — Expand** | Wider paddle for 22 seconds |
| **C — Catch** | Paddle catches returning balls; tap or press Space to release |
| **S — Slow** | Slows the balls currently in play |
| **L — Laser** | Paddle fires twin lasers for 22 seconds |
| **D — Disrupt** | Splits a ball into three; up to seven balls |
| **P — Player** | Extra ship |
| **B — Break** | Opens an exit at the right wall; move the paddle all the way right to advance |

Expand, Catch and Laser replace one another. Falling drones can deflect the ball; hitting one awards 100 points. Sound starts muted—tap **SOUND OFF** to enable it.

## Automated build and deployment

Every push to `main` runs [GitHub Actions](https://github.com/mauricekastelijn/arkanoid-game/actions/workflows/deploy.yml):

1. Check JavaScript syntax.
2. Run all gameplay tests.
3. Build a standalone release into `_site/`.
4. Deploy the release to GitHub Pages after all checks pass.

Pull requests run checks and a build without publishing. You can also deploy using **Actions → Build and deploy game → Run workflow**. No npm dependencies, API keys or personal access token are needed.

### One-time GitHub Pages setup

Open [Settings → Pages](https://github.com/mauricekastelijn/arkanoid-game/settings/pages). Under **Build and deployment → Source**, select **GitHub Actions**. Then run the workflow or push a commit. The public play link becomes available once deployment succeeds.

The repository also includes a root `index.html` launcher and `.nojekyll`, so branch-based Pages publishing from `main` at `/ (root)` opens the game too. Both paths use the same `dist/` assets and avoid showing the README as the website.

## Run, test and build locally

Use Node.js 22 for checks and Python 3 for a local server:

```sh
npm run check
npm test
npm run build
python3 -m http.server 8080 --directory _site
```

Open http://localhost:8080. For a quick development server, use `python3 -m http.server 8080` and open the same URL. Use HTTP rather than opening files directly because the game uses JavaScript modules.

## Project layout

- `index.html` — root launcher that opens `dist/`.
- `dist/index.html` and `dist/style.css` — responsive arcade cabinet and controls.
- `dist/game.js` — Canvas 2D rendering, input and synthesized sound.
- `dist/engine.js` — deterministic gameplay and collision simulation.
- `tests/engine.test.js` — gameplay regression tests.
- `scripts/build.mjs` — dependency-free static release build.
- `.github/workflows/deploy.yml` — checks, build and Pages deployment.

The simulation runs at a fixed 120 steps per second with additional collision substeps. Canvas 2D avoids requiring WebGL. Touch controls use Pointer Events and support portrait and landscape. Scores stay in browser local storage.
