import { Canvas, createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

// Função para criar ícone com fundo azul
async function createIconWithBackground() {
    try {
        // Carrega o ícone original
        const originalIcon = await loadImage('./assets/Icon.png');
        
        // Cria um canvas de 1024x1024 (tamanho padrão para ícones)
        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');
        
        // Pinta o fundo azul
        ctx.fillStyle = '#4A90E2';
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Calcula o tamanho do ícone (80% do canvas para ter padding)
        const iconSize = 1024 * 0.8;
        const iconPosition = (1024 - iconSize) / 2;
        
        // Desenha o ícone no centro
        ctx.drawImage(originalIcon, iconPosition, iconPosition, iconSize, iconSize);
        
        // Salva o novo ícone
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync('./assets/icon-with-background.png', buffer);
        
        console.log('Ícone com fundo azul criado: icon-with-background.png');
        
    } catch (error) {
        console.error('Erro ao criar ícone:', error);
    }
}

createIconWithBackground();
