/* Scientific source ledger and original training content for NeuroScope.
 * The PDF is not redistributed. Questions are newly written, not annals. */

export const source = {
  title: 'Tissu nerveux 1 — ronéo Lyon Sud 2026, à partir du cours du Pr Desestret',
  fileName: 'TN1___Ron_o_2026.pdf',
  pages: 14,
  sha256: '53f8056101374aaebbf279d1e73e494e78cfbe2093071f725868ae145bce2283',
  bytes: 4657412,
  pagination: 'Les références indiquent la page du fichier PDF, puis la page de ronéo : PDF p. n = ronéo p. n − 1. La première page, non numérotée, correspond à la page 0 selon le sommaire ; les suivantes portent 1 à 13.',
  attribution: 'Document étudiant fourni par l’utilisateur, signé L. Bastin-Heline-ESA-UE5 Histologie. Cette synthèse indépendante n’est pas une validation par l’enseignant.',
};

export const references = {
  tn1: {
    title: 'TN1 — ronéo Tissu nerveux 1, Lyon Sud 2026',
    url: '',
    note: 'Source principale locale fournie par l’utilisateur. PDF de 14 pages correspondant aux pages 0 à 13 de la ronéo ; la première ne porte pas de numéro imprimé. Import personnel vérifié par SHA-256 ; aucun fichier ni figure redistribués.',
  },
  'ostx-tissue': {
    title: 'OpenStax, Anatomy and Physiology 2e, 12.2 — Nervous Tissue',
    url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-2-nervous-tissue',
    note: 'Compléments : morphologie neuronale et gliale, myélinisation centrale/périphérique, nœuds et conduction. Texte reformulé ; aucune figure copiée.',
  },
  'ostx-development': {
    title: 'OpenStax, Anatomy and Physiology 2e, 13.1 — The Embryologic Perspective',
    url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/13-1-the-embryologic-perspective',
    note: 'Compléments : tube neural, crêtes neurales, organisation des régions du SNC et origine du tissu nerveux entérique.',
  },
  'ostx-cns': {
    title: 'OpenStax, Anatomy and Physiology 2e, 13.2 — The Central Nervous System',
    url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/13-2-the-central-nervous-system',
    note: 'Compléments : noyaux de la base distincts des noyaux du tronc, rapports des régions cérébrales, organisation médullaire.',
  },
  'ostx-covering': {
    title: 'OpenStax, Anatomy and Physiology 2e, 13.3 — Circulation and the Central Nervous System',
    url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/13-3-circulation-and-the-central-nervous-system',
    note: 'Compléments : méninges, replis duraux, circulation ventriculaire, espaces sous-arachnoïdiens et résorption classique du LCS. Les formulations générales sont précisées par les revues des barrières.',
  },
  'ostx-pns': {
    title: 'OpenStax, Anatomy and Physiology 2e, 13.4 — The Peripheral Nervous System',
    url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/13-4-the-peripheral-nervous-system',
    note: 'Compléments : racines, ganglions sensitifs/autonomes, plexus et nerfs. Pour la nature spécialisée du périnèvre, priorité au détail histologique de TN1 PDF p. 11 plutôt qu’au raccourci « connective tissue ».',
  },
  'ostx-digestive': {
    title: 'OpenStax, Anatomy and Physiology 2e, 23.1 — Overview of the Digestive System',
    url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-1-overview-of-the-digestive-system',
    note: 'Compléments : couches de la paroi digestive, plexus myentérique et sous-muqueux, rôles moteurs et sécrétoires.',
  },
  'bbb-review': {
    title: 'Daneman R, Prat A. The Blood–Brain Barrier. Cold Spring Harb Perspect Biol. 2015;7:a020412.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4292164/',
    note: 'Complément vérifié : jonctions serrées endothéliales, transport, péricytes, membranes basales et pieds astrocytaires ; distinctions cellulaires de l’unité neurovasculaire.',
  },
  'choroid-review': {
    title: 'Solár P et al. Choroid plexus and the blood-cerebrospinal fluid barrier in disease. Fluids Barriers CNS. 2020;17:35.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7201396/',
    note: 'Complément vérifié : stroma à capillaires fenêtrés, épithélium choroïdien à jonctions serrées et production du LCS. La barrière est épithéliale, à distinguer de l’endothélium de la BHE.',
  },
  'ependymal-review': {
    title: 'Serra R, Simard JM. Adherens, tight, and gap junctions in ependymal cells: A systematic review of their contribution to CSF-brain barrier. Front Neurol. 2023;14:1092205.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10079940/',
    note: 'Complément de nuance : l’épendyme est une interface active ; ses jonctions varient avec l’âge, l’espèce et l’état pathologique. Ne pas l’assimiler à la barrière sang-LCS choroïdienne ni affirmer une perméabilité absolue uniforme.',
  },
  'meninges-review': {
    title: 'Dasgupta K, Jeong J. Developmental biology of the meninges. Genesis. 2019;57:e23288.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6520190/',
    note: 'Complément vérifié : contributions des crêtes neurales et du mésoderme aux méninges selon les régions. « Mésenchymateux » ne signifie pas nécessairement « exclusivement mésodermique ».',
  },
  'microglia-review': {
    title: 'Ginhoux F et al. Origin and differentiation of microglia. Front Cell Neurosci. 2013;7:45.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3627983/',
    note: 'Complément vérifié : lignée macrophagique embryonnaire du sac vitellin et persistance de la microglie dans le SNC adulte.',
  },
  'lymph-review': {
    title: 'Louveau A et al. Structural and functional features of central nervous system lymphatics. Nature. 2015;523:337–341.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4506234/',
    note: 'Complément, principalement expérimental murin : vaisseaux lymphatiques méningés associés aux sinus duraux et drainage vers les ganglions cervicaux profonds. Aucune quantification transposée à l’adulte humain.',
  },
  'white-review': {
    title: 'Fischer M, Kukley M. Hidden in the white matter: Current views on interstitial white matter neurons. The Neuroscientist. 2025. DOI:10.1177/10738584241282969.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12255840/',
    note: 'Complément de limite au schéma PASS : des neurones interstitiels existent dans la substance blanche. Le module conserve le contraste architectural général de TN1 sans transformer « aucun corps neuronal » en loi anatomique universelle.',
  },
};

function option(text, correct, explanation, structure) { return { text, correct, explanation, structure }; }

export const questions = [
  {
    id: 'original-organisation', title: 'Deux classifications, deux questions', structure: 'body', pages: [2, 3],
    prompt: 'QRM original — Sélectionne les affirmations cohérentes avec l’organisation présentée dans TN1. Une à cinq réponses sont possibles.',
    options: [
      option('L’opposition central/périphérique décrit une organisation anatomique.', true, 'SNC/SNP est la classification anatomique ; somatique/autonome est une classification fonctionnelle.', 'body'),
      option('Une structure autonome est obligatoirement située en dehors du névraxe.', false, 'Des structures autonomes existent dans le SNC et dans le SNP ; fonction ne préjuge pas de la localisation.', 'body'),
      option('L’encéphale comprend le cervelet en plus du cerveau et du tronc cérébral.', true, 'Ces trois ensembles forment l’encéphale ; l’ajout de la moelle constitue le SNC.', 'cerebellum'),
      option('Le nerf optique doit être classé parmi les nerfs périphériques simplement parce qu’il porte le nom de nerf.', false, 'TN1 signale explicitement le nerf optique, paire II, comme une structure du SNC.', 'head'),
      option('Un même nerf peut véhiculer des composantes somatiques et végétatives.', true, 'La ronéo donne le nerf vague comme exemple de coexistence de composantes fonctionnelles.', 'nerve'),
    ],
  },
  {
    id: 'original-grise', title: 'Reconnaître une région de substance grise', structure: 'gray-matter', pages: [7, 8, 9],
    prompt: 'QRM original — Une coupe montre des somas neuronaux, des capillaires et un réseau de prolongements. Quelles conclusions sont justifiées ?',
    options: [
      option('Cet assemblage est compatible avec une région de substance grise.', true, 'Corps neuronaux et gliaux, capillaires et neuropile constituent la description de la substance grise.', 'gray-matter'),
      option('La découverte d’une fibre myélinisée impose de reclasser toute la région en substance blanche.', false, 'TN1 précise que la myéline est aussi présente dans la substance grise.', 'myelin'),
      option('Des oligodendrocytes peuvent participer à l’environnement de cette région.', true, 'La substance grise n’exclut pas les oligodendrocytes ; ces glies sont centrales.', 'oligodendrocyte'),
      option('Les prolongements gliaux appartiennent au réseau intercellulaire appelé neuropile.', true, 'Le neuropile associe des éléments neuronaux, synaptiques et gliaux.', 'neuropil'),
      option('Une cellule satellite ganglionnaire est une glie normale de ce parenchyme central.', false, 'Les cellules satellites appartiennent aux ganglions du SNP ; elles ne sont pas une composante normale de la substance grise centrale.', 'satellite'),
    ],
  },
  {
    id: 'original-neuropile', title: 'Décomposer le neuropile', structure: 'neuropil', pages: [7, 8],
    prompt: 'QRM original — Un modèle agrandit le réseau situé entre les corps neuronaux. Sélectionne les descriptions correctes de ce réseau.',
    options: [
      option('Des ramifications dendritiques peuvent y être représentées.', true, 'Les dendrites font partie des prolongements neuronaux du neuropile.', 'dendrite'),
      option('Les éléments synaptiques doivent être exclus de sa définition.', false, 'Les synapses font explicitement partie du neuropile.', 'synapse'),
      option('Des segments axonaux peuvent s’y trouver.', true, 'La définition inclut les prolongements axonaux et pas seulement les dendrites.', 'axon'),
      option('Un prolongement astrocytaire fait partie des éléments gliaux possibles.', true, 'Les prolongements gliaux sont une composante du neuropile.', 'astrocyte'),
      option('Le dessin de boutons individualisés signifie qu’ils seraient identifiables sur une coupe standard en microscopie optique.', false, 'Le modèle change d’échelle ; TN1 rappelle que les synapses ne se distinguent pas individuellement en MO standard.', 'synapse'),
    ],
  },
  {
    id: 'original-blanche', title: 'Substance blanche : architecture et limites du vocabulaire', structure: 'white-matter', pages: [8, 9, 10],
    prompt: 'QRM original — Dans le schéma architectural général de TN1, quelles interprétations sont correctes ? Les exceptions microscopiques ne sont pas l’objet de cette question.',
    options: [
      option('Un faisceau d’axones myélinisés correspond à une organisation de conduction.', true, 'La substance blanche est présentée comme un tissu de conduction, dominé par les faisceaux axonaux myélinisés.', 'white-matter'),
      option('L’expression « aucun élément de neurone » convient puisque les corps neuronaux n’y dominent pas.', false, 'Les axones sont des parties de neurones. Il faut distinguer « corps cellulaire neuronal » et « élément neuronal ».', 'axon'),
      option('Les cordons périphériques d’une coupe de moelle sont des territoires de substance blanche.', true, 'Les cordons antérieurs, latéraux et postérieurs occupent la périphérie médullaire.', 'spinal-cord'),
      option('Dans une préparation standard, un halo clair autour d’un axone peut correspondre à de la myéline dont les lipides ont été extraits.', true, 'L’extraction lipidique explique les halos clairs décrits dans les préparations de TN1.', 'myelin'),
      option('Le corps calleux est un exemple de cortex riche en corps neuronaux.', false, 'Le corps calleux est un grand faisceau de substance blanche, et non un cortex.', 'corpus-callosum'),
    ],
  },
  {
    id: 'original-meninges', title: 'Traverser les enveloppes sans créer un faux espace', structure: 'meninges', pages: [5, 6],
    prompt: 'QRM original — Lors d’une exploration de l’extérieur vers le parenchyme, quelles descriptions respectent les rapports méningés ?',
    options: [
      option('L’arachnoïde est superficielle à la pie-mère.', true, 'L’ordre est dure-mère, arachnoïde, espace sous-arachnoïdien puis pie-mère.', 'arachnoid'),
      option('Le compartiment contenant le LCS entre arachnoïde et pie-mère est un espace anatomique réel.', true, 'Il s’agit de l’espace sous-arachnoïdien.', 'subarachnoid'),
      option('Une lame vide entre dure-mère et arachnoïde sur une préparation peut résulter de la technique histologique.', true, 'TN1 illustre une séparation artéfactuelle ; il ne faut pas en faire une cavité normale libre.', 'dura'),
      option('L’avascularité de l’arachnoïde signifie qu’aucun vaisseau ne passe dans l’espace sous-arachnoïdien.', false, 'Des vaisseaux cheminent dans cet espace, bien que l’arachnoïde soit avasculaire.', 'subarachnoid'),
      option('La pie-mère se définit comme une lame conjonctive dépourvue de vascularisation.', false, 'La pie-mère est une fine lame de tissu conjonctif vascularisé.', 'pia'),
    ],
  },
  {
    id: 'original-interfaces', title: 'Identifier les bonnes cellules à la bonne interface', structure: 'interfaces', pages: [4, 5],
    prompt: 'QRM original — Associe chaque interface à son compartiment. La question s’appuie sur le texte de TN1, sans reprendre l’ancienne correction contradictoire du QRM 32.',
    options: [
      option('L’épendyme est au contact du LCS des cavités centrales.', true, 'Il tapisse les cavités ventriculaires et le canal central.', 'ependyma'),
      option('La glie limitante comporte des pieds astrocytaires.', true, 'TN1 décrit une couche de pieds astrocytaires associée à une membrane basale.', 'glia-limitans'),
      option('L’arachnoïde est un élément obligatoire de la définition piogliale donnée dans le texte du cours.', false, 'La définition du texte PDF p. 5 associe pie-mère et glie limitante ; l’ancienne correction PDF p. 14 est discordante sur ce point.', 'glia-limitans'),
      option('La BHE se situe à l’interface entre le sang et le tissu nerveux.', true, 'La BHE concerne l’interface sang/parenchyme, distincte de l’interface sang/LCS choroïdienne.', 'bbb'),
      option('Tout le revêtement des ventricules est constitué de plexus choroïdes.', false, 'L’épendyme assure le revêtement ; les plexus choroïdes sont des structures spécialisées localisées.', 'choroid-plexus'),
    ],
  },
  {
    id: 'original-glies', title: 'Localisation et origine des glies', structure: 'astrocyte', pages: [3, 4, 7, 8],
    prompt: 'QRM original — Sélectionne les associations cellule/territoire/origine compatibles avec TN1.',
    options: [
      option('L’astrocyte appartient à la névroglie centrale.', true, 'Les astrocytes sont répertoriés dans le SNC, au sein de la substance grise et blanche.', 'astrocyte'),
      option('La cellule de Schwann est la glie myélinisante habituelle du cortex cérébral.', false, 'Schwann appartient au SNP ; la myélinisation centrale relève des oligodendrocytes.', 'schwann'),
      option('L’épendymocyte fait partie des cellules gliales du SNC.', true, 'Il est classé parmi les glies centrales et forme le revêtement épendymaire.', 'ependymocyte'),
      option('La microglie doit recevoir la même origine neurectodermique que l’astrocyte.', false, 'TN1 distingue l’origine mésenchymateuse de la microglie de l’origine neurectodermique des macroglies.', 'microglia'),
      option('Une cellule satellite peut entourer le soma d’un neurone ganglionnaire périphérique.', true, 'Les ganglions sensitifs et autonomes comportent des cellules satellites.', 'satellite'),
    ],
  },
  {
    id: 'original-nerf', title: 'Ouvrir un nerf périphérique', structure: 'nerve', pages: [11],
    prompt: 'QRM original — Une coupe ouvre un nerf et expose ses fascicules. Quelles légendes sont adaptées ?',
    options: [
      option('Un fascicule peut contenir des fibres myélinisées et des fibres amyéliniques.', true, 'Une fibre nerveuse est un axone myélinisé ou non ; le nerf regroupe ces fibres en fascicules.', 'fascicle'),
      option('L’endonèvre se situe entre les fibres, à l’intérieur du fascicule.', true, 'C’est le tissu conjonctif lâche intrafasciculaire décrit par TN1.', 'endoneurium'),
      option('Le périnèvre délimite le fascicule.', true, 'Il constitue sa gaine spécialisée, faite de couches de cellules périneurales.', 'perineurium'),
      option('Le paranèvre est le nom de la gaine de myéline d’un axone périphérique.', false, 'Dans TN1, le paranèvre est une enveloppe conjonctive externe du nerf ; la myéline est produite par une glie.', 'paraneurium'),
      option('Les vasa nervorum sont décrits dans l’épinèvre.', true, 'L’épinèvre contient de nombreux vaisseaux nourriciers, ainsi que collagène, fibroblastes et adipocytes.', 'epineurium'),
    ],
  },
  {
    id: 'original-perinevre', title: 'Ne pas confondre les gaines', structure: 'perineurium', pages: [11],
    prompt: 'QRM original — Quelles propositions décrivent correctement les gaines selon la terminologie de TN1 ?',
    options: [
      option('Des cellules aplaties en couches constituent le périnèvre.', true, 'TN1 décrit environ une dizaine de couches de cellules périneurales, avec lames basales et quelques microfibrilles de collagène.', 'perineurium'),
      option('Il suffit de qualifier le périnèvre de simple tissu conjonctif dense pour décrire sa nature cellulaire.', false, 'Ce raccourci efface l’organisation spécialisée des cellules périneurales, explicitement distinguée dans la ronéo.', 'perineurium'),
      option('L’épinèvre réunit les fascicules et contient notamment des adipocytes.', true, 'La ronéo décrit un tissu conjonctif dense avec adipocytes et vaisseaux nourriciers.', 'epineurium'),
      option('La présence de capillaires continus est compatible avec l’endonèvre.', true, 'Ils font partie de la composition endoneurale décrite dans TN1.', 'endoneurium'),
      option('Le périnèvre et le paranèvre désignent exactement la même limite.', false, 'Le périnèvre entoure un fascicule ; le paranèvre est décrit à la périphérie du nerf.', 'paraneurium'),
    ],
  },
  {
    id: 'original-ganglions', title: 'Repérer un relais ganglionnaire', structure: 'sensory-ganglion', pages: [12],
    prompt: 'QRM original — Compare un ganglion sensitif spinal classique et un ganglion autonome. Sélectionne les affirmations justes.',
    options: [
      option('Les deux contiennent des corps cellulaires neuronaux.', true, 'Le ganglion est défini par un amas de corps neuronaux accompagné de glie et d’un stroma.', 'sensory-ganglion'),
      option('Des cellules satellites sont présentes dans les deux types.', true, 'Elles entourent les corps neuronaux dans les ganglions périphériques.', 'satellite'),
      option('Le ganglion sensitif spinal constitue classiquement un relais synaptique entre deux neurones.', false, 'Le schéma classique décrit une absence de synapses intraganglionnaires de relais dans le ganglion sensitif.', 'sensory-ganglion'),
      option('Le ganglion autonome peut comporter de nombreuses synapses.', true, 'Les fibres préganglionnaires y font relais sur les neurones ganglionnaires.', 'autonomic-ganglion'),
      option('Une capsule fibreuse exclut la présence d’un stroma conjonctif intraganglionnaire.', false, 'TN1 décrit au contraire un stroma en continuité avec la capsule.', 'sensory-ganglion'),
    ],
  },
  {
    id: 'original-enterique', title: 'Placer les deux plexus digestifs', structure: 'enteric', pages: [3, 13],
    prompt: 'QRM original — Dans la paroi digestive, quelles associations sont correctes ?',
    options: [
      option('Le plexus de Meissner est localisé dans la sous-muqueuse.', true, 'C’est le plexus sous-muqueux.', 'meissner'),
      option('Le plexus d’Auerbach est associé à la musculeuse.', true, 'Il est dit myentérique ; le complément anatomique le place entre les couches musculaires circulaire et longitudinale.', 'auerbach'),
      option('Les ganglions entériques ne contiennent que des neurones, sans glie.', false, 'TN1 indique des corps neuronaux ET des cellules gliales entériques.', 'enteric'),
      option('Les mailles des réseaux sont constituées notamment par les axones qui relient les ganglions.', true, 'La ronéo distingue les corps neuronaux ganglionnaires et leurs axones dans les mailles du réseau.', 'axon'),
      option('Le système entérique doit être assimilé à une portion de la moelle spinale.', false, 'Il est dans la paroi digestive, appartient au SNP dans le repérage anatomique et à l’organisation autonome dans la classification fonctionnelle.', 'enteric'),
    ],
  },
  {
    id: 'original-lcs', title: 'LCS : liquide, cavités et surfaces', structure: 'csf', pages: [4, 5],
    prompt: 'QRM original — Sélectionne les descriptions cohérentes avec les compartiments du LCS exposés dans TN1.',
    options: [
      option('Les plexus choroïdes participent à la production du LCS.', true, 'Ils sont identifiés comme structures productrices dans TN1.', 'choroid-plexus'),
      option('Le LCS est limité aux cavités ventriculaires et ne se trouve pas autour du névraxe.', false, 'TN1 décrit des compartiments ventriculaires et sous-arachnoïdiens péri-encéphaliques et périmédullaires.', 'subarachnoid'),
      option('L’aqueduc cérébral met en communication les troisième et quatrième ventricules.', true, 'Il est le passage entre ces deux cavités ; la topographie détaillée est expliquée dans le complément anatomique.', 'aqueduct'),
      option('Le revêtement épendymaire appartient à l’interface avec les cavités centrales.', true, 'Il est formé d’épendymocytes et borde notamment les ventricules et le canal central.', 'ependyma'),
      option('Le sang circulant dans un capillaire cérébral est le même compartiment que le LCS sous-arachnoïdien.', false, 'Le sang, le LCS et le parenchyme sont des compartiments distincts séparés par des interfaces différentes.', 'interfaces'),
    ],
  },
];

// Explicit external references for corrections that add detail beyond TN1.
const questionReferences = {
  'original-blanche': ['white-review'],
  'original-interfaces': ['choroid-review'],
  'original-glies': ['ostx-tissue'],
  'original-ganglions': ['ostx-pns'],
  'original-enterique': ['ostx-digestive'],
  'original-lcs': ['ostx-covering'],
};
for (const question of questions) {
  question.references = questionReferences[question.id] || [];
  question.note = question.references.length ? 'Les pages indiquées renvoient à TN1 ; les compléments de correction sont identifiés par les références externes ci-dessous.' : 'Question originale fondée sur les pages de TN1 indiquées, sans reproduction d’annale.';
}

export const comparison = {
  graywhite: {
    title: 'Substance grise et substance blanche', headers: ['Critère', 'Substance grise', 'Substance blanche'], pages: [7, 8, 9, 10],
    rows: [
      ['Organisation dominante', 'Corps neuronaux et gliaux, capillaires et neuropile', 'Faisceaux axonaux, glies et capillaires'],
      ['Fonction', 'Contacts, réception et intégration synaptiques', 'Conduction et connexions entre territoires'],
      ['Axones et myéline', 'Présents aussi dans la substance grise', 'Nombreux axones, souvent myélinisés'],
      ['Glies normales', 'Astrocytes, oligodendrocytes, microglie', 'Astrocytes, oligodendrocytes, microglie'],
      ['Hémisphères', 'Cortex superficiel et noyaux profonds', 'Sous le cortex, entre les territoires de substance grise'],
      ['Moelle', 'Région centrale avec cornes', 'Cordons périphériques'],
    ], note: 'Contraste architectural de TN1. Les formules absolues sur l’absence de tout corps neuronal ou de toute synapse en substance blanche ne constituent pas une loi universelle : voir le complément sur les neurones interstitiels.',
  },
  myelin: {
    title: 'Oligodendrocyte et cellule de Schwann', headers: ['Critère', 'Oligodendrocyte', 'Cellule de Schwann'], pages: [3, 4, 8, 11],
    rows: [
      ['Territoire', 'SNC', 'SNP'],
      ['Origine', 'Tube neural', 'Crêtes neurales'],
      ['Organisation myélinisante', 'Une cellule peut former plusieurs internœuds', 'Une cellule myélinisante forme un internœud d’un axone'],
      ['Prolongements', 'Plusieurs prolongements myélinisants possibles', 'Enveloppement d’un segment axonal par la cellule myélinisante'],
      ['Axones amyéliniques périphériques', 'Ne les enveloppe pas dans le SNP', 'Cellules non myélinisantes : enveloppement possible sans myéline compacte'],
    ], note: 'La localisation et l’origine générale figurent dans TN1. Les détails d’internœuds et des Schwann non myélinisantes sont des compléments OpenStax 12.2 et 13.1.',
  },
  ganglia: {
    title: 'Ganglion sensitif spinal et ganglion autonome', headers: ['Critère', 'Sensitif spinal', 'Autonome'], pages: [12],
    rows: [
      ['Corps neuronaux', 'Neurones sensitifs pseudounipolaires', 'Neurones autonomes généralement multipolaires'],
      ['Glie autour des somas', 'Cellules satellites', 'Cellules satellites'],
      ['Relais synaptique classique', 'Absence habituelle de synapse de relais intraganglionnaire', 'Synapses des fibres préganglionnaires avec les neurones ganglionnaires'],
      ['Fibres', 'Branche périphérique et centrale des neurones sensitifs', 'Fibres préganglionnaires et postganglionnaires'],
      ['Enveloppe', 'Capsule et stroma conjonctifs', 'Stroma et enveloppe variables selon le territoire'],
    ], note: 'TN1 fonde la comparaison sur les cellules et les synapses ; polarité et circuits pré/postganglionnaires sont des compléments OpenStax. La mention de XI parmi les ganglions sensitifs crâniens n’est pas reprise.',
  },
  barriers: {
    title: 'Deux barrières, deux cellules porteuses des jonctions serrées', headers: ['Critère', 'Barrière hématoencéphalique', 'Barrière sang-LCS choroïdienne'], pages: [4, 5],
    rows: [
      ['Compartiments', 'Sang ↔ tissu nerveux', 'Sang/stroma choroïdien ↔ LCS'],
      ['Cellule barrière', 'Cellule endothéliale du capillaire', 'Cellule épithéliale choroïdienne'],
      ['Jonctions serrées', 'Entre cellules endothéliales', 'Entre cellules épithéliales'],
      ['Capillaires', 'Endothélium spécialisé à faible passage paracellulaire', 'Capillaires fenêtrés du stroma, en amont de la barrière épithéliale'],
      ['Environnement', 'Membrane basale, péricytes et pieds astrocytaires', 'Stroma et revêtement choroïdien polarisé'],
    ], note: 'Les détails cellulaires sont des compléments des revues Daneman/Prat et Solár et al. L’épendyme ordinaire est une troisième organisation : ne pas l’assimiler à l’une de ces deux barrières.',
  },
  arrangement: {
    title: 'Organisation cérébrale et médullaire', headers: ['Repère', 'Hémisphères cérébraux', 'Moelle spinale'], pages: [7, 8, 9, 10],
    rows: [
      ['Substance grise', 'Cortex superficiel ET noyaux profonds', 'Centrale, cornes dorsales et ventrales'],
      ['Substance blanche', 'Principalement sous-corticale', 'Périphérique : cordons'],
      ['Cavité de LCS', 'Système ventriculaire', 'Canal central, branche secondaire dans le modèle adulte'],
    ], note: 'La formule « disposition inversée » aide à comparer cortex et moelle mais ne supprime pas les noyaux gris profonds de l’encéphale.',
  },
  envelopes: {
    title: 'Enveloppes crâniennes et spinales', headers: ['Repère', 'Crânien', 'Spinal'], pages: [5, 6],
    rows: [
      ['Dure-mère', 'Feuillets périosté et méningé ; sinus duraux', 'Sac dural distinct du périoste vertébral'],
      ['Espace épidural', 'Potentiel en situation normale', 'Réel, contenant notamment graisse et plexus veineux'],
      ['Sous-dural', 'Plan potentiel ou décollement artéfactuel/pathologique', 'Même prudence : ne pas dessiner une cavité normale libre de LCS'],
      ['Sous-arachnoïdien', 'Espace réel de LCS et vaisseaux', 'Espace réel de LCS autour de la moelle et des racines'],
    ], note: 'TN1 précise le plan sous-dural artéfactuel et les couches méningées ; la comparaison crânienne/spinale détaillée est un complément OpenStax 13.3.',
  },
  meninges: {
    title: 'Méninges : trois couches, des espaces distincts', headers: ['Élément', 'Nature', 'Piège'], pages: [5, 6],
    rows: [
      ['Dure-mère', 'Tissu conjonctif résistant, pachyméninge', 'Ne pas confondre avec le périoste externe'],
      ['Arachnoïde', 'Méninge avasculaire', 'Les vaisseaux de l’espace sous-arachnoïdien ne la rendent pas vascularisée'],
      ['Pie-mère', 'Fine lame conjonctive vascularisée', 'À distinguer de la glie limitante sous-jacente'],
      ['Espace sous-arachnoïdien', 'Cavité réelle avec LCS', 'Ce n’est pas une quatrième méninge'],
    ], note: 'Pour l’interface piogliale : pie-mère + glie limitante ; l’arachnoïde ne fait pas partie de cette définition.',
  },
  enteric: {
    title: 'Deux plexus intramuraux', headers: ['Repère', 'Meissner', 'Auerbach'], pages: [13],
    rows: [
      ['Localisation', 'Sous-muqueuse', 'Musculeuse, entre couches circulaire et longitudinale'],
      ['Constituants', 'Neurones, glies et axones entériques', 'Neurones, glies et axones entériques'],
      ['Fonction dominante illustrée', 'Contrôle local des sécrétions et de la muqueuse', 'Contrôle de la motricité digestive'],
    ], note: 'Localisations générales et cellules : TN1. Position entre les couches et fonctions détaillées : complément OpenStax 23.1.',
  },
};

export const limitations = [
  'Tous les modèles sont des géométries originales schématiques, et non des segmentations d’imagerie ou des moulages anatomiques. Dimensions, distances et tailles cellulaires ne sont pas mesurables.',
  'Les grands trajets nerveux sont des repères simplifiés. Le modèle ne représente pas individuellement tous les nerfs, ganglions, noyaux, plexus ni vaisseaux du corps.',
  'Les passages entre corps, région, tissu, cellule et microstructure changent de représentation et d’échelle. Les cellules agrandies ne sont pas à la taille anatomique du modèle corporel.',
  'Les coupes 3D sont des ouvertures géométriques du schéma ; elles ne constituent ni une IRM, ni un atlas de coupes anatomiques fidèle, ni une lame histologique réelle.',
  'HES, bleu de toluidine, Luxol Fast Blue et trichrome de Masson sont des palettes illustratives simulées, sans image de lame authentique. La teinte seule ne permet pas un diagnostic.',
  'La circulation du LCS suit un trajet principal simplifié : les particules ne mesurent ni vitesse, ni débit, ni fraction de résorption. Le canal central médullaire n’est pas la voie principale chez l’adulte.',
  'Le PDF TN1 contient 14 pages correspondant aux pages de ronéo 0 à 13 ; la première est non numérotée et les suivantes portent 1 à 13. Les références indiquent d’abord la page du fichier PDF.',
  'La ronéo est un document étudiant à partir d’un cours ; des formulations discordantes sont signalées et précisées dans les compléments, sans attribuer les corrections au professeur.',
  'Les données moléculaires et les morphologies détaillées non développées dans TN1 sont identifiées comme compléments, avec leurs références propres.',
  'Les QRM sont originaux, créés pour l’entraînement, et ne sont pas des annales. Les QRM 30, 31 et 32 reproduits PDF p. 14 / ronéo p. 13 ne sont pas recopiés, faute de droits de redistribution établis.',
  'L’absence habituelle de relais synaptique dans le ganglion sensitif spinal décrit le schéma classique enseigné ; ce libellé n’est pas une généralisation à toutes les situations expérimentales ou pathologiques.',
  'Le fichier PDF personnel n’est pas publié avec le site. Son association locale nécessite la vérification de son empreinte et ne vaut pas autorisation de redistribution.',
];
