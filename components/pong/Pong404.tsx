"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GLYPH_4 = ["#...#", "#...#", "#...#", "#####", "....#", "....#", "....#"];
const GLYPH_0 = [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."];

const WIDTH = 480;
const HEIGHT = 260;
const PADDLE_H = 46;
const PADDLE_W = 6;
const BALL_R = 4;
const PIXEL = 5;
const GLYPH_W = 5 * PIXEL;
const GLYPH_H = 7 * PIXEL;
const GLYPH_GAP = PIXEL * 2;
const PADDLE_INSET = 8;
const START_LIVES = 3;

type Phase = "idle" | "playing" | "won" | "lost";
type Block = { x: number; y: number; w: number; h: number; alive: boolean };
type Score = { destroyed: number; lives: number };

function buildBlocks(): Block[] {
  const blocks: Block[] = [];
  const totalW = GLYPH_W * 3 + GLYPH_GAP * 2;
  const startX = (WIDTH - totalW) / 2;
  const startY = (HEIGHT - GLYPH_H) / 2;
  const glyphs = [GLYPH_4, GLYPH_0, GLYPH_4];
  for (const [gi, g] of glyphs.entries()) {
    const gx = startX + gi * (GLYPH_W + GLYPH_GAP);
    for (const [ry, row] of g.entries()) {
      for (let rx = 0; rx < row.length; rx++) {
        if (row[rx] === "#") {
          blocks.push({
            x: gx + rx * PIXEL,
            y: startY + ry * PIXEL,
            w: PIXEL,
            h: PIXEL,
            alive: true,
          });
        }
      }
    }
  }
  return blocks;
}

export function Pong404() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState<Score>({ destroyed: 0, lives: START_LIVES });

  const phaseRef = useRef<Phase>("idle");
  const scoreRef = useRef<Score>({ destroyed: 0, lives: START_LIVES });
  const stateRef = useRef({
    ball: { x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0 },
    playerY: HEIGHT / 2,
    cpuY: HEIGHT / 2,
    playerIntent: 0,
    mouseControl: false,
    blocks: buildBlocks(),
  });

  const totalBlocks = stateRef.current.blocks.length;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const resetBall = useCallback((direction: 1 | -1) => {
    const s = stateRef.current;
    s.ball.x = WIDTH / 2;
    s.ball.y = HEIGHT * (Math.random() < 0.5 ? 0.25 : 0.75);
    const angle = Math.random() * 0.6 - 0.3;
    const speed = 3.4;
    s.ball.vx = Math.cos(angle) * speed * direction;
    s.ball.vy = Math.sin(angle) * speed;
  }, []);

  const startGame = useCallback(() => {
    const initial: Score = { destroyed: 0, lives: START_LIVES };
    setScore(initial);
    scoreRef.current = initial;
    stateRef.current.playerY = HEIGHT / 2;
    stateRef.current.cpuY = HEIGHT / 2;
    for (const b of stateRef.current.blocks) b.alive = true;
    phaseRef.current = "playing";
    setPhase("playing");
    resetBall(Math.random() < 0.5 ? 1 : -1);
  }, [resetBall]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const readVar = (name: string, fallback: string) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    };

    let raf = 0;
    const step = () => {
      const state = stateRef.current;
      const currentPhase = phaseRef.current;

      const fg = readVar("--color-fg", "#111");
      const accent = readVar("--color-accent", "#0a0");
      const muted = readVar("--color-muted", "#888");
      const border = readVar("--color-border", "#ccc");

      if (currentPhase === "playing") {
        if (!state.mouseControl && state.playerIntent !== 0) {
          state.playerY += state.playerIntent * 5;
        }
        state.playerY = Math.max(PADDLE_H / 2, Math.min(HEIGHT - PADDLE_H / 2, state.playerY));

        const dy = state.ball.y - state.cpuY;
        state.cpuY += Math.sign(dy) * Math.min(Math.abs(dy), 3.0);
        state.cpuY = Math.max(PADDLE_H / 2, Math.min(HEIGHT - PADDLE_H / 2, state.cpuY));

        state.ball.x += state.ball.vx;
        state.ball.y += state.ball.vy;

        if (state.ball.y - BALL_R < 0) {
          state.ball.y = BALL_R;
          state.ball.vy *= -1;
        }
        if (state.ball.y + BALL_R > HEIGHT) {
          state.ball.y = HEIGHT - BALL_R;
          state.ball.vy *= -1;
        }

        const playerRect = {
          x: PADDLE_INSET,
          y: state.playerY - PADDLE_H / 2,
          w: PADDLE_W,
          h: PADDLE_H,
        };
        const cpuRect = {
          x: WIDTH - PADDLE_INSET - PADDLE_W,
          y: state.cpuY - PADDLE_H / 2,
          w: PADDLE_W,
          h: PADDLE_H,
        };
        const hitPaddle = (rect: typeof playerRect, isLeft: boolean) => {
          if (
            state.ball.x - BALL_R < rect.x + rect.w &&
            state.ball.x + BALL_R > rect.x &&
            state.ball.y + BALL_R > rect.y &&
            state.ball.y - BALL_R < rect.y + rect.h
          ) {
            const rel = (state.ball.y - (rect.y + rect.h / 2)) / (rect.h / 2);
            const angle = rel * (Math.PI / 3.4);
            const speed = Math.min(Math.hypot(state.ball.vx, state.ball.vy) * 1.04, 6.8);
            state.ball.vx = Math.cos(angle) * speed * (isLeft ? 1 : -1);
            state.ball.vy = Math.sin(angle) * speed;
            state.ball.x = isLeft ? rect.x + rect.w + BALL_R : rect.x - BALL_R;
          }
        };
        hitPaddle(playerRect, true);
        hitPaddle(cpuRect, false);

        let destroyedThisFrame = 0;
        for (const b of state.blocks) {
          if (!b.alive) continue;
          if (
            state.ball.x + BALL_R > b.x &&
            state.ball.x - BALL_R < b.x + b.w &&
            state.ball.y + BALL_R > b.y &&
            state.ball.y - BALL_R < b.y + b.h
          ) {
            const prevX = state.ball.x - state.ball.vx;
            const prevY = state.ball.y - state.ball.vy;
            const fromSide = prevX + BALL_R <= b.x || prevX - BALL_R >= b.x + b.w;
            const fromVert = prevY + BALL_R <= b.y || prevY - BALL_R >= b.y + b.h;
            if (fromSide) state.ball.vx *= -1;
            else if (fromVert) state.ball.vy *= -1;
            else state.ball.vx *= -1;
            b.alive = false;
            destroyedThisFrame++;
          }
        }

        if (destroyedThisFrame > 0) {
          const next: Score = {
            destroyed: scoreRef.current.destroyed + destroyedThisFrame,
            lives: scoreRef.current.lives,
          };
          scoreRef.current = next;
          setScore(next);
          if (next.destroyed >= state.blocks.length) {
            phaseRef.current = "won";
            setPhase("won");
          }
        }

        if (state.ball.x < -BALL_R * 2) {
          const next: Score = {
            destroyed: scoreRef.current.destroyed,
            lives: scoreRef.current.lives - 1,
          };
          scoreRef.current = next;
          setScore(next);
          if (next.lives <= 0) {
            phaseRef.current = "lost";
            setPhase("lost");
          } else {
            resetBall(-1);
          }
        } else if (state.ball.x > WIDTH + BALL_R * 2) {
          resetBall(1);
        }
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, WIDTH - 1, HEIGHT - 1);

      ctx.strokeStyle = muted;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 8);
      ctx.lineTo(WIDTH / 2, HEIGHT - 8);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = accent;
      for (const b of stateRef.current.blocks) {
        if (b.alive) ctx.fillRect(b.x, b.y, b.w, b.h);
      }

      ctx.font = "500 11px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace";
      ctx.textBaseline = "top";

      ctx.fillStyle = muted;
      ctx.textAlign = "left";
      ctx.fillText(
        `chipped ${scoreRef.current.destroyed}/${state.blocks.length}`,
        PADDLE_INSET + 4,
        8,
      );

      ctx.textAlign = "right";
      const livesStr = "♥".repeat(Math.max(0, scoreRef.current.lives));
      const emptyLivesStr = "·".repeat(Math.max(0, START_LIVES - scoreRef.current.lives));
      ctx.fillStyle = accent;
      const livesX = WIDTH - PADDLE_INSET - 4;
      ctx.fillText(livesStr, livesX, 8);
      if (emptyLivesStr.length > 0) {
        const filledW = ctx.measureText(livesStr).width;
        ctx.fillStyle = muted;
        ctx.textAlign = "right";
        ctx.fillText(emptyLivesStr, livesX - filledW, 8);
      }

      ctx.fillStyle = fg;
      ctx.fillRect(PADDLE_INSET, stateRef.current.playerY - PADDLE_H / 2, PADDLE_W, PADDLE_H);
      ctx.fillRect(
        WIDTH - PADDLE_INSET - PADDLE_W,
        stateRef.current.cpuY - PADDLE_H / 2,
        PADDLE_W,
        PADDLE_H,
      );

      if (currentPhase === "playing") {
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(stateRef.current.ball.x, stateRef.current.ball.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [resetBall]);

  useEffect(() => {
    const isTypingInto = (t: EventTarget | null) => {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "a" ||
        tag === "button" ||
        t.isContentEditable
      );
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingInto(e.target)) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        stateRef.current.mouseControl = false;
        stateRef.current.playerIntent = -1;
        e.preventDefault();
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        stateRef.current.mouseControl = false;
        stateRef.current.playerIntent = 1;
        e.preventDefault();
      } else if (e.key === " " || e.key === "Enter") {
        if (phaseRef.current !== "playing") startGame();
        e.preventDefault();
      } else if (e.key === "Escape") {
        setPhase("idle");
        phaseRef.current = "idle";
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "w" ||
        e.key === "W" ||
        e.key === "s" ||
        e.key === "S"
      ) {
        stateRef.current.playerIntent = 0;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.height === 0) return;
      stateRef.current.mouseControl = true;
      stateRef.current.playerY = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    };
    canvas.addEventListener("pointermove", onMove);
    return () => canvas.removeEventListener("pointermove", onMove);
  }, []);

  const status = (() => {
    switch (phase) {
      case "idle":
        return `chip every pixel off the 404 · ${START_LIVES} lives · press space or tap to play`;
      case "playing":
        return `${score.destroyed}/${totalBlocks} chipped · ${score.lives} ${
          score.lives === 1 ? "life" : "lives"
        } left · esc to reset`;
      case "won":
        return "// path found. space to play again";
      case "lost":
        return `// out of lives at ${score.destroyed}/${totalBlocks}. space to retry`;
    }
  })();

  return (
    <div className="mt-10">
      <p className="text-xs text-[color:var(--color-muted)]"># ./pong --404</p>
      <div className="mt-3">
        <canvas
          ref={canvasRef}
          onClick={() => {
            if (phase !== "playing") startGame();
          }}
          onKeyDown={() => {}}
          aria-label="404 pong game"
          style={{
            width: "100%",
            maxWidth: `${WIDTH}px`,
            aspectRatio: `${WIDTH} / ${HEIGHT}`,
            display: "block",
            touchAction: "none",
            cursor: phase === "playing" ? "none" : "crosshair",
          }}
          className="rounded-sm border border-[color:var(--color-border)]"
        />
      </div>
      <p className="mt-2 text-xs text-[color:var(--color-muted)]">{status}</p>
    </div>
  );
}
