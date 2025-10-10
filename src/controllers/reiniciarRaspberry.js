const { spawn } = require('child_process');

exports.reiniciarRaspberry = (req, res) => {
  try {
    res.status(200).json({
      retorno: {
        status: 200,
        mensagem: 'A balança será reiniciada em instantes...'
      },
      registros: []
    });

    // Executa o comando de reboot de forma assíncrona
    const child = spawn('sudo', ['reboot'], {
      detached: true,
      stdio: 'ignore'
    });

    // Garante que o processo não dependa do Node
    child.unref();

    console.log('[INFO] Reboot do balança iniciado...');

  } catch (error) {
    console.error('Erro ao reiniciar balança:', error);

    res.status(500).json({
      retorno: {
        status: 500,
        mensagem: 'Erro ao tentar reiniciar a balança.'
      },
      registros: []
    });
  }
};
