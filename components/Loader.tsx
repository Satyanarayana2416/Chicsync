
import React, { useState, useEffect, useRef } from 'react';

interface LoaderProps {
  t: any;
}

const InteractiveLoader: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Use a ref for state that changes every frame to avoid re-renders
    const stateRef = useRef({
        particles: [] as any[],
        mouse: { x: -999, y: -999, radius: 100 },
        animationFrameId: 0,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = stateRef.current;
        const isDark = document.documentElement.classList.contains('dark');
        
        const PARTICLE_COUNT = 150;
        const BASE_RADIUS = 50;
        const PULSE_AMOUNT = 10;
        const PARTICLE_SIZE = 2;
        const MOUSE_REPEL_STRENGTH = 50;
        const RETURN_FORCE = 0.1;
        const DAMPING = 0.9;

        let width = canvas.width = 250;
        let height = canvas.height = 250;
        const centerX = width / 2;
        const centerY = height / 2;

        class Particle {
            homeX: number;
            homeY: number;
            x: number;
            y: number;
            vx: number;
            vy: number;
            color: string;

            constructor(x: number, y: number) {
                this.homeX = x;
                this.homeY = y;
                this.x = x;
                this.y = y;
                this.vx = 0;
                this.vy = 0;
                this.color = isDark ? `hsl(${Math.random() * 60 + 200}, 100%, 70%)` : `hsl(${Math.random() * 60 + 200}, 90%, 50%)`;
            }

            update(pulseFactor: number) {
                const currentHomeX = centerX + (this.homeX - centerX) * pulseFactor;
                const currentHomeY = centerY + (this.homeY - centerY) * pulseFactor;

                // Repulsion from mouse
                const dxMouse = this.x - state.mouse.x;
                const dyMouse = this.y - state.mouse.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                
                if (distMouse < state.mouse.radius) {
                    const forceDirectionX = dxMouse / distMouse;
                    const forceDirectionY = dyMouse / distMouse;
                    const force = (state.mouse.radius - distMouse) / state.mouse.radius * MOUSE_REPEL_STRENGTH;
                    this.vx += forceDirectionX * force * 0.1;
                    this.vy += forceDirectionY * force * 0.1;
                }

                // Attraction to home
                const dxHome = currentHomeX - this.x;
                const dyHome = currentHomeY - this.y;
                this.vx += dxHome * RETURN_FORCE;
                this.vy += dyHome * RETURN_FORCE;

                // Apply damping and update position
                this.vx *= DAMPING;
                this.vy *= DAMPING;
                this.x += this.vx;
                this.y += this.vy;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, PARTICLE_SIZE, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const init = () => {
            state.particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
                // Distribute particles in rings for a fuller look
                const radius = BASE_RADIUS * (0.5 + Math.random() * 0.5); 
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                state.particles.push(new Particle(x, y));
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            state.mouse.x = e.clientX - rect.left;
            state.mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            state.mouse.x = -999;
            state.mouse.y = -999;
        };
        
        let time = 0;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            time += 0.05;
            // Create a pulsing effect by scaling the home positions
            const pulseFactor = 1 + (Math.sin(time) * PULSE_AMOUNT) / BASE_RADIUS;
            
            for (const particle of state.particles) {
                particle.update(pulseFactor);
                particle.draw();
            }
            
            state.animationFrameId = requestAnimationFrame(animate);
        };
        
        init();
        animate();

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cancelAnimationFrame(state.animationFrameId);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return <canvas ref={canvasRef} />;
};


const subMessages = [
    "Analyzing color harmonies...",
    "Checking style compatibility...",
    "Consulting the latest trends...",
    "Tailoring recommendations...",
    "Generating your virtual look...",
];

const Loader: React.FC<LoaderProps> = ({ t }) => {
  const [currentSubMessage, setCurrentSubMessage] = useState(subMessages[0]);
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % subMessages.length;
      setCurrentSubMessage(subMessages[index]);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
      <InteractiveLoader />
      <div>
        <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg">{t.loaderMessage}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-opacity duration-500">{currentSubMessage}</p>
      </div>
    </div>
  );
};

export default Loader;