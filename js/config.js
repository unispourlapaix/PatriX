/**
 * PATRIX - Configuration Globale
 * ID: E-manuel-config
 * Auteur: Emmanuel Payet
 * Message: "Abandonne la tristesse, revêts-toi de force et courage"
 */

const CONFIG = {
    // Grille de jeu
    GRID: {
        COLS: 10,
        ROWS: 20,
        CELL_SIZE: 32,
        GAP: 2
    },

    // Vitesse et timing
    TIMING: {
        INITIAL_DROP_SPEED: 1000,  // ms
        MIN_DROP_SPEED: 150,        // ms
        SPEED_INCREASE: 40,         // ms par ligne
        COMBO_TIMEOUT: 2000,        // ms
        ANIMATION_DURATION: 600     // ms
    },

    // Couleurs du thème lumineux/positif
    COLORS: {
        // Arrière-plan dégradé (nuit → aube)
        BG_START: '#1a1a2e',
        BG_END: '#16213e',
        
        // Blocs AVANT transformation (sombres mais pas tristes)
        SHADOW: {
            CROSS: '#4a5568',     // Gris bleuté
            HEART: '#553c5e',     // Violet sombre
            STAR: '#5e4a3c',      // Brun sombre
            ANCHOR: '#3c4e5e',    // Bleu nuit
            LLIGHT: '#4e5e3c',    // Vert foncé
            TCROSS: '#5e3c4a',    // Pourpre sombre
            PILLAR: '#5e5e4a'     // Gris olive
        },
        
        // Blocs APRÈS transformation (lumineux/dorés)
        LIGHT: {
            CROSS: '#ffd700',     // Or pur
            HEART: '#ff6b9d',     // Rose lumineux
            STAR: '#ffeb3b',      // Jaune soleil
            ANCHOR: '#4fc3f7',    // Bleu ciel
            LLIGHT: '#81c784',    // Vert espérance
            TCROSS: '#ba68c8',    // Violet royal
            PILLAR: '#f4a460'     // Orange sable
        },
        
        // Effets
        PARTICLE: '#ffd700',      // Or pour particules
        GLOW: 'rgba(255, 215, 0, 0.6)',
        EXPLOSION: 'rgba(255, 215, 0, 0.8)'
    },

    // Spiritual messages by level
    MESSAGES: {
        LEVELS: [
            { level: 0, message: "Leave sadness behind..." },
            { level: 5, message: "Clothe yourself with strength!" },
            { level: 10, message: "Cultivate courage!" },
            { level: 15, message: "Transform despair..." },
            { level: 20, message: "...into great dreams!" },
            { level: 25, message: "Light shines in darkness" },
            { level: 30, message: "You are stronger than you think" },
            { level: 40, message: "Each block placed is a victory" },
            { level: 50, message: "You're building something beautiful" }
        ],
        
        // Philosophical treasure messages for each level
        TREASURES: [
            { level: 1, message: "Joy is a choice you make every day. Choose it now! ✨" },
            { level: 2, message: "Contentment comes from within. You already have everything you need. 💫" },
            { level: 3, message: "Let go of what you can't control. Freedom awaits you! 🕊️" },
            { level: 4, message: "Forgive yourself. You did your best with what you knew at that time. 💚" },
            { level: 5, message: "Think outside the box! The world is bigger than your fears. 🌍" },
            { level: 6, message: "Move, dance, live! Your body is the temple of your spirit. 💃" },
            { level: 7, message: "Nothing is impossible for those who believe. You're capable of anything! ⭐" },
            { level: 8, message: "Courage isn't the absence of fear, it's moving forward despite it. 🦁" },
            { level: 9, message: "Laugh and sing! The music of your heart transforms the world. 🎵" },
            { level: 10, message: "Dance in the rain with a smile! Storms always pass. ☔" },
            { level: 11, message: "Your inner light shines brighter than any darkness. ✝️" },
            { level: 12, message: "Every small step counts. Keep moving forward, you're progressing! 👣" },
            { level: 13, message: "Gratitude transforms what you have into enough. Thanks for today! 🙏" },
            { level: 14, message: "You are a unique and magnificent creation. Celebrate who you are! 🌟" },
            { level: 15, message: "Love begins with yourself. Love yourself as you are loved. ❤️" },
            { level: 16, message: "Failures are lessons in disguise. Keep learning! 📚" },
            { level: 17, message: "Your voice matters. Express yourself with authenticity and courage. 🗣️" },
            { level: 18, message: "Patience is a form of wisdom. Everything comes in its own time. ⏳" },
            { level: 19, message: "Breathe deeply. You're alive and that's a gift! 🌬️" },
            { level: 20, message: "Your dreams are valid. Pursue them with passion and faith! 🎯" },
            { level: 21, message: "You're more resilient than you imagine. Look at all you've overcome! 💪" },
            { level: 22, message: "Share your smile. It can brighten someone's day. 😊" },
            { level: 23, message: "Hope is an anchor for the soul. Keep hope, always! ⚓" },
            { level: 24, message: "Change your perspective, change your life. It's all about vision! 👁️" },
            { level: 25, message: "You're a force of nature. Embrace your power! 🌊" },
            { level: 26, message: "Kindness is strength, not weakness. Be kind to yourself. 🤗" },
            { level: 27, message: "Every day is a new chance to start over. Today counts! 🌅" },
            { level: 28, message: "You deserve happiness. Don't let anyone tell you otherwise! 🎁" },
            { level: 29, message: "Faith moves mountains. Keep believing! ⛰️" },
            { level: 30, message: "You're exactly where you need to be. Trust the process. 🧭" },
            { level: 31, message: "Your story isn't over yet. The best is yet to come! 📖" },
            { level: 32, message: "Celebrate every victory, even the small ones. You're a champion! 🏆" },
            { level: 33, message: "Inner peace is your birthright. Claim it! ☮️" },
            { level: 34, message: "Dare to dream bigger. The sky is just the beginning! ☁️" },
            { level: 35, message: "You inspire more people than you think. Shine! ✨" },
            { level: 36, message: "Life is a gift. Unwrap it with wonder! 🎀" },
            { level: 37, message: "You have the power to create the life you desire. Start now! 🎨" },
            { level: 38, message: "Let go of what weighs you down. Travel light, fly high! 🦅" },
            { level: 39, message: "Your potential is unlimited. Never underestimate yourself! 🚀" },
            { level: 40, message: "You're a living miracle. Never forget it! 🌈" },
            { level: 41, message: "Self-confidence is learned. Practice it every day! 💎" },
            { level: 42, message: "You're the architect of your destiny. Build with love! 🏗️" },
            { level: 43, message: "Sing your own song. The world needs your melody! 🎼" },
            { level: 44, message: "You are blessed and you are a blessing. Share your light! 🕯️" },
            { level: 45, message: "The best investment is in yourself. You're worth the effort! 💰" },
            { level: 46, message: "Marvel at the little things. Magic is everywhere! ✨" },
            { level: 47, message: "You've survived 100% of your worst days. You're invincible! 🛡️" },
            { level: 48, message: "Live fully. Love deeply. Laugh often. That's life! 🎭" },
            { level: 49, message: "You're a work of art in progress. Be patient with yourself! 🖼️" },
            { level: 50, message: "You've reached heights! Keep climbing. You're extraordinary! 🏔️" }
        ],
        
        COMBOS: [
            "Beautiful build! ✨",
            "The light grows! 🌟",
            "Keep it up! 💪",
            "Magnificent! ⭐",
            "You shine! ✝️",
            "Strength and courage! 💫",
            "Incredible! 🎯",
            "Champion! 👑"
        ],
        
        ENCOURAGEMENTS: [
            "COURAGE", "STRENGTH", "HOPE", "FAITH", "LOVE",
            "PEACE", "LIGHT", "LIFE", "JOY", "GRACE",
            "VICTORY", "GLORY", "HONOR", "BEAUTY", "GOODNESS",
            "TRUTH", "FREEDOM", "WISDOM", "POWER", "DREAM",
            "PERSEVERE", "ADVANCE", "SHINE", "SUCCEED", "CREATE",
            "BUILD", "GROW", "RADIATE", "CONQUER", "CONFIDENCE"
        ]
    },
    
    // Trophy system
    TROPHIES: [
        // Special trophies
        {
            id: 'first_steps',
            name: 'LIFT YOUR HEAD',
            icon: '🌅',
            message: 'You are a wonderful creature! The first step is always the most important.',
            condition: { type: 'level', value: 5 },
            unlocked: false,
            special: true
        },
        {
            id: 'move_now',
            name: 'MOVE NOW!',
            icon: '⚡',
            message: 'Action creates momentum. Keep moving forward, don\'t stop!',
            condition: { type: 'level', value: 10 },
            unlocked: false,
            special: true
        },
        {
            id: 'break_silence',
            name: 'BREAK THE SILENCE',
            icon: '🔊',
            message: 'Your voice matters. Express yourself, be heard. The world awaits you!',
            condition: { type: 'lines', value: 50 },
            unlocked: false,
            special: true
        },
        {
            id: 'persevere',
            name: 'PERSEVERE',
            icon: '💪',
            message: 'Perseverance beats talent. Keep going, you\'re on the right path!',
            condition: { type: 'score', value: 50000 },
            unlocked: false,
            special: true
        },
        {
            id: 'release',
            name: 'RELEASE',
            icon: '🕊️',
            message: 'Free yourself from your chains. Let go of what holds you back.',
            condition: { type: 'combo', value: 5 },
            unlocked: false,
            special: true
        },
        {
            id: 'stand_up',
            name: 'STAND UP!',
            icon: '🦁',
            message: 'Get up! You\'re a warrior, a champion. Don\'t stay down!',
            condition: { type: 'level', value: 15 },
            unlocked: false,
            special: true
        },
        {
            id: 'jesus_loves',
            name: 'YOU ARE LOVED',
            icon: '✝️',
            message: 'Jesus loves you as you are. His love is unconditional and eternal.',
            condition: { type: 'level', value: 20 },
            unlocked: false,
            special: true
        },
        {
            id: 'halfway',
            name: 'HALFWAY THERE',
            icon: '🌗',
            message: 'You\'ve come halfway! Keep going, the best is yet to come!',
            condition: { type: 'level', value: 25 },
            unlocked: false,
            special: true
        },
        {
            id: 'combo_master',
            name: 'COMBO MASTER',
            icon: '🔥',
            message: 'Extraordinary combo! You\'ve mastered the art of connection!',
            condition: { type: 'combo', value: 10 },
            unlocked: false,
            special: true
        },
        {
            id: 'warrior',
            name: 'LIGHT WARRIOR',
            icon: '⚔️',
            message: 'You\'re a warrior! Your courage inspires the world around you.',
            condition: { type: 'score', value: 200000 },
            unlocked: false,
            special: true
        },
        {
            id: 'unstoppable',
            name: 'UNSTOPPABLE',
            icon: '🚀',
            message: 'Nothing can stop you! You\'re a force of nature!',
            condition: { type: 'lines', value: 100 },
            unlocked: false,
            special: true
        },
        {
            id: 'master',
            name: 'ABSOLUTE MASTER',
            icon: '👑',
            message: 'You've achieved supreme mastery! You're extraordinary!',
            condition: { type: 'level', value: 50 },
            unlocked: false,
            special: true
        },
        {
            id: 'ultimate_trophy',
            name: 'ULTIMATE TROPHY',
            icon: '🏆',
            message: 'MAXIMUM level reached! You\'re an absolute champion! Discover Emmanuel\'s inclusive universe.',
            condition: { type: 'level', value: 20 },
            unlocked: false,
            special: true,
            hasLinks: true,
            links: [
                {
                    url: 'https://play.google.com/store/books/collection/cluster?gsr=SheCARQKEAoMVlc0MkVRQUFRQkFKEAkQBA%3D%3D:S:ANO1ljJUoCo',
                    text: '📚 Digital Version (Google Play)',
                    color: '#ff6b9d'
                },
                {
                    url: 'https://www.amazon.fr/stores/Emmanuel-Payet/author/B0CS613QFB/allbooks?ref=ap_rdr&shoppingPortalEnabled=true',
                    text: '📖 Paperback Version (Amazon)',
                    color: '#ff9800'
                }
            ]
        },
        
        // 50 Gold medals for each level
        { id: 'level_1', name: 'Level 1', icon: '🥇', message: 'First level! Strong start!', condition: { type: 'level', value: 1 }, unlocked: false },
        { id: 'level_2', name: 'Level 2', icon: '🥇', message: 'Level 2! Keep it up!', condition: { type: 'level', value: 2 }, unlocked: false },
        { id: 'level_3', name: 'Level 3', icon: '🥇', message: 'Level 3! Good progress!', condition: { type: 'level', value: 3 }, unlocked: false },
        { id: 'level_4', name: 'Level 4', icon: '🥇', message: 'Level 4! You\'re on fire!', condition: { type: 'level', value: 4 }, unlocked: false },
        { id: 'level_5', name: 'Level 5', icon: '🥇', message: 'Level 5! Excellent work!', condition: { type: 'level', value: 5 }, unlocked: false },
        { id: 'level_6', name: 'Level 6', icon: '🥇', message: 'Level 6! Powering up!', condition: { type: 'level', value: 6 }, unlocked: false },
        { id: 'level_7', name: 'Level 7', icon: '🥇', message: 'Level 7! Magnificent progress!', condition: { type: 'level', value: 7 }, unlocked: false },
        { id: 'level_8', name: 'Level 8', icon: '🥇', message: 'Level 8! Unstoppable!', condition: { type: 'level', value: 8 }, unlocked: false },
        { id: 'level_9', name: 'Level 9', icon: '🥇', message: 'Level 9! Almost to 10!', condition: { type: 'level', value: 9 }, unlocked: false },
        { id: 'level_10', name: 'Level 10', icon: '🥇', message: 'Level 10! Milestone reached!', condition: { type: 'level', value: 10 }, unlocked: false },
        { id: 'level_11', name: 'Level 11', icon: '🥇', message: 'Level 11! Climbing higher!', condition: { type: 'level', value: 11 }, unlocked: false },
        { id: 'level_12', name: 'Level 12', icon: '🥇', message: 'Level 12! Impressive!', condition: { type: 'level', value: 12 }, unlocked: false },
        { id: 'level_13', name: 'Level 13', icon: '🥇', message: 'Level 13! No bad luck for you!', condition: { type: 'level', value: 13 }, unlocked: false },
        { id: 'level_14', name: 'Level 14', icon: '🥇', message: 'Level 14! On the right path!', condition: { type: 'level', value: 14 }, unlocked: false },
        { id: 'level_15', name: 'Level 15', icon: '🥇', message: 'Level 15! Quarter way there!', condition: { type: 'level', value: 15 }, unlocked: false },
        { id: 'level_16', name: 'Level 16', icon: '🥇', message: 'Level 16! You shine!', condition: { type: 'level', value: 16 }, unlocked: false },
        { id: 'level_17', name: 'Level 17', icon: '🥇', message: 'Level 17! Superb performance!', condition: { type: 'level', value: 17 }, unlocked: false },
        { id: 'level_18', name: 'Level 18', icon: '🥇', message: 'Level 18! You\'re on fire!', condition: { type: 'level', value: 18 }, unlocked: false },
        { id: 'level_19', name: 'Level 19', icon: '🥇', message: 'Level 19! Almost to 20!', condition: { type: 'level', value: 19 }, unlocked: false },
        { id: 'level_20', name: 'Level 20', icon: '🥇', message: 'Level 20! Milestone reached! Incredible!', condition: { type: 'level', value: 20 }, unlocked: false },
        { id: 'level_21', name: 'Level 21', icon: '🥇', message: 'Level 21! Entering the elite!', condition: { type: 'level', value: 21 }, unlocked: false },
        { id: 'level_22', name: 'Level 22', icon: '🥇', message: 'Level 22! Tremendous!', condition: { type: 'level', value: 22 }, unlocked: false },
        { id: 'level_23', name: 'Level 23', icon: '🥇', message: 'Level 23! Keep going!', condition: { type: 'level', value: 23 }, unlocked: false },
        { id: 'level_24', name: 'Level 24', icon: '🥇', message: 'Level 24! Almost halfway!', condition: { type: 'level', value: 24 }, unlocked: false },
        { id: 'level_25', name: 'Level 25', icon: '🥇', message: 'Level 25! Halfway done!', condition: { type: 'level', value: 25 }, unlocked: false },
        { id: 'level_26', name: 'Level 26', icon: '🥇', message: 'Level 26! Second half begins!', condition: { type: 'level', value: 26 }, unlocked: false },
        { id: 'level_27', name: 'Level 27', icon: '🥇', message: 'Level 27! You\'re invincible!', condition: { type: 'level', value: 27 }, unlocked: false },
        { id: 'level_28', name: 'Level 28', icon: '🥇', message: 'Level 28! Such mastery!', condition: { type: 'level', value: 28 }, unlocked: false },
        { id: 'level_29', name: 'Level 29', icon: '🥇', message: 'Level 29! Almost to 30!', condition: { type: 'level', value: 29 }, unlocked: false },
        { id: 'level_30', name: 'Level 30', icon: '🥇', message: 'Level 30! Milestone reached! Legend!', condition: { type: 'level', value: 30 }, unlocked: false },
        { id: 'level_31', name: 'Level 31', icon: '🥇', message: 'Level 31! Exceptional!', condition: { type: 'level', value: 31 }, unlocked: false },
        { id: 'level_32', name: 'Level 32', icon: '🥇', message: 'Level 32! Incredible progress!', condition: { type: 'level', value: 32 }, unlocked: false },
        { id: 'level_33', name: 'Level 33', icon: '🥇', message: 'Level 33! You\'re a master!', condition: { type: 'level', value: 33 }, unlocked: false },
        { id: 'level_34', name: 'Level 34', icon: '🥇', message: 'Level 34! What talent!', condition: { type: 'level', value: 34 }, unlocked: false },
        { id: 'level_35', name: 'Level 35', icon: '🥇', message: 'Level 35! You\'re remarkable!', condition: { type: 'level', value: 35 }, unlocked: false },
        { id: 'level_36', name: 'Level 36', icon: '🥇', message: 'Level 36! Fantastic!', condition: { type: 'level', value: 36 }, unlocked: false },
        { id: 'level_37', name: 'Level 37', icon: '🥇', message: 'Level 37! You dominate!', condition: { type: 'level', value: 37 }, unlocked: false },
        { id: 'level_38', name: 'Level 38', icon: '🥇', message: 'Level 38! Almost to 40!', condition: { type: 'level', value: 38 }, unlocked: false },
        { id: 'level_39', name: 'Level 39', icon: '🥇', message: 'Level 39! One more level!', condition: { type: 'level', value: 39 }, unlocked: false },
        { id: 'level_40', name: 'Level 40', icon: '🥇', message: 'Level 40! Milestone reached! Heroic!', condition: { type: 'level', value: 40 }, unlocked: false },
        { id: 'level_41', name: 'Level 41', icon: '🥇', message: 'Level 41! You\'re superhuman!', condition: { type: 'level', value: 41 }, unlocked: false },
        { id: 'level_42', name: 'Level 42', icon: '🥇', message: 'Level 42! The ultimate answer!', condition: { type: 'level', value: 42 }, unlocked: false },
        { id: 'level_43', name: 'Level 43', icon: '🥇', message: 'Level 43! You\'re magnificent!', condition: { type: 'level', value: 43 }, unlocked: false },
        { id: 'level_44', name: 'Level 44', icon: '🥇', message: 'Level 44! Soon 45!', condition: { type: 'level', value: 44 }, unlocked: false },
        { id: 'level_45', name: 'Level 45', icon: '🥇', message: 'Level 45! Only 5 more!', condition: { type: 'level', value: 45 }, unlocked: false },
        { id: 'level_46', name: 'Level 46', icon: '🥇', message: 'Level 46! Almost at the summit!', condition: { type: 'level', value: 46 }, unlocked: false },
        { id: 'level_47', name: 'Level 47', icon: '🥇', message: 'Level 47! Only 3 more!', condition: { type: 'level', value: 47 }, unlocked: false },
        { id: 'level_48', name: 'Level 48', icon: '🥇', message: 'Level 48! Final stretch!', condition: { type: 'level', value: 48 }, unlocked: false },
        { id: 'level_49', name: 'Level 49', icon: '🥇', message: 'Level 49! One level remaining!', condition: { type: 'level', value: 49 }, unlocked: false },
        { id: 'level_50', name: 'Level 50', icon: '🥇', message: 'Level 50! MAXIMUM! You\'re LEGENDARY!', condition: { type: 'level', value: 50 }, unlocked: false }
    ],

    // Score
    SCORING: {
        SINGLE_LINE: 100,
        DOUBLE_LINE: 300,
        TRIPLE_LINE: 500,
        QUAD_LINE: 800,
        COMBO_MULTIPLIER: 50,
        SOFT_DROP: 1,
        HARD_DROP: 2
    },
    
    // Seuils de score pour les niveaux (progression plus lente et équilibrée)
    LEVEL_THRESHOLDS: [
        0,        // Niveau 0
        3000,     // Niveau 1 - environ 30 lignes
        7000,     // Niveau 2
        12000,    // Niveau 3
        18000,    // Niveau 4
        25000,    // Niveau 5
        35000,    // Niveau 6
        47000,    // Niveau 7
        61000,    // Niveau 8
        77000,    // Niveau 9
        95000,    // Niveau 10
        115000,   // Niveau 11
        138000,   // Niveau 12
        164000,   // Niveau 13
        193000,   // Niveau 14
        225000,   // Niveau 15
        260000,   // Niveau 16
        298000,   // Niveau 17
        340000,   // Niveau 18
        385000,   // Niveau 19
        435000,   // Niveau 20
        490000,   // Niveau 21
        550000,   // Niveau 22
        615000,   // Niveau 23
        685000,   // Niveau 24
        760000,   // Niveau 25
        840000,   // Niveau 26
        925000,   // Niveau 27
        1015000,  // Niveau 28
        1110000,  // Niveau 29
        1210000,  // Niveau 30
        1320000,  // Niveau 31
        1440000,  // Niveau 32
        1570000,  // Niveau 33
        1710000,  // Niveau 34
        1860000,  // Niveau 35
        2020000,  // Niveau 36
        2190000,  // Niveau 37
        2370000,  // Niveau 38
        2560000,  // Niveau 39
        2760000,  // Niveau 40
        2970000,  // Niveau 41
        3190000,  // Niveau 42
        3420000,  // Niveau 43
        3660000,  // Niveau 44
        3910000,  // Niveau 45
        4170000,  // Niveau 46
        4440000,  // Niveau 47
        4720000,  // Niveau 48
        5010000,  // Niveau 49
        5310000   // Niveau 50
    ],

    // Audio (pour plus tard)
    AUDIO: {
        ENABLED: true,
        VOLUME: 0.5
    },

    // Mobile
    MOBILE: {
        SWIPE_THRESHOLD: 30,
        TAP_THRESHOLD: 15,
        DOUBLE_TAP_DELAY: 500
    }
};

// Rendre CONFIG disponible globalement
window.CONFIG = CONFIG;

// Export pour utilisation dans autres modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
