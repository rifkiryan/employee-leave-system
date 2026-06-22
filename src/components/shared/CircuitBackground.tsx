"use client";

import { useEffect, useRef } from "react";

export function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const GRID_SIZE = 40;

    class Line {
      points!: { x: number; y: number }[];
      vx!: number;
      vy!: number;
      speed!: number;
      hue!: number;
      life!: number;
      maxLife!: number;
      width!: number;

      constructor() {
        this.reset();
      }

      reset() {
        const cols = Math.floor(width / GRID_SIZE);
        const rows = Math.floor(height / GRID_SIZE);
        const startCol = Math.floor(Math.random() * cols);
        const startRow = Math.floor(Math.random() * rows);
        
        const sx = startCol * GRID_SIZE;
        const sy = startRow * GRID_SIZE;

        this.points = [{ x: sx, y: sy }];
        this.speed = 1.5 + Math.random() * 2.5;
        this.hue = Math.floor(Math.random() * 360);
        this.life = 0;
        this.maxLife = 120 + Math.random() * 180;
        this.width = 1.2 + Math.random() * 1.8;

        const dir = Math.floor(Math.random() * 4);
        this.vx = 0;
        this.vy = 0;
        if (dir === 0) this.vx = this.speed;
        else if (dir === 1) this.vx = -this.speed;
        else if (dir === 2) this.vy = this.speed;
        else this.vy = -this.speed;
      }

      update() {
        const head = this.points[this.points.length - 1];
        let nextX = head.x + this.vx;
        let nextY = head.y + this.vy;

        const reachedCol = Math.round(nextX / GRID_SIZE) * GRID_SIZE;
        const reachedRow = Math.round(nextY / GRID_SIZE) * GRID_SIZE;

        const isCloseX = Math.abs(nextX - reachedCol) < this.speed;
        const isCloseY = Math.abs(nextY - reachedRow) < this.speed;

        if (isCloseX && isCloseY) {
          nextX = reachedCol;
          nextY = reachedRow;

          if (Math.random() < 0.2) {
            const turnDir = Math.random() < 0.5 ? -1 : 1;
            if (this.vx !== 0) {
              this.vy = turnDir * this.speed;
              this.vx = 0;
            } else {
              this.vx = turnDir * this.speed;
              this.vy = 0;
            }
          }
        }

        this.points.push({ x: nextX, y: nextY });

        if (this.points.length > 30) {
          this.points.shift();
        }

        this.life++;
        if (this.life > this.maxLife || nextX < 0 || nextX > width || nextY < 0 || nextY > height) {
          this.reset();
        }
      }

      draw(context: CanvasRenderingContext2D) {
        if (this.points.length < 2) return;

        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          context.lineTo(this.points[i].x, this.points[i].y);
        }

        context.shadowBlur = 10;
        context.shadowColor = `hsla(${this.hue}, 100%, 50%, 0.8)`;
        context.strokeStyle = `hsla(${this.hue}, 100%, 60%, ${Math.min(1, 1 - this.life / this.maxLife)})`;
        context.lineWidth = this.width;
        context.stroke();
        context.shadowBlur = 0;

        const head = this.points[this.points.length - 1];
        context.beginPath();
        context.arc(head.x, head.y, this.width + 1.5, 0, Math.PI * 2);
        context.fillStyle = `hsla(${this.hue}, 100%, 75%, 0.95)`;
        context.shadowBlur = 15;
        context.shadowColor = `hsla(${this.hue}, 100%, 50%, 1)`;
        context.fill();
        context.shadowBlur = 0;
      }
    }

    const lines: Line[] = Array.from({ length: 20 }, () => new Line());

    const render = () => {
      ctx.fillStyle = "rgba(7, 11, 25, 0.15)";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(6, 182, 212, 0.02)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      lines.forEach((line) => {
        line.update();
        line.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />;
}
