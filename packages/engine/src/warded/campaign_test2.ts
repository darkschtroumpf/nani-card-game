import { createCampaignGame } from './campaign-engine';
import { startNight, startWave, resolveWardPassives, resolveDamage, endNight, processDawn } from './game';
import { CHAPTERS } from './campaign-data';

// Test Jardir: simulate 3 nights
const jardir = CHAPTERS.find(c => c.id === 3)!;
console.log('=== JARDIR TEST ===');
const s = createCampaignGame(jardir);

for (let night = 0; night < 3; night++) {
  console.log(`\n--- Night ${night + 1} (nightNumber: ${s.nightNumber}) ---`);
  startNight(s);
  
  for (let wave = 1; wave <= 3; wave++) {
    startWave(s);
    resolveWardPassives(s);
    const total = Object.values(s.demonsAtLocations).flat().length;
    console.log(`  Wave ${wave}: ${total} demons alive after passives`);
    resolveDamage(s);
    if (s.gameOver) { console.log('  GAME OVER:', s.defeatReason); break; }
  }
  
  if (s.gameOver) break;
  endNight(s);
  console.log(`  After endNight: phase=${s.phase}, nightNumber=${s.nightNumber}, turnNumber=${s.turnNumber}, gameOver=${s.gameOver}, victory=${s.victory}`);
  if (!s.gameOver) processDawn(s);
}

// Test Arlen chapter completion
console.log('\n=== ARLEN CH1 VICTORY TEST ===');
const arlen = CHAPTERS.find(c => c.id === 1)!;
const a = createCampaignGame(arlen);
console.log(`maxNights: ${a.maxNights}, minStanding: ${a.minStandingLocations}`);

for (let night = 0; night < 3; night++) {
  startNight(a);
  for (let wave = 1; wave <= 3; wave++) {
    startWave(a);
    resolveWardPassives(a);
    resolveDamage(a);
    if (a.gameOver) break;
  }
  if (a.gameOver) break;
  endNight(a);
  console.log(`Night ${night+1} done: phase=${a.phase}, turnNumber=${a.turnNumber}, nightNumber=${a.nightNumber}, gameOver=${a.gameOver}, victory=${a.victory}`);
  if (!a.gameOver) processDawn(a);
}
console.log(`Final: gameOver=${a.gameOver}, victory=${a.victory}`);
