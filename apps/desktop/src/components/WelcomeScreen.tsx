import { useEffect, useRef } from 'react';
import { ArrowRight, Coffee, Gamepad2, HelpCircle, MapPin, MessageCircle, PenTool, Sparkles, Users } from 'lucide-react';
import { drawAvatar, drawMap } from '../world/draw';
import { SPAWN, WORLD } from '../world/map';
import { AvatarPreview } from './AvatarPreview';
import type { Avatar } from '../types';

const sample: Avatar = { name: 'Maya', skin: '#d8a17b', hair: '#302332', shirt: '#8a70bc', style: 'long' };
function CampusPreview() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!, c = canvas.getContext('2d')!;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height);
    c.scale(canvas.width / WORLD.width, canvas.height / WORLD.height); drawMap(c);
    drawAvatar(c, sample, SPAWN.x, SPAWN.y, { selected: true });
    drawAvatar(c, { ...sample, shirt: '#5c8e75', style: 'curly' }, 2860, 1440);
    drawAvatar(c, { ...sample, shirt: '#a46c65' }, 1750, 630);
  }, []);
  return <canvas ref={ref} width={1200} height={867} aria-label="Preview of Nova’s nine-room campus" />;
}

export function WelcomeScreen({ onEnter, onHelp }: { onEnter: () => void; onHelp: () => void }) {
  return <>
    <header className="landing-header">
      <a className="brand" href="./"><span className="brand-symbol">n<span>·</span></span><strong>nova<span>your little work world</span></strong></a>
      <nav className="landing-nav" aria-label="Welcome navigation"><a href="#possibilities">The possibilities</a><button className="quiet-button" onClick={onHelp}><HelpCircle size={17} /> How to play</button><button className="outline-button" onClick={onEnter}>Join your team <ArrowRight size={16} /></button></nav>
    </header>
    <main className="landing-main">
      <section className="hero-copy">
        <span className="eyebrow hero-eyebrow"><span className="status-dot" /> A LITTLE WORLD. A LOT OF POSSIBILITIES.</span>
        <h1>Your team’s<br /><em>happy place<span className="hero-spark">✳</span></em></h1>
        <p>Less “you’re on mute.” More “come sit with us.”<br />A playful place to work, wander, and make<br className="desktop-break" /> great things happen together.</p>
        <div className="hero-cta"><button className="primary-button enter-button" onClick={onEnter}>Enter workplace <ArrowRight size={21} /></button><span><MapPin size={14} /> Your next great idea starts here.</span></div>
        <div className="hero-companions"><div className="companion-faces"><span>✿</span><span>☺</span><span>✦</span></div><p>Built for your people.<br /><strong>And their big, beautiful ideas.</strong></p></div>
      </section>
      <section className="hero-world" aria-label="Explore the Nova campus">
        <span className="world-sticker sticker-sage"><Coffee size={16} /> Coffee break, anyone?</span>
        <div className="campus-preview"><div className="preview-window-bar"><span><i /><i /><i /></span><strong><span className="status-dot" /> NOVA CAMPUS</strong><span>01 / YOUR WORLD</span></div><CampusPreview /><div className="preview-caption"><span><Users size={15} /> Room for all your ideas</span><span>9 spaces · one team</span></div></div>
        <div className="hello-card"><div className="hello-avatar"><AvatarPreview avatar={sample} size={75} portrait /></div><div><span>A LITTLE PREVIEW</span><strong>Hey, you made it! <span>👋</span></strong><small>Pull up a chair. Make yourself at home.</small></div></div>
        <span className="world-sticker sticker-peach"><Sparkles size={15} /> Good work. Great company.</span>
        <span className="hero-orbit orbit-one" aria-hidden="true">✦</span><span className="hero-orbit orbit-two" aria-hidden="true">✳</span>
      </section>
    </main>
    <section className="possibilities" id="possibilities" aria-label="Things to do in Nova">
      <div className="possibilities-heading"><span className="eyebrow">A WORKDAY WITH A LITTLE MORE LIFE</span><h2>Make room for the good stuff.</h2></div>
      <div className="possibility-cards">
        <button onClick={onEnter} className="possibility-card sage"><span className="possibility-icon"><MessageCircle size={25} /></span><div><h3>Meet naturally.</h3><p>Walk over. Say hello. Feel a little closer.</p></div><ArrowRight size={18} /></button>
        <button onClick={onEnter} className="possibility-card lilac"><span className="possibility-icon"><PenTool size={25} /></span><div><h3>Make something great.</h3><p>Share a screen or sketch your next big idea.</p></div><ArrowRight size={18} /></button>
        <button onClick={onEnter} className="possibility-card peach"><span className="possibility-icon"><Gamepad2 size={25} /></span><div><h3>Take the scenic route.</h3><p>A garden, a coffee, a game. A proper break.</p></div><ArrowRight size={18} /></button>
      </div>
    </section>
    <footer className="landing-footer"><span><span className="brand-mini">n·</span> MADE FOR BEING TOGETHER</span><span>Work feels better with a little wonder.</span><button onClick={onEnter}>See you inside <ArrowRight size={14} /></button></footer>
  </>;
}
