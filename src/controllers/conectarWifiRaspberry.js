const fs = require('fs');

const path = require('path');

const { spawn, execSync } = require('child_process');

exports.conectarWifiRaspberry = (req, res) => {
  try {
    const { ssid, password } = req.body;

    const cpuInfo = fs.readFileSync('/proc/cpuinfo', 'utf8');
    const serialLine = cpuInfo.split('\n').find(line => line.startsWith('Serial'));
    const serial = serialLine ? serialLine.split(':')[1].trim() : '000000';

    if (!ssid || !password) {
      return res.status(400).json({
        retorno: {
          status: 400,
          mensagem: 'SSID e password são obrigatórios'
        }
      });
    }

    let redeAtual = '';
    try {
      redeAtual = execSync('iwgetid -r').toString().trim();
    } catch {
      redeAtual = '';
    }

    if (redeAtual) {
      return res.status(200).json({
        retorno: {
          status: 200,
          mensagem: `Já conectado à rede '${redeAtual}'. Reinicie para trocar.`
        }
      });
    }

    const scriptConfigPath = path.resolve(__dirname, '../scripts/configurar_wifi.sh');
    const scriptWatchdogPath = path.resolve(__dirname, '../scripts/watchdog_wifi.sh');

    // Gera hostname para exibir no frontend
    const ssidLimpo = ssid.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const serialFinal = serial.slice(-6);

    // Resposta imediata
    res.status(200).json({
      retorno: {
        status: 200,
        mensagem: `Iniciando conexão com a rede ${ssid}... Verifique os indicadores luminosos na placa para confirmar o status da conexão.`
      },
      registros: [{ serial }]
    });

    // Executa script de configuração
    const childConfig = spawn('sudo', [scriptConfigPath, ssid, password, serial]);

    childConfig.stdout.on('data', (data) => {
      console.log(`[configurar_wifi.sh stdout]: ${data}`);
    });

    childConfig.stderr.on('data', (data) => {
      console.error(`[configurar_wifi.sh stderr]: ${data}`);
    });

    childConfig.on('close', (code) => {
      console.log(`configurar_wifi.sh finalizado com código ${code}`);

      // Inicia watchdog
      const childWatchdog = spawn('sudo', [scriptWatchdogPath], {
        detached: true,
        stdio: 'ignore'
      });
      childWatchdog.unref();
      console.log('Watchdog iniciado.');
    });

  } catch (error) {
    console.error("Erro na função conectWifiRaspberry:", error);
    return res.status(500).json({
      retorno: {
        status: 500,
        mensagem: "Erro ao conectar à rede, tente novamente.",
        erro: error.message
      }
    });
  }
};