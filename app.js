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

// Attend que le DOM soit entièrement chargé avant d'exécuter le code
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // Charge les transactions existantes depuis localStorage
    let transactions = loadTransactions();
    // Charge les budgets depuis localStorage
    let budgets = loadBudgets();

    // Détecte la page actuelle et initialise les fonctionnalités appropriées
    const currentPage = getCurrentPage();
    initializePage(currentPage, transactions, budgets);

    // Gestionnaire de soumission du formulaire (seulement sur la page transactions)
    const form = document.getElementById('transaction-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const amountField = document.getElementById('amount');
            const typeField = document.getElementById('type');
            const categoryField = document.getElementById('category');
            const descriptionField = document.getElementById('description');
            const dateField = document.getElementById('date');
            const paymentMethodField = document.getElementById('payment-method');

            const amount = parseFloat(amountField.value);
            if (isNaN(amount) || amount < 0) {
                showNotification('Veuillez entrer un montant valide.', 'error');
                return;
            }

            const transaction = {
                id: Date.now(),
                amount: amount,
                type: typeField.value,
                category: categoryField.value,
                description: descriptionField.value.trim(),
                date: dateField.value,
                paymentMethod: paymentMethodField.value
            };
            transactions.push(transaction);
            saveTransactions(transactions);
            
            // Met à jour l'interface si on est sur la page d'accueil
            if (currentPage === 'index') {
                updateQuickSummary(transactions);
                updateRecommendations(transactions, budgets);
            }

            // Réinitialise le formulaire
            form.reset();
            if (dateInput) {
                dateInput.value = today;
            }
            
            showNotification('Transaction enregistrée avec succès !', 'success');
        });
    }

    // Gestion de l'enregistrement des budgets (seulement sur la page budgets)
    const saveBudgetsBtn = document.getElementById('save-budgets');
    if (saveBudgetsBtn) {
        saveBudgetsBtn.addEventListener('click', () => {
            const rows = document.querySelectorAll('#budget-table tbody tr');
            rows.forEach(row => {
                const cat = row.getAttribute('data-category');
                const input = row.querySelector('input');
                const val = parseFloat(input.value);
                budgets[cat] = isNaN(val) || val < 0 ? 0 : val;
            });
            saveBudgets(budgets);
            updateUI(transactions, budgets);
            showNotification('Budgets enregistrés avec succès !', 'success');
        });
    }

    // Contrôles des graphiques (seulement sur la page analytics)
    const barChartBtn = document.getElementById('bar-chart');
    const pieChartBtn = document.getElementById('pie-chart');
    if (barChartBtn && pieChartBtn) {
        barChartBtn.addEventListener('click', () => {
            currentChartType = 'bar';
            updateChartButtons();
            updateChart(transactions, budgets);
        });

        pieChartBtn.addEventListener('click', () => {
            currentChartType = 'pie';
            updateChartButtons();
            updateChart(transactions, budgets);
        });
    }

    // Export des données (sur toutes les pages qui ont ce bouton)
    const exportBtn = document.getElementById('export-json');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                transactions: transactions,
                budgets: budgets,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `budget_malin_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Données exportées avec succès !', 'success');
        });
    }

    // Import des données (seulement sur la page data)
    const importBtn = document.getElementById('import-json');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('import-file');
            const file = fileInput.files[0];
            if (!file) {
                showNotification('Veuillez sélectionner un fichier JSON.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (Array.isArray(data.transactions)) {
                        transactions = data.transactions;
                        saveTransactions(transactions);
                    }
                    if (data.budgets && typeof data.budgets === 'object') {
                        budgets = data.budgets;
                        saveBudgets(budgets);
                    }
                    updateUI(transactions, budgets);
                    fileInput.value = '';
                    showNotification('Données importées avec succès !', 'success');
                } catch (err) {
                    showNotification('Le fichier sélectionné est invalide.', 'error');
                }
            };
            reader.readAsText(file);
        });
    }
});

/**
 * Détecte la page actuelle
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('transactions.html')) return 'transactions';
    if (path.includes('history.html')) return 'history';
    if (path.includes('budgets.html')) return 'budgets';
    if (path.includes('analytics.html')) return 'analytics';
    if (path.includes('data.html')) return 'data';
    if (path.includes('tips.html')) return 'tips';
    return 'index';
}

/**
 * Initialise la page selon son type
 */
function initializePage(page, transactions, budgets) {
    switch (page) {
        case 'index':
            updateQuickSummary(transactions);
            updateRecommendations(transactions, budgets);
            break;
        case 'transactions':
            // Page déjà initialisée par les event listeners
            break;
        case 'history':
            populateHistoryTable(transactions);
            setupFilters(transactions);
            break;
        case 'budgets':
            updateBudgetOverview(transactions, budgets);
            populateBudgetTable(budgets);
            updateBudgetAlerts(transactions, budgets);
            break;
        case 'analytics':
            updateUI(transactions, budgets);
            updateInsights(transactions, budgets);
            break;
        case 'data':
            updateDataStats(transactions);
            break;
        case 'tips':
            updatePersonalizedTips(transactions, budgets);
            break;
    }
}

/**
 * Met à jour le résumé rapide sur la page d'accueil
 */
function updateQuickSummary(transactions) {
    let totalRevenus = 0;
    let totalDepenses = 0;
    transactions.forEach(item => {
        if (item.type === 'revenu') {
            totalRevenus += item.amount;
        } else {
            totalDepenses += item.amount;
        }
    });
    const solde = totalRevenus - totalDepenses;
    
    const quickRevenus = document.getElementById('quick-total-revenus');
    const quickDepenses = document.getElementById('quick-total-depenses');
    const quickSolde = document.getElementById('quick-solde');
    
    if (quickRevenus) quickRevenus.textContent = totalRevenus.toFixed(0) + ' FCFA';
    if (quickDepenses) quickDepenses.textContent = totalDepenses.toFixed(0) + ' FCFA';
    if (quickSolde) {
        quickSolde.textContent = solde.toFixed(0) + ' FCFA';
        quickSolde.style.color = solde >= 0 ? '#28a745' : '#dc3545';
    }
}

/**
 * Génère des recommandations personnalisées
 */
function updateRecommendations(transactions, budgets) {
    const container = document.getElementById('recommendations-container');
    if (!container) return;
    
    container.innerHTML = '';
    const recommendations = generateRecommendations(transactions, budgets);
    
    recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = `recommendation-card ${rec.type}`;
        card.innerHTML = `
            <h3>${rec.icon} ${rec.title}</h3>
            <p>${rec.message}</p>
        `;
        container.appendChild(card);
    });
}

/**
 * Génère des recommandations basées sur les données utilisateur
 */
function generateRecommendations(transactions, budgets) {
    const recommendations = [];
    
    // Analyse des dépenses
    const expenses = transactions.filter(t => t.type === 'depense');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalRevenues = transactions.filter(t => t.type === 'revenu').reduce((sum, t) => sum + t.amount, 0);
    
    if (totalExpenses === 0) {
        recommendations.push({
            type: 'info',
            icon: '📝',
            title: 'Commencez à enregistrer',
            message: 'Ajoutez votre première transaction pour commencer à suivre votre budget !'
        });
        return recommendations;
    }
    
    // Vérification du solde
    const solde = totalRevenues - totalExpenses;
    if (solde < 0) {
        recommendations.push({
            type: 'danger',
            icon: '⚠️',
            title: 'Solde négatif',
            message: `Votre solde est de ${solde.toFixed(0)} FCFA. Pensez à réduire vos dépenses ou augmenter vos revenus.`
        });
    } else if (solde > 0) {
        recommendations.push({
            type: 'success',
            icon: '✅',
            title: 'Excellent !',
            message: `Votre solde positif de ${solde.toFixed(0)} FCFA montre une bonne gestion de votre budget.`
        });
    }
    
    // Analyse des budgets
    const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    const monthlyExpenses = expenses.filter(item => item.date.startsWith(currentMonth));
    const expensesByCategory = {};
    monthlyExpenses.forEach(item => {
        expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
    });
    
    let budgetWarnings = 0;
    Object.keys(budgets).forEach(category => {
        const budget = budgets[category];
        const spent = expensesByCategory[category] || 0;
        if (budget > 0) {
            const percentage = (spent / budget) * 100;
            if (percentage > 100) {
                budgetWarnings++;
            }
        }
    });
    
    if (budgetWarnings > 0) {
        recommendations.push({
            type: 'warning',
            icon: '🎯',
            title: 'Dépassements de budget',
            message: `${budgetWarnings} catégorie(s) dépassent leur budget. Revoyez vos dépenses.`
        });
    }
    
    // Recommandation d'épargne
    if (solde > 0 && solde < totalRevenues * 0.1) {
        recommendations.push({
            type: 'info',
            icon: '💰',
            title: 'Épargne faible',
            message: 'Votre épargne représente moins de 10% de vos revenus. Pensez à épargner davantage.'
        });
    }
    
    // Recommandation de diversification des revenus
    const revenueCategories = [...new Set(transactions.filter(t => t.type === 'revenu').map(t => t.category))];
    if (revenueCategories.length === 1) {
        recommendations.push({
            type: 'info',
            icon: '💼',
            title: 'Diversifiez vos revenus',
            message: 'Vous n\'avez qu\'une seule source de revenus. Pensez à diversifier pour plus de sécurité.'
        });
    }
    
    return recommendations;
}

/**
 * Met à jour les boutons de contrôle des graphiques
 */
function updateChartButtons() {
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (currentChartType === 'bar') {
        const barBtn = document.getElementById('bar-chart');
        if (barBtn) barBtn.classList.add('active');
    } else {
        const pieBtn = document.getElementById('pie-chart');
        if (pieBtn) pieBtn.classList.add('active');
    }
}

/**
 * Affiche une notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Charge les transactions depuis le stockage local.
 * @returns {Array} Liste des transactions
 */
function loadTransactions() {
    try {
        const data = JSON.parse(localStorage.getItem('transactions'));
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.warn('Erreur de chargement des transactions :', e);
        return [];
    }
}

/**
 * Sauvegarde les transactions dans le stockage local.
 * @param {Array} tx - Liste des transactions à sauvegarder
 */
function saveTransactions(tx) {
    localStorage.setItem('transactions', JSON.stringify(tx));
}

/**
 * Met à jour l'ensemble de l'interface en fonction des transactions.
 * @param {Array} tx - Liste des transactions
 */
function updateUI(tx, budgets) {
    populateTable(tx);
    updateTotals(tx);
    updateChart(tx, budgets);
    updateBudgetAlerts(tx, budgets);
}

/**
 * Remplit le tableau HTML avec les transactions fournies.
 * Les transactions sont triées par date décroissante.
 * @param {Array} tx - Liste des transactions
 */
function populateTable(tx) {
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    // Clone le tableau pour ne pas altérer l'ordre original dans localStorage
    const txSorted = tx.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    txSorted.forEach(item => {
        const tr = document.createElement('tr');

        const dateTd = document.createElement('td');
        dateTd.textContent = formatDate(item.date);

        const descTd = document.createElement('td');
        descTd.textContent = item.description || '-';

        const catTd = document.createElement('td');
        catTd.textContent = item.category;

        const paymentTd = document.createElement('td');
        paymentTd.textContent = item.paymentMethod || '-';

        const amountTd = document.createElement('td');
        amountTd.textContent = Number(item.amount).toFixed(0);
        // Donne une couleur différente selon qu'il s'agit d'un revenu ou d'une dépense
        if (item.type === 'revenu') {
            amountTd.style.color = '#28a745';
            amountTd.style.fontWeight = '600';
        } else {
            amountTd.style.color = '#dc3545';
            amountTd.style.fontWeight = '600';
        }

        const typeTd = document.createElement('td');
        typeTd.textContent = item.type === 'revenu' ? 'Revenu' : 'Dépense';

        tr.appendChild(dateTd);
        tr.appendChild(descTd);
        tr.appendChild(catTd);
        tr.appendChild(paymentTd);
        tr.appendChild(amountTd);
        tr.appendChild(typeTd);
        tbody.appendChild(tr);
    });
}

/**
 * Met à jour les totaux (revenus, dépenses et solde) dans l'interface.
 * @param {Array} tx - Liste des transactions
 */
function updateTotals(tx) {
    let totalRevenus = 0;
    let totalDepenses = 0;
    tx.forEach(item => {
        if (item.type === 'revenu') {
            totalRevenus += item.amount;
        } else {
            totalDepenses += item.amount;
        }
    });
    const solde = totalRevenus - totalDepenses;
    
    const revenusEl = document.getElementById('total-revenus');
    const depensesEl = document.getElementById('total-depenses');
    const soldeEl = document.getElementById('solde');
    
    if (revenusEl) revenusEl.textContent = totalRevenus.toFixed(0) + ' FCFA';
    if (depensesEl) depensesEl.textContent = totalDepenses.toFixed(0) + ' FCFA';
    if (soldeEl) {
        soldeEl.textContent = solde.toFixed(0) + ' FCFA';
        soldeEl.style.color = solde >= 0 ? '#28a745' : '#dc3545';
    }
}

/**
 * Met à jour le graphique de répartition des dépenses par catégorie.
 * @param {Array} tx - Liste des transactions
 */
function updateChart(tx, budgets = {}) {
    const expenses = tx.filter(item => item.type === 'depense');
    const sums = {};
    expenses.forEach(item => {
        sums[item.category] = (sums[item.category] || 0) + item.amount;
    });
    const categories = Object.keys(sums);
    const values = categories.map(cat => sums[cat]);
    const chartDiv = document.getElementById('chart-container');
    
    if (!chartDiv) return;
    
    if (categories.length === 0) {
        chartDiv.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucune dépense enregistrée.</p>';
        return;
    }
    
    // Couleurs dynamiques : rouge si la dépense dépasse le budget, vert sinon
    const colors = categories.map(cat => {
        const spent = sums[cat];
        const budget = budgets[cat] || 0;
        return budget > 0 && spent > budget ? '#dc3545' : '#28a745';
    });
    
    if (currentChartType === 'bar') {
        const data = [
            {
                x: categories,
                y: values,
                type: 'bar',
                marker: { 
                    color: colors,
                    line: { color: '#ffffff', width: 1 }
                },
                text: values.map(v => v.toFixed(0) + ' FCFA'),
                textposition: 'auto',
                textfont: { color: '#ffffff', size: 12 }
            }
        ];
        const layout = {
            margin: { t: 40, r: 10, b: 60, l: 50 },
            title: { text: 'Répartition des dépenses par catégorie', font: { size: 16, color: '#009879' } },
            xaxis: { title: 'Catégorie' },
            yaxis: { title: 'Montant (FCFA)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)'
        };
        chartDiv.innerHTML = '';
        Plotly.newPlot(chartDiv, data, layout, { responsive: true });
    } else {
        const data = [
            {
                labels: categories,
                values: values,
                type: 'pie',
                marker: { colors: colors },
                textinfo: 'label+percent',
                textposition: 'outside',
                textfont: { size: 12, color: '#333' },
                hoverinfo: 'label+value+percent',
                hovertext: values.map(v => v.toFixed(0) + ' FCFA')
            }
        ];
        const layout = {
            title: { text: 'Répartition des dépenses par catégorie', font: { size: 16, color: '#009879' } },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)'
        };
        chartDiv.innerHTML = '';
        Plotly.newPlot(chartDiv, data, layout, { responsive: true });
    }
}

/**
 * Met à jour les alertes de budget
 */
function updateBudgetAlerts(tx, budgets) {
    const alertsContainer = document.getElementById('budget-alerts');
    if (!alertsContainer) return;
    
    alertsContainer.innerHTML = '';
    
    const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    const monthlyExpenses = tx.filter(item => 
        item.type === 'depense' && 
        item.date.startsWith(currentMonth)
    );
    
    const expensesByCategory = {};
    monthlyExpenses.forEach(item => {
        expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
    });
    
    let hasAlerts = false;
    
    Object.keys(budgets).forEach(category => {
        const budget = budgets[category];
        const spent = expensesByCategory[category] || 0;
        
        if (budget > 0) {
            const percentage = (spent / budget) * 100;
            
            if (percentage > 100) {
                hasAlerts = true;
                const alert = document.createElement('div');
                alert.className = 'alert alert-danger';
                alert.innerHTML = `
                    ⚠️ <strong>${category}</strong> : Dépassement de budget ! 
                    ${spent.toFixed(0)} FCFA dépensés sur ${budget.toFixed(0)} FCFA (${percentage.toFixed(1)}%)
                `;
                alertsContainer.appendChild(alert);
            } else if (percentage > 80) {
                hasAlerts = true;
                const alert = document.createElement('div');
                alert.className = 'alert alert-warning';
                alert.innerHTML = `
                    ⚠️ <strong>${category}</strong> : Attention ! 
                    ${spent.toFixed(0)} FCFA dépensés sur ${budget.toFixed(0)} FCFA (${percentage.toFixed(1)}%)
                `;
                alertsContainer.appendChild(alert);
            }
        }
    });
    
    if (!hasAlerts) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.innerHTML = '✅ Tous vos budgets sont respectés ce mois-ci !';
        alertsContainer.appendChild(alert);
    }
}

/**
 * Formate une date au format européen (JJ/MM/AAAA).
 * @param {String} dateString - Date au format ISO (AAAA-MM-JJ)
 * @returns {String} Date formatée
 */
function formatDate(dateString) {
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Charge les budgets mensuels depuis le stockage local. Chaque entrée de l'objet
 * retourné associe une catégorie à un budget numérique. Si aucune donnée n'est
 * trouvée, un objet vide est retourné.
 * @returns {Object} Objet budgets
 */
function loadBudgets() {
    try {
        const data = JSON.parse(localStorage.getItem('budgets'));
        return data && typeof data === 'object' ? data : {};
    } catch (e) {
        console.warn('Erreur de chargement des budgets :', e);
        return {};
    }
}

/**
 * Sauvegarde les budgets dans le stockage local.
 * @param {Object} bgt - Objet des budgets à sauvegarder
 */
function saveBudgets(bgt) {
    localStorage.setItem('budgets', JSON.stringify(bgt));
}

/**
 * Remplit le tableau de budgets avec les valeurs fournies.
 * @param {Object} budgets - Objet contenant les budgets par catégorie
 */
function populateBudgetTable(budgets) {
    const tbody = document.querySelector('#budget-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    const monthlyExpenses = loadTransactions().filter(item => 
        item.type === 'depense' && 
        item.date.startsWith(currentMonth)
    );
    
    const expensesByCategory = {};
    monthlyExpenses.forEach(item => {
        expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
    });
    
    // Les catégories sont les mêmes que celles définies dans le formulaire
    const categories = [
        'Nourriture',
        'Transport',
        'Logement',
        'Communication',
        'Santé',
        'Salaire',
        'Divers'
    ];
    
    categories.forEach(cat => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-category', cat);
        
        const catTd = document.createElement('td');
        catTd.textContent = cat;
        
        const budgetTd = document.createElement('td');
        const budgetInput = document.createElement('input');
        budgetInput.type = 'number';
        budgetInput.min = '0';
        budgetInput.step = '0.01';
        budgetInput.value = budgets[cat] || '';
        budgetInput.style.width = '100%';
        budgetInput.style.padding = '8px';
        budgetInput.style.border = '1px solid #ddd';
        budgetInput.style.borderRadius = '4px';
        budgetTd.appendChild(budgetInput);
        
        const spentTd = document.createElement('td');
        const spent = expensesByCategory[cat] || 0;
        spentTd.textContent = spent.toFixed(0) + ' FCFA';
        spentTd.style.color = spent > 0 ? '#dc3545' : '#6c757d';
        
        const remainingTd = document.createElement('td');
        const budget = budgets[cat] || 0;
        const remaining = budget - spent;
        remainingTd.textContent = remaining.toFixed(0) + ' FCFA';
        remainingTd.style.color = remaining >= 0 ? '#28a745' : '#dc3545';
        
        const statusTd = document.createElement('td');
        if (budget > 0) {
            const percentage = (spent / budget) * 100;
            const statusBadge = document.createElement('span');
            statusBadge.className = 'status-badge';
            
            if (percentage > 100) {
                statusBadge.className += ' status-danger';
                statusBadge.textContent = 'Dépassé';
            } else if (percentage > 80) {
                statusBadge.className += ' status-warning';
                statusBadge.textContent = 'Attention';
            } else {
                statusBadge.className += ' status-good';
                statusBadge.textContent = 'OK';
            }
            statusTd.appendChild(statusBadge);
        } else {
            statusTd.textContent = '-';
        }
        
        tr.appendChild(catTd);
        tr.appendChild(budgetTd);
        tr.appendChild(spentTd);
        tr.appendChild(remainingTd);
        tr.appendChild(statusTd);
        tbody.appendChild(tr);
    });
}

/**
 * Met à jour l'interface pour la section budgets avec les données actuelles.
 */
function updateBudgetOverview(transactions, budgets) {
    const totalBudgetEl = document.getElementById('total-budgets');
    const totalSpentEl = document.getElementById('total-spent');
    const totalRemainingEl = document.getElementById('total-remaining');

    if (totalBudgetEl) {
        let totalBudget = 0;
        Object.values(budgets).forEach(budget => totalBudget += budget);
        totalBudgetEl.textContent = totalBudget.toFixed(0) + ' FCFA';
    }
    if (totalSpentEl) {
        let totalSpent = 0;
        const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
        const monthlyExpenses = transactions.filter(t => t.type === 'depense' && t.date.startsWith(currentMonth));
        const expensesByCategory = {};
        monthlyExpenses.forEach(item => {
            expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
        });
        Object.values(expensesByCategory).forEach(spent => totalSpent += spent);
        totalSpentEl.textContent = totalSpent.toFixed(0) + ' FCFA';
    }
    if (totalRemainingEl) {
        let totalRemaining = 0;
        const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
        const monthlyExpenses = transactions.filter(t => t.type === 'depense' && t.date.startsWith(currentMonth));
        const expensesByCategory = {};
        monthlyExpenses.forEach(item => {
            expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
        });
        Object.keys(budgets).forEach(cat => {
            const budget = budgets[cat] || 0;
            const spent = expensesByCategory[cat] || 0;
            totalRemaining += budget - spent;
        });
        totalRemainingEl.textContent = totalRemaining.toFixed(0) + ' FCFA';
    }
}

/**
 * Met à jour les insights de l'analyse.
 */
function updateInsights(transactions, budgets) {
    const insightsContainer = document.getElementById('insights-container');
    if (!insightsContainer) return;

    insightsContainer.innerHTML = '';

    const totalExpenses = transactions.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.amount, 0);
    const totalRevenues = transactions.filter(t => t.type === 'revenu').reduce((sum, t) => sum + t.amount, 0);
    const solde = totalRevenues - totalExpenses;

    const soldeInsight = document.createElement('div');
    soldeInsight.className = 'insight-card';
    soldeInsight.innerHTML = `
        <h3>Solde</h3>
        <p>Votre solde actuel est de ${solde.toFixed(0)} FCFA.</p>
        <p style="color: ${solde >= 0 ? '#28a745' : '#dc3545'};">
            ${solde >= 0 ? 'Votre budget est respecté.' : 'Votre budget est dépassé.'}
        </p>
    `;
    insightsContainer.appendChild(soldeInsight);

    const budgetWarnings = [];
    Object.keys(budgets).forEach(category => {
        const budget = budgets[category];
        const spent = transactions.filter(t => t.type === 'depense' && t.category === category).reduce((sum, t) => sum + t.amount, 0);
        if (budget > 0) {
            const percentage = (spent / budget) * 100;
            if (percentage > 100) {
                budgetWarnings.push(`
                    <div class="alert alert-danger">
                        ⚠️ <strong>${category}</strong> : Dépassement de budget ! 
                        ${spent.toFixed(0)} FCFA dépensés sur ${budget.toFixed(0)} FCFA (${percentage.toFixed(1)}%)
                    </div>
                `);
            } else if (percentage > 80) {
                budgetWarnings.push(`
                    <div class="alert alert-warning">
                        ⚠️ <strong>${category}</strong> : Attention ! 
                        ${spent.toFixed(0)} FCFA dépensés sur ${budget.toFixed(0)} FCFA (${percentage.toFixed(1)}%)
                    </div>
                `);
            }
        }
    });

    if (budgetWarnings.length > 0) {
        const budgetWarningsDiv = document.createElement('div');
        budgetWarningsDiv.className = 'insight-card';
        budgetWarningsDiv.innerHTML = `
            <h3>Dépassements de Budget</h3>
            ${budgetWarnings.join('')}
        `;
        insightsContainer.appendChild(budgetWarningsDiv);
    }

    const savingsInsight = document.createElement('div');
    savingsInsight.className = 'insight-card';
    if (solde > 0) {
        savingsInsight.innerHTML = `
            <h3>Épargne</h3>
            <p>Votre épargne est de ${solde.toFixed(0)} FCFA.</p>
            <p style="color: #28a745;">Votre solde est positif, vous épargnez !</p>
        `;
    } else {
        savingsInsight.innerHTML = `
            <h3>Épargne</h3>
            <p>Votre épargne est de ${solde.toFixed(0)} FCFA.</p>
            <p style="color: #dc3545;">Votre solde est négatif, vous dépensez !</p>
        `;
    }
    insightsContainer.appendChild(savingsInsight);

    const revenueDiversityInsight = document.createElement('div');
    revenueDiversityInsight.className = 'insight-card';
    const revenueCategories = [...new Set(transactions.filter(t => t.type === 'revenu').map(t => t.category))];
    if (revenueCategories.length === 1) {
        revenueDiversityInsight.innerHTML = `
            <h3>Diversification des Revenus</h3>
            <p>Vous n'avez qu'une seule source de revenus. Pensez à diversifier pour plus de sécurité.</p>
        `;
    } else {
        revenueDiversityInsight.innerHTML = `
            <h3>Diversification des Revenus</h3>
            <p>Votre budget est bien diversifié.</p>
        `;
    }
    insightsContainer.appendChild(revenueDiversityInsight);
}

/**
 * Met à jour les statistiques de données.
 */
function updateDataStats(transactions) {
    const totalTransactionsEl = document.getElementById('total-transactions');
    const totalRevenusEl = document.getElementById('total-revenus');
    const totalDepensesEl = document.getElementById('total-depenses');
    const totalSoldeEl = document.getElementById('solde');

    if (totalTransactionsEl) totalTransactionsEl.textContent = transactions.length;
    if (totalRevenusEl) {
        let totalRevenus = 0;
        transactions.forEach(item => {
            if (item.type === 'revenu') totalRevenus += item.amount;
        });
        totalRevenusEl.textContent = totalRevenus.toFixed(0) + ' FCFA';
    }
    if (totalDepensesEl) {
        let totalDepenses = 0;
        transactions.forEach(item => {
            if (item.type === 'depense') totalDepenses += item.amount;
        });
        totalDepensesEl.textContent = totalDepenses.toFixed(0) + ' FCFA';
    }
    if (totalSoldeEl) {
        let totalRevenus = 0;
        let totalDepenses = 0;
        transactions.forEach(item => {
            if (item.type === 'revenu') totalRevenus += item.amount;
            if (item.type === 'depense') totalDepenses += item.amount;
        });
        const solde = totalRevenus - totalDepenses;
        totalSoldeEl.textContent = solde.toFixed(0) + ' FCFA';
        totalSoldeEl.style.color = solde >= 0 ? '#28a745' : '#dc3545';
    }
}

/**
 * Met à jour les conseils personnalisés.
 */
function updatePersonalizedTips(transactions, budgets) {
    const tipsContainer = document.getElementById('tips-container');
    if (!tipsContainer) return;

    tipsContainer.innerHTML = '';

    const totalExpenses = transactions.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.amount, 0);
    const totalRevenues = transactions.filter(t => t.type === 'revenu').reduce((sum, t) => sum + t.amount, 0);
    const solde = totalRevenues - totalExpenses;

    const tips = [];

    if (totalExpenses === 0) {
        tips.push({
            type: 'info',
            icon: '📝',
            title: 'Commencez à enregistrer',
            message: 'Ajoutez votre première transaction pour commencer à suivre votre budget !'
        });
    }

    if (solde < 0) {
        tips.push({
            type: 'danger',
            icon: '⚠️',
            title: 'Solde négatif',
            message: `Votre solde est de ${solde.toFixed(0)} FCFA. Pensez à réduire vos dépenses ou augmenter vos revenus.`
        });
    } else if (solde > 0) {
        tips.push({
            type: 'success',
            icon: '✅',
            title: 'Excellent !',
            message: `Votre solde positif de ${solde.toFixed(0)} FCFA montre une bonne gestion de votre budget.`
        });
    }

    const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    const monthlyExpenses = transactions.filter(item => item.type === 'depense' && item.date.startsWith(currentMonth));
    const expensesByCategory = {};
    monthlyExpenses.forEach(item => {
        expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
    });

    let budgetWarnings = 0;
    Object.keys(budgets).forEach(category => {
        const budget = budgets[category];
        const spent = expensesByCategory[category] || 0;
        if (budget > 0) {
            const percentage = (spent / budget) * 100;
            if (percentage > 100) {
                budgetWarnings++;
            }
        }
    });

    if (budgetWarnings > 0) {
        tips.push({
            type: 'warning',
            icon: '🎯',
            title: 'Dépassements de budget',
            message: `${budgetWarnings} catégorie(s) dépassent leur budget. Revoyez vos dépenses.`
        });
    }

    if (solde > 0 && solde < totalRevenues * 0.1) {
        tips.push({
            type: 'info',
            icon: '💰',
            title: 'Épargne faible',
            message: 'Votre épargne représente moins de 10% de vos revenus. Pensez à épargner davantage.'
        });
    }

    const revenueCategories = [...new Set(transactions.filter(t => t.type === 'revenu').map(t => t.category))];
    if (revenueCategories.length === 1) {
        tips.push({
            type: 'info',
            icon: '💼',
            title: 'Diversifiez vos revenus',
            message: 'Vous n\'avez qu\'une seule source de revenus. Pensez à diversifier pour plus de sécurité.'
        });
    }

    tips.forEach(tip => {
        const card = document.createElement('div');
        card.className = `recommendation-card ${tip.type}`;
        card.innerHTML = `
            <h3>${tip.icon} ${tip.title}</h3>
            <p>${tip.message}</p>
        `;
        tipsContainer.appendChild(card);
    });
}

// Ajout des styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Affichage dynamique de l'historique des transactions
function populateHistoryTable(transactions) {
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    // Trie par date décroissante
    const txSorted = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    txSorted.forEach(item => {
        const tr = document.createElement('tr');
        // Surlignage des grosses dépenses
        const isBigExpense = item.type === 'depense' && item.amount > 50000;
        tr.style.background = isBigExpense ? 'rgba(220,53,69,0.08)' : '';
        // Colonnes
        tr.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td>${item.description || '-'}</td>
            <td>${item.category}</td>
            <td>${item.paymentMethod || '-'}</td>
            <td style="color:${item.type === 'revenu' ? '#28a745' : '#dc3545'};font-weight:600;">${item.amount.toFixed(0)}</td>
            <td>${item.type === 'revenu' ? 'Revenu' : 'Dépense'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Appel automatique sur la page d'historique
if (window.location.pathname.includes('history.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const transactions = loadTransactions();
        populateHistoryTable(transactions);
        // Remplir le filtre Mois dynamiquement
        const filterMonth = document.getElementById('filter-month');
        if (filterMonth) {
            const months = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse();
            months.forEach(m => {
                const option = document.createElement('option');
                option.value = m;
                option.textContent = m;
                filterMonth.appendChild(option);
            });
        }
        // Appliquer les filtres
        document.getElementById('apply-filters').addEventListener('click', () => {
            const type = document.getElementById('filter-type').value;
            const category = document.getElementById('filter-category').value;
            const month = document.getElementById('filter-month').value;
            let filtered = transactions;
            if (type) filtered = filtered.filter(t => t.type === type);
            if (category) filtered = filtered.filter(t => t.category === category);
            if (month) filtered = filtered.filter(t => t.date.startsWith(month));
            populateHistoryTable(filtered);
            // Affiche le nombre de transactions filtrées
            const count = document.getElementById('filtered-count');
            if (count) count.textContent = filtered.length;
        });
    });
}

// 2. Bouton Enregistrer les budgets fonctionnel
if (window.location.pathname.includes('budgets.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const saveBtn = document.getElementById('save-budgets');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const rows = document.querySelectorAll('#budget-table tbody tr');
                const budgets = loadBudgets();
                rows.forEach(row => {
                    const cat = row.children[0].textContent;
                    const input = row.querySelector('input');
                    const val = parseFloat(input.value);
                    budgets[cat] = isNaN(val) || val < 0 ? 0 : val;
                });
                saveBudgets(budgets);
                // Rafraîchit l'affichage
                const transactions = loadTransactions();
                updateBudgetUI(transactions, budgets);
                showNotification('Budgets enregistrés avec succès !', 'success');
            });
        }
    });
}

// 3. Analyse : Sélecteur de période
if (window.location.pathname.includes('analytics.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const periodSelect = document.getElementById('trend-period');
        if (periodSelect) {
            periodSelect.addEventListener('change', () => {
                updateAnalyticsPeriod(periodSelect.value);
            });
            // Initialisation
            updateAnalyticsPeriod(periodSelect.value);
        }
    });
}

function updateAnalyticsPeriod(period) {
    const transactions = loadTransactions();
    const budgets = loadBudgets();
    // Calcule la date de début selon la période
    let startDate = new Date();
    if (period === '6') startDate.setMonth(startDate.getMonth() - 5);
    else if (period === '12') startDate.setMonth(startDate.getMonth() - 11);
    else if (period === '3') startDate.setMonth(startDate.getMonth() - 2);
    else if (period === '1') startDate.setMonth(startDate.getMonth() - 0);
    else if (period === '7d') startDate.setDate(startDate.getDate() - 6);
    // Filtre les transactions selon la période
    const filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= startDate;
    });
    // Met à jour les graphiques et résumés
    updateTotals(filtered);
    updateChart(filtered, budgets);
    updateInsights(filtered, budgets);
}

// Gestion du bouton Réinitialiser dans budgets
if (window.location.pathname.includes('budgets.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const resetBtn = document.getElementById('reset-budgets');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Voulez-vous vraiment réinitialiser tous les budgets ?')) {
                    localStorage.removeItem('budgets');
                    // Recharge la page ou rafraîchit l'affichage
                    location.reload();
                }
            });
        }
    });
}

// Amélioration dynamique des couleurs/progressions dans budgets
function updateBudgetUI(transactions, budgets) {
    let totalBudget = 0;
    let totalSpent = 0;
    const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    const monthlyExpenses = transactions.filter(t => t.type === 'depense' && t.date.startsWith(currentMonth));
    const expensesByCategory = {};
    monthlyExpenses.forEach(item => {
        expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
    });
    Object.keys(budgets).forEach(cat => {
        totalBudget += budgets[cat] || 0;
        totalSpent += expensesByCategory[cat] || 0;
    });
    const totalRemaining = totalBudget - totalSpent;
    if (document.getElementById('total-budgets')) document.getElementById('total-budgets').textContent = totalBudget.toFixed(0) + ' FCFA';
    if (document.getElementById('total-spent')) document.getElementById('total-spent').textContent = totalSpent.toFixed(0) + ' FCFA';
    if (document.getElementById('total-remaining')) document.getElementById('total-remaining').textContent = totalRemaining.toFixed(0) + ' FCFA';
    // Alertes
    const alerts = [];
    Object.keys(budgets).forEach(cat => {
        const budget = budgets[cat] || 0;
        const spent = expensesByCategory[cat] || 0;
        if (budget > 0) {
            const percent = (spent / budget) * 100;
            if (percent > 100) alerts.push(`🚨 <b>${cat}</b> dépassé (${spent.toFixed(0)}/${budget.toFixed(0)} FCFA)`);
            else if (percent > 80) alerts.push(`⚠️ <b>${cat}</b> proche de la limite (${spent.toFixed(0)}/${budget.toFixed(0)} FCFA)`);
        }
    });
    const alertsDiv = document.getElementById('budget-alerts');
    if (alertsDiv) alertsDiv.innerHTML = alerts.length ? alerts.map(a => `<div class='alert alert-warning'>${a}</div>`).join('') : `<div class='alert alert-success'>✅ Tous vos budgets sont respectés ce mois-ci !</div>`;
    // Badges
    const badgesDiv = document.getElementById('budget-badges');
    if (badgesDiv) {
        if (alerts.length === 0 && totalBudget > 0) {
            badgesDiv.innerHTML = `<span style='font-size:2rem;'>🏅</span><br><b>Bravo ! Tous vos budgets sont respectés !</b>`;
        } else {
            badgesDiv.innerHTML = '';
        }
    }
    // Tableau
    const tbody = document.querySelector('#budget-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        const categories = [
            'Nourriture', 'Transport', 'Logement', 'Communication', 'Santé', 'Salaire', 'Divers'
        ];
        categories.forEach(cat => {
            const budget = budgets[cat] || 0;
            const spent = expensesByCategory[cat] || 0;
            const remaining = budget - spent;
            const percent = budget > 0 ? (spent / budget) * 100 : 0;
            let color = '#28a745';
            if (percent > 100) color = '#dc3545';
            else if (percent > 80) color = '#ffc107';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cat}</td>
                <td><input type='number' value='${budget}' min='0' style='width:90px;'></td>
                <td>${spent.toFixed(0)} FCFA</td>
                <td style='color:${remaining >= 0 ? '#28a745' : '#dc3545'};'>${remaining.toFixed(0)} FCFA</td>
                <td><div class='progress-bar'><div class='progress-fill' style='width:${Math.min(percent,100)}%;background:${color};'></div></div></td>
                <td style='color:${color};font-weight:600;'>${percent > 100 ? '❌ Dépassé' : percent > 80 ? '⚠️ Limite' : budget > 0 ? '✅ OK' : '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Palette de couleurs pour les catégories
const CATEGORY_COLORS = [
    '#009879', '#ff6600', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#28a745', '#fd7e14', '#20c997', '#6610f2', '#e83e8c', '#343a40'
];

// 4. Export CSV/JSON dans l'analyse
if (window.location.pathname.includes('analytics.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const exportCsvBtn = document.getElementById('export-csv');
        const exportJsonBtn = document.getElementById('export-json');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                const transactions = getCurrentAnalyticsTransactions();
                exportToCSV(transactions, 'analyse_budget.csv');
            });
        }
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => {
                const transactions = getCurrentAnalyticsTransactions();
                exportToJSON(transactions, 'analyse_budget.json');
            });
        }
    });
}

function getCurrentAnalyticsTransactions() {
    // Utilise la période sélectionnée
    const periodSelect = document.getElementById('trend-period');
    let period = periodSelect ? periodSelect.value : '6';
    let startDate = new Date();
    if (period === '6') startDate.setMonth(startDate.getMonth() - 5);
    else if (period === '12') startDate.setMonth(startDate.getMonth() - 11);
    else if (period === '3') startDate.setMonth(startDate.getMonth() - 2);
    else if (period === '1') startDate.setMonth(startDate.getMonth() - 0);
    else if (period === '7d') startDate.setDate(startDate.getDate() - 6);
    const transactions = loadTransactions();
    return transactions.filter(t => new Date(t.date) >= startDate);
}

function exportToCSV(transactions, filename) {
    if (!transactions.length) return;
    const header = Object.keys(transactions[0]).join(',');
    const rows = transactions.map(t => Object.values(t).map(v => '"'+String(v).replace(/"/g,'""')+'"').join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportToJSON(transactions, filename) {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Graphiques dynamiques et colorés
function updateChart(tx, budgets = {}) {
    const expenses = tx.filter(item => item.type === 'depense');
    const sums = {};
    expenses.forEach(item => {
        sums[item.category] = (sums[item.category] || 0) + item.amount;
    });
    const categories = Object.keys(sums);
    const values = categories.map(cat => sums[cat]);
    const chartDiv = document.getElementById('chart-container');
    if (!chartDiv) return;
    if (categories.length === 0) {
        chartDiv.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucune dépense enregistrée.</p>';
        return;
    }
    // Couleurs distinctes pour chaque catégorie
    const colors = categories.map((cat, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
    if (currentChartType === 'bar') {
        const data = [
            {
                x: categories,
                y: values,
                type: 'bar',
                marker: {
                    color: colors,
                    line: { color: '#ffffff', width: 1 }
                },
                text: values.map(v => v.toFixed(0) + ' FCFA'),
                textposition: 'auto',
                textfont: { color: '#ffffff', size: 12 },
                hoverinfo: 'x+y',
                hovertemplate: '%{x}: %{y} FCFA'
            }
        ];
        const layout = {
            margin: { t: 40, r: 10, b: 60, l: 50 },
            title: { text: 'Répartition des dépenses par catégorie', font: { size: 16, color: '#009879' } },
            xaxis: { title: 'Catégorie' },
            yaxis: { title: 'Montant (FCFA)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: { orientation: 'h', y: -0.2 }
        };
        chartDiv.innerHTML = '';
        Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false, animation: { duration: 500, easing: 'cubic-in-out' } });
    } else {
        const data = [
            {
                labels: categories,
                values: values,
                type: 'pie',
                marker: { colors: colors },
                textinfo: 'label+percent',
                textposition: 'outside',
                textfont: { size: 12, color: '#333' },
                hoverinfo: 'label+value+percent',
                hovertext: values.map(v => v.toFixed(0) + ' FCFA'),
                pull: categories.map(() => 0.05)
            }
        ];
        const layout = {
            title: { text: 'Répartition des dépenses par catégorie', font: { size: 16, color: '#009879' } },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: { orientation: 'h', y: -0.2 }
        };
        chartDiv.innerHTML = '';
        Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false, animation: { duration: 500, easing: 'cubic-in-out' } });
    }
    // Légende dynamique
    let legendHtml = '<div style="margin-top:10px;text-align:center;">';
    categories.forEach((cat, i) => {
        legendHtml += `<span style="display:inline-block;width:16px;height:16px;background:${colors[i]};border-radius:3px;margin-right:5px;"></span> ${cat} &nbsp;`;
    });
    legendHtml += '</div>';
    chartDiv.insertAdjacentHTML('beforeend', legendHtml);
}

// Gestion des filtres et graphiques sur la page d'accueil
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        const chartPeriodSelect = document.getElementById('chart-period');
        const chartTypeSelect = document.getElementById('chart-type');
        
        if (chartPeriodSelect) {
            chartPeriodSelect.addEventListener('change', updateHomeChart);
        }
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', updateHomeChart);
        }
        
        // Initialise les graphiques de la page d'accueil
        updateHomeChart();
        updateEvolutionChart();
    });
}

function updateHomeChart() {
    const periodSelect = document.getElementById('chart-period');
    const typeSelect = document.getElementById('chart-type');
    
    if (!periodSelect || !typeSelect) return;
    
    const period = periodSelect.value;
    const chartType = typeSelect.value;
    
    // Filtre les transactions selon la période
    const transactions = getFilteredTransactions(period);
    
    // Met à jour le graphique
    updateChart(transactions);
    
    // Met à jour le type de graphique
    currentChartType = chartType;
    updateChartButtons();
}

function updateEvolutionChart() {
    const transactions = loadTransactions();
    const evolutionContainer = document.getElementById('evolution-chart');
    const avgExpensesEl = document.getElementById('avg-expenses');
    const avgRevenuesEl = document.getElementById('avg-revenues');
    const trendIndicatorEl = document.getElementById('trend-indicator');
    
    if (!evolutionContainer || !avgExpensesEl || !avgRevenuesEl || !trendIndicatorEl) return;
    
    // Calcule les moyennes mensuelles
    const monthlyData = calculateMonthlyAverages(transactions);
    
    // Met à jour les indicateurs
    avgExpensesEl.textContent = `${monthlyData.avgExpenses.toFixed(0)} FCFA/mois`;
    avgRevenuesEl.textContent = `${monthlyData.avgRevenues.toFixed(0)} FCFA/mois`;
    
    // Détermine la tendance
    const trend = determineTrend(monthlyData);
    trendIndicatorEl.textContent = trend.text;
    trendIndicatorEl.className = `trend-${trend.type}`;
    
    // Crée le graphique d'évolution
    if (monthlyData.months.length > 0) {
        const data = [
            {
                x: monthlyData.months,
                y: monthlyData.expenses,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Dépenses',
                line: { color: '#dc3545', width: 3 },
                marker: { size: 8, color: '#dc3545' }
            },
            {
                x: monthlyData.months,
                y: monthlyData.revenues,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Revenus',
                line: { color: '#28a745', width: 3 },
                marker: { size: 8, color: '#28a745' }
            }
        ];
        
        const layout = {
            title: { text: 'Évolution mensuelle', font: { size: 16, color: '#009879' } },
            xaxis: { title: 'Mois' },
            yaxis: { title: 'Montant (FCFA)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: { orientation: 'h', y: -0.2 }
        };
        
        evolutionContainer.innerHTML = '';
        Plotly.newPlot(evolutionContainer, data, layout, { 
            responsive: true, 
            displayModeBar: false,
            animation: { duration: 500, easing: 'cubic-in-out' }
        });
    } else {
        evolutionContainer.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Pas assez de données pour l\'évolution.</p>';
    }
}

function getFilteredTransactions(period) {
    const transactions = loadTransactions();
    let startDate = new Date();
    
    switch (period) {
        case '7d':
            startDate.setDate(startDate.getDate() - 6);
            break;
        case '1':
            startDate.setMonth(startDate.getMonth() - 0);
            break;
        case '3':
            startDate.setMonth(startDate.getMonth() - 2);
            break;
        case '6':
            startDate.setMonth(startDate.getMonth() - 5);
            break;
        case '12':
            startDate.setMonth(startDate.getMonth() - 11);
            break;
        default:
            startDate.setMonth(startDate.getMonth() - 5);
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
}

function calculateMonthlyAverages(transactions) {
    const monthlyData = {};
    
    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { expenses: 0, revenues: 0 };
        }
        
        if (t.type === 'depense') {
            monthlyData[monthKey].expenses += t.amount;
        } else {
            monthlyData[monthKey].revenues += t.amount;
        }
    });
    
    const months = Object.keys(monthlyData).sort();
    const expenses = months.map(m => monthlyData[m].expenses);
    const revenues = months.map(m => monthlyData[m].revenues);
    
    const avgExpenses = expenses.length > 0 ? expenses.reduce((a, b) => a + b, 0) / expenses.length : 0;
    const avgRevenues = revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0;
    
    return {
        months: months.map(m => {
            const [year, month] = m.split('-');
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        }),
        expenses,
        revenues,
        avgExpenses,
        avgRevenues
    };
}

function determineTrend(monthlyData) {
    if (monthlyData.expenses.length < 2) {
        return { type: 'stable', text: 'Stable' };
    }
    
    const recentExpenses = monthlyData.expenses.slice(-3);
    const recentRevenues = monthlyData.revenues.slice(-3);
    
    const expenseTrend = recentExpenses[recentExpenses.length - 1] - recentExpenses[0];
    const revenueTrend = recentRevenues[recentRevenues.length - 1] - recentRevenues[0];
    
    if (revenueTrend > expenseTrend && revenueTrend > 0) {
        return { type: 'positive', text: '📈 En hausse' };
    } else if (expenseTrend > revenueTrend && expenseTrend > 0) {
        return { type: 'negative', text: '📉 En baisse' };
    } else {
        return { type: 'stable', text: '➡️ Stable' };
    }
}

// Gestion dynamique des graphiques dans analytics.html
if (window.location.pathname.includes('analytics.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Aperçu des dépenses par catégorie
        const chartPeriod = document.getElementById('chart-period');
        const chartType = document.getElementById('chart-type');
        if (chartPeriod) chartPeriod.addEventListener('change', updateAnalyticsCategoryChart);
        if (chartType) chartType.addEventListener('change', updateAnalyticsCategoryChart);
        updateAnalyticsCategoryChart();

        // Évolution mensuelle
        const evolutionType = document.getElementById('evolution-type');
        if (evolutionType) evolutionType.addEventListener('change', updateAnalyticsEvolutionChart);
        updateAnalyticsEvolutionChart();
    });
}

function updateAnalyticsCategoryChart() {
    const period = document.getElementById('chart-period')?.value || '6';
    const type = document.getElementById('chart-type')?.value || 'bar';
    const chartDiv = document.getElementById('chart-container');
    if (!chartDiv) return;
    const tx = getFilteredTransactions(period);
    const expenses = tx.filter(item => item.type === 'depense');
    const sums = {};
    expenses.forEach(item => {
        sums[item.category] = (sums[item.category] || 0) + item.amount;
    });
    const categories = Object.keys(sums);
    const values = categories.map(cat => sums[cat]);
    const colors = categories.map((cat, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
    chartDiv.innerHTML = '';
    if (categories.length === 0) {
        chartDiv.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Aucune dépense enregistrée.</p>';
        return;
    }
    let data = [], layout = {};
    if (type === 'bar') {
        data = [{
            x: categories,
            y: values,
            type: 'bar',
            marker: { color: colors, line: { color: '#fff', width: 1 } },
            text: values.map(v => v.toFixed(0) + ' FCFA'),
            textposition: 'auto',
            hovertemplate: '%{x}: %{y} FCFA'
        }];
        layout = {
            title: 'Dépenses par catégorie',
            xaxis: { title: 'Catégorie' },
            yaxis: { title: 'Montant (FCFA)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false
        };
    } else if (type === 'pie') {
        data = [{
            labels: categories,
            values: values,
            type: 'pie',
            marker: { colors: colors },
            textinfo: 'label+percent',
            textposition: 'outside',
            hoverinfo: 'label+value+percent',
            pull: categories.map(() => 0.05)
        }];
        layout = {
            title: 'Répartition des dépenses',
            showlegend: true,
            legend: { orientation: 'h', y: -0.2 },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)'
        };
    } else if (type === 'area') {
        data = [{
            x: categories,
            y: values,
            type: 'scatter',
            fill: 'tozeroy',
            mode: 'lines+markers',
            marker: { color: colors[0] },
            line: { color: colors[0], width: 3 },
            name: 'Dépenses',
            hovertemplate: '%{x}: %{y} FCFA'
        }];
        layout = {
            title: 'Dépenses (aire)',
            xaxis: { title: 'Catégorie' },
            yaxis: { title: 'Montant (FCFA)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false
        };
    } else if (type === 'radar') {
        data = [{
            type: 'scatterpolar',
            r: values,
            theta: categories,
            fill: 'toself',
            marker: { color: colors[0] },
            line: { color: colors[0], width: 3 },
            name: 'Dépenses',
            hovertemplate: '%{theta}: %{r} FCFA'
        }];
        layout = {
            polar: { radialaxis: { visible: true, range: [0, Math.max(...values) * 1.2] } },
            title: 'Dépenses (radar)',
            showlegend: false,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)'
        };
    }
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false, animation: { duration: 500, easing: 'cubic-in-out' } });
}

function updateAnalyticsEvolutionChart() {
    const type = document.getElementById('evolution-type')?.value || 'line';
    const chartDiv = document.getElementById('evolution-chart');
    const avgExpensesEl = document.getElementById('avg-expenses');
    const avgRevenuesEl = document.getElementById('avg-revenues');
    const trendIndicatorEl = document.getElementById('trend-indicator');
    if (!chartDiv || !avgExpensesEl || !avgRevenuesEl || !trendIndicatorEl) return;
    const transactions = loadTransactions();
    const monthlyData = calculateMonthlyAverages(transactions);
    avgExpensesEl.textContent = `${monthlyData.avgExpenses.toFixed(0)} FCFA/mois`;
    avgRevenuesEl.textContent = `${monthlyData.avgRevenues.toFixed(0)} FCFA/mois`;
    const trend = determineTrend(monthlyData);
    trendIndicatorEl.textContent = trend.text;
    trendIndicatorEl.className = `trend-${trend.type}`;
    if (monthlyData.months.length === 0) {
        chartDiv.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">Pas assez de données pour l\'évolution.</p>';
        return;
    }
    let data = [], layout = {};
    if (type === 'line') {
        data = [
            {
                x: monthlyData.months,
                y: monthlyData.expenses,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Dépenses',
                line: { color: '#dc3545', width: 3 },
                marker: { size: 8, color: '#dc3545' }
            },
            {
                x: monthlyData.months,
                y: monthlyData.revenues,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Revenus',
                line: { color: '#28a745', width: 3 },
                marker: { size: 8, color: '#28a745' }
            }
        ];
        layout = {
            title: 'Évolution mensuelle',
            xaxis: { title: 'Mois' },
            yaxis: { title: 'Montant (FCFA)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: { orientation: 'h', y: -0.2 }
        };
    } else if (type === 'area') {
        data = [
            {
                x: monthlyData.months,
                y: monthlyData.expenses,
                type: 'scatter',
                fill: 'tozeroy',
                mode: 'lines+markers',
                name: 'Dépenses',
                line: { color: '#dc3545', width: 3 },
                marker: { size: 8, color: '#dc3545' }
            },
            {
                x: monthlyData.months,
                y: monthlyData.revenues,
                type: 'scatter',
                fill: 'tozeroy',
                mode: 'lines+markers',
                name: 'Revenus',
                line: { color: '#28a745', width: 3 },
                marker: { size: 8, color: '#28a745' }
            }
        ];
        layout = {
            title: 'Évolution mensuelle (aires)',
            xaxis: { title: 'Mois' },
            yaxis: { title: 'Montant (FCFA)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: { orientation: 'h', y: -0.2 }
        };
    } else if (type === 'bar') {
        data = [
            {
                x: monthlyData.months,
                y: monthlyData.expenses,
                type: 'bar',
                name: 'Dépenses',
                marker: { color: '#dc3545' }
            },
            {
                x: monthlyData.months,
                y: monthlyData.revenues,
                type: 'bar',
                name: 'Revenus',
                marker: { color: '#28a745' }
            }
        ];
        layout = {
            barmode: 'group',
            title: 'Évolution mensuelle (barres)',
            xaxis: { title: 'Mois' },
            yaxis: { title: 'Montant (FCFA)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: { orientation: 'h', y: -0.2 }
        };
    }
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false, animation: { duration: 500, easing: 'cubic-in-out' } });
}

// Fonctions spécifiques à la page budgets.html
function getCategoryLabel(category) {
    const labels = {
        'nourriture': '🍽️ Nourriture',
        'transport': '🚗 Transport',
        'logement': '🏠 Logement',
        'sante': '🏥 Santé',
        'communication': '📱 Communication',
        'loisirs': '🎮 Loisirs',
        'vetements': '👕 Vêtements',
        'education': '📚 Éducation',
        'salaire': '💰 Salaire',
        'bonus': '🎁 Bonus',
        'freelance': '💼 Freelance',
        'investissement': '📈 Investissement'
    };
    return labels[category] || category;
}

function getPaymentMethodLabel(method) {
    const labels = {
        'especes': '💵 Espèces',
        'carte': '💳 Carte',
        'mobile': '📱 Mobile',
        'virement': '🏦 Virement'
    };
    return labels[method] || method;
}

function getCategoryColor(index) {
    const colors = ['#009879', '#dc3545', '#007bff', '#ffc107', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];
    return colors[index % colors.length];
}

function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
}