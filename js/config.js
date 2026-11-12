/**
 * PATRIX - Configuration Globale
 * ID: E-manuel-config
 * Auteur: Emmanuel Payet
 * Message: "Abandonne la tristesse, revêts-toi de force et courage"
 */

// Mode debug (false = désactive tous les logs sauf erreurs critiques)
const DEBUG_MODE = false;

// Helper pour les logs (respecte DEBUG_MODE)
const devLog = DEBUG_MODE ? console.log.bind(console) : () => {};
const devWarn = DEBUG_MODE ? console.warn.bind(console) : () => {};

const CONFIG = {
    MAX_LEVEL: 50,
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
        COMBO_TIMEOUT: 8000,        // ms - Délai pour maintenir un combo de lignes complètes
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

    // Messages spirituels par niveau
    MESSAGES: {
        LEVELS: [
            { level: 0, message: "Abandonne la tristesse..." },
            { level: 5, message: "Revêts-toi de force !" },
            { level: 10, message: "Cultive le courage !" },
            { level: 15, message: "Transforme le désespoir..." },
            { level: 20, message: "...en grands rêves !" },
            { level: 25, message: "La lumière brille dans l'obscurité" },
            { level: 30, message: "Tu es plus fort que tu le crois" },
            { level: 40, message: "Chaque bloc posé est une victoire" },
            { level: 50, message: "Tu bâtis quelque chose de beau" }
        ],
        
        // Messages de trésor philosophiques pour chaque niveau
        TREASURES: [
            { level: 1, message: "La joie est un choix que tu fais chaque jour. Choisis-la maintenant ! ✨" },
            { level: 2, message: "Le contentement vient de l'intérieur. Tu as déjà tout ce qu'il te faut. 💫" },
            { level: 3, message: "Lâche prise sur ce que tu ne peux contrôler. La liberté t'attend ! 🕊️" },
            { level: 4, message: "Pardonne-toi. Tu as fait de ton mieux avec ce que tu savais à ce moment. 💚" },
            { level: 5, message: "Sors de ta boîte ! Le monde est plus vaste que tes peurs. 🌍" },
            { level: 6, message: "Bouge, danse, vis ! Ton corps est le temple de ton esprit. 💃" },
            { level: 7, message: "Rien n'est impossible à celui qui croit. Tu es capable de tout ! ⭐" },
            { level: 8, message: "Le courage n'est pas l'absence de peur, c'est avancer malgré elle. 🦁" },
            { level: 9, message: "Rie et chante ! La musique de ton cœur transforme le monde. 🎵" },
            { level: 10, message: "Danse sous la pluie avec le sourire ! Les tempêtes passent toujours. ☔" },
            { level: 11, message: "Ta lumière intérieure brille plus fort que toute obscurité. ✝️" },
            { level: 12, message: "Chaque petit pas compte. Continue d'avancer, tu progresses ! 👣" },
            { level: 13, message: "La gratitude transforme ce que tu as en suffisance. Merci pour aujourd'hui ! 🙏" },
            { level: 14, message: "Tu es une création unique et magnifique. Célèbre qui tu es ! 🌟" },
            { level: 15, message: "L'amour commence par toi-même. Aime-toi comme tu es aimé. ❤️" },
            { level: 16, message: "Les échecs sont des leçons déguisées. Continue d'apprendre ! 📚" },
            { level: 17, message: "Ta voix compte. Exprime-toi avec authenticité et courage. 🗣️" },
            { level: 18, message: "La patience est une forme de sagesse. Tout vient en son temps. ⏳" },
            { level: 19, message: "Respire profondément. Tu es vivant et c'est un cadeau ! 🌬️" },
            { level: 20, message: "Tes rêves sont valides. Poursuis-les avec passion et foi ! 🎯" },
            { level: 21, message: "Tu es plus résilient que tu ne l'imagines. Regarde tout ce que tu as surmonté ! 💪" },
            { level: 22, message: "Partage ton sourire. Il peut illuminer la journée de quelqu'un. 😊" },
            { level: 23, message: "L'espoir est une ancre pour l'âme. Garde espoir, toujours ! ⚓" },
            { level: 24, message: "Change ta perspective, change ta vie. Tout est question de vision ! 👁️" },
            { level: 25, message: "Tu es une force de la nature. Embrasse ta puissance ! 🌊" },
            { level: 26, message: "La gentillesse est une force, pas une faiblesse. Sois bon envers toi. 🤗" },
            { level: 27, message: "Chaque jour est une nouvelle chance de recommencer. Aujourd'hui compte ! 🌅" },
            { level: 28, message: "Tu mérites le bonheur. Ne laisse personne te dire le contraire ! 🎁" },
            { level: 29, message: "La foi déplace des montagnes. Continue de croire ! ⛰️" },
            { level: 30, message: "Tu es exactement là où tu dois être. Fais confiance au processus. 🧭" },
            { level: 31, message: "Ton histoire n'est pas encore terminée. Le meilleur reste à venir ! 📖" },
            { level: 32, message: "Célèbre chaque victoire, même les petites. Tu es un champion ! 🏆" },
            { level: 33, message: "La paix intérieure est ton droit de naissance. Revendique-la ! ☮️" },
            { level: 34, message: "Ose rêver plus grand. Le ciel n'est que le début ! ☁️" },
            { level: 35, message: "Tu inspires plus de personnes que tu ne le crois. Brille ! ✨" },
            { level: 36, message: "La vie est un cadeau. Déballe-le avec émerveillement ! 🎀" },
            { level: 37, message: "Tu as le pouvoir de créer la vie que tu désires. Commence maintenant ! 🎨" },
            { level: 38, message: "Laisse partir ce qui te pèse. Voyage léger, vole haut ! 🦅" },
            { level: 39, message: "Ton potentiel est illimité. Ne te sous-estime jamais ! 🚀" },
            { level: 40, message: "Tu es un miracle vivant. Ne l'oublie jamais ! 🌈" },
            { level: 41, message: "La confiance en soi s'apprend. Pratique-la chaque jour ! 💎" },
            { level: 42, message: "Tu es l'architecte de ton destin. Bâtis avec amour ! 🏗️" },
            { level: 43, message: "Chante ta propre chanson. Le monde a besoin de ta mélodie ! 🎼" },
            { level: 44, message: "Tu es béni et tu es une bénédiction. Partage ta lumière ! 🕯️" },
            { level: 45, message: "Le meilleur investissement est en toi-même. Tu vaux l'effort ! 💰" },
            { level: 46, message: "Émerveille-toi des petites choses. La magie est partout ! ✨" },
            { level: 47, message: "Tu as survécu à 100% de tes pires jours. Tu es invincible ! 🛡️" },
            { level: 48, message: "Vis pleinement. Aime profondément. Rie souvent. C'est ça la vie ! 🎭" },
            { level: 49, message: "Tu es une œuvre d'art en devenir. Sois patient avec toi-même ! 🖼️" },
            { level: 50, message: "Tu as atteint des sommets ! Continue d'escalader. Tu es extraordinaire ! 🏔️" }
        ],
        
        COMBOS: [
            "Belle construction ! ✨",
            "La lumière grandit ! 🌟",
            "Continue comme ça ! 💪",
            "Magnifique ! ⭐",
            "Tu rayonnes ! ✝️",
            "Force et courage ! 💫",
            "Incroyable ! 🎯",
            "Champion ! 👑"
        ],
        
        ENCOURAGEMENTS: [
            "COURAGE", "FORCE", "ESPOIR", "FOI", "AMOUR",
            "PAIX", "LUMIÈRE", "VIE", "JOIE", "GRÂCE",
            "VICTOIRE", "GLOIRE", "HONNEUR", "BEAUTÉ", "BONTÉ",
            "VÉRITÉ", "LIBERTÉ", "SAGESSE", "PUISSANCE", "RÊVE",
            "PERSEVÈRE", "AVANCE", "BRILLE", "RÉUSSIS", "CRÉE",
            "BÂTIS", "GRANDIS", "RAYONNE", "VAINCS", "CONFIANCE"
        ]
    },
    
    // Système de trophées
    TROPHIES: [
        // Médailles du respect : une réflexion à chaque étape.
        ...[
            ['dignity', 'Égale dignité', '🤝', 1, "Devant Dieu, la femme a les mêmes droits et la même dignité que l’homme. Respecter l’égalité, c’est défendre sa liberté de choisir et le droit de faire entendre sa voix."],
            ['consent', 'Un oui libre', '💬', 3, "Si elle ne peut pas dire non sans craindre ta réaction, que vaut le oui que tu attends ?"],
            ['boundaries', 'Respecter un non', '🛑', 6, "Insister après un non, c’est faire pression sur elle pour qu’elle cède. Sa liberté de choisir compte plus que ta déception. Accepte sa réponse."],
            ['empathy', 'À sa place', '🪞', 10, "Imagine ce que tu ressentirais à sa place, puis écoute-la : ton imagination ne remplace pas son expérience."],
            ['freedom', 'Aimer sans contrôler', '🕊️', 15, "Fouiller son téléphone ou lui interdire de voir ses amis, c’est contrôler sa vie. Si tu es jaloux, parle de ce que tu ressens sans lui demander de renoncer à sa liberté."],
            ['anger', 'La force du calme', '🌿', 21, "Le respect se voit aussi dans ce que tu choisis de ne pas faire quand tu es en colère."],
            ['sexism', 'Refuser le sexisme', '🗣️', 28, "Une blague qui rabaisse les femmes reste humiliante même si tout le monde rit. Tu peux dire à tes amis : « Ça la rabaisse. Ce n’est pas drôle. »"],
            ['privacy', 'Protéger son intimité', '🔒', 36, "Elle t’a confié quelque chose d’elle. Ce geste ne t’a jamais donné le droit de l’exposer."],
            ['solidarity', 'Soutenir sans imposer', '🛡️', 45, "L’aider, c’est lui rendre de la place pour décider, pas décider à sa place."],
            ['accountability', 'Assumer ses actes', '🌱', 55, "Tu sauras que tu as changé le jour où tu réagiras autrement à la même frustration."],
            ['happiness', 'Le bonheur de l’autre', '🌻', 66, "Se réjouir de la voir s’épanouir, c’est aussi se réjouir de ce qu’elle accomplit sans toi."],
            ['fantasy', 'Fantasme', '💭', 72, "La sexualité n’est pas le plus important dans la vie. La tendresse, la confiance et la complicité comptent bien davantage dans le bonheur qu’on construit à deux. Cherche avant tout à être heureux et à contribuer à son bonheur et à son épanouissement."],
            ['worth', 'La valeur', '💎', 78, "Avoir ou non une vie sexuelle ne dit rien de ta valeur. Tu n’as rien à prouver."],
            ['tenderness', 'La tendresse', '🫶', 84, "Il y a des moments de bonheur qui tiennent à peu de chose : quelqu’un qui t’écoute, un rire partagé, une présence qui te fait du bien."],
            ['desire', 'Le désir', '🧭', 90, "Le mal te fait croire que rien n’est plus important que ton désir. Peu importe ce que tu désires : sans la sagesse de l’amour, ton désir peut te mener à la folie et au chagrin. Regarde avec le cœur : si ton désir est d’aimer, protège et respecte l’autre avant tout."],
            ['love', 'L’amour', '💛', 96, "La qualité d’une relation se voit aussi dans la liberté que chacun garde d’être soi, de parler et de dire non."],
            ['full_life', 'Une vie pleine', '🌈', 102, "L’amitié, la création, l’entraide et la joie d’apprendre peuvent donner autant de sens à ta vie que l’amour ou la sexualité."],
            ["break_the_chain","Brise la chaîne du viol","🛡️",108,"Minimiser les gestes sexuels imposés et le harcèlement, c’est entretenir la culture du viol. Quand ces violences touchent quelqu’un de ta famille, c’est aussi ta vie qui est ébranlée. N’attends pas qu’elles touchent tes proches pour réagir. Dis non au harcèlement sexuel, défends le droit des femmes à vivre sans violence et soutiens celles qui en parlent."],
            ["no_manipulation","Non à la manipulation","🗝️",114,"L’amour n’est ni un programme ni un jeu. Vouloir enfermer quelqu’un dans une cage dorée, c’est de la folie : même dorée, une cage prive de liberté. L’amour ne se manipule pas. Si tu aimes quelqu’un, respecte sa liberté de choisir."],
            ["no_perfidy","Non à la perfidie","🤍",120,"Trop souvent, entre hommes, nos conversations et nos partages manquent de respect à l’intimité des femmes. Une remarque sexuelle humiliante ou une photo intime diffusée sans accord contribue à les faire vivre dans l’insécurité. Change ton cœur : choisis l’amour vrai, celui qui respecte leur intimité, même quand elles ne sont pas là."],
            ["protect_without_control","La protection sans emprise","🛡️",126,"Si tu veux la protéger, demande-lui ce dont elle a besoin. Décider à sa place peut lui retirer la liberté que tu voulais défendre."],
            ["trust_not_debt","La confiance n’est pas une dette","🤝",132,"Si tu lui dis « après tout ce que j’ai fait pour toi » pour obtenir un oui, tu transformes ta générosité en pression."],
            ["respect_in_absence","Le respect en son absence","🔒",138,"Quand un ami partage une photo intime sans son accord, ne la relaie pas. Dis-lui de la supprimer. Le respect se voit aussi dans ce que tu refuses de cautionner."],
            ["listen_first","Écouter avant de se défendre","👂",144,"Si elle te dit que tu lui as fait peur, ne commence pas par lui expliquer pourquoi elle n’aurait pas dû avoir peur. Écoute ce qu’elle a vécu."],
            ["faith_and_freedom","La foi et la liberté","🕊️",150,"N’invoque pas Dieu pour obtenir d’elle ce qu’elle ne veut pas te donner. Sa conscience et sa liberté méritent autant de respect que les tiennes."],
            ["make_amends","Réparer sans réclamer","🌱",156,"Tu peux reconnaître le mal que tu as fait sans lui demander de te pardonner. Le premier signe du changement, c’est de respecter la distance qu’elle demande."],
            ["integrity","L’intégrité","🧭",162,"Tiens parole même quand personne ne te regarde. Si tu ne peux plus tenir un engagement, dis-le franchement."],
            ["humility","L’humilité","🌿",168,"Quand quelqu’un te corrige, cherche d’abord ce que tu peux apprendre. Reconnaître une erreur ne diminue pas ta valeur."],
            ["healthy_boundaries","Le courage de poser une limite","✋",174,"Tu peux dire non avec calme, même à tes amis. Respecter les autres ne t’oblige pas à accepter ce qui te blesse."],
            ["share_responsibilities","Le partage des responsabilités","🤲",180,"Prends ta part du travail quotidien sans attendre qu’elle te le rappelle. Organiser et prévoir, c’est aussi du travail."],
            ["celebrate_success","La joie de voir l’autre réussir","🌟",186,"Célèbre sa réussite sans la comparer à la tienne. Son talent n’enlève rien au tien."],
            ["consideration","La délicatesse","💙",192,"Avant de plaisanter sur une fragilité qu’elle t’a confiée, rappelle-toi pourquoi elle t’en a parlé : elle te faisait confiance."],
            ["ask_for_help","La force de demander de l’aide","🫂",198,"Quand tu ne sais plus comment agir sans blesser, parle à une personne de confiance. Demander de l’aide, c’est prendre tes actes au sérieux."],
            ["share_peace","Recherche la paix et partage-la","🕊️",204,"Recherche la paix dans tes paroles et dans tes actes. Quand un conflit éclate, écoute avant de répondre et refuse d’humilier. Partager la paix, c’est aussi poser des limites quand quelqu’un fait du mal."],
            ["gods_light","La lumière de Dieu","🕯️",210,"Garde l'amour de Dieu comme lumière et sa sagesse dans ton cœur"],
            ["valiant_hero","Vaillant héros","⚔️",216,"Dieu te donnera la force : il est avec toi. Vaillant héros, ne reste pas prisonnier des erreurs du passé. Construis ta vie avec justice, foi et espérance, malgré les combats."]
        ].map(([id, name, icon, value, message]) => ({
            id: `respect_${id}`, name, icon, message,
            condition: { type: 'lines', value }, unlocked: false, special: false
        })),
        // Trophées spéciaux
        {
            id: 'first_steps',
            name: 'RELÈVE LA TÊTE',
            icon: '🌅',
            message: 'Tu es une créature merveilleuse ! Le premier pas est toujours le plus important.',
            condition: { type: 'level', value: 5 },
            unlocked: false,
            special: true
        },
        {
            id: 'move_now',
            name: 'BOUGE MAINTENANT !',
            icon: '⚡',
            message: 'L\'action crée le momentum. Continue d\'avancer, ne t\'arrête pas !',
            condition: { type: 'level', value: 10 },
            unlocked: false,
            special: true
        },
        {
            id: 'break_silence',
            name: 'BRISE LE SILENCE',
            icon: '🔊',
            message: 'Ta voix compte. Exprime-toi, fais-toi entendre. Le monde t\'attend !',
            condition: { type: 'lines', value: 50 },
            unlocked: false,
            special: true
        },
        {
            id: 'persevere',
            name: 'PERSÉVÈRE',
            icon: '💪',
            message: 'La persévérance bat le talent. Continue, tu es sur le bon chemin !',
            condition: { type: 'score', value: 50000 },
            unlocked: false,
            special: true
        },
        {
            id: 'release',
            name: 'RELÂCHE',
            icon: '🕊️',
            message: 'Libère-toi de tes chaînes. Lâche prise sur ce qui te retient.',
            condition: { type: 'combo', value: 5 },
            unlocked: false,
            special: true
        },
        {
            id: 'stand_up',
            name: 'DEBOUT !',
            icon: '🦁',
            message: 'Relève-toi ! Tu es un guerrier, un champion. Ne reste pas à terre !',
            condition: { type: 'level', value: 15 },
            unlocked: false,
            special: true
        },
        {
            id: 'jesus_loves',
            name: 'TU ES AIMÉ',
            icon: '✝️',
            message: 'Jésus t\'aime tel que tu es. Son amour est inconditionnel et éternel.',
            condition: { type: 'level', value: 20 },
            unlocked: false,
            special: true
        },
        {
            id: 'halfway',
            name: 'À MI-CHEMIN',
            icon: '🌗',
            message: 'Tu as parcouru la moitié du chemin ! Continue, le meilleur reste à venir !',
            condition: { type: 'level', value: 25 },
            unlocked: false,
            special: true
        },
        {
            id: 'combo_master',
            name: 'MAÎTRE DES COMBOS',
            icon: '🔥',
            message: 'Combo extraordinaire ! Tu maîtrises l\'art de la connexion !',
            condition: { type: 'combo', value: 10 },
            unlocked: false,
            special: true
        },
        {
            id: 'warrior',
            name: 'GUERRIER DE LUMIÈRE',
            icon: '⚔️',
            message: 'Tu es un guerrier ! Ton courage inspire le monde autour de toi.',
            condition: { type: 'score', value: 200000 },
            unlocked: false,
            special: true
        },
        {
            id: 'unstoppable',
            name: 'INARRÊTABLE',
            icon: '🚀',
            message: 'Rien ne peut t\'arrêter ! Tu es une force de la nature !',
            condition: { type: 'lines', value: 100 },
            unlocked: false,
            special: true
        },
        {
            id: 'master',
            name: 'MAÎTRE ABSOLU',
            icon: '👑',
            message: 'Tu as atteint la maîtrise suprême ! Tu es extraordinaire !',
            condition: { type: 'level', value: 50 },
            unlocked: false,
            special: true
        },
        {
            id: 'ultimate_trophy',
            name: 'TROPHÉE ULTIME',
            icon: '🏆',
            message: 'Niveau MAXIMUM atteint ! Tu es un champion absolu ! Découvre l\'univers inclusif d\'Emmanuel.',
            condition: { type: 'level', value: 50 },
            unlocked: false,
            special: true,
            hasLinks: true,
            links: [
                {
                    url: 'https://play.google.com/store/books/collection/cluster?gsr=SheCARQKEAoMVlc0MkVRQUFRQkFKEAkQBA%3D%3D:S:ANO1ljJUoCo',
                    text: '📚 Version Numérique (Google Play)',
                    color: '#ff6b9d'
                },
                {
                    url: 'https://www.amazon.fr/stores/Emmanuel-Payet/author/B0CS613QFB/allbooks?ref=ap_rdr&shoppingPortalEnabled=true',
                    text: '📖 Version Papier (Amazon)',
                    color: '#ff9800'
                }
            ]
        },
        
        // 50 Médailles d'or pour chaque niveau
        { id: 'level_1', name: 'Niveau 1', icon: '🥇', message: 'Premier niveau ! Tu commences fort !', condition: { type: 'level', value: 1 }, unlocked: false },
        { id: 'level_2', name: 'Niveau 2', icon: '🥇', message: 'Niveau 2 ! Continue comme ça !', condition: { type: 'level', value: 2 }, unlocked: false },
        { id: 'level_3', name: 'Niveau 3', icon: '🥇', message: 'Niveau 3 ! Tu progresses bien !', condition: { type: 'level', value: 3 }, unlocked: false },
        { id: 'level_4', name: 'Niveau 4', icon: '🥇', message: 'Niveau 4 ! Tu es en feu !', condition: { type: 'level', value: 4 }, unlocked: false },
        { id: 'level_5', name: 'Niveau 5', icon: '🥇', message: 'Niveau 5 ! Excellent travail !', condition: { type: 'level', value: 5 }, unlocked: false },
        { id: 'level_6', name: 'Niveau 6', icon: '🥇', message: 'Niveau 6 ! Tu montes en puissance !', condition: { type: 'level', value: 6 }, unlocked: false },
        { id: 'level_7', name: 'Niveau 7', icon: '🥇', message: 'Niveau 7 ! Magnifique progression !', condition: { type: 'level', value: 7 }, unlocked: false },
        { id: 'level_8', name: 'Niveau 8', icon: '🥇', message: 'Niveau 8 ! Tu es inarrêtable !', condition: { type: 'level', value: 8 }, unlocked: false },
        { id: 'level_9', name: 'Niveau 9', icon: '🥇', message: 'Niveau 9 ! Presque à 10 !', condition: { type: 'level', value: 9 }, unlocked: false },
        { id: 'level_10', name: 'Niveau 10', icon: '🥇', message: 'Niveau 10 ! Cap des 10 atteint !', condition: { type: 'level', value: 10 }, unlocked: false },
        { id: 'level_11', name: 'Niveau 11', icon: '🥇', message: 'Niveau 11 ! Tu continues ta montée !', condition: { type: 'level', value: 11 }, unlocked: false },
        { id: 'level_12', name: 'Niveau 12', icon: '🥇', message: 'Niveau 12 ! Impressionnant !', condition: { type: 'level', value: 12 }, unlocked: false },
        { id: 'level_13', name: 'Niveau 13', icon: '🥇', message: 'Niveau 13 ! Pas de malchance pour toi !', condition: { type: 'level', value: 13 }, unlocked: false },
        { id: 'level_14', name: 'Niveau 14', icon: '🥇', message: 'Niveau 14 ! Tu es sur la bonne voie !', condition: { type: 'level', value: 14 }, unlocked: false },
        { id: 'level_15', name: 'Niveau 15', icon: '🥇', message: 'Niveau 15 !', condition: { type: 'level', value: 15 }, unlocked: false },
        { id: 'level_16', name: 'Niveau 16', icon: '🥇', message: 'Niveau 16 ! Tu brilles !', condition: { type: 'level', value: 16 }, unlocked: false },
        { id: 'level_17', name: 'Niveau 17', icon: '🥇', message: 'Niveau 17 ! Superbe performance !', condition: { type: 'level', value: 17 }, unlocked: false },
        { id: 'level_18', name: 'Niveau 18', icon: '🥇', message: 'Niveau 18 ! Tu es en feu !', condition: { type: 'level', value: 18 }, unlocked: false },
        { id: 'level_19', name: 'Niveau 19', icon: '🥇', message: 'Niveau 19 ! Presque à 20 !', condition: { type: 'level', value: 19 }, unlocked: false },
        { id: 'level_20', name: 'Niveau 20', icon: '🥇', message: 'Niveau 20 ! Cap des 20 ! Incroyable !', condition: { type: 'level', value: 20 }, unlocked: false },
        { id: 'level_21', name: 'Niveau 21', icon: '🥇', message: 'Niveau 21 ! Tu entres dans l\'élite !', condition: { type: 'level', value: 21 }, unlocked: false },
        { id: 'level_22', name: 'Niveau 22', icon: '🥇', message: 'Niveau 22 ! Formidable !', condition: { type: 'level', value: 22 }, unlocked: false },
        { id: 'level_23', name: 'Niveau 23', icon: '🥇', message: 'Niveau 23 ! Continue ainsi !', condition: { type: 'level', value: 23 }, unlocked: false },
        { id: 'level_24', name: 'Niveau 24', icon: '🥇', message: 'Niveau 24 ! Presque à mi-chemin !', condition: { type: 'level', value: 24 }, unlocked: false },
        { id: 'level_25', name: 'Niveau 25', icon: '🥇', message: 'Niveau 25 ! Moitié accomplie !', condition: { type: 'level', value: 25 }, unlocked: false },
        { id: 'level_26', name: 'Niveau 26', icon: '🥇', message: 'Niveau 26 ! Deuxième moitié commence !', condition: { type: 'level', value: 26 }, unlocked: false },
        { id: 'level_27', name: 'Niveau 27', icon: '🥇', message: 'Niveau 27 ! Tu es invincible !', condition: { type: 'level', value: 27 }, unlocked: false },
        { id: 'level_28', name: 'Niveau 28', icon: '🥇', message: 'Niveau 28 ! Quelle maîtrise !', condition: { type: 'level', value: 28 }, unlocked: false },
        { id: 'level_29', name: 'Niveau 29', icon: '🥇', message: 'Niveau 29 ! Presque à 30 !', condition: { type: 'level', value: 29 }, unlocked: false },
        { id: 'level_30', name: 'Niveau 30', icon: '🥇', message: 'Niveau 30 ! Cap des 30 ! Légende !', condition: { type: 'level', value: 30 }, unlocked: false },
        { id: 'level_31', name: 'Niveau 31', icon: '🥇', message: 'Niveau 31 ! Tu es exceptionnel !', condition: { type: 'level', value: 31 }, unlocked: false },
        { id: 'level_32', name: 'Niveau 32', icon: '🥇', message: 'Niveau 32 ! Incroyable progression !', condition: { type: 'level', value: 32 }, unlocked: false },
        { id: 'level_33', name: 'Niveau 33', icon: '🥇', message: 'Niveau 33 ! Tu es un maître !', condition: { type: 'level', value: 33 }, unlocked: false },
        { id: 'level_34', name: 'Niveau 34', icon: '🥇', message: 'Niveau 34 ! Quel talent !', condition: { type: 'level', value: 34 }, unlocked: false },
        { id: 'level_35', name: 'Niveau 35', icon: '🥇', message: 'Niveau 35 ! Tu es remarquable !', condition: { type: 'level', value: 35 }, unlocked: false },
        { id: 'level_36', name: 'Niveau 36', icon: '🥇', message: 'Niveau 36 ! Fantastique !', condition: { type: 'level', value: 36 }, unlocked: false },
        { id: 'level_37', name: 'Niveau 37', icon: '🥇', message: 'Niveau 37 ! Tu domines !', condition: { type: 'level', value: 37 }, unlocked: false },
        { id: 'level_38', name: 'Niveau 38', icon: '🥇', message: 'Niveau 38 ! Presque à 40 !', condition: { type: 'level', value: 38 }, unlocked: false },
        { id: 'level_39', name: 'Niveau 39', icon: '🥇', message: 'Niveau 39 ! Un niveau de plus !', condition: { type: 'level', value: 39 }, unlocked: false },
        { id: 'level_40', name: 'Niveau 40', icon: '🥇', message: 'Niveau 40 ! Cap des 40 ! Héroïque !', condition: { type: 'level', value: 40 }, unlocked: false },
        { id: 'level_41', name: 'Niveau 41', icon: '🥇', message: 'Niveau 41 ! Tu es surhumain !', condition: { type: 'level', value: 41 }, unlocked: false },
        { id: 'level_42', name: 'Niveau 42', icon: '🥇', message: 'Niveau 42 ! La réponse ultime !', condition: { type: 'level', value: 42 }, unlocked: false },
        { id: 'level_43', name: 'Niveau 43', icon: '🥇', message: 'Niveau 43 ! Tu es grandiose !', condition: { type: 'level', value: 43 }, unlocked: false },
        { id: 'level_44', name: 'Niveau 44', icon: '🥇', message: 'Niveau 44 ! Bientôt 45 !', condition: { type: 'level', value: 44 }, unlocked: false },
        { id: 'level_45', name: 'Niveau 45', icon: '🥇', message: 'Niveau 45 ! Plus que 5 !', condition: { type: 'level', value: 45 }, unlocked: false },
        { id: 'level_46', name: 'Niveau 46', icon: '🥇', message: 'Niveau 46 ! Presque au sommet !', condition: { type: 'level', value: 46 }, unlocked: false },
        { id: 'level_47', name: 'Niveau 47', icon: '🥇', message: 'Niveau 47 ! Plus que 3 !', condition: { type: 'level', value: 47 }, unlocked: false },
        { id: 'level_48', name: 'Niveau 48', icon: '🥇', message: 'Niveau 48 ! Dernière ligne droite !', condition: { type: 'level', value: 48 }, unlocked: false },
        { id: 'level_49', name: 'Niveau 49', icon: '🥇', message: 'Niveau 49 ! Un seul niveau restant !', condition: { type: 'level', value: 49 }, unlocked: false },
        { id: 'level_50', name: 'Niveau 50', icon: '🥇', message: 'Niveau 50 ! MAXIMUM ! Tu es LÉGENDAIRE !', condition: { type: 'level', value: 50 }, unlocked: false }
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

