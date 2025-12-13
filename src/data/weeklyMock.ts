import { WeeklyWorkoutPlan } from "../types";

// Dados mockados estritos seguindo as regras de negócio:
// 1. Segunda a Sexta (5 dias)
// 2. 5 a 8 exercícios por dia
// 3. Formato de vídeo /embed/
// 4. Sem repetição consecutiva de grupos musculares

export const MOCK_WEEKLY_PLAN: WeeklyWorkoutPlan = {
  level: "Intermediário",
  goal: "Hipertrofia e Definição",
  days: [
    {
      id: "day-1",
      dayName: "Segunda-feira",
      muscleGroup: "Peito e Tríceps",
      exercises: [
        {
          name: "Supino Reto com Barra",
          sets: "4",
          reps: "10-12",
          videoUrl: "https://www.youtube.com/embed/SqyZ3h0Xk1I"
        },
        {
          name: "Supino Inclinado com Halteres",
          sets: "3",
          reps: "12",
          videoUrl: "https://www.youtube.com/embed/Z1-5e8y3-kI"
        },
        {
          name: "Crucifixo na Polia (Crossover)",
          sets: "3",
          reps: "15",
          videoUrl: "https://www.youtube.com/embed/H530fWd6H2k"
        },
        {
          name: "Tríceps Corda na Polia",
          sets: "4",
          reps: "12",
          videoUrl: "https://www.youtube.com/embed/5478" // ID fictício mapeado
        },
        {
          name: "Tríceps Testa",
          sets: "3",
          reps: "10",
          videoUrl: "https://www.youtube.com/embed/4854" // ID fictício mapeado
        },
        {
          name: "Flexão de Braço (Falha)",
          sets: "3",
          reps: "Máx",
          videoUrl: "https://www.youtube.com/embed/IODxDxX7oi4"
        }
      ]
    },
    {
      id: "day-2",
      dayName: "Terça-feira",
      muscleGroup: "Costas e Bíceps",
      exercises: [
        {
          name: "Puxada Alta (Pulley Frente)",
          sets: "4",
          reps: "10-12",
          videoUrl: "https://www.youtube.com/embed/CAwf7n6Luuc"
        },
        {
          name: "Remada Curvada com Barra",
          sets: "4",
          reps: "10",
          videoUrl: "https://www.youtube.com/embed/G8x-Te3VbIw"
        },
        {
          name: "Remada Baixa (Triângulo)",
          sets: "3",
          reps: "12",
          videoUrl: "https://www.youtube.com/embed/R6gO4D3f4oI"
        },
        {
          name: "Rosca Direta com Barra",
          sets: "3",
          reps: "12",
          videoUrl: "https://www.youtube.com/embed/4850"
        },
        {
          name: "Rosca Martelo",
          sets: "3",
          reps: "12",
          videoUrl: "https://www.youtube.com/embed/5158"
        },
        {
          name: "Rosca Concentrada",
          sets: "3",
          reps: "15",
          videoUrl: "https://www.youtube.com/embed/Jp_q4" // Placeholder ID
        }
      ]
    },
    {
      id: "day-3",
      dayName: "Quarta-feira",
      muscleGroup: "Pernas Completo",
      exercises: [
        {
          name: "Agachamento Livre",
          sets: "4",
          reps: "10",
          videoUrl: "https://www.youtube.com/embed/U3HlEF_E9fo"
        },
        {
          name: "Leg Press 45º",
          sets: "4",
          reps: "12",
          videoUrl: "https://www.youtube.com/embed/yZmx_Ac3880"
        },
        {
          name: "Cadeira Extensora",
          sets: "3",
          reps: "15",
          videoUrl: "https://www.youtube.com/embed/Wv_Z15-Q_Y0"
        },
        {
          name: "Mesa Flexora",
          sets: "4",
          reps: "12",
          videoUrl: "https://www.youtube.com/embed/1wL75Ea0h6E"
        },
        {
          name: "Stiff com Barra",
          sets: "3",
          reps: "12",
          videoUrl: "https://www.youtube.com/embed/lCg_gh_fppI"
        },
        {
          name: "Panturrilha no Leg Press",
          sets: "4",
          reps: "20",
          videoUrl: "https://www.youtube.com/embed/K9bK" // Placeholder
        }
      ]
    },
    {
      id: "day-4",
      dayName: "Quinta-feira",
      muscleGroup: "Ombros e Abdômen",
      exercises: [
        {
          name: "Desenvolvimento com Halteres",
          sets: "4",
          reps: "10",
          videoUrl: "https://www.youtube.com/embed/B-aVuy8q_cM"
        },
        {
          name: "Elevação Lateral",
          sets: "4",
          reps: "12-15",
          videoUrl: "https://www.youtube.com/embed/3vcD8b-0_0"
        },
        {
          name: "Elevação Frontal",
          sets: "3",
          reps: "12",
          videoUrl: "https://www.youtube.com/embed/5036"
        },
        {
          name: "Crucifixo Inverso (Posterior)",
          sets: "3",
          reps: "15",
          videoUrl: "https://www.youtube.com/embed/post_delt"
        },
        {
          name: "Prancha Abdominal",
          sets: "3",
          reps: "45-60s",
          videoUrl: "https://www.youtube.com/embed/ASdvN_XEl_c"
        },
        {
          name: "Abdominal Supra",
          sets: "3",
          reps: "20",
          videoUrl: "https://www.youtube.com/embed/10612"
        }
      ]
    },
    {
      id: "day-5",
      dayName: "Sexta-feira",
      muscleGroup: "Full Body (Metabólico)",
      exercises: [
        {
          name: "Burpees",
          sets: "3",
          reps: "10",
          videoUrl: "https://www.youtube.com/embed/TU8QYXLscGk"
        },
        {
          name: "Agachamento com Salto",
          sets: "3",
          reps: "15",
          videoUrl: "https://www.youtube.com/embed/jump_squat"
        },
        {
          name: "Flexão de Braço",
          sets: "3",
          reps: "15",
          videoUrl: "https://www.youtube.com/embed/IODxDxX7oi4"
        },
        {
          name: "Polichinelos",
          sets: "3",
          reps: "50",
          videoUrl: "https://www.youtube.com/embed/iSSAk4XCsRA"
        },
        {
          name: "Mountain Climbers",
          sets: "3",
          reps: "30s",
          videoUrl: "https://www.youtube.com/embed/mt_climber"
        }
      ]
    }
  ]
};
