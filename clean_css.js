const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

const newCSS = `
/* =============================================
   DYNAMIC CSS CLASSES FOR CLOCK
   ============================================= */
.clock-minimal { font-weight: 200; letter-spacing: 8px; color: #ffffff; -webkit-text-fill-color: #ffffff; background: none; -webkit-background-clip: unset; background-clip: unset; opacity: 0.9; text-transform: none; }
.clock-bold { color: #ffffff; -webkit-text-fill-color: #ffffff; background: none; -webkit-background-clip: unset; background-clip: unset; font-weight: 900; letter-spacing: -4px; filter: none; }
.clock-glass { color: rgba(255,255,255,0.95); -webkit-text-fill-color: rgba(255,255,255,0.95); background: rgba(255,255,255,0.10); -webkit-background-clip: unset; background-clip: unset; backdrop-filter: blur(18px) saturate(180%); -webkit-backdrop-filter: blur(18px) saturate(180%); border: 1px solid rgba(255,255,255,0.25); padding: 16px 40px; border-radius: 28px; animation: glassShimmer 4s ease-in-out infinite; font-weight: 700; letter-spacing: 2px; }
.clock-neumorphism { background: var(--bg-color); -webkit-background-clip: unset; background-clip: unset; color: #ffffff; -webkit-text-fill-color: #ffffff; padding: 20px 50px; border-radius: 32px; box-shadow: 8px 8px 20px rgba(0,0,0,0.5), -4px -4px 12px rgba(255,255,255,0.05); font-weight: 700; letter-spacing: 0px; animation: neuGlow 4s ease-in-out infinite; }
.clock-cyberpunk { color: #ffffff; -webkit-text-fill-color: #ffffff; background: none; -webkit-background-clip: unset; background-clip: unset; font-family: "Courier New", Courier, monospace; font-weight: 900; letter-spacing: 6px; animation: neonPulse 2.5s ease-in-out infinite; text-transform: none; }
.clock-swiss { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-weight: 900; letter-spacing: -6px; color: #e63946; -webkit-text-fill-color: #e63946; background: none; -webkit-background-clip: unset; background-clip: unset; animation: swissPulse 3s ease-in-out infinite; text-transform: uppercase; }
.clock-retro { font-family: "Courier New", Courier, monospace; background: #0d1117; -webkit-background-clip: unset; background-clip: unset; color: #39ff14; -webkit-text-fill-color: #39ff14; border: 2px solid #39ff14; padding: 14px 36px; border-radius: 8px; text-shadow: 0 0 8px #39ff14, 0 0 18px #39ff14; box-shadow: 0 0 0 4px rgba(57,255,20,0.08), inset 0 0 30px rgba(57,255,20,0.05); letter-spacing: 4px; font-weight: 700; animation: crtFlicker 5s linear infinite; }
.clock-rainbow { background: linear-gradient(90deg, #ff0080, #ff4d00, #ffff00, #00ff80, #00bfff, #8000ff, #ff0080); background-size: 300% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: rainbowScroll 4s linear infinite; font-weight: 900; letter-spacing: -2px; }
.clock-flip { background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 49.5%, #111 50%, #1c1c1c 100%); -webkit-background-clip: unset; background-clip: unset; color: #f0f0f0; -webkit-text-fill-color: #f0f0f0; padding: 12px 40px; border-radius: 12px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -2px 0 rgba(0,0,0,0.8), 0 6px 24px rgba(0,0,0,0.7); letter-spacing: 8px; border: 1px solid rgba(255,255,255,0.08); font-weight: 700; }
.clock-tracer { color: #ffffff; -webkit-text-fill-color: #ffffff; background: none; -webkit-background-clip: unset; background-clip: unset; border: 2px solid var(--accent-color); padding: 12px 44px; border-radius: 28px; font-weight: 700; letter-spacing: 2px; animation: tracerBorderAnim 2s ease-in-out infinite; }
.clock-oled { background: #000000; -webkit-background-clip: unset; background-clip: unset; color: #ffffff; -webkit-text-fill-color: #ffffff; padding: 20px 60px; border-radius: 48px; font-weight: 100; letter-spacing: 10px; box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.8); animation: oledFlicker 8s linear infinite; }

/* =============================================
   DYNAMIC CSS CLASSES FOR SEARCH BAR
   ============================================= */
.search-form-base { display: flex; align-items: stretch; width: 100%; transition: all 0.3s ease; position: relative; z-index: 10; }
.search-input-base { flex: 1; border: none; background: transparent; color: var(--text-color); outline: none; transition: all 0.3s ease; }
.search-form-style-default { background: rgba(var(--overlay-base), 0.65); backdrop-filter: blur(12px) saturate(180%); border: 1px solid rgba(255,255,255,0.1); border-radius: 30px; padding: 8px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.engine-dropdown-style-default { background: rgba(var(--overlay-base), 0.85); backdrop-filter: blur(12px) saturate(180%); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
.search-form-style-minimal { background: transparent; backdrop-filter: none; border: none; border-bottom: 2px solid rgba(255,255,255,0.3); border-radius: 0; padding: 8px 4px; box-shadow: none; }
.engine-dropdown-style-minimal { background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); border: none; border-bottom: 2px solid rgba(255,255,255,0.3); border-radius: 0; box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
.search-form-style-glass { background: rgba(255,255,255,0.1); backdrop-filter: blur(20px) saturate(200%); border: 1px solid rgba(255,255,255,0.3); border-radius: 24px; padding: 10px 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
.engine-dropdown-style-glass { background: rgba(255,255,255,0.15); backdrop-filter: blur(20px) saturate(200%); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
.search-form-style-neumorphism { background: var(--bg-color); backdrop-filter: none; border: none; border-radius: 30px; padding: 10px 16px; box-shadow: 6px 6px 12px rgba(0,0,0,0.5), -4px -4px 10px rgba(255,255,255,0.05); }
.engine-dropdown-style-neumorphism { background: var(--bg-color); backdrop-filter: none; border: none; border-radius: 16px; box-shadow: 6px 6px 12px rgba(0,0,0,0.5), -4px -4px 10px rgba(255,255,255,0.05); }
.search-form-style-cyberpunk { background: rgba(0,0,0,0.8); backdrop-filter: none; border: 2px solid var(--accent-color); border-radius: 4px; padding: 10px 16px; box-shadow: 0 0 10px var(--accent-color); }
.engine-dropdown-style-cyberpunk { background: rgba(0,0,0,0.9); backdrop-filter: none; border: 2px solid var(--accent-color); border-radius: 4px; box-shadow: 0 0 10px var(--accent-color); }
.search-form-style-oled { background: #000000; backdrop-filter: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; padding: 12px 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
.engine-dropdown-style-oled { background: #000000; backdrop-filter: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
.search-form-style-custom { display: flex; align-items: stretch; width: 100%; transition: all 0.3s ease; position: relative; z-index: 10; }
`;

if (!css.includes('.clock-minimal')) {
  css += '\n' + newCSS;
}

let lines = css.split('\n');
let inMobileQuery = false;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('@media (max-width: 1100px)') || lines[i].includes('@media (max-width: 768px)')) {
    inMobileQuery = true;
    braceDepth = 0;
  }
  
  if (inMobileQuery) {
    if (lines[i].includes('{')) braceDepth += (lines[i].match(/{/g) || []).length;
    if (lines[i].includes('}')) braceDepth -= (lines[i].match(/}/g) || []).length;
    
    lines[i] = lines[i].replace(/ !important/g, '');
    
    // Check if it's a selector line
    let trimmed = lines[i].trim();
    // A simple heuristic for this file
    if (braceDepth === 1 && (trimmed.startsWith('.') || trimmed.startsWith('#'))) {
      if (trimmed.endsWith('{') || (lines[i+1] && lines[i+1].trim() === '{')) {
        let parts = lines[i].split(',');
        for (let j = 0; j < parts.length; j++) {
          let pTrim = parts[j].trim();
          if (pTrim.startsWith('.') || pTrim.startsWith('#')) {
             parts[j] = parts[j].replace(pTrim, 'body ' + pTrim);
          }
        }
        lines[i] = parts.join(',');
      }
    }
    
    if (braceDepth === 0 && lines[i].includes('}')) {
      inMobileQuery = false;
    }
  }
}

fs.writeFileSync(cssPath, lines.join('\n'), 'utf8');
console.log('CSS optimized successfully.');
