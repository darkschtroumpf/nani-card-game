import { createCampaignGame } from './campaign-engine';
import { startNight, startWave, resolveWardPassives, activateWard } from './game';
import { CHAPTERS } from './campaign-data';

for (const chapter of CHAPTERS) {
  console.log(`\n=== ${chapter.title} (hero: ${chapter.heroId}) ===`);
  const s = createCampaignGame(chapter);
  
  const living = s.locations.filter(l => !l.fallen && l.maxPopulation > 0);
  console.log('Living locations:', living.map(l => `${l.id}(${l.terrain})`).join(', '));
  console.log('nightNumber:', s.nightNumber, 'mode:', s.mode);
  
  startNight(s);
  console.log('Surge:', s.currentSurge);
  
  // Wave 1
  startWave(s);
  let demonsBeforePassive = 0;
  for (const [locId, demons] of Object.entries(s.demonsAtLocations)) {
    demonsBeforePassive += demons.length;
    if (demons.length > 0) {
      console.log(`  ${locId}: ${demons.length} demons [${demons.map(d => d.demon.type + '(' + d.currentStrength + ')').join(', ')}]`);
    }
  }
  console.log('Total BEFORE passives:', demonsBeforePassive);
  
  // Resolve passives
  const passiveEvents = resolveWardPassives(s);
  let demonsAfterPassive = 0;
  for (const demons of Object.values(s.demonsAtLocations)) {
    demonsAfterPassive += demons.length;
  }
  console.log('Total AFTER passives:', demonsAfterPassive);
  if (passiveEvents.length > 0) {
    passiveEvents.forEach(e => console.log('  passive:', e));
  }
  
  // Auto-activate wards
  for (const loc of s.locations) {
    if (loc.fallen || !loc.wards.some(ws => ws.ward)) continue;
    const hasCombo = loc.wards.filter(ws => ws.ward).length >= 2;
    activateWard(s, loc.id, hasCombo);
  }
  let demonsAfterActive = 0;
  for (const demons of Object.values(s.demonsAtLocations)) {
    demonsAfterActive += demons.length;
  }
  console.log('Total AFTER actives:', demonsAfterActive);
}
