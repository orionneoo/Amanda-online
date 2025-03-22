import { EventEmitter } from 'events';

class MemoryManager extends EventEmitter {
    private readonly PAUSE_DURATION = 5 * 60 * 1000; // 5 minutos em ms
    private readonly MEMORY_CHECK_INTERVAL = 30 * 1000; // Checa a cada 30 segundos
    private readonly MEMORY_THRESHOLD = 0.85; // 85% do limite de memória
    private checkInterval: NodeJS.Timeout | null = null;
    private isPaused: boolean = false;

    constructor() {
        super();
        this.startMonitoring();
        this.handleProcessErrors();
    }

    private startMonitoring() {
        this.checkInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, this.MEMORY_CHECK_INTERVAL);
    }

    private checkMemoryUsage() {
        const used = process.memoryUsage();
        const heapUsed = used.heapUsed / 1024 / 1024; // MB
        const heapTotal = used.heapTotal / 1024 / 1024; // MB
        const memoryUsageRatio = heapUsed / heapTotal;

        console.log(`Uso de memória: ${Math.round(heapUsed)}MB / ${Math.round(heapTotal)}MB (${Math.round(memoryUsageRatio * 100)}%)`);

        if (memoryUsageRatio > this.MEMORY_THRESHOLD && !this.isPaused) {
            this.pauseBot();
        }
    }

    private async pauseBot() {
        try {
            this.isPaused = true;
            console.log('⚠️ Uso alto de memória detectado. Pausando bot por 5 minutos...');
            
            // Emite evento de pausa
            this.emit('pause');

            // Força coleta de lixo
            if (global.gc) {
                global.gc();
            }

            // Aguarda 5 minutos
            await new Promise(resolve => setTimeout(resolve, this.PAUSE_DURATION));

            // Retoma operação
            this.isPaused = false;
            console.log('✅ Bot retomando operação após pausa...');
            this.emit('resume');

        } catch (error) {
            console.error('Erro durante pausa do bot:', error);
            this.isPaused = false;
        }
    }

    private handleProcessErrors() {
        // Captura erros de memória
        process.on('memoryUsage', (data) => {
            console.log('Aviso de uso de memória:', data);
        });

        // Captura erros não tratados
        process.on('uncaughtException', (error) => {
            console.error('Erro não tratado:', error);
            if (error.message.includes('heap') || error.message.includes('memory')) {
                this.pauseBot();
            }
        });

        // Captura promessas rejeitadas não tratadas
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Promessa rejeitada não tratada:', reason);
        });
    }

    public stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

export const memoryManager = new MemoryManager(); 