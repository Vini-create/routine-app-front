import type { SupportedLanguage } from "@/lib/i18n";

export type FirstAccessTourStep = {
  route: string;
  area: string;
  title: string;
  description: string;
  tip: string;
};

type TourCopy = {
  invitationEyebrow: string;
  invitationTitle: string;
  invitationDescription: string;
  invitationAccept: string;
  invitationDecline: string;
  eyebrow: string;
  progress: (current: number, total: number) => string;
  previous: string;
  next: string;
  finish: string;
  skip: string;
  tipLabel: string;
  steps: FirstAccessTourStep[];
};

const ptBR: TourCopy = {
  invitationEyebrow: "Bem-vindo ao Winperium",
  invitationTitle: "Quer conhecer o aplicativo?",
  invitationDescription: "Preparamos uma visita curta e tranquila pelas principais áreas. Você verá, passo a passo, onde organizar sua rotina, criar metas e hábitos e conversar com Alfred.",
  invitationAccept: "Sim, quero conhecer",
  invitationDecline: "Agora não",
  eyebrow: "Primeiros passos",
  progress: (current, total) => `${current} de ${total}`,
  previous: "Voltar",
  next: "Próxima área",
  finish: "Começar a usar",
  skip: "Pular tutorial",
  tipLabel: "Como começar",
  steps: [
    { route: "/dashboard", area: "Início", title: "Sua visão do dia", description: "Aqui você acompanha o que importa agora: compromissos, hábitos principais, progresso e o foco da semana.", tip: "Comece o dia por esta tela e marque os itens conforme avança." },
    { route: "/routine", area: "Rotina", title: "Organize tarefas e compromissos", description: "Crie blocos únicos ou recorrentes, defina horários, duração e dias da semana sem montar uma agenda impossível.", tip: "Adicione primeiro os compromissos fixos; depois encaixe tarefas flexíveis." },
    { route: "/goals", area: "Metas", title: "Transforme intenção em direção", description: "As metas dão contexto ao seu planejamento e conectam seus hábitos a um resultado que você realmente quer alcançar.", tip: "Crie uma meta clara com prazo e vincule hábitos que ajudam a sustentá-la." },
    { route: "/habits", area: "Hábitos", title: "Construa consistência", description: "Cadastre comportamentos recorrentes, acompanhe execuções e veja a consistência mudar de cor ao longo do tempo.", tip: "Prefira hábitos pequenos e realistas; frequência sustentável vale mais que intensidade." },
    { route: "/calendar", area: "Calendário", title: "Veja como sua semana se encaixa", description: "O calendário reúne itens da rotina e hábitos em uma visão temporal para revelar conflitos, espaços livres e sobrecarga.", tip: "Revise a semana antes de aceitar novos compromissos ou reorganizar horários." },
    { route: "/feedback", area: "Feedback", title: "Aprenda com seus padrões", description: "Informe sua prioridade e receba uma leitura da semana com avanços, obstáculos e ajustes práticos.", tip: "Use no fim da semana e seja específico sobre o resultado que deseja melhorar." },
    { route: "/assistant", area: "Alfred", title: "Planeje conversando", description: "Alfred usa o contexto da plataforma para ajudar a organizar o dia, reduzir sobrecarga e adaptar planos quando algo muda.", tip: "Experimente dizer: “Estou sem energia; reorganize apenas o essencial de hoje”." },
    { route: "/insights", area: "Insights", title: "Entenda o que funciona", description: "Aqui seus registros viram tendências de consistência e sinais úteis para ajustar a rotina com menos adivinhação.", tip: "Observe padrões de algumas semanas antes de mudar tudo por causa de um dia ruim." },
    { route: "/settings", area: "Perfil", title: "Deixe o Winperium com a sua cara", description: "Gerencie nome, idioma, tema, segurança e preferências da sua conta em um único lugar.", tip: "Confira o idioma e a aparência agora; você poderá alterá-los quando quiser." },
  ],
};

const en: TourCopy = {
  invitationEyebrow: "Welcome to Winperium",
  invitationTitle: "Would you like a quick tour?",
  invitationDescription: "We prepared a short, relaxed visit through the main areas. Step by step, you will see where to organize your routine, create goals and habits, and talk to Alfred.",
  invitationAccept: "Yes, show me around",
  invitationDecline: "Not now",
  eyebrow: "Getting started",
  progress: (current, total) => `${current} of ${total}`,
  previous: "Back",
  next: "Next area",
  finish: "Start using",
  skip: "Skip tutorial",
  tipLabel: "How to start",
  steps: [
    { route: "/dashboard", area: "Home", title: "Your day at a glance", description: "See what matters now: commitments, key habits, progress, and your weekly focus.", tip: "Start your day here and update items as you move forward." },
    { route: "/routine", area: "Routine", title: "Organize tasks and commitments", description: "Create one-time or recurring blocks with flexible times, durations, and weekdays.", tip: "Add fixed commitments first, then fit flexible work around them." },
    { route: "/goals", area: "Goals", title: "Turn intention into direction", description: "Goals give your planning context and connect daily habits to outcomes that matter.", tip: "Create one clear, time-bound goal and link supporting habits to it." },
    { route: "/habits", area: "Habits", title: "Build consistency", description: "Track recurring behaviors and watch their consistency styling evolve over time.", tip: "Choose small, realistic habits; sustainable frequency beats intensity." },
    { route: "/calendar", area: "Calendar", title: "See how your week fits together", description: "Calendar combines routine items and habits to reveal conflicts, open time, and overload.", tip: "Review your week before accepting commitments or moving time blocks." },
    { route: "/feedback", area: "Feedback", title: "Learn from your patterns", description: "Share your priority and receive a weekly reading with progress, obstacles, and practical adjustments.", tip: "Use it at the end of the week and describe what you want to improve." },
    { route: "/assistant", area: "Alfred", title: "Plan through conversation", description: "Alfred uses your platform context to organize the day and adapt plans when life changes.", tip: "Try: “I have low energy; reorganize only today's essentials.”" },
    { route: "/insights", area: "Insights", title: "Understand what works", description: "Your activity becomes consistency trends and useful signals for better decisions.", tip: "Look for multi-week patterns before changing everything after one bad day." },
    { route: "/settings", area: "Profile", title: "Make Winperium yours", description: "Manage your name, language, theme, security, and account preferences.", tip: "Check language and appearance now; both can be changed at any time." },
  ],
};

const es: TourCopy = {
  ...en,
  invitationEyebrow: "Bienvenido a Winperium", invitationTitle: "¿Quieres conocer la aplicación?", invitationDescription: "Preparamos una visita breve y sencilla por las áreas principales. Verás paso a paso dónde organizar tu rutina, crear metas y hábitos y hablar con Alfred.", invitationAccept: "Sí, quiero conocerla", invitationDecline: "Ahora no",
  eyebrow: "Primeros pasos", progress: (current, total) => `${current} de ${total}`, previous: "Volver", next: "Siguiente área", finish: "Empezar a usar", skip: "Saltar tutorial", tipLabel: "Cómo empezar",
  steps: [
    { route: "/dashboard", area: "Inicio", title: "Tu día de un vistazo", description: "Consulta compromisos, hábitos principales, progreso y enfoque semanal.", tip: "Empieza el día aquí y actualiza cada elemento mientras avanzas." },
    { route: "/routine", area: "Rutina", title: "Organiza tareas y compromisos", description: "Crea bloques únicos o recurrentes con horarios, duración y días flexibles.", tip: "Añade primero los compromisos fijos y después las tareas flexibles." },
    { route: "/goals", area: "Metas", title: "Convierte intención en dirección", description: "Las metas conectan tu planificación y tus hábitos con resultados importantes.", tip: "Crea una meta clara con plazo y vincula los hábitos que la sostienen." },
    { route: "/habits", area: "Hábitos", title: "Construye constancia", description: "Registra comportamientos recurrentes y observa su evolución con el tiempo.", tip: "Elige hábitos pequeños y realistas; la frecuencia sostenible gana." },
    { route: "/calendar", area: "Calendario", title: "Entiende cómo encaja tu semana", description: "Reúne rutina y hábitos para mostrar conflictos, espacios libres y sobrecarga.", tip: "Revisa la semana antes de aceptar nuevos compromisos." },
    { route: "/feedback", area: "Feedback", title: "Aprende de tus patrones", description: "Recibe una lectura semanal con avances, obstáculos y ajustes prácticos.", tip: "Úsalo al final de la semana y explica qué deseas mejorar." },
    { route: "/assistant", area: "Alfred", title: "Planifica conversando", description: "Alfred usa tu contexto para organizar el día y adaptar tus planes.", tip: "Prueba: “Tengo poca energía; reorganiza solo lo esencial de hoy”." },
    { route: "/insights", area: "Insights", title: "Descubre qué funciona", description: "Tu actividad se convierte en tendencias y señales útiles para decidir mejor.", tip: "Observa varias semanas antes de cambiar todo por un mal día." },
    { route: "/settings", area: "Perfil", title: "Haz tuyo Winperium", description: "Gestiona nombre, idioma, tema, seguridad y preferencias de la cuenta.", tip: "Comprueba ahora el idioma y la apariencia; podrás cambiarlos después." },
  ],
};

const fr: TourCopy = {
  ...en,
  invitationEyebrow: "Bienvenue sur Winperium", invitationTitle: "Souhaitez-vous découvrir l’application ?", invitationDescription: "Nous avons préparé une visite courte et simple des principales zones. Vous verrez pas à pas où organiser votre routine, créer des objectifs et des habitudes, et parler à Alfred.", invitationAccept: "Oui, découvrir", invitationDecline: "Pas maintenant",
  eyebrow: "Premiers pas", progress: (current, total) => `${current} sur ${total}`, previous: "Retour", next: "Zone suivante", finish: "Commencer", skip: "Passer le tutoriel", tipLabel: "Pour commencer",
  steps: [
    { route: "/dashboard", area: "Accueil", title: "Votre journée en un coup d’œil", description: "Consultez vos engagements, habitudes principales, progrès et priorité de la semaine.", tip: "Commencez la journée ici et mettez les éléments à jour au fil du temps." },
    { route: "/routine", area: "Routine", title: "Organisez tâches et engagements", description: "Créez des blocs uniques ou récurrents avec des horaires et durées flexibles.", tip: "Ajoutez d’abord les engagements fixes, puis les tâches flexibles." },
    { route: "/goals", area: "Objectifs", title: "Donnez une direction à vos intentions", description: "Les objectifs relient votre planification et vos habitudes aux résultats importants.", tip: "Créez un objectif clair et daté, puis associez-lui des habitudes." },
    { route: "/habits", area: "Habitudes", title: "Développez votre régularité", description: "Suivez les comportements récurrents et observez leur évolution dans le temps.", tip: "Choisissez des habitudes petites et réalistes pour tenir durablement." },
    { route: "/calendar", area: "Calendrier", title: "Visualisez votre semaine", description: "Réunissez routine et habitudes pour repérer conflits, temps libre et surcharge.", tip: "Consultez la semaine avant d’accepter de nouveaux engagements." },
    { route: "/feedback", area: "Feedback", title: "Apprenez de vos habitudes", description: "Recevez une analyse hebdomadaire avec progrès, obstacles et ajustements pratiques.", tip: "Utilisez-la en fin de semaine et précisez ce que vous souhaitez améliorer." },
    { route: "/assistant", area: "Alfred", title: "Planifiez en discutant", description: "Alfred utilise votre contexte pour organiser la journée et adapter vos plans.", tip: "Essayez : « Je manque d’énergie, réorganise seulement l’essentiel. »" },
    { route: "/insights", area: "Analyses", title: "Comprenez ce qui fonctionne", description: "Votre activité devient des tendances et des signaux utiles pour mieux décider.", tip: "Observez plusieurs semaines avant de tout changer après une mauvaise journée." },
    { route: "/settings", area: "Profil", title: "Personnalisez Winperium", description: "Gérez nom, langue, thème, sécurité et préférences du compte.", tip: "Vérifiez la langue et l’apparence maintenant ; vous pourrez les modifier ensuite." },
  ],
};

export const firstAccessTourCopy: Record<SupportedLanguage, TourCopy> = { "pt-BR": ptBR, en, es, fr };
