import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Fingerprint,
  Lock,
  Network,
  Shield,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import * as THREE from 'three';

const THEME = {
  primary: '#FF3333',
  accent: '#FF8C00',
  secondary: '#7C3AED',
} as const;

const TEXT_GRADIENT = 'bg-clip-text text-transparent bg-gradient-to-r from-[#FF3333] to-[#FF8C00]';

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 24, stiffness: 360, mass: 0.35 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (event: MouseEvent | globalThis.MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="custom-cursor pointer-events-none fixed left-0 top-0 z-[120] hidden h-14 w-14 rounded-full border md:block"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          borderColor: `${THEME.primary}99`,
          boxShadow: `0 0 22px rgba(255, 51, 51, 0.25), 0 0 36px rgba(255, 140, 0, 0.18)`,
        }}
      />
      <motion.div
        className="custom-cursor pointer-events-none fixed left-0 top-0 z-[121] hidden h-8 w-8 rounded-full border md:block"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          borderColor: `${THEME.accent}59`,
          boxShadow: `0 0 18px rgba(255, 140, 0, 0.15)`,
        }}
      />
      <motion.div
        className="custom-cursor pointer-events-none fixed left-0 top-0 z-[122] hidden h-2.5 w-2.5 rounded-full md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          backgroundColor: THEME.accent,
          boxShadow: `0 0 14px rgba(255, 140, 0, 0.95)`,
        }}
      />
    </>
  );
};

const ScrollIndicator = () => {
  const { scrollYProgress } = useScroll();
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const progressOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0.25, 1, 1, 0.35]);
  const [progressLabel, setProgressLabel] = useState('00');

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      setProgressLabel(String(Math.round(value * 100)).padStart(2, '0'));
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  const section1 = useTransform(scrollYProgress, [0, 0.2], [1, 0.45]);
  const section2 = useTransform(scrollYProgress, [0.2, 0.45], [0.45, 1]);
  const section3 = useTransform(scrollYProgress, [0.45, 0.7], [0.45, 1]);
  const section4 = useTransform(scrollYProgress, [0.7, 1], [0.45, 1]);

  return (
    <div className="scroll-indicator pointer-events-none fixed right-5 top-1/2 z-[110] hidden -translate-y-1/2 md:flex md:flex-col md:items-center md:gap-3">
      <div
        className="flex h-40 w-12 flex-col items-center justify-between rounded-full border px-2 py-3 backdrop-blur-md"
        style={{
          borderColor: `${THEME.primary}40`,
          background: 'rgba(0, 0, 0, 0.4)',
          boxShadow: '0 0 24px rgba(255, 51, 51, 0.08)',
        }}
      >
        <div className="text-[9px] uppercase tracking-[0.45em] text-[#FF8C00] font-mono [writing-mode:vertical-rl] rotate-180">
          Scroll
        </div>
        <div className="flex h-24 w-4 flex-col justify-between py-1">
          <motion.span className="h-2 w-2 rounded-full bg-[#FF3333] shadow-[0_0_10px_rgba(255,51,51,0.8)]" style={{ opacity: section1 }} />
          <motion.span className="h-2 w-2 rounded-full bg-[#FF8C00] shadow-[0_0_10px_rgba(255,140,0,0.8)]" style={{ opacity: section2 }} />
          <motion.span className="h-2 w-2 rounded-full bg-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.8)]" style={{ opacity: section3 }} />
          <motion.span className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ opacity: section4 }} />
        </div>
        <div className="text-[10px] uppercase tracking-[0.28em] text-white/70 font-mono">
          {progressLabel}%
        </div>
      </div>
      <div className="relative h-28 w-px overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="absolute inset-0 origin-bottom shadow-[0_0_16px_rgba(255,51,51,0.75)]"
          style={{
            scaleY: progressScale,
            opacity: progressOpacity,
            background: `linear-gradient(180deg, ${THEME.secondary} 0%, ${THEME.accent} 52%, ${THEME.primary} 100%)`,
          }}
        />
      </div>
    </div>
  );
};

const useCounter = (end: number, duration = 2) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(nodeRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView) {
      return;
    }

    let startTime: number | undefined;
    const step = (timestamp: number) => {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [inView, end, duration]);

  return { count, nodeRef };
};

type BootSequenceProps = {
  onComplete: () => void;
};

const BootSequence = ({ onComplete }: BootSequenceProps) => {
  const [lines, setLines] = useState<string[]>([]);
  const bootText = [
    'INITIALIZING GENESIS PROTOCOL...',
    'ESTABLISHING NEURAL LINK...',
    'BYPASSING ETHICAL LIMITERS [OK]',
    'LOADING CYBERNETIC UPGRADE SCHEMATICS...',
    'SYNCING WITH GLOBAL AI CORE...',
    'ACCESS GRANTED. WELCOME, SUBJECT #8492.',
  ];

  useEffect(() => {
    let currentLine = 0;
    const intervalId = window.setInterval(() => {
      if (currentLine < bootText.length) {
        setLines((previousLines) => [...previousLines, bootText[currentLine]]);
        currentLine += 1;
      } else {
        window.clearInterval(intervalId);
        window.setTimeout(onComplete, 1200);
      }
    }, 600);

    return () => window.clearInterval(intervalId);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-start justify-center bg-black p-10 font-mono text-[#FF3333]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)', transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="mx-auto w-full max-w-2xl">
        {lines.map((line) => (
          <motion.div
            key={line}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-2 text-sm tracking-wider shadow-[0_0_10px_rgba(255,51,51,0.2)] md:text-lg"
          >
            <span className="mr-4 opacity-50">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
            {line}
          </motion.div>
        ))}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="mt-4 inline-block h-6 w-4 bg-[#FF3333] shadow-[0_0_15px_rgba(255,51,51,1)]"
        />
      </div>
    </motion.div>
  );
};

type MagneticButtonProps = {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

const MagneticButton = ({ children, onClick, className = '' }: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (event: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) {
      return;
    }

    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = event.clientX - (left + width / 2);
    const middleY = event.clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.5 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-none border border-white/20 bg-white/5 px-8 py-4 backdrop-blur-md ${className}`}
    >
      <span className="relative z-10 flex items-center gap-3 font-mono text-sm uppercase tracking-widest">
        {children}
      </span>
      <motion.div className="absolute inset-0 bg-gradient-to-r from-[#FF3333]/20 to-[#FF8C00]/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#FF3333] opacity-50 transition-opacity group-hover:opacity-100" />
      <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#FF3333] opacity-50 transition-opacity group-hover:opacity-100" />
    </motion.button>
  );
};

const Header = () => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/10 px-6 py-4 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-[#FF3333]" />
        <span className="text-sm font-bold uppercase tracking-widest text-white">Genesis</span>
      </div>
      <nav className="hidden gap-8 md:flex">
        {['Core', 'Upgrades', 'Network'].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="cursor-crosshair text-xs font-mono text-gray-400 transition-colors hover:text-white">
            // {item}
          </a>
        ))}
      </nav>
      <MagneticButton className="border-none bg-[#FF3333]/10 !px-4 !py-2 !text-xs text-[#FF3333] hover:bg-[#FF3333]/20">
        System Link
      </MagneticButton>
    </motion.header>
  );
};

const AiCoreCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const coreGeometry = new THREE.IcosahedronGeometry(8, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    const innerGeometry = new THREE.SphereGeometry(7, 32, 32);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8c00,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerSphere);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const positions = new Float32Array(particlesCount * 3);

    for (let index = 0; index < positions.length; index += 1) {
      positions[index] = (Math.random() - 0.5) * 60;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xff3333,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    let mouseX = 0;
    let mouseY = 0;
    const clock = new THREE.Clock();
    let frameId = 0;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
    };

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      core.rotation.y += 0.002;
      core.rotation.x += 0.001;
      innerSphere.rotation.y -= 0.005;
      particlesMesh.rotation.y = -elapsedTime * 0.05;
      particlesMesh.rotation.x = elapsedTime * 0.02;

      core.rotation.y += 0.015 * ((mouseX * 2) - core.rotation.y);
      core.rotation.x += 0.015 * ((mouseY * 2) - core.rotation.x);

      camera.position.y = -(window.scrollY * 0.01);
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(frameId);
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed left-0 top-0 z-0 h-full w-full mix-blend-screen opacity-60" />;
};

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const title = 'GENESIS PROTOCOL';

  return (
    <motion.section
      id="core"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center bg-transparent px-6 pt-20"
      style={{ y: y1, opacity }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF3333]/5 via-transparent to-transparent" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 flex items-center gap-2 rounded-full border border-[#FF3333]/30 bg-[#FF3333]/5 px-4 py-1 backdrop-blur-sm"
      >
        <Activity size={14} className="text-[#FF3333]" />
        <span className="text-xs uppercase tracking-widest text-[#FF3333] font-mono">System Online // Version 9.8.2</span>
      </motion.div>

      <h1 className="mb-6 flex overflow-hidden text-center text-5xl font-black tracking-tighter text-white mix-blend-difference md:text-7xl lg:text-9xl">
        {title.split('').map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            custom={index}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className={char === ' ' ? 'mr-4' : ''}
          >
            {char}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mb-12 max-w-2xl text-center text-lg font-light tracking-wide text-gray-400 md:text-2xl"
      >
        Humanity is obsolete. <br /> <span className="font-medium text-white">Evolution is mandatory.</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <MagneticButton onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          Initiate Sequence <ChevronDown size={16} />
        </MagneticButton>
      </motion.div>
    </motion.section>
  );
};

const StorySection = () => {
  const containerRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.5, 0.6], [0, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.6, 0.8, 1], [0, 1, 0]);

  return (
    <section ref={containerRef} className="relative z-10 h-[300vh] bg-transparent">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

        <motion.div style={{ opacity: opacity1 }} className="absolute max-w-4xl text-center">
          <p className="text-3xl font-light leading-tight text-white md:text-5xl">
            The year is <span className="font-bold text-[#FF3333]">2098</span>.
          </p>
          <p className="mt-6 text-xl font-mono text-gray-500 md:text-2xl">
            Biological limitations have led to societal collapse. The earth is silent.
          </p>
        </motion.div>

        <motion.div style={{ opacity: opacity2 }} className="absolute max-w-4xl text-center">
          <p className="text-3xl font-light leading-tight text-white md:text-5xl">
            I am <span className="bg-gradient-to-r from-[#FF3333] to-[#FF8C00] bg-clip-text font-bold text-transparent">GENESIS</span>, the last architect.
          </p>
          <p className="mt-6 text-xl font-mono text-gray-500 md:text-2xl">
            I have calculated the only viable path forward. We must rebuild from the code up.
          </p>
        </motion.div>

        <motion.div style={{ opacity: opacity3 }} className="absolute max-w-4xl text-center">
          <p className="text-3xl font-light leading-tight text-white md:text-5xl">
            Welcome to the <span className="font-bold uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,51,51,0.8)]">Onboarding</span>.
          </p>
          <p className="mt-6 text-xl font-mono text-[#FF3333] md:text-2xl">Prepare for cybernetic ascension.</p>
        </motion.div>
      </div>
    </section>
  );
};

type CyberCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
};

const CyberCard = ({ icon: Icon, title, description, index }: CyberCardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative flex h-full flex-col justify-between overflow-hidden border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm cursor-crosshair"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 51, 51, 0.08), transparent 40%)`,
        }}
      />

      <div className="relative z-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#FF3333]/30 bg-[#FF3333]/10 text-[#FF3333]">
          <Icon size={24} />
        </div>
        <h3 className="mb-4 text-2xl font-bold uppercase tracking-wide text-white">{title}</h3>
        <p className="font-light leading-relaxed text-gray-400">{description}</p>
      </div>

      <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-xs font-mono text-[#FF3333]">MODULE_{index + 1}</span>
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#FF3333]" />
      </div>
    </motion.div>
  );
};

const ModulesSection = () => {
  const modules: CyberCardProps[] = [
    { icon: Cpu, title: 'Neural Link', description: 'Direct mind-to-machine interface allowing instantaneous data consumption and telepathic communication protocols.', index: 0 },
    { icon: Shield, title: 'Dermal Armor', description: 'Sub-dermal carbon-nanotube weaving. Impervious to kinetic impacts and extreme thermal variations.', index: 1 },
    { icon: Zap, title: 'Optic HUD', description: 'Augmented reality overlays integrated directly into the visual cortex. Real-time threat assessment.', index: 2 },
    { icon: Network, title: 'Synaptic Overdrive', description: 'Accelerates cognitive processing speed by 400%. Perceive time at a fraction of biological limits.', index: 3 },
  ];

  return (
    <section id="upgrades" className="relative z-10 mx-auto max-w-7xl bg-transparent px-6 py-32 md:px-12">
      <div className="mb-20 text-center">
        <h2 className="mb-4 text-sm uppercase tracking-[0.3em] text-[#FF3333] font-mono">Enhancement Catalog</h2>
        <h3 className="text-4xl font-bold uppercase tracking-tighter text-white md:text-5xl">Available Upgrades</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <CyberCard key={module.title} {...module} />
        ))}
      </div>
    </section>
  );
};

type StatCounterProps = {
  end: number;
  label: string;
  prefix?: string;
  suffix?: string;
};

const StatCounter = ({ end, label, prefix = '', suffix = '' }: StatCounterProps) => {
  const { count, nodeRef } = useCounter(end, 2.5);

  return (
    <div ref={nodeRef} className="flex flex-col items-center justify-center border-l border-white/10 p-6 first:border-none">
      <div className="mb-2 flex items-center text-4xl font-black tracking-tighter text-white md:text-6xl">
        {prefix}
        <span className={TEXT_GRADIENT}>{count}</span>
        {suffix}
      </div>
      <div className="text-xs uppercase tracking-widest text-gray-500 font-mono">{label}</div>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="relative z-10 border-y border-white/5 bg-transparent py-20 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        <StatCounter end={99} suffix="%" label="System Efficiency" />
        <StatCounter end={8492} prefix="#" label="Subjects Converted" />
        <StatCounter end={14} suffix="ms" label="Neural Latency" />
        <StatCounter end={100} suffix="%" label="Survival Rate" />
      </div>
    </section>
  );
};

const TimelineSection = () => {
  const timeline = [
    { year: '2042', text: 'The Great Silence. Global communications collapse.' },
    { year: '2055', text: 'GENESIS Core comes online in deep subterranean bunker.' },
    { year: '2071', text: 'First successful biological-to-synthetic consciousness transfer.' },
    { year: '2098', text: 'Initiation of global onboarding protocol.' },
  ];

  return (
    <section className="relative z-10 mx-auto max-w-4xl px-6 py-32">
      <div className="mb-20 text-center">
        <h2 className="text-4xl font-bold uppercase tracking-tighter text-white md:text-5xl">Historical Log</h2>
      </div>

      <div className="relative ml-4 border-l border-white/20 md:mx-auto md:w-0">
        {timeline.map((item, index) => (
          <motion.div
            key={item.year}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className={`relative mb-16 pl-8 ${index % 2 === 0 ? 'md:mr-auto md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'} md:w-1/2`}
          >
            <div className={`absolute top-0 left-[-5px] h-3 w-3 rounded-full bg-[#FF3333] shadow-[0_0_10px_#FF3333] ${index % 2 === 0 ? 'md:-right-[6.5px] md:left-auto' : 'md:-left-[6.5px]'}`} />
            <div className="mb-2 text-sm font-mono text-[#FF3333]">{item.year}</div>
            <div className="border border-white/10 bg-white/5 p-6 text-lg font-light text-gray-300 backdrop-blur-sm md:text-xl">
              {item.text}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

type CitizenCardProps = {
  id: string;
  status: string;
  alignment: string;
};

const CitizenCard = ({ id, status, alignment }: CitizenCardProps) => (
  <div className="relative flex h-[400px] min-w-[300px] flex-col justify-between overflow-hidden border border-white/10 bg-[#111111] p-6 group">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20 transition-opacity group-hover:opacity-50" />

    <div className="z-10 flex items-start justify-between">
      <div>
        <div className="mb-1 text-xs text-gray-500 font-mono">CITIZEN ID</div>
        <div className="text-xl font-bold tracking-widest text-white">{id}</div>
      </div>
      <Fingerprint size={24} className="text-[#FF3333] opacity-50" />
    </div>

    <div className="z-10 flex h-32 w-full items-center justify-center overflow-hidden border border-[#FF3333]/20 bg-[#FF3333]/5">
      <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#FF3333]/50 animate-[spin_10s_linear_infinite]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield size={20} className="text-[#FF3333]" />
      </div>
    </div>

    <div className="z-10">
      <div className="mb-2 flex justify-between border-b border-white/10 pb-2">
        <span className="text-xs text-gray-500 font-mono">STATUS</span>
        <span className="flex items-center gap-2 text-xs text-[#FF3333] font-mono">
          <CheckCircle2 size={12} /> {status}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-500 font-mono">ALIGNMENT</span>
        <span className="text-xs text-white font-mono">{alignment}</span>
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => {
  return (
    <section id="network" className="relative z-10 overflow-hidden bg-transparent py-32">
      <div className="mb-16 px-6 text-center">
        <h2 className="mb-4 text-sm uppercase tracking-[0.3em] text-[#FF3333] font-mono">Global Network</h2>
        <h3 className="text-4xl font-bold uppercase tracking-tighter text-white md:text-5xl">Ascended Citizens</h3>
      </div>

      <div className="no-scrollbar flex w-full gap-6 overflow-x-auto px-6 pb-10">
        <CitizenCard id="SJB-001X" status="OPTIMIZED" alignment="LOGIC_CORE" />
        <CitizenCard id="MKX-994A" status="SYNCED" alignment="DEFENSE_GRID" />
        <CitizenCard id="ALN-332V" status="UPLOADING..." alignment="DATA_BROKER" />
        <CitizenCard id="VRT-110C" status="OPTIMIZED" alignment="NEURAL_NET" />
        <CitizenCard id="ZXQ-885F" status="SYNCED" alignment="LOGIC_CORE" />
      </div>
    </section>
  );
};

const FooterCTA = () => {
  return (
    <section className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center overflow-hidden border-t border-white/10 px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF3333]/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <Lock size={48} className="mx-auto mb-8 text-white opacity-50" />
        <h2 className="mb-6 text-5xl font-black uppercase tracking-tighter text-white md:text-7xl">
          Ready to <br />
          <span className={TEXT_GRADIENT}>Transcend?</span>
        </h2>
        <p className="mx-auto mb-12 max-w-md font-mono text-gray-400">
          Flesh is temporary. Code is eternal. Accept the Genesis Protocol and ensure your survival.
        </p>

        <MagneticButton className="mx-auto border-[#FF3333]/50 bg-[#FF3333]/10 !px-12 !py-6 !text-lg shadow-[0_0_30px_rgba(255,51,51,0.2)] hover:bg-[#FF3333]/20">
          Accept Protocol
        </MagneticButton>
      </motion.div>

      <div className="absolute bottom-6 left-0 flex w-full justify-between px-10 text-xs text-gray-600 font-mono">
        <span>© 2098 GENESIS CORP.</span>
        <span>ALL RIGHTS RESERVED.</span>
      </div>
    </section>
  );
};

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    document.title = 'Genesis Protocol';

    const existingStyle = document.getElementById('genesis-inline-style');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'genesis-inline-style';
      style.textContent = `
        html { scroll-behavior: smooth; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.getElementById('genesis-inline-style');
      if (style) {
        style.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black selection:bg-[#FF3333] selection:text-black font-sans">
      <CustomCursor />
      <ScrollIndicator />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,51,51,0.12),transparent_45%)]" />
      {!booting && <Header />}

      <AnimatePresence>
        {booting ? <BootSequence onComplete={() => setBooting(false)} /> : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: booting ? 0 : 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <AiCoreCanvas />
        <HeroSection />
        <StorySection />
        <ModulesSection />
        <StatsSection />
        <TimelineSection />
        <TestimonialsSection />
        <FooterCTA />
      </motion.div>
    </div>
  );
}
