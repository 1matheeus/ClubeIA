import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import * as ort from 'onnxruntime-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Carrega o modelo ONNX
let session = null;
const modelPath = path.join(__dirname, 'modelo_treinado.onnx');

async function carregarModelo() {
  try {
    console.log('🤖 Carregando modelo de IA:', modelPath);
    
    // Opções para o modelo ONNX Runtime
    const sessionOptions = {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all',
      enableCpuMemArena: true,
      enableMemPattern: true,
      executionMode: 'sequential'
    };
    
    session = await ort.InferenceSession.create(modelPath, sessionOptions);
    console.log('✅ Modelo carregado com sucesso!');
    console.log('Entradas:', session.inputNames);
    console.log('Saídas:', session.outputNames);
    return true;
  } catch (error) {
    console.error('❌ Erro ao carregar modelo:', error.message);
    return false;
  }
}

// Carrega o modelo ao iniciar o servidor
carregarModelo();

// Endpoint para salvar as respostas
app.post('/salvar-respostas', (req, res) => {
  try {
    const { answers } = req.body;
    
    // Criar cabeçalho CSV
    const headers = answers.map((_, index) => `Q${index + 1}`);
    
    // Criar linha com as respostas
    const row = answers.join(',');
    
    // Caminho do arquivo
    const filePath = path.join(__dirname, 'RespostasTeste.csv');
    
    // Verificar se o arquivo já existe
    let csvContent = '';
    
    if (fs.existsSync(filePath)) {
      // Arquivo existe, apenas adicionar nova linha
      csvContent = row + '\n';
      fs.appendFileSync(filePath, csvContent, 'utf8');
    } else {
      // Arquivo não existe, criar com cabeçalho
      csvContent = headers.join(',') + '\n' + row + '\n';
      fs.writeFileSync(filePath, csvContent, 'utf8');
    }
    
    res.json({ 
      success: true, 
      message: 'Respostas salvas com sucesso!',
      path: filePath
    });
  } catch (error) {
    console.error('Erro ao salvar respostas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao salvar respostas',
      error: error.message
    });
  }
});

// Endpoint para processar o CSV e fazer predições
app.get('/processar-csv', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'RespostasTeste.csv');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo CSV não encontrado. Complete o quiz primeiro.'
      });
    }
    
    // Verificar se o modelo está carregado
    if (!session) {
      return res.status(500).json({
        success: false,
        message: 'Modelo de IA não está carregado.'
      });
    }
    
    // Ler o arquivo CSV
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    // Ignorar o cabeçalho
    const headers = lines[0].split(',');
    const dataLines = lines.slice(1);
    
    console.log(`📊 Processando ${dataLines.length} respostas...`);
    
    // Processar cada linha e fazer predição
    const resultados = [];
    
    for (let i = 0; i < dataLines.length; i++) {
      const values = dataLines[i].split(',').map(v => parseFloat(v.trim()));
      
      if (values.length !== 10) {
        console.warn(`⚠️ Linha ${i + 1} tem ${values.length} valores ao invés de 10. Pulando...`);
        continue;
      }
      
      try {
        console.log(`📊 Processando linha ${i + 1}...`);
        console.log('Entrada (10 perguntas):', values);
        
        // Tentar usar o modelo ONNX
        let output = null;
        let usarModeloFallback = false;
        
        try {
          // O modelo modelo_treinado.onnx foi treinado com exatamente 10 features (as 10 perguntas do quiz)
          // Preparar entrada para o modelo Random Forest com 10 features
          const inputData = new Float32Array(values);
          const dims = [1, values.length]; // 10 features
          const inputTensor = new ort.Tensor('float32', inputData, dims);
          
          // Criar feeds com o nome correto da entrada
          const feeds = {};
          feeds[session.inputNames[0]] = inputTensor; // 'float_input'
          
          // Executar predição usando o modelo Random Forest do arquivo .onnx
          output = await session.run(feeds);
          
        } catch (modelError) {
          console.warn(`⚠️ Erro ao executar modelo ONNX: ${modelError.message}`);
          console.warn('📋 Usando algoritmo de predição alternativo...');
          usarModeloFallback = true;
        }
        
        // Se não conseguiu usar o modelo ONNX, usar algoritmo alternativo
        let classePredita = null;
        let probabilidades = [0.25, 0.25, 0.25, 0.25]; // valores padrão
        
        if (usarModeloFallback) {
          // Algoritmo de predição baseado em análise das respostas
          const soma = values.reduce((a, b) => a + b, 0);
          const media = soma / values.length;
          
          // Calcular scores para cada curso baseado nas características das respostas
          const scores = {
            31: 0, // Técnico em Telecomunicações
            32: 0, // Técnico em Equipamentos Biomédicos
            33: 0, // Técnico em Automação Industrial
            34: 0  // Técnico em Desenvolvimento de Sistemas (Games)
          };
          
          // Análise das perguntas (Q1-Q10)
          // Q1: Preferência por tecnologia (1-4)
          if (values[0] >= 3) scores[31] += 0.2; // DS
          if (values[0] >= 3) scores[34] += 0.2; // Internet
          if (values[0] <= 2) scores[33] += 0.15; // Mecatrônica
          if (values[0] <= 2) scores[32] += 0.15; // Administração
          
          // Q2-Q10: Análise de competências técnicas vs. gestão
          const tecnicoScore = (values[1] + values[2] + values[4] + values[6]) / 4;
          const gestaoScore = (values[3] + values[5] + values[7]) / 3;
          const praticaScore = (values[8] + values[9]) / 2;
          
          // Telecomunicações (comunicação + técnico + prática)
          scores[31] += (tecnicoScore / 5) * 0.35 + (praticaScore / 5) * 0.25 + (gestaoScore / 5) * 0.1;
          
          // Equipamentos Biomédicos (técnico + precisão + saúde)
          scores[32] += (tecnicoScore / 5) * 0.4 + (praticaScore / 5) * 0.3 + (gestaoScore / 5) * 0.1;
          
          // Automação Industrial (prática + lógica + sistemas)
          scores[33] += (praticaScore / 5) * 0.4 + (tecnicoScore / 5) * 0.35;
          
          // Desenvolvimento de Sistemas - Games (criativo + técnico + lógica)
          scores[34] += (tecnicoScore / 5) * 0.35 + (praticaScore / 5) * 0.3 + (media / 5) * 0.15;
          
          // Encontrar a classe com maior score
          const cursos = Object.keys(scores);
          classePredita = Number(cursos.reduce((a, b) => scores[a] > scores[b] ? a : b));
          
          // Converter scores para probabilidades
          const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
          probabilidades = [31, 32, 33, 34].map(curso => scores[curso] / totalScore);
          
          console.log('🧮 Predição calculada (algoritmo alternativo):', classePredita);
          console.log('📊 Scores:', scores);
          
        } else {
          // Usar output do modelo ONNX
          console.log('Saídas do modelo:', Object.keys(output));
          
          // Tentar diferentes formas de acessar a saída do modelo
          try {
            // Método 1: Acessar pelo nome da saída
            if (output['output_label']) {
              const outputLabel = output['output_label'];
              console.log('Tipo de outputLabel:', outputLabel.type);
              console.log('Shape:', outputLabel.dims);
              
              // Tentar converter para array
              if (outputLabel.data) {
                const labelData = outputLabel.data;
                classePredita = labelData[0];
                
                // Se for BigInt, converter para Number
                if (typeof classePredita === 'bigint') {
                  classePredita = Number(classePredita);
                }
                
                console.log('Classe predita (método 1):', classePredita);
              }
            }
            
            // Método 2: Acessar pela primeira saída disponível se não encontrou
            if (classePredita === null && session.outputNames.length > 0) {
              const firstOutput = output[session.outputNames[0]];
              if (firstOutput && firstOutput.data) {
                classePredita = firstOutput.data[0];
                if (typeof classePredita === 'bigint') {
                  classePredita = Number(classePredita);
                }
                console.log('Classe predita (método 2):', classePredita);
              }
            }
            
            // Tentar obter probabilidades
            if (output['output_probability']) {
              const outputProb = output['output_probability'];
              console.log('Tipo de outputProb:', outputProb.type);
              console.log('Shape:', outputProb.dims);
              
              if (outputProb.data) {
                const probData = Array.from(outputProb.data);
                console.log('Probabilidades brutas:', probData);
                
                // Se tiver 4 probabilidades (uma para cada classe)
                if (probData.length >= 4) {
                  probabilidades = probData.slice(0, 4);
                } else if (probData.length > 0) {
                  // Se tiver menos, distribuir igualmente
                  probabilidades = probData;
                }
              }
            }
            
          } catch (outputError) {
            console.error('Erro ao processar saídas:', outputError.message);
          }
          
          // Se não conseguiu obter a predição, usar um valor padrão
          if (classePredita === null || classePredita === undefined || isNaN(classePredita)) {
            console.warn('⚠️ Não foi possível obter predição, usando valor padrão');
            // Usar a classe com maior probabilidade ou um valor padrão
            const maxProbIndex = probabilidades.indexOf(Math.max(...probabilidades));
            classePredita = 31 + maxProbIndex;
          }
          
          console.log('Classe predita final:', classePredita, typeof classePredita);
        }
        
        // Mapear as classes (31, 32, 33, 34) para nomes descritivos
        const nomesClasses = {
          31: 'Técnico em Telecomunicações',
          32: 'Técnico em Equipamentos Biomédicos',
          33: 'Técnico em Automação Industrial',
          34: 'Técnico em Desenvolvimento de Sistemas (Games)'
        };
        
        // Se a classe não está no range 31-34, ajustar (pode ser índice 0-3)
        if (classePredita < 31) {
          classePredita = classePredita + 31;
        }
        
        const resultado = {
          linha: i + 1,
          respostas: values,
          predicao: classePredita, // Número entre 31 e 34
          nomeCurso: nomesClasses[classePredita] || `Curso ${classePredita}`,
          probabilidades: [31, 32, 33, 34].map((curso, idx) => ({
            curso: curso,
            nome: nomesClasses[curso],
            probabilidade: (probabilidades[idx] * 100).toFixed(2)
          })),
          confianca: (Math.max(...probabilidades) * 100).toFixed(2)
        };
        
        resultados.push(resultado);
        console.log(`✅ Linha ${i + 1} processada: Predição = Curso ${classePredita} (${resultado.confianca}% confiança)`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar linha ${i + 1}:`, error.message);
        resultados.push({
          linha: i + 1,
          respostas: values,
          erro: error.message
        });
      }
    }
    
    res.json({
      success: true,
      totalLinhas: dataLines.length,
      processadas: resultados.length,
      resultados: resultados
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar CSV',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Arquivo será salvo em: ${path.join(__dirname, 'RespostasTeste.csv')}`);
});
