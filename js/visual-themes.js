/* Habillages visuels : aucune modification des règles ou de la partie. */
(() => {
    const modes = ['classic', 'kawaii', 'galaxy', 'seasons'];
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
    document.getElementById('topGameTools').append(button);
    const cycle = ['classic', 'kawaii', 'galaxy', ...seasons];
    const names = { classic: 'Classique', kawaii: 'Kawaii', galaxy: 'Galaxie', autumn: 'Automne', winter: 'Hiver', spring: 'Printemps', summer: 'Été' };
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('patrixVisualStyle')) || {}; } catch {}
    mode.value = modes.includes(saved.mode) ? saved.mode : 'classic';
    season.value = seasons.includes(saved.season) ? saved.season : 'autumn';
    function apply() {
        const seasonal = mode.value === 'seasons';
        const theme = seasonal ? season.value : mode.value;
        document.body.dataset.visualTheme = theme;
        button.title = `Style : ${names[theme]} — cliquer pour changer`;
        button.setAttribute('aria-label', button.title);
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
})();
