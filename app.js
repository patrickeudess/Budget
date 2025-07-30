/*
 * Logique principale pour Mon Budget Malin
 *
 * Ce fichier gère l'enregistrement des transactions, la sauvegarde dans
 * le stockage local du navigateur et la mise à jour de l'interface
 * (tableau des transactions, calcul des totaux et graphique de
 * répartition des dépenses). Plotly est utilisé pour les graphiques,
 * ce qui permet un rendu interactif hors‑connexion grâce au fichier
 * plotly.js local.
 */

let currentChartType = 'bar'; // 'bar' ou 'pie'

// Variables globales
let transactions = [];
let budgets = {};
let categories = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Charger les données
        await loadData();
        
        // Initialiser l'interface
        updateUI();
        
        // Configurer les événements
        setupEventListeners();
        
        // Initialiser les animations
        initializeAnimations();
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showNotification('Erreur lors du chargement des données', 'error');
    }
}

async function loadData() {
    try {
        // Charger les transactions
        transactions = await loadTransactions();
        
        // Charger les budgets
        budgets = await loadBudgets();
        
        // Charger les catégories
        categories = loadCategories();
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Fallback vers localStorage
        transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
        categories = loadCategories();
    }
}

function loadCategories() {
    return [
        { name: 'Salaire', icon: '💰', color: '#28a745', type: 'revenu' },
        { name: 'Bonus', icon: '🎁', color: '#ffc107', type: 'revenu' },
        { name: 'Freelance', icon: '💼', color: '#17a2b8', type: 'revenu' },
        { name: 'Investissement', icon: '📈', color: '#6f42c1', type: 'revenu' },
        { name: 'Nourriture', icon: '🍽️', color: '#dc3545', type: 'depense' },
        { name: 'Transport', icon: '🚗', color: '#fd7e14', type: 'depense' },
        { name: 'Logement', icon: '🏠', color: '#20c997', type: 'depense' },
        { name: 'Communication', icon: '📱', color: '#e83e8c', type: 'depense' },
        { name: 'Santé', icon: '🏥', color: '#6610f2', type: 'depense' },
        { name: 'Loisirs', icon: '🎮', color: '#343a40', type: 'depense' },
        { name: 'Vêtements', icon: '👕', color: '#6c757d', type: 'depense' },
        { name: 'Éducation', icon: '📚', color: '#28a745', type: 'depense' },
        { name: 'Divers', icon: '📦', color: '#6c757d', type: 'depense' }
    ];
}

function updateUI() {
    updateQuickSummary();
    updateEvolutionChart();
    updateBudgetOverview();
}

function updateQuickSummary() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const totalRevenus = monthTransactions
        .filter(t => t.type === 'revenu')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalDepenses = monthTransactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const solde = totalRevenus - totalDepenses;
    
    // Mettre à jour les éléments de l'interface
    const revenusElement = document.getElementById('total-revenus');
    const depensesElement = document.getElementById('total-depenses');
    const soldeElement = document.getElementById('solde-actuel');
    
    if (revenusElement) revenusElement.textContent = `${totalRevenus.toFixed(0)} FCFA`;
    if (depensesElement) depensesElement.textContent = `${totalDepenses.toFixed(0)} FCFA`;
    if (soldeElement) {
        soldeElement.textContent = `${solde.toFixed(0)} FCFA`;
        soldeElement.style.color = solde >= 0 ? '#28a745' : '#dc3545';
    }
}

function updateEvolutionChart() {
    const chartContainer = document.getElementById('evolution-chart');
    if (!chartContainer) return;
    
    // Grouper les transactions par mois
    const monthlyData = {};
    transactions.forEach(transaction => {
        const month = transaction.date.slice(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { revenus: 0, depenses: 0 };
        }
        
        if (transaction.type === 'revenu') {
            monthlyData[month].revenus += transaction.amount;
        } else {
            monthlyData[month].depenses += transaction.amount;
        }
    });
    
    // Préparer les données pour Plotly
    const months = Object.keys(monthlyData).sort();
    const revenusData = months.map(month => monthlyData[month].revenus);
    const depensesData = months.map(month => monthlyData[month].depenses);
    
    const trace1 = {
        x: months,
        y: revenusData,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Revenus',
        line: { color: '#4CAF50', width: 3 },
        marker: { size: 8 }
    };
    
    const trace2 = {
        x: months,
        y: depensesData,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Dépenses',
        line: { color: '#F44336', width: 3 },
        marker: { size: 8 }
    };
    
    const layout = {
        title: 'Évolution des finances',
        xaxis: { title: 'Mois' },
        yaxis: { title: 'Montant (FCFA)' },
        hovermode: 'closest',
        margin: { t: 50, b: 50, l: 50, r: 50 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    Plotly.newPlot(chartContainer, [trace1, trace2], layout, { responsive: true, displayModeBar: false });
}

function updateBudgetOverview() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    // Calculer les dépenses par catégorie
    const expensesByCategory = {};
    monthTransactions
        .filter(t => t.type === 'depense')
        .forEach(t => {
            if (!expensesByCategory[t.category]) {
                expensesByCategory[t.category] = 0;
            }
            expensesByCategory[t.category] += t.amount;
        });
    
    // Mettre à jour les progress bars des budgets
    Object.keys(budgets).forEach(category => {
        const budgetAmount = budgets[category];
        const spentAmount = expensesByCategory[category] || 0;
        const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
        
        const progressElement = document.querySelector(`[data-category="${category}"] .progress-fill`);
        if (progressElement) {
            progressElement.style.width = `${Math.min(percentage, 100)}%`;
            progressElement.style.backgroundColor = percentage > 100 ? '#dc3545' : 
                                                percentage > 80 ? '#ffc107' : '#28a745';
        }
    });
}

function setupEventListeners() {
    // Écouter les changements de données
    window.addEventListener('dataUpdated', () => {
        updateUI();
    });
    
    // Écouter les événements de connexion
    if (window.authManager) {
        window.authManager.setupEventListeners();
    }
}

function initializeAnimations() {
    // Animation des cartes
    const cards = document.querySelectorAll('.nav-card, .summary-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
    
    // Animation des valeurs numériques
    const animatedValues = document.querySelectorAll('.animated-value');
    animatedValues.forEach(value => {
        const finalValue = parseFloat(value.textContent.replace(/[^\d]/g, ''));
        animateValue(value, 0, finalValue, 1500);
    });
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (difference * easeOutCubic(progress));
        element.textContent = formatCurrency(current);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message, type = 'info') {
    if (window.notificationManager) {
        window.notificationManager.show(message, type);
    } else {
        // Fallback simple
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
}

// Fonctions de compatibilité avec l'ancien code
function addTransaction(transaction) {
    transactions.push(transaction);
    saveTransactions(transactions);
    updateUI();
    showNotification('Transaction ajoutée avec succès !', 'success');
}

function updateTransaction(id, updatedTransaction) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updatedTransaction };
        saveTransactions(transactions);
        updateUI();
        showNotification('Transaction mise à jour avec succès !', 'success');
    }
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions(transactions);
    updateUI();
    showNotification('Transaction supprimée avec succès !', 'success');
}

function addBudget(category, amount) {
    budgets[category] = amount;
    saveBudgets(budgets);
    updateUI();
    showNotification('Budget ajouté avec succès !', 'success');
}

function updateBudget(category, amount) {
    budgets[category] = amount;
    saveBudgets(budgets);
    updateUI();
    showNotification('Budget mis à jour avec succès !', 'success');
}

function deleteBudget(category) {
    delete budgets[category];
    saveBudgets(budgets);
    updateUI();
    showNotification('Budget supprimé avec succès !', 'success');
}

// Fonctions utilitaires
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}

function getCurrentMonth() {
    return new Date().toISOString().slice(0, 7);
}

// Export des fonctions pour utilisation globale
window.addTransaction = addTransaction;
window.updateTransaction = updateTransaction;
window.deleteTransaction = deleteTransaction;
window.addBudget = addBudget;
window.updateBudget = updateBudget;
window.deleteBudget = deleteBudget;
window.showNotification = showNotification;