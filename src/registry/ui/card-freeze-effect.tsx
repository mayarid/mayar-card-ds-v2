import { getFontEmbedCSS, toCanvas } from 'html-to-image'
import { useEffect, useEffectEvent, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar Card freeze effect. Port of the shipped app's `CardFreezeEffect.svelte` (code-only: Wonder
 * has no specimen of the motion). A WebGL ice sheet covers the card and refracts a snapshot of it
 * through procedural ice (fbm + voronoi plates). The ice grows in on freeze (water → ice) and melts on
 * thaw (ice → water). In the interactive mode the cursor is a hammer: blows crack the ice along its
 * voronoi seams, cracked plates fall out as shards, and when about 70% is gone the rest collapses and
 * `onShatter` fires. The host then sets the card active again.
 *
 * Nothing in this module touches `window` or `document` at import time, so it is safe on the server.
 */

/* ── Shared between every instance ───────────────────────────────────────── */

/**
 * Live WebGL contexts that the look-only ice can hold at once, shared by every instance. A browser
 * drops its oldest context past about 16, so a grid of frozen tiles takes turns: each tile waits for
 * a slot, renders, keeps the last frame on a 2D canvas and gives the slot back.
 */
const MAX_LIVE_GL = 4

/** The webfont CSS that html-to-image embeds in each snapshot. Read once per page. */
let fontEmbedCss: Promise<string> | null = null
let liveGl = 0
const glWaiters: (() => void)[] = []

/** Waits for a free context slot. Call the returned function once to give the slot back. */
function acquireGlSlot(): Promise<() => void> {
  return new Promise((resolve) => {
    const grant = () => {
      liveGl++
      let released = false
      resolve(() => {
        if (released) return
        released = true
        liveGl--
        glWaiters.shift()?.()
      })
    }
    if (liveGl < MAX_LIVE_GL) grant()
    else glWaiters.push(grant)
  })
}

/* ── Timing ──────────────────────────────────────────────────────────────── */

// `be` is the raw freeze ramp 0..1 (linear over FREEZE_MS); `xe` is the raw thaw ramp 0..1 (linear
// over THAW_MS). The easing is applied only when the uniforms are set.
const FREEZE_MS = 1500
const THAW_MS = 1600
/** Keyboard path: this many hits (Enter or Space) break the ice. */
const KEY_HITS = 3
/** Where the keyboard hits land, in uv (y up): middle, then left, then right. */
const KEY_SPOTS = [
  [0.5, 0.52],
  [0.2, 0.4],
  [0.8, 0.6],
] as const

const easeOutCubic = (e: number) => 1 - Math.pow(1 - e, 3)
const thawEase = (e: number) => 0.5 * e + 0.5 * e * e * e
// Refreeze in the middle of a thaw: resume the freeze ramp at the coverage that the thaw has
// receded to, so the front does not jump.
const invThaw = (e: number) => 1 - Math.pow(1 - Math.max(0.02, 1 - 1.12 * thawEase(e)), 1 / 3)
// Unfreeze in the middle of a freeze: Newton-invert the freeze easing (through the 1.12 thaw
// overshoot), so the thaw joins at the matching coverage.
const invFreeze = (e: number) => {
  const tt = Math.min(1, (1 - easeOutCubic(e)) / 1.12)
  let n = tt
  for (let k = 0; k < 4; k++) n -= (0.5 * n + 0.5 * n * n * n - tt) / (0.5 + 1.5 * n * n)
  return Math.min(1, Math.max(0, n))
}

interface Ramp {
  be: number
  xe: number
}

/** Moves the ramps by `dtMs` toward `frozen`. Returns true when a thaw has just finished. */
function stepRamp(r: Ramp, frozen: boolean, dtMs: number, reduce: boolean) {
  if (reduce) {
    r.be = frozen ? 1 : 0
    r.xe = 0
    return !frozen
  }
  if (frozen) {
    if (r.xe > 0) {
      r.be = Math.min(r.be, invThaw(r.xe))
      r.xe = 0
    }
    r.be = Math.min(1, r.be + dtMs / FREEZE_MS)
    return false
  }
  if (r.be > 0) {
    if (r.be < 0.999 && r.xe <= 0) {
      r.xe = invFreeze(r.be)
      r.be = 1
    }
    r.xe = Math.min(1, r.xe + dtMs / THAW_MS)
    if (r.xe >= 1) {
      r.be = 0
      r.xe = 0
      return true
    }
  }
  return false
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

/* ── Placeholder texture (drawn from props, used until the snapshot is ready) ── */

const TW = 1024
const TH = 640
const ASPECT = 420 / 264
const MONO = "'Paper Mono', ui-monospace, monospace"
const SANS = "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif"
const M_PATH =
  'm93.1 98.8l4.7-30.6c1.4-9.2 3.3-20.7 6-34.8h-0.4c-5 12.7-10.3 25-14.4 33.7l-13.6 29.9h-16.5l-1.4-29.8c-0.4-8.3-1-20.9-1.2-33.8h-0.3c-2.7 13.2-5.2 25.7-7.3 34.8l-7.1 30.6h-19.4l22.2-88.7h27.4l1 29.9c0.3 7.9 1 18.7 0.9 28.4h0.4c3.2-9.7 7.9-20.8 11.3-28.6l12.6-29.7h27.5l-12.1 88.7z'

/** A theme colour (`--color-<name>`), or the fallback when the theme is not loaded. */
function themeColor(name: string, fallback: string) {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim() || fallback
}

/** Splits on commas that are not inside parentheses. */
function splitTopLevel(body: string) {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (c === '(') depth++
    else if (c === ')') depth--
    else if (c === ',' && depth === 0) {
      parts.push(body.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(body.slice(start).trim())
  return parts.filter(Boolean)
}

/** Reads the angle and stops of the first `linear-gradient()` in a CSS background value. */
function parseGradient(css: string | undefined) {
  let angle = 140
  const stops: { color: string; pos: number | null }[] = []
  const at = css ? css.indexOf('linear-gradient(') : -1
  if (css && at >= 0) {
    let depth = 0
    let end = -1
    for (let i = at + 'linear-gradient'.length; i < css.length; i++) {
      if (css[i] === '(') depth++
      else if (css[i] === ')' && --depth === 0) {
        end = i
        break
      }
    }
    const body = end > 0 ? css.slice(at + 'linear-gradient('.length, end) : ''
    splitTopLevel(body).forEach((part, i) => {
      const deg = /^(-?\d+(?:\.\d+)?)deg\b/.exec(part)
      if (i === 0 && (deg || part.startsWith('in ') || part.startsWith('to '))) {
        if (deg?.[1]) angle = parseFloat(deg[1])
        return
      }
      const withPos = /^(.*?)\s+(-?\d+(?:\.\d+)?)%$/.exec(part)
      if (withPos?.[1] && withPos[2]) stops.push({ color: withPos[1], pos: parseFloat(withPos[2]) / 100 })
      else stops.push({ color: part, pos: null })
    })
  }
  if (stops.length < 2) {
    stops.length = 0
    stops.push(
      { color: themeColor('skin-midnight-1', 'rgb(31 34 53)'), pos: 0 },
      { color: themeColor('skin-midnight-2', 'rgb(14 15 26)'), pos: 0.55 },
      { color: themeColor('skin-midnight-3', 'rgb(21 22 42)'), pos: 1 },
    )
  }
  return { angle, stops: stops.map((s, i) => ({ color: s.color, pos: s.pos ?? i / (stops.length - 1) })) }
}

interface Placeholder {
  gradient?: string
  pan?: string
  holder?: string
  expiry?: string
}

function roundRect(x: CanvasRenderingContext2D, rx: number, ry: number, w: number, h: number, r: number) {
  x.beginPath()
  x.moveTo(rx + r, ry)
  x.arcTo(rx + w, ry, rx + w, ry + h, r)
  x.arcTo(rx + w, ry + h, rx, ry + h, r)
  x.arcTo(rx, ry + h, rx, ry, r)
  x.arcTo(rx, ry, rx + w, ry, r)
  x.closePath()
}

/** Draws a stand-in of the card face on a 2D canvas: gradient, sheen, watermark, chip and text. */
function paintTexture({ gradient, pan = '', holder = '', expiry = '' }: Placeholder) {
  const c = document.createElement('canvas')
  c.width = TW
  c.height = TH
  const x = c.getContext('2d')
  if (!x) return c
  const { angle, stops } = parseGradient(gradient)
  const rad = (angle * Math.PI) / 180
  const dx = Math.sin(rad)
  const dy = -Math.cos(rad)
  const len = Math.abs(TW * dx) + Math.abs(TH * dy)
  const g = x.createLinearGradient(TW / 2 - (dx * len) / 2, TH / 2 - (dy * len) / 2, TW / 2 + (dx * len) / 2, TH / 2 + (dy * len) / 2)
  stops.forEach((s) => {
    try {
      g.addColorStop(Math.max(0, Math.min(1, s.pos)), s.color)
    } catch {
      /* a colour the canvas cannot read */
    }
  })
  x.fillStyle = g
  x.fillRect(0, 0, TW, TH)
  // Top-right sheen.
  const rg = x.createRadialGradient(TW * 0.82, -80, 0, TW * 0.82, -80, TW * 0.8)
  rg.addColorStop(0, 'rgba(255,255,255,0.22)')
  rg.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = rg
  x.fillRect(0, 0, TW, TH)
  // The Mayar M bleeding past the bottom-right corner.
  if (typeof Path2D !== 'undefined') {
    x.save()
    x.translate(TW - 300, TH - 150)
    x.scale(2.9, 2.9)
    x.fillStyle = 'rgba(255,255,255,0.11)'
    x.fill(new Path2D(M_PATH))
    x.restore()
  }
  // Chip.
  const cg = x.createLinearGradient(64, 132, 176, 214)
  cg.addColorStop(0, themeColor('card-chip-1', 'rgb(246 220 154)'))
  cg.addColorStop(1, themeColor('card-chip-3', 'rgb(184 146 62)'))
  x.fillStyle = cg
  roundRect(x, 64, 132, 112, 82, 10)
  x.fill()
  // Text.
  x.textBaseline = 'alphabetic'
  x.fillStyle = 'rgb(255 255 255)'
  x.font = `500 60px ${MONO}`
  x.fillText(pan, 60, 372)
  x.font = `600 22px ${SANS}`
  x.fillStyle = 'rgba(255,255,255,0.5)'
  x.fillText('PEMEGANG KARTU', 60, 430)
  x.fillText('BERLAKU', 640, 430)
  x.fillStyle = 'rgb(255 255 255)'
  x.font = `600 32px ${SANS}`
  x.fillText(holder, 60, 476)
  x.font = `600 30px ${MONO}`
  x.fillText(expiry, 640, 476)
  // Network: the Mastercard logo of the face (the app draws its mastercard.svg here), 78px high.
  if (typeof Path2D !== 'undefined') {
    const h = 78
    const w = (652 / 408) * h
    x.save()
    x.translate(TW - w - 60, 430)
    x.scale(h / 408, h / 408)
    x.translate(6, 6)
    x.fillStyle = themeColor('card-mc-overlap', 'rgb(255 95 0)')
    x.fill(new Path2D('M224.833 42.298h190.416v311.005H224.833z'))
    x.fillStyle = themeColor('card-mc-red', 'rgb(235 0 27)')
    x.fill(
      new Path2D(
        'M244.446 197.828a197.448 197.448 0 0175.54-155.475 197.777 197.777 0 100 311.004 197.448 197.448 0 01-75.54-155.53z',
      ),
    )
    x.fillStyle = themeColor('card-mc-orange', 'rgb(247 158 27)')
    x.fill(
      new Path2D('M640 197.828a197.777 197.777 0 01-320.015 155.474 197.777 197.777 0 000-311.004A197.777 197.777 0 01640 197.773z'),
    )
    x.restore()
  }
  return c
}

/**
 * Snapshots the real card face, so the art under the ice lines up with the DOM. The effect itself
 * and anything marked `data-freeze-ignore` (status overlays) are left out. On failure it returns the
 * drawn placeholder, so the card is never blank.
 */
async function captureFace(target: HTMLElement | null, placeholder: () => HTMLCanvasElement) {
  if (!target) return placeholder()
  try {
    fontEmbedCss ??= getFontEmbedCSS(target).catch(() => '')
    const fontCss = await fontEmbedCss
    return await toCanvas(target, {
      pixelRatio: 1,
      fontEmbedCSS: fontCss,
      canvasWidth: TW,
      canvasHeight: TH,
      style: { transform: 'none', borderRadius: '0' },
      filter: (node: HTMLElement) =>
        !node.dataset || (node.dataset.slot !== 'card-freeze-effect' && node.dataset.freezeIgnore === undefined),
    })
  } catch {
    return placeholder()
  }
}

/* ── WebGL ───────────────────────────────────────────────────────────────── */

const VERT = 'attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}'
// The fragment shader of the shipped app, unchanged.
const FRAG = `precision highp float;
uniform vec2 u_res;uniform float u_time,u_progress,u_thaw,u_aspect;
uniform sampler2D u_card;
uniform vec4 u_chips[16];uniform int u_chipCount;
uniform vec4 u_webs[16];
uniform vec4 u_shards[24];uniform int u_shardCount;
float hash21(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
vec2 hash22(vec2 p){float n=hash21(p);return vec2(n,hash21(p+n));}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
 return mix(mix(hash21(i),hash21(i+vec2(1.0,0.0)),u.x),mix(hash21(i+vec2(0.0,1.0)),hash21(i+vec2(1.0,1.0)),u.x),u.y);}
float fbm(vec2 p){float v=0.0,a=0.5;mat2 rot=mat2(0.8,-0.6,0.6,0.8);
 for(int i=0;i<5;i++){v+=a*vnoise(p);p=rot*p*2.03;a*=0.5;}return v;}
vec2 voronoi(vec2 p,out vec2 id){vec2 i=floor(p),f=fract(p);float d1=8.0,d2=8.0;id=i;
 for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=hash22(i+g);vec2 r=g+o-f;float d=dot(r,r);
 if(d<d1){d2=d1;d1=d;id=i+g;}else if(d<d2){d2=d;}}}return vec2(sqrt(d1),sqrt(d2)-sqrt(d1));}
float edgeDist(vec2 uv){return min(min(uv.x,1.0-uv.x),min(uv.y,1.0-uv.y));}
vec2 toP(vec2 uv){return vec2(uv.x*u_aspect,uv.y)*3.0;}
float seedField(vec2 uv,vec2 seed,vec2 asp,float prog,float delay,float soft,float nAmp,float nVal,float span){
 float lp=clamp((prog-delay)/span,0.0,1.0);lp=lp*lp*(3.0-2.0*lp);
 float grow=mix(-0.18,1.35,lp);float d=length((uv-seed)*asp);return grow-d*soft-nVal*nAmp;}
vec3 sampleCard(vec2 suv,float blur){
 float bo=clamp(blur,0.0,2.2)*0.006+0.0006;
 vec3 s=texture2D(u_card,suv).rgb;
 s+=texture2D(u_card,suv+vec2(bo,0.0)).rgb+texture2D(u_card,suv-vec2(bo,0.0)).rgb;
 s+=texture2D(u_card,suv+vec2(0.0,bo)).rgb+texture2D(u_card,suv-vec2(0.0,bo)).rgb;
 s+=texture2D(u_card,suv+vec2(bo,bo)).rgb+texture2D(u_card,suv+vec2(-bo,bo)).rgb;
 s+=texture2D(u_card,suv+vec2(bo,-bo)).rgb+texture2D(u_card,suv+vec2(-bo,-bo)).rgb;
 return s*0.1111;}
void main(){
 vec2 uv=vec2(gl_FragCoord.x/u_res.x,gl_FragCoord.y/u_res.y);
 vec2 p=toP(uv);float e=edgeDist(uv);vec2 asp=vec2(u_aspect,1.0);
 float nA=fbm(p*2.6),nB=fbm(p*3.4+9.1),nC=fbm(p*6.0+3.7);
 float prog=clamp(u_progress-u_thaw*1.12,0.0,1.0);
 float fz=-1.0;
 fz=max(fz,seedField(uv,vec2(0.14,0.22),asp,prog,0.00,1.38,0.24,nA,0.90));
 fz=max(fz,seedField(uv,vec2(0.82,0.18),asp,prog,0.04,1.42,0.24,nB,0.90));
 fz=max(fz,seedField(uv,vec2(0.48,0.55),asp,prog,0.07,1.30,0.26,nA,0.90));
 fz=max(fz,seedField(uv,vec2(0.22,0.82),asp,prog,0.03,1.40,0.24,nC,0.90));
 fz=max(fz,seedField(uv,vec2(0.90,0.72),asp,prog,0.09,1.34,0.25,nB,0.90));
 fz=max(fz,seedField(uv,vec2(0.58,0.08),asp,prog,0.05,1.44,0.22,nC,0.90));
 float melt=-1.0;
 if(u_thaw>0.001){
  melt=max(melt,seedField(uv,vec2(0.32,0.38),asp,u_thaw,0.00,0.26,0.16,nB,0.75));
  melt=max(melt,seedField(uv,vec2(0.70,0.48),asp,u_thaw,0.05,0.28,0.18,nA,0.75));
  melt=max(melt,seedField(uv,vec2(0.18,0.62),asp,u_thaw,0.08,0.24,0.17,nC,0.75));
  melt=max(melt,seedField(uv,vec2(0.78,0.28),asp,u_thaw,0.02,0.30,0.15,nA,0.75));
  melt=max(melt,seedField(uv,vec2(0.52,0.88),asp,u_thaw,0.10,0.22,0.18,nB,0.75));
  melt=max(melt,seedField(uv,vec2(0.42,0.14),asp,u_thaw,0.06,0.29,0.16,nC,0.75));
 }
 float cov=fz-max(melt,0.0)*0.35;
 float chipFlash=0.0;
 for(int i=0;i<16;i++){if(i>=u_chipCount)break;vec4 c=u_chips[i];float cd=length((uv-c.xy)*asp);
  if(c.z>=0.004){float jag=c.z-cd-0.02-(nC-0.5)*0.12-(nB-0.5)*0.08;cov=mix(cov,-0.25,smoothstep(-0.025,0.025,jag));
   chipFlash=max(chipFlash,smoothstep(-0.06,0.0,jag)*smoothstep(0.08,0.0,jag)*c.w);}
  chipFlash=max(chipFlash,smoothstep(u_webs[i].w*0.8,0.0,cd)*c.w*0.55);}
 float ridgeA=1.0-abs(2.0*nC-1.0);
 float ridgeB=1.0-abs(2.0*fbm(p*10.0+nA*2.4)-1.0);
 float finger=(pow(ridgeB,3.0)-0.35)*0.075+(ridgeA-0.5)*0.05;
 float film=smoothstep(-0.08,0.13,cov+finger);
 float drain=1.0-0.65*smoothstep(0.0,0.7,u_thaw);
 float setAmt=smoothstep(0.05,0.42,cov)*drain;
 float front=smoothstep(-0.06,0.01,cov+finger)*smoothstep(0.16,0.01,cov);
 float fringe=front*(pow(ridgeB,2.0)*0.85+pow(ridgeA,3.0)*0.5)*(1.0-smoothstep(0.05,0.40,u_thaw));
 if(film<=0.003&&fringe<=0.003&&u_shardCount==0){gl_FragColor=vec4(0.0);return;}
 float wetBand=smoothstep(0.30,0.0,cov)*film*smoothstep(0.02,0.12,u_thaw);
 float body=0.30+0.70*nB;float thick=setAmt*body;float epsn=0.055;
 vec2 slope=vec2(fbm(p*3.4+vec2(epsn,0.0)+9.1)-nB,fbm(p*3.4+vec2(0.0,epsn)+9.1)-nB)/epsn;
 vec2 refr=clamp(slope*0.008,-0.010,0.010)*max(setAmt,max(wetBand,front)*0.45);
 float crack=0.0,crackSpec=0.0;vec2 plateOff=vec2(0.0);
 if(setAmt>0.02){
  vec2 warp=vec2(nA,nB)*1.7;
  vec2 id1;vec2 f1=voronoi(vec2(p.x*2.6,p.y*1.5)*0.55+warp,id1);
  vec2 id2;vec2 f2=voronoi(vec2(p.x*1.6,p.y*2.2)*1.35+warp.yx*1.4,id2);
  float hit=0.0;
  for(int i=0;i<16;i++){if(i>=u_chipCount)break;vec4 wb=u_webs[i];if(wb.z<0.01)continue;
   float hd=length((uv-wb.xy)*asp);float reach=wb.w*wb.z*(0.75+0.6*nA);hit=max(hit,smoothstep(reach,reach*0.15,hd));}
  float keep1=step(hash21(id1+2.2),0.42);float keep2=step(hash21(id2+9.1),0.14);
  float t1=0.52+0.44*hash21(id1);float r1=max(smoothstep(t1,t1+0.14,prog)*keep1,hit)*setAmt;
  float t2=0.60+0.36*hash21(id2+5.3);float r2=max(smoothstep(t2,t2+0.14,prog)*keep2,hit*step(hash21(id2+1.4),0.95))*setAmt;
  float wmod=0.30+1.40*fbm(p*4.5+11.3);wmod*=1.0+hit*0.9;
  float bright1=0.65+0.35*hash21(id1+6.8);float streak1=fbm(p*9.0+hash22(id1)*23.0);
  float core1=smoothstep(0.022*wmod,0.0,f1.y);float halo1=smoothstep(0.14*wmod,0.0,f1.y);
  float seg1=mix(0.35+0.65*smoothstep(0.20,0.80,streak1),1.0,hit*0.6);
  float crack1=(core1*seg1+halo1*halo1*0.40*smoothstep(0.30,0.85,streak1))*r1*bright1;
  float streak2=fbm(p*12.0+hash22(id2)*17.0);
  float crack2=smoothstep(0.038*wmod,0.0,f2.y)*max(smoothstep(0.35,0.85,streak2),hit*0.7)*r2*(0.3+0.6*hash21(id2+3.6));
  crack=max(crack1,crack2)*(1.0+hit*0.6);crackSpec=core1*r1*bright1*(1.0+hit*0.5);
  plateOff=(hash22(id1)-0.5)*0.010*r1;
 }
 float humid=smoothstep(0.42,0.82,fbm(p*1.9+13.1));
 float thawAmt=smoothstep(0.04,0.75,u_thaw);float dropRun=thawAmt*thawAmt*0.22;
 float dropDrift=(hash21(floor(p*8.0))-0.5)*thawAmt*0.03;
 vec2 dp=toP(vec2(uv.x+dropDrift,uv.y+dropRun));
 vec2 dgrid=vec2(20.0,mix(26.0,15.0,thawAmt));vec2 di=floor(dp*dgrid);vec2 df=fract(dp*dgrid)-0.5;
 vec2 dOff=(hash22(di)-0.5)*0.5;float dR=mix(0.09,0.22,hash21(di+4.1))*mix(1.0,1.6,thawAmt);
 float dHit=step(0.50,hash21(di+2.7))*humid;vec2 dvec=(df-dOff)*vec2(1.0,mix(1.0,0.62,thawAmt));
 float dDist=length(dvec);float droplet=smoothstep(dR,dR*0.35,dDist)*dHit*max(film,wetBand);
 vec2 dropDir=dvec/max(dDist,1e-4);refr+=dropDir*droplet*mix(0.010,0.020,thawAmt);
 float dHi=smoothstep(dR*0.55,dR*0.12,length(dvec+vec2(0.06,-0.07)))*droplet;
 float trail=dHit*thawAmt*max(film,wetBand)*smoothstep(dR*0.9,dR*0.3,abs(dvec.x))*smoothstep(0.5,0.05,dvec.y)*step(0.02,dvec.y);
 refr.y+=trail*0.004;
 float fog=smoothstep(0.55,0.9,fbm(p*1.4+21.0))*setAmt*0.07;fog+=wetBand*0.10*humid;
 vec2 suv=clamp(uv+refr+plateOff,0.002,0.998);
 float blur=thick*1.6+wetBand*0.35+front*0.5;
 vec3 base=sampleCard(suv,blur);
 vec3 col=base*mix(vec3(1.0),vec3(0.92,0.965,1.03),setAmt);
 col=mix(col,vec3(0.60,0.74,0.92),thick*0.10);
 float mottle=smoothstep(0.35,0.85,nA);float grain=vnoise(p*30.0);float grain2=vnoise(p*60.0+4.7);
 col=mix(col,vec3(0.86,0.92,1.0),(mottle*0.14+grain*0.06+grain2*0.04)*setAmt);
 float bmask=smoothstep(0.5,0.75,fbm(p*2.3+9.7));
 vec2 bi=floor(p*15.0);vec2 bf=fract(p*15.0)-0.5;
 float bub=smoothstep(mix(0.05,0.13,hash21(bi+3.3)),0.03,length(bf-(hash22(bi)-0.5)*0.7))*step(0.42,hash21(bi+7.7));
 vec2 bi2=floor(p*32.0);vec2 bf2=fract(p*32.0)-0.5;
 float bub2=smoothstep(0.09,0.03,length(bf2-(hash22(bi2)-0.5)*0.7))*step(0.58,hash21(bi2+1.9));
 float bubbles=max(bub,bub2*0.75)*bmask*setAmt;
 col=mix(col,vec3(0.87,0.93,1.0),bubbles*0.32);
 col=mix(col,vec3(0.30,0.46,0.66),smoothstep(0.26,0.0,e)*0.11*setAmt);
 float feather=fbm(p*6.2+nA*1.5);float frost=smoothstep(0.13,0.0,e)*pow(feather,1.7)*setAmt;
 col=mix(col,vec3(0.90,0.95,1.0),frost*0.22);
 col+=vec3(0.92,0.96,1.0)*fringe*0.40;
 col+=vec3(0.90,0.95,1.0)*crack*1.05;
 col+=vec3(0.95,0.98,1.0)*chipFlash*0.9;
 vec3 nrm=normalize(vec3(-slope*(0.35*thick+droplet*0.8),1.0));
 vec3 hv=normalize(vec3(-0.30,0.40,1.75));
 float spec=pow(max(dot(nrm,hv),0.0),60.0);
 col+=spec*(0.10*setAmt+0.45*droplet+0.40*crackSpec)*vec3(0.9,0.95,1.05);
 col=mix(col,col*vec3(0.85,0.88,0.95),droplet*0.5);col+=dHi*0.5;
 col=mix(col,col*vec3(0.72,0.80,0.90),wetBand*0.55);
 col=mix(col,col*vec3(0.80,0.86,0.94),trail*0.35);
 col=mix(col,vec3(0.88,0.94,1.0),fog);
 float sheen=exp(-pow((uv.x+uv.y-1.12)*2.4,2.0))*0.045*setAmt;col+=sheen*vec3(0.85,0.93,1.05);
 vec2 scell=floor(p*40.0);float ss=hash21(scell);float tw=pow(0.5+0.5*sin(u_time*1.8+ss*40.0),16.0);
 float glint=smoothstep(0.985,1.0,ss)*tw*smoothstep(0.5,0.0,length(fract(p*40.0)-0.5))*setAmt;
 col+=vec3(glint)*(0.5+0.5*crack);
 float alpha=film*(0.30+0.55*setAmt)+fringe*0.35+droplet*0.45+trail*0.12+wetBand*0.35+crack*0.15+chipFlash*0.4;
 alpha=clamp(alpha,0.0,1.0);
 float shardM=0.0;
 for(int i=0;i<24;i++){if(i>=u_shardCount)break;vec4 s=u_shards[i];
  float h1=hash21(vec2(s.z,1.7)),h2=hash21(vec2(s.z,4.3)),h3=hash21(vec2(s.z,8.9)),h4=hash21(vec2(s.z,2.6));
  vec2 pos=s.xy+vec2((h1-0.5)*0.5*s.w,(0.10+h2*0.25)*s.w-1.9*s.w*s.w);
  vec2 q=(uv-pos)*asp;float rot=(h3-0.5)*9.0*s.w;float cs=cos(rot),sn=sin(rot);
  q=mat2(cs,-sn,sn,cs)*q;float sz=0.018+0.030*h4;
  float edgeR=sz*(0.62+0.38*hash21(vec2(floor(atan(q.y,q.x)*1.1141)+3.3,s.z)));
  float fade=1.0-smoothstep(0.65,1.05,s.w);shardM=max(shardM,smoothstep(edgeR,edgeR*0.8,length(q))*fade);}
 if(shardM>0.003){vec2 sUv=clamp(uv+vec2(0.006,-0.006),0.002,0.998);
  vec3 sCol=sampleCard(sUv,1.5);sCol=mix(sCol,vec3(0.87,0.93,1.0),0.55);
  sCol+=vec3(0.9,0.95,1.0)*(vnoise(p*34.0)-0.5)*0.18;float sA=shardM*0.92;
  gl_FragColor=vec4(sCol*sA+col*alpha*(1.0-sA),sA+alpha*(1.0-sA));return;}
 gl_FragColor=vec4(col*alpha,alpha);
}`

interface IceFrame {
  progress: number
  thaw: number
  time: number
  chipCount: number
  shardCount: number
  chips: Float32Array
  webs: Float32Array
  shards: Float32Array
}

interface IceGl {
  upload(src: TexImageSource): void
  /** Drawing-buffer size in device px (the canvas must already have it). */
  resize(w: number, h: number): void
  draw(f: IceFrame): void
  /** Frees the GL objects and gives the context back to the browser. */
  destroy(): void
}

const UNIFORMS = [
  'u_res',
  'u_progress',
  'u_thaw',
  'u_time',
  'u_aspect',
  'u_card',
  'u_chipCount',
  'u_shardCount',
  'u_chips',
  'u_webs',
  'u_shards',
] as const

/** Compiles the ice program on a canvas. Returns null when WebGL or the program is not available. */
function createIce(cv: HTMLCanvasElement): IceGl | null {
  let ctx: WebGLRenderingContext | null
  try {
    ctx = (cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true, powerPreference: 'low-power' }) ??
      cv.getContext('experimental-webgl')) as WebGLRenderingContext | null
  } catch {
    ctx = null
  }
  if (!ctx) return null
  const gl = ctx
  const loseContext = () => gl.getExtension('WEBGL_lose_context')?.loseContext()

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)
    if (!sh) return null
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('CardFreezeEffect shader:', gl.getShaderInfoLog(sh))
      return null
    }
    return sh
  }
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  const prog = vs && fs ? gl.createProgram() : null
  if (!vs || !fs || !prog) {
    loseContext()
    return null
  }
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('CardFreezeEffect link:', gl.getProgramInfoLog(prog))
    loseContext()
    return null
  }
  gl.useProgram(prog)

  // One fullscreen triangle.
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  const U = Object.fromEntries(UNIFORMS.map((n) => [n, gl.getUniformLocation(prog, n)])) as Record<
    (typeof UNIFORMS)[number],
    WebGLUniformLocation | null
  >
  gl.uniform1f(U.u_aspect, ASPECT)

  const tex = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.uniform1i(U.u_card, 0)

  return {
    upload(src) {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      // The shader samples at y-up uv (gl_FragCoord); a 2D canvas is y-down. Flip on upload.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
      // NPOT texture: WebGL1 needs CLAMP wrap and no mipmaps, or every sample reads black.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    },
    resize(w, h) {
      gl.viewport(0, 0, w, h)
      gl.uniform2f(U.u_res, w, h)
    },
    draw(f) {
      gl.uniform1f(U.u_progress, f.progress)
      gl.uniform1f(U.u_thaw, f.thaw)
      gl.uniform1f(U.u_time, f.time)
      gl.uniform1i(U.u_chipCount, f.chipCount)
      gl.uniform1i(U.u_shardCount, f.shardCount)
      gl.uniform4fv(U.u_chips, f.chips)
      gl.uniform4fv(U.u_webs, f.webs)
      gl.uniform4fv(U.u_shards, f.shards)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    destroy() {
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
      gl.deleteTexture(tex)
      loseContext()
    },
  }
}

/* Hammer cursor (data-URI SVG). Built on first use: `btoa` is a browser global. */
function hammerCursor(rot: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><g transform="rotate(${rot} 14 26)"><rect x="19" y="14" width="6" height="20" rx="3" fill="rgb(107 63 24)"/><rect x="19" y="14" width="2" height="20" fill="rgb(156 106 51)"/><rect x="6" y="6" width="24" height="12" rx="3" fill="rgb(125 131 141)" stroke="rgb(74 79 88)" stroke-width="1.2"/><rect x="6" y="6" width="24" height="4" rx="2" fill="rgb(167 173 184)"/></g></svg>`
  return `url("data:image/svg+xml;base64,${btoa(svg)}") 14 8, pointer`
}

/* ── The two modes ───────────────────────────────────────────────────────── */

interface Callbacks {
  /** Latest props, read at the moment they are needed. */
  frozen: () => boolean
  renderScale: () => number
  target: () => HTMLElement | null
  placeholder: () => HTMLCanvasElement
  fail: () => void
  ready: () => void
  thawEnd: () => void
  shatter: () => void
}

interface Controller {
  /** Called when `frozen` or `renderScale` changes. */
  sync(frozen: boolean, scale: number): void
  /** A keyboard hit. Returns false when the ice cannot take a hit yet. */
  keyHit(index: number): boolean
  destroy(): void
}

const NO_CHIPS = new Float32Array(16 * 4)
const NO_SHARDS = new Float32Array(24 * 4)

/**
 * Look-only ice (grid tiles). Renders on a short-lived offscreen context, copies the last frame to
 * the visible 2D canvas and releases the context. At most MAX_LIVE_GL of these are live at a time.
 */
function mountLookOnly(cv: HTMLCanvasElement, cb: Callbacks, appear: boolean): Controller {
  const noop: Controller = { sync() {}, keyHit: () => false, destroy() {} }
  const ctx = cv.getContext('2d')
  if (!ctx) {
    cb.fail()
    return noop
  }
  const reduce = prefersReducedMotion()
  const ramp: Ramp = { be: cb.frozen() && !appear ? 1 : 0, xe: 0 }
  let isFrozen = cb.frozen()
  let destroyed = false
  let failed = false
  let face: HTMLCanvasElement | null = null
  let faceStale = true
  let session: { ice: IceGl; glCv: HTMLCanvasElement; release: () => void; onLost: () => void } | null = null
  let starting = false
  let shown = false
  let lastT = 0
  let raf = 0
  let rescaleTimer: ReturnType<typeof setTimeout> | undefined

  const fail = () => {
    if (failed) return
    failed = true
    cb.fail()
  }

  const bufSize = (): [number, number] => {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const s = cb.renderScale() > 0 ? cb.renderScale() : 1
    return [Math.max(1, Math.round(420 * s * dpr)), Math.max(1, Math.round(264 * s * dpr))]
  }

  const end = () => {
    if (!session) return
    const s = session
    session = null
    s.glCv.removeEventListener('webglcontextlost', s.onLost)
    s.ice.destroy()
    s.release()
  }

  // Render until the ice settles, then keep the last frame and free the context.
  const step = () => {
    raf = 0
    const s = session
    if (!s || destroyed) return
    const t = performance.now()
    const dtMs = Math.min(50, t - lastT)
    lastT = t
    stepRamp(ramp, isFrozen, dtMs, reduce)
    const [w, h] = bufSize()
    if (s.glCv.width !== w || s.glCv.height !== h) {
      s.glCv.width = w
      s.glCv.height = h
    }
    if (cv.width !== w || cv.height !== h) {
      cv.width = w
      cv.height = h
    }
    s.ice.resize(w, h)
    s.ice.draw({
      progress: easeOutCubic(ramp.be),
      thaw: thawEase(ramp.xe),
      time: 0,
      chipCount: 0,
      shardCount: 0,
      chips: NO_CHIPS,
      webs: NO_CHIPS,
      shards: NO_SHARDS,
    })
    // Copy in the same task as the draw: the GL buffer is not preserved.
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(s.glCv, 0, 0)
    if (!shown) {
      shown = true
      cb.ready()
    }
    const settled = isFrozen ? ramp.be >= 1 : ramp.be === 0 && ramp.xe === 0
    if (settled) {
      end()
      if (!isFrozen) cb.thawEnd()
    } else raf = requestAnimationFrame(step)
  }

  const ensure = async () => {
    if (session || starting || destroyed || failed) return
    if (!isFrozen && ramp.be === 0 && ramp.xe === 0) {
      ctx.clearRect(0, 0, cv.width, cv.height)
      if (shown) cb.thawEnd()
      return
    }
    starting = true
    // Snapshot before taking a slot, so a slow capture never holds a context another tile waits for.
    if (faceStale || !face) {
      faceStale = false
      if (typeof document !== 'undefined' && document.fonts?.ready) await document.fonts.ready
      face = await captureFace(cb.target(), cb.placeholder)
    }
    if (destroyed) return
    const release = await acquireGlSlot()
    if (destroyed) {
      release()
      starting = false
      return
    }
    const glCv = document.createElement('canvas')
    const [w, h] = bufSize()
    glCv.width = w
    glCv.height = h
    // A context lost at birth makes GL calls throw. Give the slot back on any failure.
    let ice: IceGl | null
    try {
      ice = createIce(glCv)
      ice?.upload(face ?? cb.placeholder())
    } catch {
      ice = null
    }
    starting = false
    if (!ice) {
      release()
      fail()
      return
    }
    // The browser can drop the offscreen context (too many live contexts, a GPU reset).
    const onLost = () => {
      end()
      fail()
    }
    glCv.addEventListener('webglcontextlost', onLost)
    session = { ice, glCv, release, onLost }
    lastT = performance.now()
    raf = requestAnimationFrame(step)
  }

  void ensure()

  let syncFrozen = isFrozen
  let syncScale = cb.renderScale()
  return {
    sync(nextFrozen, nextScale) {
      if (nextFrozen !== syncFrozen) {
        syncFrozen = nextFrozen
        isFrozen = nextFrozen
        // A new freeze takes a new snapshot (the number or the holder may have changed).
        if (nextFrozen) faceStale = true
        if (session && !raf) raf = requestAnimationFrame(step)
        void ensure()
      }
      if (nextScale !== syncScale) {
        syncScale = nextScale
        clearTimeout(rescaleTimer)
        rescaleTimer = setTimeout(() => void ensure(), 150)
      }
    },
    keyHit: () => false,
    destroy() {
      destroyed = true
      clearTimeout(rescaleTimer)
      if (raf) cancelAnimationFrame(raf)
      end()
    },
  }
}

interface Impact {
  x: number
  y: number
  r: number
  target: number
  crack: number
  crackTarget: number
  crackR: number
  flashAt: number
}

interface Shard {
  x: number
  y: number
  seed: number
  born: number
}

/** Interactive ice (Detail Kartu hero): a live context, the hammer, cracks, shards and the collapse. */
function mountInteractive(cv: HTMLCanvasElement, cb: Callbacks, appear: boolean): Controller {
  const noop: Controller = { sync() {}, keyHit: () => false, destroy() {} }
  const reduce = prefersReducedMotion()
  let ice: IceGl | null
  try {
    ice = createIce(cv)
  } catch {
    ice = null
  }
  if (!ice) {
    cb.fail()
    return noop
  }
  const gl = ice
  let failed = false
  let destroyed = false
  let ready = false
  let visible = true
  let raf = 0
  let cursorTimer: ReturnType<typeof setTimeout> | undefined

  const CUR = hammerCursor(0)
  const CUR_HIT = hammerCursor(26)

  // The browser can drop the context (too many live contexts, a GPU reset): show the CSS frost.
  const onLost = () => {
    failed = true
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    cb.fail()
  }
  cv.addEventListener('webglcontextlost', onLost)

  // A slow, older snapshot cannot overwrite a newer one.
  let texGen = 0
  const refreshTexture = () => {
    const gen = ++texGen
    void captureFace(cb.target(), cb.placeholder).then((snap) => {
      if (gen !== texGen || destroyed || failed) return
      try {
        gl.upload(snap)
      } catch {
        return
      }
      if (!ready) {
        ready = true
        cv.dataset.ready = ''
        cb.ready()
      }
      kick()
    })
  }
  gl.upload(cb.placeholder())
  refreshTexture()
  // Take the snapshot again once webfonts settle, so it has the real type.
  if (typeof document !== 'undefined' && document.fonts && document.fonts.status !== 'loaded') {
    void document.fonts.ready.then(() => !destroyed && refreshTexture())
  }

  // The drawing buffer follows the layout box of the effect (clientWidth, not affected by transforms).
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const resize = () => {
    const host = cv.parentElement
    const w = host?.clientWidth || cv.clientWidth || 420
    const h = host?.clientHeight || cv.clientHeight || 264
    const bw = Math.max(1, Math.round(w * dpr))
    const bh = Math.max(1, Math.round(h * dpr))
    if (cv.width !== bw || cv.height !== bh) {
      cv.width = bw
      cv.height = bh
    }
    gl.resize(cv.width, cv.height)
  }
  resize()
  const ro =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          resize()
          kick()
        })
      : null
  ro?.observe(cv)
  // Code-only: stop drawing while the card is off screen.
  const io =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => {
          visible = entries.some((e) => e.isIntersecting)
          if (visible) kick()
        })
      : null
  io?.observe(cv)

  // ── Model ──
  const ramp: Ramp = { be: cb.frozen() && !appear ? 1 : 0, xe: 0 }
  let isFrozen = cb.frozen()
  let collapsing = false
  let cascadeSteps = 0
  let nextCascade = 0
  let running = false
  let lastT = 0
  let tSec = 0
  let impacts: Impact[] = []
  let shards: Shard[] = []
  let shattered = false
  const chipBuf = new Float32Array(16 * 4)
  const webBuf = new Float32Array(16 * 4)
  const shardBuf = new Float32Array(24 * 4)

  const nowMs = () => performance.now()
  const kick = () => {
    if (running || !ready || failed || destroyed || !visible) return
    running = true
    lastT = nowMs()
    raf = requestAnimationFrame(frame)
  }

  const adist = (ax: number, ay: number, bx: number, by: number) => {
    const dx = (ax - bx) * ASPECT
    const dy = ay - by
    return Math.sqrt(dx * dx + dy * dy)
  }
  const nearest = (x: number, y: number) => {
    let bi = -1
    let bd = 1e9
    for (let i = 0; i < impacts.length; i++) {
      const im = impacts[i]!
      const d = adist(x, y, im.x, im.y)
      if (d < bd) {
        bd = d
        bi = i
      }
    }
    return { i: bi, d: bd }
  }
  const spawnShards = (x: number, y: number, n: number) => {
    for (let k = 0; k < n; k++) {
      shards.push({ x: x + (Math.random() - 0.5) * 0.04, y: y + (Math.random() - 0.5) * 0.04, seed: Math.random() * 100, born: nowMs() })
      if (shards.length > 24) shards.shift()
    }
  }
  const nudge = (im: Impact, x: number, y: number) => {
    im.x += (x - im.x) * 0.32
    im.y += (y - im.y) * 0.32
  }
  const fireShatter = () => {
    if (shattered) return
    shattered = true
    cb.shatter()
  }
  const startCollapse = (t: number) => {
    if (reduce) {
      // Reduced motion: no cascade of falling plates, the ice breaks at once.
      fireShatter()
      return
    }
    collapsing = true
    cascadeSteps = 0
    nextCascade = t + 180
  }
  const blow = (x: number, y: number) => {
    if (!isFrozen || collapsing || shattered || ramp.be < 0.6) return false
    cv.style.cursor = CUR_HIT
    clearTimeout(cursorTimer)
    cursorTimer = setTimeout(() => {
      if (isFrozen && !collapsing) cv.style.cursor = CUR
    }, 140)
    const nr = nearest(x, y)
    const im = nr.i >= 0 ? impacts[nr.i]! : null
    if (im && im.target === 0 && nr.d < Math.max(0.05, im.crackR * 0.75)) {
      im.target = Math.min(0.34, im.crackR * 0.9)
      im.crackR = Math.min(0.55, im.crackR * 1.35)
      im.flashAt = nowMs()
      nudge(im, x, y)
      spawnShards(x, y, 6)
    } else if (im && im.target > 0 && nr.d < im.target + 0.05) {
      im.target = Math.min(0.4, im.target + 0.06)
      im.crackR = Math.min(0.55, im.crackR + 0.07)
      im.flashAt = nowMs()
      nudge(im, x, y)
      spawnShards(x, y, 3)
    } else if (impacts.length < 16) {
      impacts.push({ x, y, r: 0, target: 0, crack: 0, crackTarget: 1, crackR: 0.22 + Math.random() * 0.1, flashAt: nowMs() })
    } else if (im) {
      im.target = Math.min(0.4, im.target + 0.06)
      im.crackR = Math.min(0.55, im.crackR + 0.07)
      im.flashAt = nowMs()
      nudge(im, x, y)
    }
    kick()
    return true
  }

  const localUV = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height }
  }
  let down = false
  let lastBlow = { x: 0, y: 0 }
  const onDown = (e: PointerEvent) => {
    if (!isFrozen || collapsing) return
    e.preventDefault()
    down = true
    try {
      cv.setPointerCapture(e.pointerId)
    } catch {
      /* no capture */
    }
    const p = localUV(e)
    lastBlow = p
    blow(p.x, p.y)
  }
  const onMove = (e: PointerEvent) => {
    if (!down || !isFrozen || collapsing) return
    const p = localUV(e)
    if (adist(p.x, p.y, lastBlow.x, lastBlow.y) > 0.09) {
      lastBlow = p
      blow(p.x, p.y)
    }
  }
  const onUp = (e: PointerEvent) => {
    down = false
    try {
      cv.releasePointerCapture(e.pointerId)
    } catch {
      /* no capture */
    }
  }
  cv.addEventListener('pointerdown', onDown)
  cv.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)

  // ── Collapse cascade ──
  const brokenFraction = () => {
    let total = 0
    let broken = 0
    for (let gy = 0; gy < 10; gy++) {
      for (let gx = 0; gx < 16; gx++) {
        total++
        const x = (gx + 0.5) / 16
        const y = (gy + 0.5) / 10
        for (const im of impacts) {
          if (im.target > 0 && adist(x, y, im.x, im.y) < im.target * 0.95) {
            broken++
            break
          }
        }
      }
    }
    return total ? broken / total : 0
  }
  const cascadeStep = () => {
    let bx = 0
    let by = 0
    let found = false
    let best = 1e9
    for (let gy = 0; gy < 10; gy++) {
      for (let gx = 0; gx < 16; gx++) {
        const x = (gx + 0.5) / 16 + (Math.random() - 0.5) * 0.03
        const y = (gy + 0.5) / 10 + (Math.random() - 0.5) * 0.03
        let icy = true
        let minRim = 1e9
        for (const im of impacts) {
          if (im.target > 0) {
            const d = adist(x, y, im.x, im.y)
            if (d < im.target * 0.95) {
              icy = false
              break
            }
            minRim = Math.min(minRim, d - im.target)
          }
        }
        if (icy && minRim < best) {
          best = minRim
          bx = x
          by = y
          found = true
        }
      }
    }
    if (!found) {
      collapsing = false
      fireShatter()
      return
    }
    const nr = nearest(bx, by)
    const im = nr.i >= 0 ? impacts[nr.i]! : null
    if (im && (nr.d < im.target + 0.08 || impacts.length >= 16)) {
      im.x += (bx - im.x) * 0.2
      im.y += (by - im.y) * 0.2
      im.target = Math.min(0.8, Math.max(im.target + 0.07, nr.d * 0.95))
      im.crackR = Math.min(0.6, im.crackR + 0.08)
    } else {
      impacts.push({ x: bx, y: by, r: 0, target: 0.13 + Math.random() * 0.08, crack: 0, crackTarget: 1, crackR: 0.24 + Math.random() * 0.1, flashAt: 0 })
    }
    spawnShards(bx, by, 2 + Math.floor(Math.random() * 3))
    cascadeSteps++
    if (cascadeSteps > 32) {
      collapsing = false
      fireShatter()
    }
  }

  let thawPending = false
  function frame() {
    raf = 0
    if (failed || destroyed || !visible) {
      running = false
      return
    }
    const t = nowMs()
    const dtMs = Math.min(50, t - lastT)
    const dt = dtMs / 1000
    lastT = t
    if (!reduce) tSec += dt
    // Freeze and thaw follow isFrozen alone, as linear time ramps.
    if (stepRamp(ramp, isFrozen, dtMs, reduce) && !reduce) {
      impacts = []
      shards = []
    }
    for (let i = impacts.length - 1; i >= 0; i--) {
      const im = impacts[i]!
      const tauH = im.target > 0 ? 0.07 : 0.7
      im.r += (im.target - im.r) * (1 - Math.exp(-dt / tauH))
      const tauC = im.crackTarget > 0 ? 0.14 : 0.7
      im.crack += (im.crackTarget - im.crack) * (1 - Math.exp(-dt / tauC))
      if (im.target === 0 && im.crackTarget === 0 && im.r < 0.002 && im.crack < 0.01) impacts.splice(i, 1)
    }
    for (let s = shards.length - 1; s >= 0; s--) if ((t - shards[s]!.born) / 1000 > 1.05) shards.splice(s, 1)

    if (isFrozen && !collapsing && !shattered && ramp.be > 0.9 && brokenFraction() >= 0.7) startCollapse(t)
    if (collapsing && t >= nextCascade) {
      cascadeStep()
      nextCascade = t + 90 + Math.random() * 130
    }

    const nC = Math.min(16, impacts.length)
    for (let k = 0; k < 16; k++) {
      const b = k * 4
      const m = k < nC ? impacts[k]! : null
      chipBuf[b] = m?.x ?? 0
      chipBuf[b + 1] = m?.y ?? 0
      chipBuf[b + 2] = m?.r ?? 0
      chipBuf[b + 3] = m ? Math.max(0, 1 - (t - m.flashAt) / 260) : 0
      webBuf[b] = m?.x ?? 0
      webBuf[b + 1] = m?.y ?? 0
      webBuf[b + 2] = m?.crack ?? 0
      webBuf[b + 3] = m?.crackR ?? 0
    }
    const nS = Math.min(24, shards.length)
    for (let j = 0; j < 24; j++) {
      const bb = j * 4
      const sh = j < nS ? shards[j]! : null
      shardBuf[bb] = sh?.x ?? 0
      shardBuf[bb + 1] = sh?.y ?? 0
      shardBuf[bb + 2] = sh?.seed ?? 0
      shardBuf[bb + 3] = sh ? (t - sh.born) / 1000 : 0
    }

    gl.draw({
      progress: easeOutCubic(ramp.be),
      thaw: thawEase(ramp.xe),
      time: tSec,
      chipCount: nC,
      shardCount: nS,
      chips: chipBuf,
      webs: webBuf,
      shards: shardBuf,
    })

    const busy = ramp.xe > 0 || impacts.length > 0 || shards.length > 0 || collapsing
    // The idle ice twinkles (u_time). Reduced motion draws it once and stops.
    const animating = isFrozen ? !reduce || ramp.be < 1 || busy : ramp.be > 0 || busy
    if (animating) raf = requestAnimationFrame(frame)
    else {
      running = false
      if (!isFrozen && thawPending) {
        thawPending = false
        cb.thawEnd()
      }
    }
  }

  if (isFrozen) cv.style.cursor = CUR

  let sync = isFrozen
  return {
    sync(nextFrozen) {
      if (nextFrozen === sync) return
      sync = nextFrozen
      if (nextFrozen) {
        // The loop resumes the freeze ramp (inverting any thaw in flight).
        isFrozen = true
        shattered = false
        collapsing = false
        thawPending = false
        refreshTexture()
        cv.style.cursor = CUR
      } else {
        // The loop starts the thaw (joining at the current coverage) and heals the holes.
        isFrozen = false
        collapsing = false
        thawPending = true
        impacts.forEach((im) => {
          im.target = 0
          im.crackTarget = 0
        })
        cv.style.cursor = ''
      }
      kick()
    },
    keyHit(index) {
      const [x, y] = KEY_SPOTS[index % KEY_SPOTS.length]!
      // A keyboard hit is a full blow: the first strike cracks, the second knocks the plate out.
      if (!blow(x, y)) return false
      blow(x, y)
      if (index + 1 >= KEY_HITS && !collapsing) startCollapse(nowMs())
      return true
    },
    destroy() {
      destroyed = true
      texGen++
      if (raf) cancelAnimationFrame(raf)
      clearTimeout(cursorTimer)
      cv.removeEventListener('webglcontextlost', onLost)
      cv.removeEventListener('pointerdown', onDown)
      cv.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      ro?.disconnect()
      io?.disconnect()
      gl.destroy()
    },
  }
}

/* ── Component ───────────────────────────────────────────────────────────── */

interface CardFreezeEffectProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** The card is frozen. A change plays the freeze or the thaw. */
  frozen: boolean
  /**
   * `true` (default, the Detail Kartu hero): a live WebGL ice sheet with the hammer cursor, cracks,
   * shards, a keyboard path and `onShatter`. `false` (grid tiles): the same ice, look only. The
   * pointer passes through, and the ice renders on a short-lived context that is released after it
   * settles (at most 4 live at a time on the page). Set it once; a change remounts the effect.
   */
  interactive?: boolean
  /** Play the freeze when the effect mounts frozen. Off: a frozen mount shows the ice at once. */
  appear?: boolean
  /** Displayed size as a fraction of the 420×264 face. The look-only bitmap is sized from it. Default 1. */
  renderScale?: number
  /** The element to snapshot as the texture under the ice. Default: the parent element of the effect. */
  targetRef?: React.RefObject<HTMLElement | null>
  /** CSS background of the card, for the placeholder texture. Default: the computed background of the target. */
  gradient?: string
  /** Card number line as shown, for the placeholder texture. */
  pan?: string
  /** Holder line, for the placeholder texture. */
  holder?: string
  /** BERLAKU value, for the placeholder texture. */
  expiry?: string
  /** Name of the keyboard control that hits the ice. Default "Pecahkan es untuk membuka kartu". */
  hitLabel?: string
  /** Called once the ice has fully broken. Set the card active here. */
  onShatter?: () => void
  /** Called when WebGL cannot run (no context, shader error, context lost). Show a CSS frost then. */
  onFail?: () => void
  /** Called when the first frame with the card snapshot is on screen. */
  onReady?: () => void
  /** Called when a thaw has finished and no ice is left. */
  onThawEnd?: () => void
}

/**
 * A WebGL ice sheet over the Mayar card that refracts a snapshot of the face and, in the
 * interactive mode, can be broken with a hammer to unfreeze the card.
 *
 * Put it inside a positioned card (it fills it with `absolute inset-0` and takes its corner radius).
 * Without WebGL it calls `onFail` and draws nothing, so the host can show a CSS frost. Keyboard:
 * the interactive mode has a focusable control; Enter or Space is one hit, and three hits break the ice.
 */
function CardFreezeEffect({
  frozen,
  interactive = true,
  appear = false,
  renderScale = 1,
  targetRef,
  gradient,
  pan,
  holder,
  expiry,
  hitLabel = 'Pecahkan es untuk membuka kartu',
  onShatter,
  onFail,
  onReady,
  onThawEnd,
  className,
  ref,
  ...props
}: CardFreezeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controllerRef = useRef<Controller | null>(null)
  const failedRef = useRef(false)
  const shatteredRef = useRef(false)
  const hitsRef = useRef(0)
  const [message, setMessage] = useState('')

  // Latest props for the imperative loop, without restarting it.
  const latest = useRef({ frozen, renderScale, targetRef, gradient, pan, holder, expiry, appear })
  useEffect(() => {
    latest.current = { frozen, renderScale, targetRef, gradient, pan, holder, expiry, appear }
  })

  function breakIce() {
    if (shatteredRef.current) return
    shatteredRef.current = true
    setMessage('Es pecah.')
    onShatter?.()
  }
  const fireShatter = useEffectEvent(breakIce)
  const fireFail = useEffectEvent(() => {
    failedRef.current = true
    const cv = canvasRef.current
    if (cv) cv.hidden = true
    onFail?.()
  })
  const fireReady = useEffectEvent(() => onReady?.())
  const fireThawEnd = useEffectEvent(() => onThawEnd?.())

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    failedRef.current = false
    cv.hidden = false
    const target = () => latest.current.targetRef?.current ?? cv.parentElement?.parentElement ?? null
    const callbacks: Callbacks = {
      frozen: () => latest.current.frozen,
      renderScale: () => latest.current.renderScale,
      target,
      placeholder: () => {
        const { gradient: g, pan: p, holder: h, expiry: e } = latest.current
        const el = target()
        const computed = el && typeof getComputedStyle === 'function' ? getComputedStyle(el).backgroundImage : undefined
        return paintTexture({ gradient: g ?? computed, pan: p, holder: h, expiry: e })
      },
      fail: fireFail,
      ready: fireReady,
      thawEnd: fireThawEnd,
      shatter: fireShatter,
    }
    const controller = interactive
      ? mountInteractive(cv, callbacks, latest.current.appear)
      : mountLookOnly(cv, callbacks, latest.current.appear)
    controllerRef.current = controller
    return () => {
      controllerRef.current = null
      controller.destroy()
    }
  }, [interactive])

  useEffect(() => {
    controllerRef.current?.sync(frozen, renderScale)
  }, [frozen, renderScale])

  // A new freeze starts the hit count again.
  const [lastFrozen, setLastFrozen] = useState(frozen)
  if (lastFrozen !== frozen) {
    setLastFrozen(frozen)
    if (frozen) setMessage('')
  }
  useEffect(() => {
    if (!frozen) return
    hitsRef.current = 0
    shatteredRef.current = false
  }, [frozen])

  const hit = () => {
    if (!frozen || shatteredRef.current) return
    const index = hitsRef.current
    const live = controllerRef.current && !failedRef.current
    // With WebGL the hit lands on the ice; without it, the count alone breaks the ice.
    if (live && !controllerRef.current!.keyHit(index)) {
      setMessage('Es belum membeku penuh. Coba lagi.')
      return
    }
    hitsRef.current = index + 1
    const left = KEY_HITS - hitsRef.current
    if (left > 0) setMessage(`Es retak. ${left} pukulan lagi.`)
    else if (live) setMessage('Es pecah.')
    else breakIce()
  }

  const breakable = interactive && frozen

  return (
    <div
      ref={ref}
      data-slot="card-freeze-effect"
      data-interactive={interactive ? '' : undefined}
      {...props}
      className={cn('pointer-events-none absolute inset-0 z-20 overflow-clip rounded-[inherit]', className)}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        data-slot="card-freeze-canvas"
        className={cn(
          'absolute inset-0 size-full rounded-[inherit] select-none',
          // Hidden until the snapshot is on the ice; `invisible` also keeps the pointer off it.
          interactive && 'invisible data-ready:visible',
          breakable ? 'pointer-events-auto touch-none' : 'pointer-events-none',
        )}
      />
      {breakable ? (
        <button
          type="button"
          aria-label={hitLabel}
          data-slot="card-freeze-hit"
          onClick={hit}
          // Keyboard and assistive tech only: the pointer hits the canvas under it.
          className="pointer-events-none absolute inset-0 rounded-[inherit] outline-none focus-ring:outline-focus focus-ring:outline-2 focus-ring:-outline-offset-4"
        />
      ) : null}
      {interactive ? (
        <span role="status" className="sr-only">
          {message}
        </span>
      ) : null}
    </div>
  )
}

export { CardFreezeEffect, type CardFreezeEffectProps }
