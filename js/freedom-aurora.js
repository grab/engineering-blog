(function () {
  'use strict';

  var VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

  var FRAGMENT_SHADER = `precision highp float;

uniform float u_time;         
uniform vec2  u_resolution;   
uniform vec2  u_mouse;        

uniform float u_speed;          
uniform float u_intensity;      
uniform float u_bands;          
uniform float u_lineWidthPx;    
uniform float u_gapPx;          
uniform float u_strokeOffset;   
uniform float u_innerScale;     
uniform float u_innerOpacity;   
uniform float u_disconnect;     
uniform float u_bloom;          
uniform float u_sparkIntensity; 
uniform float u_veil;           
uniform float u_rays;           
uniform float u_warp;           
uniform float u_palette;        
uniform float u_parallax;       
uniform float u_curtainX;       
uniform float u_curtainY;       
uniform float u_vignette;       
uniform float u_exposure;       
uniform float u_grain;          

const int MAX_BANDS = 4;

const vec3 GREEN_50  = vec3(0.701, 0.974, 0.738); 
const vec3 GREEN_100 = vec3(0.448, 0.828, 0.499); 
const vec3 GREEN_400 = vec3(0.000, 0.448, 0.076); 
const vec3 GREEN_500 = vec3(0.000, 0.220, 0.066); 
const vec3 GREEN_700 = vec3(0.000, 0.084, 0.037); 
const vec3 DUX_50    = vec3(0.859, 0.965, 0.965); 
const vec3 DUX_100   = vec3(0.405, 0.828, 0.797); 
const vec3 DUX_400   = vec3(0.005, 0.471, 0.389); 
const vec3 DUX_500   = vec3(0.009, 0.302, 0.259); 
const vec3 DUX_700   = vec3(0.006, 0.055, 0.048); 
const vec3 LIME_100  = vec3(0.658, 0.875, 0.032); 
const vec3 BG_GREEN  = vec3(0.000, 0.084, 0.024); 
const vec3 BG_TEAL   = vec3(0.000, 0.023, 0.016); 
const vec3 BG_NIGHT  = vec3(0.001, 0.007, 0.013); 

float dflt(float v, float d) { return mix(d, max(v, 0.0), step(1e-4, abs(v))); }

float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);        
}

float fbm2(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 2; i++) {
        s += a * vnoise(p);
        p  = p * 2.03 + vec2(11.7, 5.3);
        a *= 0.5;
    }
    return s * 2.6666667 - 1.0;
}

float vnoise1(float x, float seed) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash21(vec2(i, seed)), hash21(vec2(i + 1.0, seed)), u);
}

float freedomBreak(float x, float t, float seed, float amount) {
    float n   = vnoise1(x * 2.2 + t * 0.12 + seed, seed * 1.7 + 4.0);
    float thr = mix(-0.25, 0.80, clamp(amount, 0.0, 1.0));
    return smoothstep(thr, thr + 0.10, n);                  
}

float curveY(float x, float t, float seed, float amp, float warp, out float slope) {
    float a1 = 1.70 * x + t * 0.23 + seed;
    float a2 = 3.10 * x - t * 0.17 + seed * 1.7;
    float a3 = 5.90 * x + t * 0.11 + seed * 2.9;

    float y  = 0.50 * sin(a1) + 0.26 * sin(a2) + 0.12 * sin(a3);
    float dy = 0.50 * 1.70 * cos(a1) + 0.26 * 3.10 * cos(a2) + 0.12 * 5.90 * cos(a3);

    
    float b1 = 1.07 * x - t * 0.15 + seed * 0.7;
    float b2 = 2.31 * x + t * 0.09 + seed * 2.1;
    float sw  = 0.55 * sin(b1) + 0.30 * sin(b2);
    float dsw = 0.55 * 1.07 * cos(b1) + 0.30 * 2.31 * cos(b2);

    float xw  = x * 0.80 + warp * 1.25 * sw;                
    float dxw = 0.80     + warp * 1.25 * dsw;

    const float EPS = 0.045;
    vec2  q  = vec2(xw + seed * 4.0, t * 0.07 + seed * 2.0);
    float n0 = fbm2(q);
    float n1 = fbm2(q + vec2(EPS, 0.0));
    y  += 0.55 * n0;
    dy += 0.55 * (n1 - n0) / EPS * dxw;                     

    slope = amp * dy;
    return amp * y;
}

void main() {

    
    vec2  res = max(u_resolution, vec2(1.0, 1.0));
    float pxu = 1.0 / res.y;                                
    vec2  uv  = (gl_FragCoord.xy - 0.5 * res) * pxu;        
    float aspect = res.x / res.y;

    float speed      = dflt(u_speed,        1.00);
    float intensity  = dflt(u_intensity,    1.00);
    float bandCount  = clamp(dflt(u_bands,  3.00), 1.0, float(MAX_BANDS));
    float lineWpx    = max(dflt(u_lineWidthPx,  2.20), 0.60);
    float gapPx      = max(dflt(u_gapPx,       10.00), 2.00);
    float strokeOff  = max(dflt(u_strokeOffset, 0.075), 0.015);
    float innerScale = clamp(dflt(u_innerScale,   0.62), 0.15, 0.95);
    float innerOp    = clamp(dflt(u_innerOpacity, 0.60), 0.0, 1.0);
    float disconnect = clamp(dflt(u_disconnect,   0.55), 0.0, 1.0);
    float bloomAmt   = dflt(u_bloom,        1.00);
    float sparkAmt   = dflt(u_sparkIntensity, 0.70);
    float veilAmt    = dflt(u_veil,         1.00);
    float rayAmt     = clamp(dflt(u_rays,   1.00), 0.0, 1.5);
    float warpAmt    = dflt(u_warp,         1.00);
    float palette    = clamp(dflt(u_palette, 0.35), 0.0, 1.0);
    float parallax   = dflt(u_parallax,     0.05);
    float cx         = u_curtainX;                          
    float cy         = u_curtainY;
    float vigAmt     = clamp(dflt(u_vignette, 0.55), 0.0, 1.0);
    float exposure   = max(dflt(u_exposure,  1.00), 0.05);
    float grainAmt   = dflt(u_grain,        0.60);

    
    float t  = mod(u_time, 86400.0) * speed;
    vec2  mo = clamp(u_mouse, 0.0, 1.0) - 0.5;
    float localX = uv.x - cx;                               

    
    float lw   = max(lineWpx * pxu, 1.05 * pxu);
    float hRaw = 0.5 * gapPx * pxu;

    
    float rn = vnoise(vec2(localX * 1.7 - t * 0.05, uv.y * 0.9 + t * 0.03));

    
    float rayF = 0.62 + 0.22 * sin(localX * 27.0 + rn * 5.0 + t * 0.55)
                      + 0.16 * sin(localX * 13.0 - t * 0.31 + rn * 3.0);
    float rays = mix(1.0, rayF, rayAmt);

    
    float sky = clamp(uv.y * 0.90 + 0.5, 0.0, 1.0);
    float hz  = 1.0 - sky;  hz = hz * hz; hz = hz * hz;     
    vec3  col = BG_NIGHT;
    col = mix(col, BG_TEAL,   1.0 - smoothstep(0.00, 0.62, sky));
    col = mix(col, BG_GREEN,  0.26 * hz);
    
    col = mix(col, vec3(0.0), 0.66 + 0.30 * smoothstep(0.45, 1.00, sky));

    
    for (int i = 0; i < MAX_BANDS; i++) {
        float fi = float(i);
        if (fi < bandCount) {

            
            float depth = fi / max(bandCount - 1.0, 1.0);
            depth = mix(1.0, depth, step(1.5, bandCount));
            float seed = fi * 7.31 + 1.7;
            float dim  = mix(0.35, 1.00, depth);            
            float sc   = mix(0.72, 1.15, depth);            

            
            float dir   = mix(-1.0, 1.0, step(0.5, fract(seed * 0.61)));
            float kx    = mix(1.30, 0.85, depth);

            
            float bxs   = localX * kx + mo.x * parallax * mix(0.6, 2.2, depth);
            float drift = 0.42 * sin(t * 0.037 + seed * 2.3) * dir;
            float bx    = bxs + drift;

            
            float tailEnd  = aspect * 0.31 + (fract(seed * 0.37) - 0.5) * 0.08;
            float tailMask = 1.0 - smoothstep(tailEnd - 0.018, tailEnd + 0.055, localX);
            float sweepLen = max(aspect * 1.05 + 0.35, 0.90);
            float sweep    = fract(t * mix(0.075, 0.095, depth) + seed * 0.173);
            float headX    = tailEnd - sweep * sweepLen;
            float behind   = localX - headX;
            float tailLen  = max(tailEnd - headX, 0.001);
            float tailBody = smoothstep(-0.010, 0.042, behind)
                           * (1.0 - smoothstep(tailLen * 0.22, tailLen, behind));
            float rayHead  = 1.0 - smoothstep(0.0, 0.065, abs(behind));
            float rayTrail = tailMask * (0.42 * tailBody + 1.10 * rayHead);
            float trailGlow = rayTrail * (0.25 + 0.90 * bloomAmt);
            float trailEnergy = 1.0 + rayTrail;

            float baseY = cy + mix(0.15, -0.11, depth)
                        + mo.y * parallax * mix(0.5, 2.0, depth);
            float amp   = mix(0.055, 0.135, depth);
            float tilt  = (fract(seed * 0.37) - 0.5) * 0.34;

            float slope;
            float yc = baseY + tilt * bxs
                     + curveY(bx, t * mix(0.80, 1.25, depth), seed, amp, warpAmt, slope);
            slope = (slope + tilt) * kx;                    

            
            float dp    = (uv.y - yc) * inversesqrt(1.0 + slope * slope);
            float ad    = abs(dp);
            float above = step(0.0, dp);                    

            
            float W  = strokeOff * sc;
            
            float hmin = lw * 1.45;                          
            float hmax = max(W * 0.42, hmin);                
            float h  = clamp(hRaw, hmin, hmax);
            float e  = ad - W;
            float ae = abs(e);
            float dPair = abs(ae - h);

            
            float pairPx = 2.0 * h * res.y;
            float minPx  = 2.0 * lineWpx + 2.5;
            float legible = smoothstep(minPx * 0.65, minPx * 1.25, pairPx);
            float crowd   = 1.0 - legible;

            float pairInk  = (1.0 - smoothstep(lw * 0.55, lw * 1.70, dPair)) * legible;
            float pairCore = (1.0 - smoothstep(lw * 0.10, lw * 0.85, dPair)) * legible;

            
            float ns = 1.0 - smoothstep(h * 0.20, h * 0.92, ae);

            
            float brkTop = freedomBreak(bx,        t, seed,        disconnect);
            float brkBot = freedomBreak(bx,        t, seed + 11.3, disconnect);
            float brkOut = mix(brkBot, brkTop, above);
            float brkIn  = mix(freedomBreak(bx * 1.27, t, seed + 23.9, disconnect * 0.85),
                               brkOut, 0.45);
            pairInk  *= brkOut * tailMask;
            pairCore *= brkOut * tailMask;

            
            float lifeX = 0.04 + 0.96 * smoothstep(0.26, 0.72,
                              vnoise1(bx * 1.50 + t * 0.06 + seed, seed));
            
            float dyb   = uv.y - baseY;
            float fade  = (1.0 - smoothstep(0.22, 0.80, -dyb))
                        * (1.0 - smoothstep(0.34, 1.05,  dyb));
            float lit   = clamp(lifeX * fade * tailMask, 0.0, 1.0);
            float vis   = lit * intensity * mix(0.60, 1.0, depth);

            
            
            float upf = smoothstep(-0.05, 0.12, dp);

            float bw = max(h * 0.85, lw * 2.5);             
            float bv = 0.075 * sc * (0.55 + 0.75 * bloomAmt)
                     * mix(0.55, 1.40, upf);                
            float hc = (bw * bw) / (dPair * dPair + bw * bw);
            float hv = (bv * bv) / (ae * ae + bv * bv);
            float halo = hc * hc * 0.90 + hv * hv * 0.55 * bloomAmt;
            halo *= mix(1.0, brkOut, 0.55);                 
            halo *= mix(1.0, rays, 0.55);                   
            
            halo *= (1.0 - 0.90 * ns) * tailMask;

            
            float sb = max((W - h) * 0.62, 0.002);
            float sq = (sb * sb) / (dp * dp + sb * sb);
            float subject = sq * sq * sq;
            float bwide   = 0.11 * sc * mix(0.40, 1.80, upf);
            float wide    = (bwide * bwide) / (dp * dp + bwide * bwide);
            wide *= mix(0.28, 1.00, upf);

            
            float hue = clamp(palette + (0.5 - depth) * 0.26, 0.0, 1.0);
            
            vec3  cLine = mix(mix(GREEN_100, DUX_100, hue),
                              mix(GREEN_400, DUX_400, hue), 0.26);
            vec3  cSubj = mix(GREEN_400, DUX_400, hue);
            vec3  cHalo = mix(GREEN_500, DUX_500, hue);
            vec3  cWM   = mix(GREEN_700, DUX_700, hue);
            vec3  cSpark = mix(GREEN_400, GREEN_100, 0.86); 

            
            float en   = clamp(vis * (1.25 + 0.75 * rayTrail), 0.0, 1.0);
            vec3  cHot = mix(cLine, mix(GREEN_100, DUX_100, hue), smoothstep(0.20, 0.70, en));
            cHot = mix(cHot, mix(GREEN_50, DUX_50, hue), 0.55 * smoothstep(0.62, 1.00, en));
            cHot = mix(cHot, LIME_100, 0.14 * smoothstep(0.82, 1.00, en));

            
            float lineAmp = mix(0.10, 1.0, lit) * intensity * dim * trailEnergy;
            float carve   = 0.80 * ns * brkOut * legible * mix(0.15, 1.0, lit) * tailMask;

            
            float contourOuter = step(0.0, e);                
            float contourSlot  = above * 2.0 + contourOuter;  
            float contourSide  = mix(-1.0, 1.0, above);
            float contourRing  = mix(-h, h, contourOuter);
            float contourDist  = dp - contourSide * (W + contourRing);
            float tangentScale = sqrt(1.0 + slope * slope);
            float sparkKey     = seed * 8.71 + contourSlot * 13.17;

            
            float sparkRate  = mix(15.0, 18.0, depth);
            float sparkTrack = localX * sparkRate + t * mix(1.45, 2.10, depth)
                             + sparkKey * 0.37;
            float sparkCell  = floor(sparkTrack);
            float sparkPhase = fract(sparkTrack);
            float sparkSeed  = hash21(vec2(sparkCell, sparkKey + 17.0));
            float sparkLive  = smoothstep(0.56, 0.84, sparkSeed);
            float sparkAt    = mix(0.15, 0.85, hash21(vec2(sparkCell, sparkKey + 3.0)));
            float sparkDelta = sparkPhase - sparkAt;
            sparkDelta -= floor(sparkDelta + 0.5);
            float sparkAlong = sparkDelta / sparkRate * tangentScale;
            float sparkJitter = (hash21(vec2(sparkCell, sparkKey + 31.0)) - 0.5)
                              * max(lw * 0.58, 0.75 * pxu);
            float sparkPulse = 0.62 + 0.38 * vnoise1(t * 9.0 + sparkCell * 0.37, sparkKey);

            float grainLong = max(lw * 1.30, 2.1 * pxu);
            float grainWide = max(lw * 0.72, 1.0 * pxu);
            vec2 grainQ = vec2(sparkAlong / grainLong,
                                (contourDist - sparkJitter) / grainWide);
            float grainR2 = dot(grainQ, grainQ);
            float grainCore = (1.0 - smoothstep(0.10, 1.0, grainR2))
                            * sparkLive * sparkPulse;

            
            float grainFizzle = 0.0;
            for (int j = 0; j < 3; j++) {
                float fj = float(j);
                float emberKey = sparkKey + 47.0 + fj * 13.0;
                
                float emberOffset = mix(5.5 + fj * 5.4, 9.0 + fj * 8.0,
                                        hash21(vec2(sparkCell, emberKey))) * pxu;
                float emberJitter = (hash21(vec2(sparkCell, emberKey + 5.0)) - 0.5)
                                  * max(lw * 1.05, 1.10 * pxu);
                float emberPulse = 0.28 + 0.72 * smoothstep(0.28, 0.74,
                                  vnoise1(t * (11.0 + fj * 2.5) + sparkCell * 0.23, emberKey));
                
                float emberLong = max(lw * 0.40, 0.82 * pxu);
                float emberWide = max(lw * 0.25, 0.55 * pxu);
                vec2 emberQ = vec2((sparkAlong - emberOffset) / emberLong,
                                   (contourDist - emberJitter) / emberWide);
                float emberDot = (1.0 - smoothstep(0.10, 1.0, dot(emberQ, emberQ)))
                               * sparkLive * sparkPulse * emberPulse;
                grainFizzle += emberDot * mix(0.58, 0.18, fj * 0.5);
            }

            
            float ignitionOffset = (hash21(vec2(sparkKey, 59.0)) - 0.5) * 0.020;
            float ignitionAlong = (localX - (headX + ignitionOffset)) * tangentScale;
            float ignitionJitter = (hash21(vec2(sparkKey, 71.0)) - 0.5)
                                 * max(lw * 0.22, 0.35 * pxu);
            float ignitionPulse = 0.72 + 0.28 * vnoise1(t * 12.0 + contourSlot * 2.7, sparkKey + 5.0);
            float ignitionLong = max(lw * 1.75, 2.8 * pxu);
            float ignitionWide = max(lw * 0.95, 1.25 * pxu);
            vec2 ignitionQ = vec2(ignitionAlong / ignitionLong,
                                   (contourDist - ignitionJitter) / ignitionWide);
            float ignitionCore = (1.0 - smoothstep(0.08, 1.0, dot(ignitionQ, ignitionQ)))
                               * ignitionPulse;
            
            float ignitionNormal = contourDist - ignitionJitter;
            float starLong = max(lw * 1.08, 3.25 * pxu);
            float starWide = max(lw * 0.16, 0.62 * pxu);
            float starTangent = (1.0 - smoothstep(starLong * 0.32, starLong, abs(ignitionAlong)))
                               * (1.0 - smoothstep(starWide * 0.28, starWide, abs(ignitionNormal)));
            float starNormal = (1.0 - smoothstep(starLong * 0.32, starLong, abs(ignitionNormal)))
                              * (1.0 - smoothstep(starWide * 0.28, starWide, abs(ignitionAlong)));
            float ignitionStar = max(starTangent, starNormal) * ignitionPulse;

            float sparkGate = (1.0 - 0.98 * ns) * brkOut * tailMask * legible
                            * sparkAmt * lineAmp;
            
            float sparkCoreGain = mix(2.82, 1.42, clamp(sparkAmt * 0.50, 0.0, 1.0));
            float sparkCore = (grainCore * 1.30 + grainFizzle * 1.08
                             + ignitionCore * (1.18 + 0.82 * rayTrail)
                             + ignitionStar * (0.46 + 0.34 * rayTrail))
                            * sparkGate * sparkCoreGain;

            

            
            float Wm  = W * innerScale;
            float em  = abs(ad - Wm);
            float hm  = h * 0.85;
            float dPm = abs(em - hm);
            float inkM = (1.0 - smoothstep(lw * 0.60, lw * 1.90, dPm)) * brkIn * legible;
            float nsM  = 1.0 - smoothstep(hm * 0.20, hm * 0.90, em);
            float wmA  = clamp((inkM * 0.90 + nsM * 0.32) * innerOp, 0.0, 1.0) * tailMask;
            wmA *= clamp(lum(col) / 0.035, 0.0, 1.0);
            col = mix(col, col * mix(vec3(0.36), cWM * 2.4, 0.45), wmA);

            
            col *= (1.0 - carve * above);

            
            col += cLine * pairInk  * above * lineAmp * 0.62;
            col += cHot  * pairCore * above * lineAmp * (0.22 + 0.50 * rayTrail);
            col += cHalo * halo * above * (0.26 + 0.20 * crowd) * vis * dim * (1.0 + trailGlow);

            
            float subjA = clamp(subject * 0.82 * lit, 0.0, 1.0);
            col *= (1.0 - subjA);
            col += cSubj * subject * rays * 1.00 * vis * (1.0 + 0.45 * rayTrail);
            col += cHot  * subject * subject * rays * (0.12 + 0.38 * rayTrail) * vis;
            col += cSubj * wide * rays * rays * 0.105 * vis * veilAmt
                 * (1.0 - 0.85 * ns) * (1.0 + trailGlow);

            
            col *= (1.0 - carve * (1.0 - above));

            
            col += cLine * pairInk  * (1.0 - above) * lineAmp * 0.95;
            col += cHot  * pairCore * (1.0 - above) * lineAmp * (0.30 + 0.58 * rayTrail);
            col += cHalo * halo * (1.0 - above) * (0.36 + 0.26 * crowd) * vis * dim
                 * (1.0 + trailGlow);

            
            col += cSpark * sparkCore * 1.34;
        }
    }

    

    
    vec2  vq = vec2(uv.x / max(0.5 * aspect, 1e-3), uv.y / 0.5);
    float vr = clamp(dot(vq, vq) * 0.55, 0.0, 1.0);
    col *= 1.0 - vigAmt * 0.60 * vr;
    col *= 1.0 - vigAmt * 0.34 * smoothstep(0.26, 0.55, -uv.y);

    col  = max(col, vec3(0.0));                 
    col *= exposure;
    col  = col / (1.0 + col);                   
    col  = pow(col, vec3(1.0 / 2.2));           

    
    float dn = hash21(gl_FragCoord.xy + fract(u_time) * 17.0) - 0.5;
    col += dn * (grainAmt / 255.0) * 2.0;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

  var ZERO_SENTINEL_UNIFORMS = {
    u_disconnect: true,
    u_innerOpacity: true,
    u_warp: true,
    u_rays: true,
    u_intensity: true,
    u_bloom: true,
    u_sparkIntensity: true,
    u_veil: true,
    u_speed: true,
    u_parallax: true,
    u_vignette: true,
    u_grain: true
  };

  var FLOAT_UNIFORMS = [
    'u_speed', 'u_intensity', 'u_bands', 'u_lineWidthPx', 'u_gapPx', 'u_strokeOffset',
    'u_innerScale', 'u_innerOpacity', 'u_disconnect', 'u_bloom', 'u_sparkIntensity',
    'u_veil', 'u_rays', 'u_warp', 'u_palette', 'u_parallax', 'u_curtainX', 'u_curtainY',
    'u_vignette', 'u_exposure', 'u_grain'
  ];

  var DEFAULT_SETTINGS = {
  "u_lineWidthPx": 1.6,
  "u_gapPx": 7,
  "u_strokeOffset": 0.055,
  "u_disconnect": 0.619,
  "u_innerScale": 0.395,
  "u_innerOpacity": 0.562,
  "u_bands": 1,
  "u_warp": 0.675,
  "u_rays": 1.353,
  "u_curtainY": -0.087,
  "u_curtainX": 0.5,
  "u_intensity": 1.618,
  "u_bloom": 0.979,
  "u_sparkIntensity": 0.7,
  "u_veil": 1.913,
  "u_exposure": 1.916,
  "u_palette": 0.411,
  "u_vignette": 0.067,
  "u_grain": 0,
  "u_speed": 3.83,
  "u_parallax": 0.18
};

  function applyZeroSentinel(name, value) {
    if (ZERO_SENTINEL_UNIFORMS[name] && value === 0) {
      return -1;
    }
    return value;
  }

  function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    if (!shader) {
      throw new Error('createShader failed');
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(shader) || 'unknown error';
      gl.deleteShader(shader);
      throw new Error('Shader compile failed: ' + log);
    }
    return shader;
  }

  function createProgram(gl) {
    var vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    var fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    var program = gl.createProgram();
    if (!program) {
      throw new Error('createProgram failed');
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Program link failed: ' + (gl.getProgramInfoLog(program) || ''));
    }
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return program;
  }

  function parseSettings(raw) {
    if (!raw) {
      return Object.assign({}, DEFAULT_SETTINGS);
    }
    var values = raw.values || raw;
    var merged = Object.assign({}, DEFAULT_SETTINGS);
    Object.keys(DEFAULT_SETTINGS).forEach(function (key) {
      if (typeof values[key] === 'number' && Number.isFinite(values[key])) {
        merged[key] = values[key];
      }
    });
    return merged;
  }

  function initFreedomAurora(canvas, options) {
    options = options || {};
    var settings = parseSettings(options.settings);
    var maxDpr = options.maxDpr || 1.5;
    var paused = !!options.paused;

    var gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      throw new Error('WebGL is not available');
    }

    var program = createProgram(gl);
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    var uniformCache = {};
    function uniformLocation(name) {
      if (!uniformCache[name]) {
        uniformCache[name] = gl.getUniformLocation(program, name);
      }
      return uniformCache[name];
    }

    var mouse = { x: 0.5, y: 0.5 };
    var onPointerMove = function (event) {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }
      mouse.x = (event.clientX - rect.left) / rect.width;
      mouse.y = 1 - (event.clientY - rect.top) / rect.height;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    var elapsed = 0;
    var rafId = 0;
    var running = true;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      var width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      var height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    var resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    function frame(dt) {
      if (!running) {
        return;
      }
      rafId = window.requestAnimationFrame(function (now) {
        if (!frame.last) {
          frame.last = now;
        }
        var delta = (now - frame.last) / 1000;
        frame.last = now;
        if (!paused) {
          elapsed += delta;
        }
        draw();
        frame(delta);
      });
    }

    function draw() {
      resize();
      gl.useProgram(program);

      var timeLoc = uniformLocation('u_time');
      var resolutionLoc = uniformLocation('u_resolution');
      var mouseLoc = uniformLocation('u_mouse');

      if (timeLoc) gl.uniform1f(timeLoc, elapsed);
      if (resolutionLoc) gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      if (mouseLoc) gl.uniform2f(mouseLoc, mouse.x, mouse.y);

      FLOAT_UNIFORMS.forEach(function (name) {
        var loc = uniformLocation(name);
        if (!loc) return;
        gl.uniform1f(loc, applyZeroSentinel(name, settings[name]));
      });

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    frame.last = null;
    rafId = window.requestAnimationFrame(function () {
      frame.last = performance.now();
      draw();
      frame(0);
    });

    return {
      destroy: function () {
        running = false;
        window.cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      },
      setPaused: function (value) {
        paused = !!value;
      }
    };
  }

  window.FreedomAurora = {
    init: initFreedomAurora,
    defaults: DEFAULT_SETTINGS
  };
}());
