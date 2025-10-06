import './style.css'

// Dados do Quiz
const quizData = [
  { 
    id: 1, 
    pergunta: "Em qual desses ambientes você se sentiria mais realizado trabalhando diariamente?",
    respostas: [
      "Um hospital ou clínica, auxiliando na área da saúde com tecnologia",
      "Uma startup ou empresa de tecnologia, criando inovações digitais",
      "Uma indústria automatizada, lidando com máquinas e processos técnicos",
      "Um provedor de internet ou empresa de telecomunicações, garantindo a conectividade"
    ],
    tipo: "opcoes"
  },
  { 
    id: 2, 
    pergunta: "Já pensei que, com planejamento, quase tudo no mundo real poderia ser otimizado.",
    tipo: "escala"
  },
  { 
    id: 3, 
    pergunta: "Qual disciplina escolar mais despertava seu interesse e te fazia querer aprender mais?",
    respostas: [
      "Matemática – por causa da lógica e resolução de problemas",
      "Biologia – por curiosidade sobre a vida e o corpo humano",
      "Física – pela compreensão de fenômenos e aplicações práticas",
      "Informática – pelo uso da tecnologia no dia a dia",
      "Nenhuma em especial – preferia atividades mais práticas ou aplicadas"
    ],
    tipo: "opcoes"
  },
  { 
    id: 4, 
    pergunta: "Me incomoda depender de outras pessoas para algo que eu poderia automatizar.",
    tipo: "escala"
  },
  { 
    id: 5, 
    pergunta: "Você consegue tomar decisões rápidas sem se sentir inseguro depois?",
    tipo: "escala"
  },
  { 
    id: 6, 
    pergunta: "Já me peguei tentando entender o funcionamento de algo só por não aceitar que 'é assim e pronto'.",
    tipo: "escala"
  },
  { 
    id: 7, 
    pergunta: "Já recomecei tudo do zero só para provar para mim mesmo que eu era capaz.",
    tipo: "escala"
  },
  { 
    id: 8, 
    pergunta: "Você se sente mais produtivo quando está sozinho e concentrado?",
    tipo: "escala"
  },
  { 
    id: 9, 
    pergunta: "Às vezes olho para tarefas simples e penso: 'isso podia ser automático'",
    tipo: "escala"
  },
  { 
    id: 10, 
    pergunta: "Você prefere resolver um desafio lógico do que decorar uma informação?",
    tipo: "escala"
  }
];

let currentQuestion = 0;
let answers = new Array(quizData.length).fill(null);

// Carrega o modelo de IA ao iniciar
// Renderiza uma pergunta
function renderQuestion() {
  const app = document.querySelector('#app');
  const question = quizData[currentQuestion];
  const answeredCount = answers.filter(a => a !== null).length;
  const selectedAnswer = answers[currentQuestion];
  
  let optionsHTML = '';
  
  if (question.tipo === "escala") {
    optionsHTML = `
      <div class="options-container">
        ${[1, 2, 3, 4, 5].map(value => `
          <button class="option-btn ${selectedAnswer === value ? 'selected' : ''}" data-value="${value}">
            <span class="option-number">${value}</span>
            <span class="option-label">${getLabelEscala(value, currentQuestion)}</span>
          </button>
        `).join('')}
      </div>
    `;
  } else {
    optionsHTML = `
      <div class="options-container">
        ${question.respostas.map((resposta, index) => `
          <button class="option-btn ${selectedAnswer === (index + 1) ? 'selected' : ''}" data-value="${index + 1}">
            <span class="option-number">${index + 1}</span>
            <span class="option-label">${resposta}</span>
          </button>
        `).join('')}
      </div>
    `;
  }
  
  app.innerHTML = `
    <div class="quiz-container">
      <div class="projete-header">
        <div class="projete-logo">
          <span class="logo-icon">💡</span>
          <div class="logo-text">
            <span class="logo-title">PROJETE</span>
            <span class="logo-subtitle">FEIRA DE PROJETOS DA ETE FMC</span>
          </div>
        </div>
      </div>
      <h1><span class="emoji">🎓</span> <span class="gradient-text">Quiz - Especialização Técnica</span> <span class="emoji">🎯</span></h1>
      <p class="subtitle-eco"><span class="gradient-text">Qual Curso técnico da ETE FMC você se encaixa</span></p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(answeredCount / quizData.length) * 100}%"></div>
      </div>
      <p class="question-counter">Pergunta ${currentQuestion + 1} de ${quizData.length} | ${answeredCount} resposta(s) submetida(s)</p>
      <h2 class="question-text">${question.pergunta}</h2>
      ${optionsHTML}
      <div class="navigation-buttons">
        <button id="prev-btn" class="btn-secondary" ${currentQuestion === 0 ? 'disabled' : ''}>
          <span>← Anterior</span>
        </button>
        <button id="next-btn" class="${currentQuestion === quizData.length - 1 ? 'btn-primary' : 'btn-secondary'}" ${currentQuestion === quizData.length - 1 && answeredCount < quizData.length ? 'disabled' : ''}>
          <span>${currentQuestion === quizData.length - 1 ? 'Finalizar Quiz ✓' : 'Próxima →'}</span>
        </button>
      </div>
    </div>
  `;

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseInt(e.currentTarget.dataset.value);
      selectAnswer(value);
    });
  });

  const prevBtn = document.querySelector('#prev-btn');
  const nextBtn = document.querySelector('#next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        renderQuestion();
      } else {
        // Última pergunta - finaliza o quiz
        if (answers.filter(a => a !== null).length === quizData.length) {
          renderResults();
        }
      }
    });
  }
}

function getLabelEscala(value, questionIndex) {
  const labelsEspecificos = {
    1: { 1: 'Não, nunca pensei', 5: 'Sim, já pensei sobre' },
    3: { 1: 'Não, não me incomodo', 5: 'Sim, me incomodo' },
    4: { 1: 'Não, sempre me sinto inseguro', 5: 'Sim, não me sinto nenhum pouco inseguro' },
    5: { 1: 'Não, nunca pensei nisso', 5: 'Sim, já pensei sobre' },
    6: { 1: 'Não, nunca fiz isso', 5: 'Sim, já fiz isso' },
    7: { 1: 'Não, prefiro fazer em grupo', 5: 'Sim, consigo prestar atenção melhor' },
    8: { 1: 'Não, nunca fiz isso', 5: 'Sim, já fiz isso' },
    9: { 1: 'Não, prefiro decorar', 5: 'Sim, não sou bom com a memória' }
  };
  
  if (labelsEspecificos[questionIndex] && labelsEspecificos[questionIndex][value]) {
    return labelsEspecificos[questionIndex][value];
  }
  
  if (value === 1) return 'Discordo totalmente';
  if (value === 2) return 'Discordo parcialmente';
  if (value === 3) return 'Neutro';
  if (value === 4) return 'Concordo parcialmente';
  if (value === 5) return 'Concordo totalmente';
}

function selectAnswer(value) {
  answers[currentQuestion] = value;
  renderQuestion();
}

async function salvarRespostasCSV() {
  try {
    const response = await fetch('http://localhost:3000/salvar-respostas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Respostas salvas automaticamente no arquivo RespostasTeste.csv');
      console.log('Arquivo salvo em:', result.path);
    } else {
      console.error('❌ Erro ao salvar respostas:', result.message);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com o servidor:', error);
    console.error('Certifique-se de que o servidor está rodando (npm run server)');
  }
}

async function renderResults() {
  // Salvar automaticamente as respostas no CSV
  await salvarRespostasCSV();
  
  const app = document.querySelector('#app');
  
  // Mostrar loading enquanto busca a predição
  app.innerHTML = `
    <div class="quiz-container results">
      <div class="projete-header">
        <div class="projete-logo">
          <span class="logo-icon">💡</span>
          <div class="logo-text">
            <span class="logo-title">PROJETE</span>
            <span class="logo-year">2025</span>
          </div>
        </div>
      </div>
      <h1>🎉 Quiz Concluído!</h1>
      <p class="subtitle-eco">"Criar com Propósito" 🌱</p>
      <div class="loading-ia">
        <div class="spinner"></div>
        <p>🤖 A IA está analisando suas respostas...</p>
      </div>
    </div>
  `;

  try {
    // Buscar a predição da IA
    const response = await fetch('http://localhost:3000/processar-csv');
    const data = await response.json();

    if (!data.success || data.resultados.length === 0) {
      throw new Error('Não foi possível obter a predição');
    }

    // Pegar o último resultado (o mais recente)
    const resultado = data.resultados[data.resultados.length - 1];

    // Mapear turmas para nomes descritivos
    const nomesDescritivos = {
      31: 'Desenvolvimento de Sistemas',
      32: 'Administração',
      33: 'Mecatrônica',
      34: 'Informática para Internet'
    };

    const nomeCurso = nomesDescritivos[resultado.predicao] || resultado.nomeCurso;

    app.innerHTML = `
      <div class="quiz-container results">
        <div class="projete-header">
          <div class="projete-logo">
            <span class="logo-icon">💡</span>
            <div class="logo-text">
              <span class="logo-title">PROJETE</span>
              <span class="logo-year">2025</span>
            </div>
          </div>
        </div>
        <h1><span class="emoji">🎓</span> <span class="gradient-text">Turma Recomendada</span> <span class="emoji">🎯</span></h1>
        <p class="subtitle-eco"><span class="gradient-text">Qual Curso técnico da ETE FMC você se encaixa</span></p>
        
        <div class="ia-prediction">
          <div class="prediction-badge">
            <span class="prediction-number">${resultado.predicao}</span>
          </div>
          <h2 class="prediction-course">${nomeCurso}</h2>
          <p class="prediction-confidence">
            <span class="confidence-icon">✨</span>
            ${resultado.confianca}% de confiança
          </p>
        </div>

        <div class="probabilidades-container">
          <h3>📊 Todas as Probabilidades:</h3>
          ${resultado.probabilidades.map(prob => {
            const nomeDesc = nomesDescritivos[prob.curso] || prob.nome;
            const isRecomendado = prob.curso === resultado.predicao;
            return `
              <div class="prob-item ${isRecomendado ? 'recomendado' : ''}">
                <div class="prob-header">
                  <span class="prob-label">
                    ${isRecomendado ? '🎯 ' : ''}Turma ${prob.curso}
                  </span>
                  <span class="prob-name">${nomeDesc}</span>
                </div>
                <div class="prob-bar-container">
                  <div class="prob-bar" style="width: ${prob.probabilidade}%">
                    ${prob.probabilidade}%
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="action-buttons">
          <button id="restart-btn" class="btn-primary">🔄 Fazer Novamente</button>
        </div>

        <div class="event-info">
          <p class="eco-message">🌍 Ecologia Integral - Cuidando da Casa Comum 🌱</p>
          <div class="info-row">
            <span class="info-icon">📅</span>
            <span class="info-text"><strong>09 a 11</strong> de outubro</span>
          </div>
          <div class="info-row">
            <span class="info-icon">📍</span>
            <span class="info-text">Campus da ETE FMC - Santa Rita do Sapucaí/MG</span>
          </div>
        </div>
      </div>
    `;

    document.querySelector('#restart-btn').addEventListener('click', () => {
      currentQuestion = 0;
      answers = new Array(quizData.length).fill(null);
      renderQuestion();
    });

  } catch (error) {
    console.error('Erro ao obter predição:', error);
    app.innerHTML = `
      <div class="quiz-container results">
        <div class="projete-header">
          <div class="projete-logo">
            <span class="logo-icon">💡</span>
            <div class="logo-text">
              <span class="logo-title">PROJETE</span>
              <span class="logo-year">2025</span>
            </div>
          </div>
        </div>
        <h1>❌ Erro</h1>
        <p class="subtitle-eco">Não foi possível obter a recomendação da IA</p>
        <div class="error-message">
          <p>Por favor, certifique-se de que o servidor está rodando em http://localhost:3000</p>
          <p>Execute: <code>npm run server</code></p>
        </div>
        <div class="action-buttons">
          <button id="restart-btn" class="btn-primary">🔄 Tentar Novamente</button>
        </div>
      </div>
    `;

    document.querySelector('#restart-btn').addEventListener('click', () => {
      currentQuestion = 0;
      answers = new Array(quizData.length).fill(null);
      renderQuestion();
    });
  }
}

// Inicializa o quiz
renderQuestion();
