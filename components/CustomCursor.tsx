import React, { useEffect, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use a ref for all animation-related state to prevent re-renders on each frame
  const animationState = useRef({
    particles: [] as any[],
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, isMoving: false },
    lastMouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    mouseVelocity: { x: 0, y: 0 },
    lastTime: 0,
    particleTimer: 0,
    animationFrameId: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Local reference to the animation state for easier access inside useEffect
    const state = animationState.current;

    class SmokeParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxSize: number;
      life: number;
      decay: number;
      angle: number;
      angleVelocity: number;
      wobble: number;
      wobbleSpeed: number;
      
      constructor(x: number, y: number, vx: number, vy: number) {
        this.x = x;
        this.y = y;
        this.vx = vx * 0.1 + (Math.random() - 0.5) * 0.5;
        this.vy = vy * 0.1 + (Math.random() - 0.5) * 0.5 - 0.5;
        this.size = Math.random() * 15 + 10;
        this.maxSize = this.size * 4;
        this.life = 1.0;
        this.decay = Math.random() * 0.01 + 0.005;
        this.angle = Math.random() * Math.PI * 2;
        this.angleVelocity = (Math.random() - 0.5) * 0.02;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.05 + 0.02;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.angleVelocity;
        this.wobble += this.wobbleSpeed;
        this.vx += Math.cos(this.angle) * 0.02 + Math.sin(this.wobble) * 0.01;
        this.vy += Math.sin(this.angle) * 0.02 - 0.03;
        this.vx *= 0.98;
        this.vy *= 0.98;
        if (this.size < this.maxSize) {
          this.size += 0.5;
        }
        this.life -= this.decay;
      }
      
      render() {
        if (this.life <= 0) return;
        
        ctx.save();
        
        let alpha = this.life;
        if (alpha > 0.8) {
          alpha = (1 - alpha) * 5;
        } else {
          alpha = alpha * 0.8;
        }
        
        const isDark = document.documentElement.classList.contains('dark');
        const color = isDark ? '255, 255, 255' : '50, 50, 50';

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(${color}, ${alpha * 0.3})`);
        gradient.addColorStop(0.5, `rgba(${color}, ${alpha * 0.1})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      isDead() {
        return this.life <= 0;
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;
      state.mouse.isMoving = true;
      state.mouseVelocity.x = state.mouse.x - state.lastMouse.x;
      state.mouseVelocity.y = state.mouse.y - state.lastMouse.y;
      state.lastMouse.x = state.mouse.x;
      state.lastMouse.y = state.mouse.y;
    };

    const handleMouseLeave = () => {
      state.mouse.isMoving = false;
    };

    const createInitialBurst = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 4;
        const radius = i * 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        state.particles.push(new SmokeParticle(x, y, 0, 0));
      }
    };

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - state.lastTime;
      state.lastTime = currentTime;
      
      // Always clear the canvas completely on each frame.
      // This ensures the underlying application is visible.
      // The previous implementation used a semi-transparent fill in dark mode,
      // which obscured the content.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      state.particleTimer += deltaTime;
      if (state.mouse.isMoving && state.particleTimer > 20) {
        state.particleTimer = 0;
        for (let i = 0; i < 3; i++) {
          const offsetX = (Math.random() - 0.5) * 10;
          const offsetY = (Math.random() - 0.5) * 10;
          state.particles.push(new SmokeParticle(state.mouse.x + offsetX, state.mouse.y + offsetY, state.mouseVelocity.x, state.mouseVelocity.y));
        }
      }
      
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const particle = state.particles[i];
        particle.update();
        particle.render();
        if (particle.isDead()) {
          state.particles.splice(i, 1);
        }
      }
      
      state.animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    createInitialBurst();
    state.animationFrameId = requestAnimationFrame(animate);
    
    setTimeout(() => {
      state.mouse.isMoving = false;
    }, 100);

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(state.animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="smokeCanvas" />;
};

export default CustomCursor;