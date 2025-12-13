import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WeeklyWorkoutPlan } from '../types';

export const generateWorkoutPDF = (plan: WeeklyWorkoutPlan, userName: string = 'Atleta') => {
  const doc = new jsPDF();

  // Configurações de Fonte e Cor
  const primaryColor = [249, 115, 22]; // Laranja (#f97316)
  
  // Cabeçalho
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('VitaFlow', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Ficha de Treino Personalizada', 14, 28);

  // Informações do Aluno
  doc.setDrawColor(200);
  doc.line(14, 32, 196, 32);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Aluno: ${userName}`, 14, 40);
  doc.text(`Objetivo: ${plan.goal}`, 14, 46);
  doc.text(`Nível: ${plan.level}`, 14, 52);
  doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 120, 40);

  let finalY = 60;

  // Itera sobre os dias da semana
  plan.days.forEach((day) => {
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${day.dayName} - ${day.muscleGroup}`, 14, finalY);
    
    const tableBody = day.exercises.map(ex => [
      ex.name,
      ex.sets,
      ex.reps,
      ex.rest || '60s',
      ex.notes || '-'
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Exercício', 'Séries', 'Reps', 'Descanso', 'Obs']],
      body: tableBody,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor as any,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 70 }, 
        4: { cellWidth: 40 }  
      },
      margin: { left: 14, right: 14 }
    });

    finalY = (doc as any).lastAutoTable.finalY + 15;
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount} - Gerado via VitaFlow AI`, 105, 290, { align: 'center' });
  }

  doc.save(`treino_vitaflow_${new Date().toISOString().split('T')[0]}.pdf`);
};

// --- NOVO: PDF ESPECIALISTA ---
export const generateSpecialistPDF = (workout: any, userName: string, anamnese: any) => {
  const doc = new jsPDF();
  const primaryColor = [13, 148, 136]; // Teal-600 (Foco em Saúde/Physio)

  // Header
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('VitaFlow Specialist', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Fisioterapia • Yoga • Lutas • Cardio', 14, 26);

  // Dados do Aluno e Anamnese (Segurança)
  doc.setFillColor(240, 253, 250); // Teal-50
  doc.rect(14, 35, 182, 45, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Ficha de Segurança & Anamnese", 20, 45);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Aluno: ${userName}`, 20, 52);
  doc.text(`Histórico: ${anamnese.history || 'Nenhum'}`, 20, 58);
  doc.text(`Medicamentos: ${anamnese.meds || 'Nenhum'}`, 20, 64);
  doc.text(`Limitações: ${anamnese.limitations || 'Nenhuma'}`, 20, 70);

  // Notas de Segurança da IA
  doc.setTextColor(220, 38, 38); // Red
  doc.setFont("helvetica", "bold");
  doc.text("⚠ PRECAUÇÕES ESPECÍFICAS:", 110, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  
  let noteY = 58;
  workout.safetyNotes.forEach((note: string) => {
    doc.text(`• ${note}`, 110, noteY);
    noteY += 5;
  });

  // Título do Treino
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(workout.title, 14, 95);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Foco: ${workout.focus}`, 14, 101);

  let finalY = 110;

  // Função auxiliar para tabelas
  const addSection = (title: string, data: any[]) => {
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(title, 14, finalY);
    
    const body = data.map(ex => [
      ex.name,
      ex.sets || ex.duration || '-',
      ex.reps || '-',
      ex.rest || '-',
      ex.obs || '-'
    ]);

    autoTable(doc, {
      startY: finalY + 3,
      head: [['Exercício', 'Séries/Dur', 'Reps', 'Descanso', 'Observações']],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: primaryColor as any },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 15;
  };

  if (workout.warmup?.length) addSection("Aquecimento / Mobilidade", workout.warmup);
  if (workout.main?.length) addSection("Treino Principal", workout.main);
  if (workout.cooldown?.length) addSection("Resfriamento / Alongamento", workout.cooldown);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Este documento não substitui acompanhamento médico presencial.", 105, 290, { align: 'center' });

  doc.save(`specialist_vitaflow_${new Date().toISOString().split('T')[0]}.pdf`);
};
