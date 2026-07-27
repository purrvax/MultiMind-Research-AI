import React, { useEffect, useRef } from 'react';
import './FloatingBackground.css';

const FloatingBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 100; // Increased count for premium constellation look
    const mouse = { x: null, y: null, radius: 150 }; // 150px interactive radius

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 1; // Small elegant size
        this.baseSpeedX = (Math.random() - 0.5) * 0.2; // Slow natural drift
        this.baseSpeedY = (Math.random() - 0.5) * 0.2;
        this.vx = this.baseSpeedX;
        this.vy = this.baseSpeedY;
      }
      
      draw() {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; // Emerald, low opacity
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = dx / distance;
            const directionY = dy / distance;
            
            // Soft attraction pull
            const attractionFactor = 0.025;
            this.vx += directionX * force * attractionFactor;
            this.vy += directionY * force * attractionFactor;
            
            // Speed limit while clustering to prevent orbits or jittering
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const maxSpeed = 0.8;
            if (speed > maxSpeed) {
              this.vx = (this.vx / speed) * maxSpeed;
              this.vy = (this.vy / speed) * maxSpeed;
            }
          } else {
            // Easing back to natural drift speed
            this.vx += (this.baseSpeedX - this.vx) * 0.03;
            this.vy += (this.baseSpeedY - this.vy) * 0.03;
          }
        } else {
          // Easing back to natural drift speed
          this.vx += (this.baseSpeedX - this.vx) * 0.03;
          this.vy += (this.baseSpeedY - this.vy) * 0.03;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw each particle
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      // Draw thin elegant connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 85) {
            // Fades out as distance increases
            const opacity = (1 - (dist / 85)) * 0.06;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed-bg">
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            pointerEvents: 'none',
            zIndex: 1
          }} 
        />
      <div className="bg-space-mesh" />
    </div>
  );
};

export default FloatingBackground;
