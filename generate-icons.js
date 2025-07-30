const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Fond blanc
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    
    const scale = size / 512;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Couleurs
    const orange = '#FF6B35';
    const green = '#4CAF50';
    
    // Barres orange (graphique de croissance)
    const barWidth = 20 * scale;
    const barHeight1 = 40 * scale;
    const barHeight2 = 55 * scale;
    const barHeight3 = 80 * scale;
    
    ctx.fillStyle = orange;
    ctx.fillRect(centerX - 60 * scale, centerY + 20 * scale, barWidth, barHeight1);
    ctx.fillRect(centerX - 30 * scale, centerY + 5 * scale, barWidth, barHeight2);
    ctx.fillRect(centerX, centerY - 20 * scale, barWidth, barHeight3);
    
    // Tige verte
    ctx.strokeStyle = green;
    ctx.lineWidth = 5 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX + 20 * scale, centerY - 20 * scale);
    ctx.quadraticCurveTo(centerX + 30 * scale, centerY - 35 * scale, centerX + 45 * scale, centerY - 40 * scale);
    ctx.quadraticCurveTo(centerX + 60 * scale, centerY - 45 * scale, centerX + 75 * scale, centerY - 40 * scale);
    ctx.stroke();
    
    // Feuille verte
    ctx.fillStyle = green;
    ctx.save();
    ctx.translate(centerX + 35 * scale, centerY - 30 * scale);
    ctx.rotate(-15 * Math.PI / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8 * scale, 4 * scale, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    
    // Pièce orange avec dollar
    ctx.fillStyle = orange;
    ctx.beginPath();
    ctx.arc(centerX + 75 * scale, centerY - 40 * scale, 15 * scale, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = `${20 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('$', centerX + 75 * scale, centerY - 40 * scale + 8 * scale);
    
    // Texte "Mon Budget Malin"
    ctx.fillStyle = orange;
    ctx.font = `${16 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Mon', centerX, centerY + 50 * scale);
    ctx.fillText('Budget', centerX, centerY + 70 * scale);
    ctx.fillText('Malin', centerX, centerY + 90 * scale);
    
    return canvas.toBuffer('image/png');
}

// Générer les icônes
try {
    const icon192 = createIcon(192);
    const icon512 = createIcon(512);
    
    fs.writeFileSync('icon-192.png', icon192);
    fs.writeFileSync('icon-512.png', icon512);
    
    console.log('Icônes générées avec succès !');
    console.log('- icon-192.png créé');
    console.log('- icon-512.png créé');
} catch (error) {
    console.error('Erreur lors de la génération des icônes:', error);
} 