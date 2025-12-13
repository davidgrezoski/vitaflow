export interface Video {
  id: string;
  title: string;
  channel: string;
  videoId: string; // YouTube ID (ex: dQw4w9WgXcQ)
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio' | 'fullbody';
  keywords: string[]; // Palavras-chave para o match
  image: string; // URL da imagem técnica (Atlas Muscular)
}

// --- BIBLIOTECA DE VÍDEOS E IMAGENS TÉCNICAS ---
export const VIDEO_LIBRARY: Video[] = [
  // --- PEITO (Chest) ---
  { 
    id: 'c1', 
    title: 'Supino Reto com Barra', 
    channel: 'Growth TV', 
    videoId: 'SqyZ3h0Xk1I', 
    category: 'chest', 
    keywords: ['supino reto', 'bench press', 'peito barra'],
    image: 'https://gymvisual.com/img/p/6/9/9/8/6998.jpg' 
  },
  { 
    id: 'c2', 
    title: 'Supino Inclinado Halteres', 
    channel: 'Leandro Twin', 
    videoId: 'Z1-5e8y3-kI', 
    category: 'chest', 
    keywords: ['supino inclinado', 'inclinado halter'],
    image: 'https://gymvisual.com/img/p/5/6/0/6/5606.jpg'
  },
  { 
    id: 'c3', 
    title: 'Crucifixo na Polia (Crossover)', 
    channel: 'Treino Correto', 
    videoId: 'H530fWd6H2k', 
    category: 'chest', 
    keywords: ['crucifixo', 'crossover', 'polia alta', 'peito polia'],
    image: 'https://gymvisual.com/img/p/4/8/3/6/4836.jpg'
  },
  { 
    id: 'c4', 
    title: 'Flexão de Braço', 
    channel: 'Calistenia Brasil', 
    videoId: 'IODxDxX7oi4', 
    category: 'chest', 
    keywords: ['flexão', 'push up', 'apoio'],
    image: 'https://gymvisual.com/img/p/1/0/6/1/6/10616.jpg'
  },
  { 
    id: 'c5', 
    title: 'Peck Deck (Voador)', 
    channel: 'Max Titanium', 
    videoId: 'eGk_J-Q_M_0', 
    category: 'chest', 
    keywords: ['voador', 'peck deck', 'máquina peito'],
    image: 'https://gymvisual.com/img/p/1/0/6/2/5/10625.jpg'
  },

  // --- COSTAS (Back) ---
  { 
    id: 'b1', 
    title: 'Puxada Alta (Pulley Frente)', 
    channel: 'Renato Cariani', 
    videoId: 'CAwf7n6Luuc', 
    category: 'back', 
    keywords: ['puxada', 'pulley', 'costas polia', 'lat pull'],
    image: 'https://gymvisual.com/img/p/5/4/1/4/5414.jpg'
  },
  { 
    id: 'b2', 
    title: 'Remada Curvada', 
    channel: 'Growth TV', 
    videoId: 'G8x-Te3VbIw', 
    category: 'back', 
    keywords: ['remada curvada', 'remada barra', 'bent over row'],
    image: 'https://gymvisual.com/img/p/4/8/6/0/4860.jpg'
  },
  { 
    id: 'b3', 
    title: 'Remada Baixa (Triângulo)', 
    channel: 'Leandro Twin', 
    videoId: 'R6gO4D3f4oI', 
    category: 'back', 
    keywords: ['remada baixa', 'remada sentado', 'triângulo'],
    image: 'https://gymvisual.com/img/p/5/4/2/3/5423.jpg'
  },
  { 
    id: 'b4', 
    title: 'Barra Fixa', 
    channel: 'Calistenia', 
    videoId: 'eGo4IYlbE5g', 
    category: 'back', 
    keywords: ['barra fixa', 'pull up', 'chin up'],
    image: 'https://gymvisual.com/img/p/2/1/6/6/4/21664.jpg'
  },
  { 
    id: 'b5', 
    title: 'Serrote (Remada Unilateral)', 
    channel: 'Treino Mestre', 
    videoId: 'pG8q0o0o0o0', 
    category: 'back', 
    keywords: ['serrote', 'unilateral', 'halter costas'],
    image: 'https://gymvisual.com/img/p/5/0/8/4/5084.jpg'
  },

  // --- PERNAS (Legs) ---
  { 
    id: 'l1', 
    title: 'Agachamento Livre', 
    channel: 'Laércio Refundini', 
    videoId: 'U3HlEF_E9fo', 
    category: 'legs', 
    keywords: ['agachamento', 'squat', 'livre'],
    image: 'https://gymvisual.com/img/p/4/9/4/6/4946.jpg'
  },
  { 
    id: 'l2', 
    title: 'Leg Press 45', 
    channel: 'Treino Mestre', 
    videoId: 'yZmx_Ac3880', 
    category: 'legs', 
    keywords: ['leg press', 'leg 45', 'prensa'],
    image: 'https://gymvisual.com/img/p/5/4/3/0/5430.jpg'
  },
  { 
    id: 'l3', 
    title: 'Cadeira Extensora', 
    channel: 'Renato Cariani', 
    videoId: 'Wv_Z15-Q_Y0', 
    category: 'legs', 
    keywords: ['extensora', 'cadeira extensora', 'quadriceps'],
    image: 'https://gymvisual.com/img/p/5/4/5/6/5456.jpg'
  },
  { 
    id: 'l4', 
    title: 'Mesa Flexora', 
    channel: 'Leandro Twin', 
    videoId: '1wL75Ea0h6E', 
    category: 'legs', 
    keywords: ['flexora', 'mesa flexora', 'posterior'],
    image: 'https://gymvisual.com/img/p/5/4/6/0/5460.jpg'
  },
  { 
    id: 'l5', 
    title: 'Stiff', 
    channel: 'Carol Borba', 
    videoId: 'lCg_gh_fppI', 
    category: 'legs', 
    keywords: ['stiff', 'posterior coxa'],
    image: 'https://gymvisual.com/img/p/4/8/7/8/4878.jpg'
  },
  { 
    id: 'l6', 
    title: 'Afundo / Passada', 
    channel: 'Exercício em Casa', 
    videoId: '0_v0_0_0_0', 
    category: 'legs', 
    keywords: ['afundo', 'passada', 'lunge'],
    image: 'https://gymvisual.com/img/p/1/0/9/8/3/10983.jpg'
  },

  // --- OMBROS (Shoulders) ---
  { 
    id: 's1', 
    title: 'Desenvolvimento com Halteres', 
    channel: 'Growth TV', 
    videoId: 'B-aVuy8q_cM', 
    category: 'shoulders', 
    keywords: ['desenvolvimento', 'ombro halter', 'press'],
    image: 'https://gymvisual.com/img/p/5/0/5/2/5052.jpg'
  },
  { 
    id: 's2', 
    title: 'Elevação Lateral', 
    channel: 'Leandro Twin', 
    videoId: '3vcD8b-0_0', 
    category: 'shoulders', 
    keywords: ['elevação lateral', 'lateral halter'],
    image: 'https://gymvisual.com/img/p/5/0/4/0/5040.jpg'
  },
  { 
    id: 's3', 
    title: 'Elevação Frontal', 
    channel: 'Treino Correto', 
    videoId: '0_0_0_0_1', 
    category: 'shoulders', 
    keywords: ['elevação frontal', 'frontal'],
    image: 'https://gymvisual.com/img/p/5/0/3/6/5036.jpg'
  },

  // --- BRAÇOS (Arms) ---
  { 
    id: 'ar1', 
    title: 'Rosca Direta Barra', 
    channel: 'Renato Cariani', 
    videoId: '0_0_0_0_2', 
    category: 'arms', 
    keywords: ['rosca direta', 'biceps barra'],
    image: 'https://gymvisual.com/img/p/4/8/5/0/4850.jpg'
  },
  { 
    id: 'ar2', 
    title: 'Rosca Martelo', 
    channel: 'Leandro Twin', 
    videoId: '0_0_0_0_3', 
    category: 'arms', 
    keywords: ['martelo', 'hammer'],
    image: 'https://gymvisual.com/img/p/5/1/5/8/5158.jpg'
  },
  { 
    id: 'ar3', 
    title: 'Tríceps Pulley (Corda)', 
    channel: 'Growth TV', 
    videoId: '0_0_0_0_4', 
    category: 'arms', 
    keywords: ['triceps corda', 'pulley triceps'],
    image: 'https://gymvisual.com/img/p/5/4/7/8/5478.jpg'
  },
  { 
    id: 'ar4', 
    title: 'Tríceps Testa', 
    channel: 'Treino Mestre', 
    videoId: '0_0_0_0_5', 
    category: 'arms', 
    keywords: ['testa', 'triceps barra'],
    image: 'https://gymvisual.com/img/p/4/8/5/4/4854.jpg'
  },

  // --- ABDÔMEN (Abs) ---
  { 
    id: 'ab1', 
    title: 'Abdominal Supra', 
    channel: 'Exercício em Casa', 
    videoId: '1wL75Ea0h6E', 
    category: 'abs', 
    keywords: ['abdominal', 'supra', 'crunch'],
    image: 'https://gymvisual.com/img/p/1/0/6/1/2/10612.jpg'
  },
  { 
    id: 'ab2', 
    title: 'Prancha', 
    channel: 'Saúde na Rotina', 
    videoId: 'ASdvN_XEl_c', 
    category: 'abs', 
    keywords: ['prancha', 'plank', 'isometria'],
    image: 'https://gymvisual.com/img/p/1/3/1/4/9/13149.jpg'
  },
  { 
    id: 'ab3', 
    title: 'Abdominal Infra', 
    channel: 'Leandro Twin', 
    videoId: '0_0_0_0_6', 
    category: 'abs', 
    keywords: ['infra', 'elevação pernas'],
    image: 'https://gymvisual.com/img/p/1/0/6/1/4/10614.jpg'
  },

  // --- CARDIO/OUTROS ---
  { 
    id: 'ca1', 
    title: 'Burpees', 
    channel: 'CrossFit', 
    videoId: 'TU8QYXLscGk', 
    category: 'cardio', 
    keywords: ['burpee', 'cardio intenso'],
    image: 'https://gymvisual.com/img/p/1/0/6/1/8/10618.jpg'
  },
  { 
    id: 'ca2', 
    title: 'Polichinelos', 
    channel: 'Queima Diária', 
    videoId: 'iSSAk4XCsRA', 
    category: 'cardio', 
    keywords: ['polichinelo', 'jumping jack'],
    image: 'https://gymvisual.com/img/p/1/0/6/1/9/10619.jpg'
  },
  { 
    id: 'ca3', 
    title: 'Mountain Climbers', 
    channel: 'Exercício em Casa', 
    videoId: 'nmwgirgXLIg', 
    category: 'cardio', 
    keywords: ['mountain climber', 'escalada'],
    image: 'https://gymvisual.com/img/p/1/0/6/1/7/10617.jpg'
  },
  { 
    id: 'ca4', 
    title: 'Corrida Estacionária', 
    channel: 'Saúde na Rotina', 
    videoId: '0_0_0_0_8', 
    category: 'cardio', 
    keywords: ['corrida', 'estacionaria', 'correr'],
    image: 'https://gymvisual.com/img/p/1/0/6/2/0/10620.jpg'
  },
  { 
    id: 'ca5', 
    title: 'Pular Corda', 
    channel: 'Vinicius Possebon', 
    videoId: '0_0_0_0_9', 
    category: 'cardio', 
    keywords: ['pular corda', 'corda'],
    image: 'https://gymvisual.com/img/p/1/0/6/2/1/10621.jpg'
  },
  { 
    id: 'fb1', 
    title: 'Treino Full Body Iniciante', 
    channel: 'Vinicius Possebon', 
    videoId: '0_0_0_0_7', 
    category: 'fullbody', 
    keywords: ['full body', 'corpo todo'],
    image: 'https://gymvisual.com/img/p/4/9/4/6/4946.jpg' // Reuso do agachamento como genérico
  },
];

// Fallback videos (Vídeos de segurança caso a IA gere algo muito exótico)
const FALLBACK_VIDEOS: Record<string, Video> = {
  chest: VIDEO_LIBRARY[0],
  back: VIDEO_LIBRARY[5],
  legs: VIDEO_LIBRARY[10],
  shoulders: VIDEO_LIBRARY[16],
  arms: VIDEO_LIBRARY[19],
  abs: VIDEO_LIBRARY[23],
  cardio: VIDEO_LIBRARY[27], // Polichinelos
  fullbody: VIDEO_LIBRARY[31]
};

// --- ALGORITMO DE MATCHING INTELIGENTE ---
export const findVideoForExercise = (exerciseName: string, muscleGroupContext?: string): Video => {
  const normalizedName = exerciseName.toLowerCase();
  
  // 1. Tenta match nas palavras-chave (Prioridade Alta)
  const match = VIDEO_LIBRARY.find(v => 
    v.keywords.some(k => normalizedName.includes(k)) || 
    normalizedName.includes(v.title.toLowerCase())
  );

  if (match) return match;

  // 2. Se não achar, tenta pelo contexto do grupo muscular (Prioridade Média)
  if (muscleGroupContext) {
    const contextLower = muscleGroupContext.toLowerCase();
    let category: Video['category'] = 'fullbody';

    if (contextLower.includes('peito') || contextLower.includes('chest') || contextLower.includes('push')) category = 'chest';
    else if (contextLower.includes('costas') || contextLower.includes('back') || contextLower.includes('pull')) category = 'back';
    else if (contextLower.includes('perna') || contextLower.includes('inferior') || contextLower.includes('legs')) category = 'legs';
    else if (contextLower.includes('ombro') || contextLower.includes('deltoide')) category = 'shoulders';
    else if (contextLower.includes('braço') || contextLower.includes('biceps') || contextLower.includes('triceps')) category = 'arms';
    else if (contextLower.includes('abdomen') || contextLower.includes('abs') || contextLower.includes('core')) category = 'abs';
    else if (contextLower.includes('cardio') || contextLower.includes('aerobico')) category = 'cardio';

    // Retorna um vídeo genérico da categoria
    const categoryMatch = VIDEO_LIBRARY.find(v => v.category === category);
    return categoryMatch || FALLBACK_VIDEOS[category] || FALLBACK_VIDEOS['fullbody'];
  }

  // 3. Último caso: retorna um vídeo Full Body (Segurança)
  return FALLBACK_VIDEOS['fullbody'];
};

export const getPlaylistByFocus = (focus: string): Video[] => {
    return VIDEO_LIBRARY.filter(v => focus.toLowerCase().includes(v.category)).slice(0, 5);
};
