const fs = require('fs');
// Módulo para manipulação de arquivos (logs)
const path = require('path');
// Módulo para manipulação de caminhos de arquivos
const { exec } = require('child_process');
// Para executar comandos e scripts externos
const { Gpio } = require('onoff');
// Biblioteca para controle de GPIO no Raspberry Pi

// Caminho absoluto do arquivo de log onde as mensagens serão gravadas
const LOG_PATH = path.resolve(__dirname, '../log/conectar_wifi.log');

// Caminho absoluto do script que será executado ao pressionar o botão
const SCRIPT_PATH = path.resolve(__dirname, '../scripts/ativar_modo_ap_reboot.sh');

// Configura o GPIO 17 como entrada, detectando borda de descida (falling edge) com debounce de 10ms
const button = new Gpio(17, 'in', 'falling', { debounceTimeout: 10 });

let emExecucao = false;
// Flag para evitar múltiplas execuções simultâneas do script

// Função para gravar mensagens no arquivo de log e imprimir no console
function log(mensagem) {
  const data = new Date().toISOString();
  // Pega data e hora atual no formato ISO
  const texto = `[${data}] ${mensagem}\n`;
  // Formata mensagem com timestamp
  fs.appendFileSync(LOG_PATH, texto);
  // Grava mensagem no arquivo de log (sincrono)
  console.log(texto.trim());
  // Mostra mensagem no console, sem a quebra extra
}

// Log inicial para indicar que o monitoramento do botão iniciou
log('🔘 Monitorando botão GPIO17...');

// Configura o "watch" para detectar eventos no botão (pressionamento)
button.watch((err, value) => {
  if (err) {
    // Caso erro ao ler o botão, grava no log e retorna sem executar nada
    log(`❌ Erro ao ler botão: ${err.message}`);
    return;
  }

  // Se já houver execução em andamento, ignora novo acionamento e loga aviso
  if (emExecucao) {
    log('⚠️ Script já em execução. Ignorando novo acionamento.');
    return;
  }

  emExecucao = true;
  // Sinaliza que o script está em execução
  log('🔘 Botão pressionado. Executando script...');

  // Executa o script shell configurado
  exec(`bash ${SCRIPT_PATH}`, (error, stdout, stderr) => {
    if (error) {
      // Loga erro caso tenha ocorrido
      log(`❌ Erro ao executar script: ${error.message}`);
    }
    if (stderr) {
      // Loga qualquer saída de erro (stderr) do script
      log(`⚠️ STDERR: ${stderr}`);
    }
    if (stdout) {
      // Loga a saída padrão (stdout) do script
      log(`✅ STDOUT: ${stdout}`);
    }
    emExecucao = false;
    // Libera flag para permitir próximas execuções
  });
});

// Tratamento para encerramento do processo via CTRL+C
process.on('SIGINT', () => {
  button.unexport();
  // Libera o GPIO para uso futuro
  log('⛔ Encerrando monitoramento do botão...');
  process.exit();
  // Encerra o processo Node.js
});
