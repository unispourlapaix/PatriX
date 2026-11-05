/* Habillages visuels : aucune modification des règles ou de la partie. */
(() => {
    const modes = ['classic', 'kawaii', 'galaxy', 'seasons'];
    const seasons = ['autumn', 'winter', 'spring', 'summer'];
    const mode = document.getElementById('visualMode');
    const season = document.getElementById('visualSeason');
    document.getElementById('topGameTools').append(document.querySelector('.visual-controls'));
    document.querySelector('label[for="visualMode"]').textContent = '🎨 Style';
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('patrixVisualStyle')) || {}; } catch {}
    mode.value = modes.includes(saved.mode) ? saved.mode : 'classic';
    season.value = seasons.includes(saved.season) ? saved.season : 'autumn';
    function apply() {
        const seasonal = mode.value === 'seasons';
        const theme = seasonal ? season.value : mode.value;
        document.body.dataset.visualTheme = theme;
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
    apply();
})();
