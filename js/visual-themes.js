/* Habillages visuels : aucune modification des règles ou de la partie. */
(() => {
    const modes = ['classic', 'kawaii', 'galaxy', 'science', 'scifi', 'seasons'];
    const seasons = ['autumn', 'winter', 'spring', 'summer'];
    const mode = document.getElementById('visualMode');
    const season = document.getElementById('visualSeason');
    document.querySelector('.visual-controls').hidden = true;
    const button = document.createElement('button');
    button.id = 'visualStyleButton';
    button.type = 'button';
    const icon = document.createElement('img');
    icon.src = 'assets/images/pixel-tv.svg';
    icon.alt = '';
    icon.width = icon.height = 28;
    button.append(icon);
    document.getElementById('topGameTools').prepend(button);
    const cycle = [...modes.filter(mode => mode !== 'seasons'), ...seasons];
    const names = { classic: 'Classique', kawaii: 'Kawaii', galaxy: 'Galaxie', science: 'Laboratoire', scifi: 'Science-fiction', autumn: 'Automne', winter: 'Hiver', spring: 'Printemps', summer: 'Été' };
    const decoration = {
        classic: ['⚙', '#', '▪', '01'],
        kawaii: ['♡', 'theme-kawaii.svg', '✦'],
        galaxy: ['theme-galaxy.svg', '✦', '·', '✧'],
        science: ['π', '√2', 'E=mc²', 'H₂O', 'theme-science.svg', 'Σ'],
        scifi: ['01', '101', '⚙', 'theme-scifi.svg'],
        autumn: ['momiji-pixel.svg'],
        winter: ['season-givre.svg', '·'],
        spring: ['season-sakura.svg', 'rain', 'rain'],
        summer: ['season-soleil.svg', '≈', '✧']
    };
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const backdrop = document.createElement('div');
    backdrop.className = 'theme-fall';
    backdrop.setAttribute('aria-hidden', 'true');
    document.querySelector('.game-board').prepend(backdrop);
    function updateDecoration() {
        const theme = document.body.dataset.visualTheme;
        const motifs = decoration[theme] || decoration.classic;
        const particles = document.createDocumentFragment();
        if (!reducedMotion.matches) {
            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('span');
                const motif = motifs[i % motifs.length];
                particle.className = 'theme-fall-particle';
                if (motif === 'rain') {
                    particle.classList.add('theme-fall-rain');
                } else if (motif.endsWith('.svg')) {
                    const art = document.createElement('img');
                    art.src = 'assets/images/' + motif;
                    art.alt = '';
                    particle.append(art);
                } else {
                    particle.textContent = motif;
                }
                particle.style.left = (4 + i * 10) + '%';
                particle.style.setProperty('--fall-duration', (motif === 'rain' ? 3 + i % 3 : 9 + i % 5) + 's');
                particle.style.setProperty('--fall-delay', (-i * 1.63) + 's');
                particle.style.setProperty('--fall-drift', (motif === 'rain' ? -18 : i % 2 ? 30 : -30) + 'px');
                particle.style.setProperty('--fall-size', (12 + i % 4 * 3) + 'px');
                particles.append(particle);
            }
        }
        backdrop.replaceChildren(particles);
    }
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('patrixVisualStyle')) || {}; } catch {}
    mode.value = modes.includes(saved.mode) ? saved.mode : 'classic';
    season.value = seasons.includes(saved.season) ? saved.season : 'autumn';
    function translateButton() {
        const theme = document.body.dataset.visualTheme;
        const labels = window.i18n?.translations?.arcadeUi;
        const name = labels?.themes?.[theme] || names[theme];
        button.title = (labels?.themeLabel || 'Style : {theme} — cliquer pour changer').replace('{theme}', name);
        button.setAttribute('aria-label', button.title);
    }
    function apply() {
        const seasonal = mode.value === 'seasons';
        const theme = seasonal ? season.value : mode.value;
        document.body.dataset.visualTheme = theme;
        updateDecoration();
        translateButton();
        season.hidden = !seasonal;
        document.querySelector('label[for="visualSeason"]').hidden = !seasonal;
        try {
            localStorage.setItem('patrixVisualStyle', JSON.stringify({ mode: mode.value, season: season.value }));
        } catch {}
        // Le pied change de hauteur lorsque le choix de saison apparaît.
        window.dispatchEvent(new Event('resize'));
    }
    mode.addEventListener('change', apply);
    season.addEventListener('change', apply);
    button.addEventListener('click', () => {
        const next = cycle[(cycle.indexOf(document.body.dataset.visualTheme) + 1) % cycle.length];
        mode.value = seasons.includes(next) ? 'seasons' : next;
        if (seasons.includes(next)) season.value = next;
        apply();
    });
    apply();
    reducedMotion.addEventListener?.('change', updateDecoration);
    window.i18n?.addObserver(translateButton);
})();
