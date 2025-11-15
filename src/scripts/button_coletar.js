const Gpio = require('onoff').Gpio;
const axios = require('axios');

// Botão e LED
const botao = new Gpio(21, 'in', 'both', { debounceTimeout: 50 });
const led = new Gpio(22, 'out');

console.log("Monitorando botão e LED...");

let coletaAtiva = false;
let ledInterval = null;

// Função para iniciar piscar LED
function iniciarPiscar() {
    ledInterval = setInterval(() => {
        led.writeSync(led.readSync() ^ 1); // alterna entre 0 e 1
    }, 500);
}

// Função para parar de piscar e apagar LED
function pararPiscar() {
    if (ledInterval) {
        clearInterval(ledInterval);
        led.writeSync(0);
        ledInterval = null;
    }
}

// Função para chamar a API de coleta
async function atualizarColeta(acao) {
    try {
        const res = await axios.get(`http://127.0.0.1:5001/coleta-balanca?acao=${acao}`);
        console.log(`[API] Coleta ${acao} | Status retornado: ${res.data.retorno.coleta_status}`);
    } catch (err) {
        console.error(`[ERRO] Falha ao atualizar coleta: ${err.message}`);
    }
}

// Monitorando o botão
botao.watch((err, value) => {
    if (err) {
        console.error('Erro no botão:', err);
        return;
    }

    if (value === 0) { // botão pressionado
        if (!coletaAtiva) {
            coletaAtiva = true;
            console.log("Coleta iniciada! LED piscando...");
            iniciarPiscar();
            atualizarColeta("iniciar");
        } else {
            coletaAtiva = false;
            console.log("Coleta finalizada! LED apagado.");
            pararPiscar();
            atualizarColeta("finalizar");
        }
    }
});

// Libera GPIO ao sair
process.on('SIGINT', () => {
    botao.unexport();
    pararPiscar();
    led.unexport();
    console.log('Saindo...');
    process.exit();
});