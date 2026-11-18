export const scope = 'Six authored job definitions, unlock state, mission HUD contract and job board rendering.';
export const JOBS = [
  { id: 'cooler-caper', name: 'The Cooler Caper', contact: 'Tavi Moss', faction: 'FIXER', pay: 620,
    description: 'Take the COLDFIN freezer van back from Sunspur Impound. Deliver its cooler to Tavi at Tin Cup Pier; integrity decides the pay.' },
  { id: 'sandbag-run', name: 'Sandbag Run', contact: 'Niko Vale', faction: 'MECHANIC', pay: 340,
    description: 'Carry repair kits and sandbags from the workshop to the market barricade before the timer runs out.' },
  { id: 'market-mercy', name: 'Market Mercy', contact: 'Paz Sol', faction: 'FENCE', pay: 460,
    description: 'Collect three crates from Marigold Market stalls and get them to Juno’s safehouse.' },
  { id: 'clear-your-name', name: 'Clear Your Name', contact: 'Tavi Moss', faction: 'FIXER', pay: 500,
    description: 'Clear the evidence: swap the van’s plates, change outfit at the clothes stall, and repaint at the workshop.' },
  { id: 'five-districts', name: 'Five Districts', contact: 'Niko Vale', faction: 'MECHANIC', pay: 780,
    description: 'Hit a checkpoint in every district against the clock as the rain gets worse.' },
  { id: 'surge-run', name: 'The Surge Run', contact: 'Paz Sol', faction: 'FENCE', pay: 1600,
    description: 'Load the cooler and cross Sunspur Causeway before the surge closes the raised road.' },
];
export function createMissionDirector() {
  const state = { activeId: null, name: 'NO ACTIVE JOB', stage: 'FREE ROAM', objective: 'Find Tavi at Tin Cup Pier, or open the job board.', completed: [], unlocked: 1, progress: 0 };
  const listeners = new Set();
  function selectJob(id) {
    const index = JOBS.findIndex(job => job.id === id); if (index < 0 || index >= state.unlocked) return;
    const job = JOBS[index]; Object.assign(state, { activeId: id, name: job.name, stage: 'CONTACT', objective: 'Meet Tavi Moss at Tin Cup Pier.' });
    listeners.forEach(listener => listener(job));
  }
  function renderBoard(container, onTake) {
    container.replaceChildren();
    JOBS.forEach((job, index) => {
      const unlocked = index < state.unlocked, card = document.createElement('article'); card.className = `job ${unlocked ? '' : 'locked'}`;
      const number = document.createElement('span'); number.className = 'job-number'; number.textContent = String(index + 1).padStart(2, '0');
      const body = document.createElement('div');
      const meta = document.createElement('p'); meta.className = 'eyebrow'; meta.textContent = `${job.contact} / ${job.faction}`;
      const title = document.createElement('h3'); title.textContent = job.name;
      const description = document.createElement('p'); description.textContent = job.description;
      body.append(meta, title, description);
      const action = document.createElement('div'); action.className = 'job-action';
      const pay = document.createElement('strong'); pay.textContent = `${index === 0 ? 'UP TO ' : ''}$${job.pay}`;
      const button = document.createElement('button'); button.textContent = unlocked ? 'TAKE THE JOB' : 'LOCKED'; button.disabled = !unlocked;
      if (unlocked) button.onclick = () => { selectJob(job.id); onTake?.(job); };
      action.append(pay, button); card.append(number, body, action); container.append(card);
    });
  }
  return { state, definitions: JOBS, selectJob, renderBoard, onSelect(listener) { listeners.add(listener); return () => listeners.delete(listener); } };
}
