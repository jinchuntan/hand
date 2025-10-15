
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Pose = {
  wristYaw: number; wristPitch: number; wristRoll: number;
  thumb: number; index: number; middle: number; ring: number; pinky: number;
};

const clamp = (v:number, min:number, max:number) => Math.min(max, Math.max(min, v));

export default function HandDemoPage(){
  const [pose, setPose] = useState<Pose>({ wristYaw: 0, wristPitch: 0, wristRoll: 0, thumb: 10, index: 10, middle: 10, ring: 10, pinky: 10 });
  const reset = () => setPose({ wristYaw: 0, wristPitch: 0, wristRoll: 0, thumb: 10, index: 10, middle: 10, ring: 10, pinky: 10 });

  function curlToAngles(curl:number){ const c = clamp(curl, 0, 100) / 100; return [50*c, 60*c, 45*c] as [number,number,number]; }
  const fIndex = curlToAngles(pose.index);
  const fMiddle = curlToAngles(pose.middle);
  const fRing = curlToAngles(pose.ring);
  const fPinky = curlToAngles(pose.pinky);
  const fThumb = curlToAngles(pose.thumb);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Haptic Glove — Hand Frontend Demo</h1>
            <p className="text-neutral-600 mt-1">Use sliders to simulate glove input. The SVG hand moves in real‑time.</p>
          </div>
          <a href="/"><Button className="rounded-2xl">← Back</Button></a>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <div className="rounded-3xl border bg-neutral-50 aspect-[4/3] overflow-hidden grid place-items-center">
            <HandSVG pose={pose} />
          </div>
          <div className="rounded-3xl border p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="font-medium">Simulated Glove Input</div>
              <Button onClick={reset} className="rounded-2xl" type="button">Reset</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Slider label="Wrist Yaw" min={-45} max={45} value={pose.wristYaw} onChange={(v)=>setPose(p=>({...p, wristYaw: v}))} />
              <Slider label="Wrist Pitch" min={-30} max={30} value={pose.wristPitch} onChange={(v)=>setPose(p=>({...p, wristPitch: v}))} />
              <Slider label="Wrist Roll" min={-45} max={45} value={pose.wristRoll} onChange={(v)=>setPose(p=>({...p, wristRoll: v}))} />
              <div className="hidden sm:block"></div>
              <Slider label="Thumb curl" value={pose.thumb} onChange={(v)=>setPose(p=>({...p, thumb: v}))} />
              <Slider label="Index curl" value={pose.index} onChange={(v)=>setPose(p=>({...p, index: v}))} />
              <Slider label="Middle curl" value={pose.middle} onChange={(v)=>setPose(p=>({...p, middle: v}))} />
              <Slider label="Ring curl" value={pose.ring} onChange={(v)=>setPose(p=>({...p, ring: v}))} />
              <Slider label="Pinky curl" value={pose.pinky} onChange={(v)=>setPose(p=>({...p, pinky: v}))} />
            </div>
            <p className="text-xs text-neutral-500 mt-4">Map real glove data to these values later (0–100 per finger + yaw/pitch/roll) via WebSocket/Web Serial.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, min=0, max=100 }:{ label: string; value:number; onChange:(v:number)=>void; min?:number; max?:number }){
  return (
    <label className="block">
      <div className="text-xs text-neutral-600 mb-1 flex items-center justify-between">
        <span>{label}</span>
        <span className="tabular-nums">{value.toFixed(0)}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e)=>onChange(parseFloat(e.target.value))} className="w-full accent-black" />
    </label>
  )
}

function HandSVG({ pose }:{ pose: Pose }){
  const scale = 1.1;
  const palmWidth = 140, palmHeight = 120;
  const originX = 220, originY = 200;
  const fingerSpacing = 28;

  const rotateZ = pose.wristYaw;
  const rotateX = pose.wristPitch;
  const rotateY = pose.wristRoll;

  function Finger({ baseX, baseY, baseRot, curls, length=80 }:{ baseX:number; baseY:number; baseRot:number; curls:[number, number, number]; length?:number }){
    const [mcp, pip, dip] = curls;
    const seg1 = length;
    const seg2 = length * 0.65;
    const seg3 = length * 0.55;
    const thickness = 16;

    return (
      <g transform={`translate(${baseX},${baseY}) rotate(${baseRot})`}>
        <g>
          <rect x={-thickness/2} y={-seg1} width={thickness} height={seg1} rx={thickness/2} fill="#111" />
          <circle cx="0" cy="0" r="5" fill="#333" />
        </g>
        <g transform={`translate(0, ${-seg1}) rotate(${mcp})`}>
          <rect x={-thickness*0.45} y={-seg2} width={thickness*0.9} height={seg2} rx={thickness*0.45} fill="#111" />
          <circle cx="0" cy="0" r="4.5" fill="#333" />
          <g transform={`translate(0, ${-seg2}) rotate(${pip})`}>
            <rect x={-thickness*0.4} y={-seg3} width={thickness*0.8} height={seg3} rx={thickness*0.4} fill="#111" />
            <circle cx="0" cy="0" r="4" fill="#333" />
            <g transform={`translate(0, ${-seg3}) rotate(${dip})`}>
              <circle cx="0" cy="-6" r="6" fill="#111" />
            </g>
          </g>
        </g>
      </g>
    )
  }

  function curls(c:number){ const k = Math.max(0, Math.min(1, c/100)); return [k*50, k*60, k*45] as [number,number,number]; }

  return (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e6e6e6" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="640" height="480" fill="url(#grid)" />

      <motion.g
        initial={false}
        animate={{ rotate: rotateZ, x: 0, y: 0, skewX: rotateX * 0.2 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        transform-origin={`220px 200px`}
      >
        <g transform={`translate(${220},${200}) rotate(${rotateY}) scale(${scale})`}>
          <rect x={-palmWidth/2} y={-palmHeight} width={palmWidth} height={palmHeight} rx="24" fill="#1a1a1a" />
          <rect x={-60} y={-10} width={120} height={20} rx="10" fill="#0d0d0d" />

          <Finger baseX={-fingerSpacing*1.5} baseY={-palmHeight} baseRot={0} curls={curls( pose.index )} />
          <Finger baseX={-fingerSpacing*0.5} baseY={-palmHeight} baseRot={0} curls={curls( pose.middle )} />
          <Finger baseX={ fingerSpacing*0.5} baseY={-palmHeight} baseRot={0} curls={curls( pose.ring )} />
          <Finger baseX={ fingerSpacing*1.5} baseY={-palmHeight} baseRot={0} curls={curls( pose.pinky )} length={70} />
          <Finger baseX={-palmWidth/2 + 18} baseY={-palmHeight/2} baseRot={-30} curls={curls( pose.thumb )} length={70} />
        </g>
      </motion.g>
    </svg>
  );
}
