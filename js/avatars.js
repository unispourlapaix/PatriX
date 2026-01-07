/**
 * PATRIX - Avatars Géométriques Chrétiens
 * Couleurs du thème PATRIX : Or (#ffd700), Bleu ciel (#4fc3f7), Rose (#ff6b9d), 
 * Violet (#ba68c8), Vert (#81c784), Orange (#f4a460), Jaune (#ffeb3b)
 * Auteur: Emmanuel Payet
 */

const CHRISTIAN_AVATARS = [
    // Patri-X - Icône du jeu
    { id: 'patrix', name: 'Patri-X', svg: '<svg viewBox="0 0 100 100"><defs><linearGradient id="patrixGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFD1DC"/><stop offset="25%" style="stop-color:#FFC0CB"/><stop offset="50%" style="stop-color:#FFB6C1"/><stop offset="75%" style="stop-color:#FFC0CB"/><stop offset="100%" style="stop-color:#FFD1DC"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="#1a1a2e"/><rect x="43" y="23" width="14" height="14" fill="url(#patrixGradient)" stroke="#4a5568" stroke-width="1.5"/><rect x="43" y="43" width="14" height="14" fill="url(#patrixGradient)" stroke="#4a5568" stroke-width="1.5"/><rect x="43" y="63" width="14" height="14" fill="url(#patrixGradient)" stroke="#4a5568" stroke-width="1.5"/><rect x="23" y="43" width="14" height="14" fill="url(#patrixGradient)" stroke="#4a5568" stroke-width="1.5"/><rect x="63" y="43" width="14" height="14" fill="url(#patrixGradient)" stroke="#4a5568" stroke-width="1.5"/></svg>' },
    // Croix - Thème Or et Bleu
    { id: 'cross1', name: 'Croix Simple', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#4fc3f7"/><rect x="45" y="20" width="10" height="60" fill="#ffd700"/><rect x="25" y="45" width="50" height="10" fill="#ffd700"/></svg>' },
    { id: 'cross2', name: 'Croix Latine', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ffd700"/><rect x="42" y="15" width="16" height="70" fill="#fff"/><rect x="20" y="40" width="60" height="16" fill="#fff"/></svg>' },
    { id: 'cross3', name: 'Croix Celtique', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ba68c8"/><circle cx="50" cy="50" r="28" fill="none" stroke="#ffd700" stroke-width="4"/><rect x="45" y="15" width="10" height="70" fill="#ffd700"/><rect x="15" y="45" width="70" height="10" fill="#ffd700"/></svg>' },
    
    // Poissons - Thème Bleu et Vert
    { id: 'fish1', name: 'Poisson Simple', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#4fc3f7"/><path d="M25,50 Q40,35 60,50 Q40,65 25,50 M60,50 L75,40 L75,60 Z" fill="#fff"/><circle cx="45" cy="45" r="3" fill="#ffeb3b"/></svg>' },
    { id: 'fish2', name: 'Ichthys', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#81c784"/><path d="M20,50 Q35,30 50,50 Q35,70 20,50 M50,50 Q65,30 80,50 Q65,70 50,50" fill="none" stroke="#ffd700" stroke-width="4"/></svg>' },
    
    // Colombes - Thème Blanc et Or
    { id: 'dove1', name: 'Colombe', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ffeb3b"/><ellipse cx="45" cy="45" rx="15" ry="20" fill="#fff"/><path d="M60,45 L80,35 L75,45 L80,55 Z" fill="#fff"/><circle cx="42" cy="40" r="2" fill="#1a1a2e"/></svg>' },
    { id: 'dove2', name: 'Esprit Saint', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ffd700"/><path d="M50,25 L35,45 L50,40 L65,45 Z M50,40 L45,70 M50,40 L55,70" stroke="#fff" stroke-width="3" fill="none"/></svg>' },
    
    // Agneaux - Thème Blanc et Rose
    { id: 'lamb1', name: 'Agneau', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ff6b9d"/><circle cx="45" cy="45" r="18" fill="#fff"/><circle cx="50" cy="55" r="15" fill="#fff"/><circle cx="40" cy="42" r="3" fill="#1a1a2e"/><circle cx="50" cy="42" r="3" fill="#1a1a2e"/></svg>' },
    
    // Cœurs sacrés - Thème Rose et Or
    { id: 'heart1', name: 'Cœur Sacré', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ff6b9d"/><path d="M50,70 L30,50 Q25,40 35,35 Q45,30 50,40 Q55,30 65,35 Q75,40 70,50 Z" fill="#fff"/><rect x="48" y="35" width="4" height="15" fill="#ffd700"/><rect x="40" y="43" width="20" height="4" fill="#ffd700"/></svg>' },
    { id: 'heart2', name: 'Amour Divin', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ff6b9d"/><path d="M50,65 L35,50 Q30,40 40,35 Q50,30 50,45 Q50,30 60,35 Q70,40 65,50 Z" fill="#ffd700"/></svg>' },
    
    // Étoiles - Thème Jaune et Or
    { id: 'star1', name: 'Étoile de Bethléem', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#1a1a2e"/><path d="M50,20 L55,45 L80,45 L60,60 L70,85 L50,70 L30,85 L40,60 L20,45 L45,45 Z" fill="#ffd700"/></svg>' },
    { id: 'star2', name: 'Étoile à 6 branches', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#4fc3f7"/><path d="M50,20 L60,40 L50,50 L60,60 L50,80 L40,60 L50,50 L40,40 Z" fill="#ffeb3b"/></svg>' },
    
    // Couronnes - Thème Or
    { id: 'crown1', name: 'Couronne', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#f4a460"/><path d="M25,55 L35,40 L45,50 L50,35 L55,50 L65,40 L75,55 L70,70 L30,70 Z" fill="#ffd700"/><circle cx="35" cy="40" r="4" fill="#ff6b9d"/><circle cx="50" cy="35" r="4" fill="#ff6b9d"/><circle cx="65" cy="40" r="4" fill="#ff6b9d"/></svg>' },
    { id: 'crown2', name: 'Couronne d\'Épines', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#f4a460"/><circle cx="50" cy="50" r="30" fill="none" stroke="#ffd700" stroke-width="4"/><path d="M50,20 L52,30 M30,30 L35,35 M20,50 L30,50 M30,70 L35,65 M50,80 L52,70 M70,70 L65,65 M80,50 L70,50 M70,30 L65,35" stroke="#ffeb3b" stroke-width="2"/></svg>' },
    
    // Calices - Thème Violet et Or
    { id: 'chalice1', name: 'Calice', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ba68c8"/><path d="M35,30 Q50,40 65,30 L60,50 Q50,55 40,50 Z M45,50 L45,65 M55,50 L55,65 M38,65 L62,65" stroke="#ffd700" stroke-width="3" fill="none"/></svg>' },
    
    // Alpha et Oméga - Thème Vert et Bleu
    { id: 'alpha', name: 'Alpha', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#81c784"/><text x="50" y="70" font-size="50" fill="#ffd700" text-anchor="middle" font-family="serif" font-weight="bold">Α</text></svg>' },
    { id: 'omega', name: 'Oméga', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#4fc3f7"/><text x="50" y="70" font-size="50" fill="#ffd700" text-anchor="middle" font-family="serif" font-weight="bold">Ω</text></svg>' },
    
    // Trinitaires - Thème Or et Rose
    { id: 'trinity1', name: 'Trinité', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ff6b9d"/><circle cx="50" cy="35" r="12" fill="#ffd700"/><circle cx="35" cy="55" r="12" fill="#ffd700"/><circle cx="65" cy="55" r="12" fill="#ffd700"/><path d="M50,35 L35,55 L65,55 Z" fill="none" stroke="#fff" stroke-width="3"/></svg>' },
    { id: 'trinity2', name: 'Trois Cercles', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ba68c8"/><circle cx="50" cy="40" r="15" fill="none" stroke="#ffd700" stroke-width="4"/><circle cx="40" cy="60" r="15" fill="none" stroke="#ffd700" stroke-width="4"/><circle cx="60" cy="60" r="15" fill="none" stroke="#ffd700" stroke-width="4"/></svg>' },
    
    // Ancres - Thème Bleu
    { id: 'anchor1', name: 'Ancre', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#4fc3f7"/><path d="M50,25 L50,65 M35,65 Q35,75 50,75 Q65,75 65,65 M30,55 L40,55 M60,55 L70,55 M45,25 Q45,20 50,20 Q55,20 55,25" stroke="#ffd700" stroke-width="4" fill="none"/></svg>' },
    
    // Flammes - Thème Orange et Jaune
    { id: 'flame1', name: 'Flamme', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#f4a460"/><path d="M50,75 Q40,60 45,45 Q48,55 50,40 Q52,55 55,45 Q60,60 50,75" fill="#ffd700"/><path d="M50,75 Q45,65 48,55 Q50,60 50,50 Q50,60 52,55 Q55,65 50,75" fill="#ffeb3b"/></svg>' },
    { id: 'flame2', name: 'Esprit de Feu', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#f4a460"/><path d="M35,70 Q30,50 40,35 Q45,50 50,25 Q55,50 60,35 Q70,50 65,70 Z" fill="#ffd700"/></svg>' },
    
    // Pains - Thème Orange
    { id: 'bread1', name: 'Pain', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#f4a460"/><ellipse cx="50" cy="50" rx="30" ry="20" fill="#ffeb3b"/><path d="M35,45 L65,45 M35,50 L65,50 M35,55 L65,55" stroke="#ffd700" stroke-width="2"/></svg>' },
    
    // Vignes - Thème Violet
    { id: 'vine1', name: 'Vigne', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#81c784"/><path d="M50,80 Q40,60 30,50 Q25,40 35,35 M50,80 Q60,60 70,50 Q75,40 65,35" stroke="#ba68c8" stroke-width="3" fill="none"/><circle cx="30" cy="40" r="6" fill="#ba68c8"/><circle cx="70" cy="40" r="6" fill="#ba68c8"/><circle cx="35" cy="50" r="5" fill="#ba68c8"/><circle cx="65" cy="50" r="5" fill="#ba68c8"/></svg>' },
    
    // Églises - Thème Or
    { id: 'church1', name: 'Église', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#4fc3f7"/><rect x="35" y="45" width="30" height="35" fill="#fff"/><path d="M30,45 L50,25 L70,45" fill="#fff"/><rect x="46" y="30" width="8" height="15" fill="#ffd700"/><rect x="42" y="26" width="16" height="4" fill="#ffd700"/></svg>' },
    
    // Livres - Thème Rose et Or
    { id: 'book1', name: 'Livre Saint', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#ff6b9d"/><rect x="30" y="30" width="40" height="40" fill="#fff" stroke="#ffd700" stroke-width="2"/><rect x="48" y="35" width="4" height="30" fill="#ffd700"/><rect x="40" y="48" width="20" height="4" fill="#ffd700"/></svg>' },
    
    // Lanternes - Thème Jaune
    { id: 'lantern1', name: 'Lanterne', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#1a1a2e"/><rect x="40" y="30" width="20" height="30" rx="3" fill="#ffd700"/><rect x="45" y="25" width="10" height="5" fill="#4fc3f7"/><rect x="45" y="60" width="10" height="5" fill="#4fc3f7"/><path d="M45,40 L55,50 L45,50 Z" fill="#ffeb3b"/></svg>' },
    
    // Clés - Thème Or
    { id: 'key1', name: 'Clés du Royaume', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#f4a460"/><circle cx="35" cy="40" r="12" fill="none" stroke="#ffd700" stroke-width="4"/><path d="M47,40 L70,40 M65,35 L65,45 M60,35 L60,45" stroke="#ffd700" stroke-width="4"/></svg>' },
    
    // Palmiers - Thème Vert
    { id: 'palm1', name: 'Palme', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#81c784"/><path d="M50,70 L50,30 M35,35 Q40,30 50,35 M50,35 Q60,30 65,35 M35,45 Q42,42 50,45 M50,45 Q58,42 65,45 M35,55 Q42,53 50,55 M50,55 Q58,53 65,55" stroke="#ffd700" stroke-width="3" fill="none"/></svg>' }
];

window.CHRISTIAN_AVATARS = CHRISTIAN_AVATARS;
