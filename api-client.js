/**
 * Client API pour Mon Budget Malin
 * Gère la communication avec le backend Python
 */

class BudgetAPI {
    constructor(baseURL = 'http://localhost:8000') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('auth_token');
    }

    // Configuration des headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Gestion des erreurs
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Erreur réseau' }));
            throw new Error(error.detail || `Erreur ${response.status}`);
        }
        return response.json();
    }

    // Authentification
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${this.baseURL}/auth/token`, {
            method: 'POST',
            body: formData
        });

        const data = await this.handleResponse(response);
        this.token = data.access_token;
        localStorage.setItem('auth_token', this.token);
        return data;
    }

    async register(userData) {
        const response = await fetch(`${this.baseURL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(userData)
        });

        return this.handleResponse(response);
    }

    async getCurrentUser() {
        const response = await fetch(`${this.baseURL}/auth/me`, {
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    // Transactions
    async getTransactions(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value);
            }
        });

        const response = await fetch(`${this.baseURL}/transactions/?${params}`, {
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    async createTransaction(transactionData) {
        const response = await fetch(`${this.baseURL}/transactions/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(transactionData)
        });

        return this.handleResponse(response);
    }

    async updateTransaction(transactionId, transactionData) {
        const response = await fetch(`${this.baseURL}/transactions/${transactionId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(transactionData)
        });

        return this.handleResponse(response);
    }

    async deleteTransaction(transactionId) {
        const response = await fetch(`${this.baseURL}/transactions/${transactionId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    async getTransactionAnalytics(months = 6) {
        const response = await fetch(`${this.baseURL}/transactions/summary/analytics?months=${months}`, {
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    // Budgets
    async getBudgets(month = null) {
        const params = month ? `?month=${month}` : '';
        const response = await fetch(`${this.baseURL}/budgets/${params}`, {
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    async createBudget(budgetData) {
        const response = await fetch(`${this.baseURL}/budgets/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(budgetData)
        });

        return this.handleResponse(response);
    }

    async updateBudget(budgetId, budgetData) {
        const response = await fetch(`${this.baseURL}/budgets/${budgetId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(budgetData)
        });

        return this.handleResponse(response);
    }

    async deleteBudget(budgetId) {
        const response = await fetch(`${this.baseURL}/budgets/${budgetId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    async getBudgetAlerts(month) {
        const response = await fetch(`${this.baseURL}/budgets/alerts?month=${month}`, {
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    // Objectifs
    async getGoals(activeOnly = true) {
        const response = await fetch(`${this.baseURL}/goals/?active_only=${activeOnly}`, {
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    async createGoal(goalData) {
        const response = await fetch(`${this.baseURL}/goals/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(goalData)
        });

        return this.handleResponse(response);
    }

    async updateGoal(goalId, goalData) {
        const response = await fetch(`${this.baseURL}/goals/${goalId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(goalData)
        });

        return this.handleResponse(response);
    }

    async deleteGoal(goalId) {
        const response = await fetch(`${this.baseURL}/goals/${goalId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    // Catégories
    async getCategories(categoryType = null) {
        const params = categoryType ? `?category_type=${categoryType}` : '';
        const response = await fetch(`${this.baseURL}/categories/${params}`, {
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    }

    // Déconnexion
    logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    // Vérifier si l'utilisateur est connecté
    isAuthenticated() {
        return !!this.token;
    }
}

// Instance globale de l'API
const api = new BudgetAPI();

// Fonctions utilitaires pour la migration depuis localStorage
class DataMigration {
    static async migrateFromLocalStorage() {
        try {
            // Migrer les transactions
            const localTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            for (const transaction of localTransactions) {
                await api.createTransaction({
                    amount: transaction.amount,
                    type: transaction.type,
                    category: transaction.category,
                    description: transaction.description || '',
                    payment_method: transaction.paymentMethod || 'espèces',
                    date: new Date(transaction.date).toISOString()
                });
            }

            // Migrer les budgets
            const localBudgets = JSON.parse(localStorage.getItem('budgets') || '{}');
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            for (const [category, amount] of Object.entries(localBudgets)) {
                if (amount > 0) {
                    await api.createBudget({
                        category: category,
                        amount: amount,
                        month: currentMonth
                    });
                }
            }

            console.log('✅ Migration des données terminée');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la migration:', error);
            return false;
        }
    }
}

// Fonctions de compatibilité avec l'ancien code
function loadTransactions() {
    // Si l'utilisateur est connecté, utiliser l'API
    if (api.isAuthenticated()) {
        return api.getTransactions().catch(() => []);
    }
    // Sinon, utiliser localStorage (fallback)
    try {
        return Promise.resolve(JSON.parse(localStorage.getItem('transactions') || '[]'));
    } catch (e) {
        return Promise.resolve([]);
    }
}

function saveTransactions(transactions) {
    // Si l'utilisateur est connecté, les transactions sont gérées par l'API
    // Sinon, utiliser localStorage (fallback)
    if (!api.isAuthenticated()) {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
}

function loadBudgets() {
    // Si l'utilisateur est connecté, utiliser l'API
    if (api.isAuthenticated()) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        return api.getBudgets(currentMonth).then(budgets => {
            const budgetMap = {};
            budgets.forEach(budget => {
                budgetMap[budget.category] = budget.amount;
            });
            return budgetMap;
        }).catch(() => ({}));
    }
    // Sinon, utiliser localStorage (fallback)
    try {
        return Promise.resolve(JSON.parse(localStorage.getItem('budgets') || '{}'));
    } catch (e) {
        return Promise.resolve({});
    }
}

function saveBudgets(budgets) {
    // Si l'utilisateur est connecté, les budgets sont gérés par l'API
    // Sinon, utiliser localStorage (fallback)
    if (!api.isAuthenticated()) {
        localStorage.setItem('budgets', JSON.stringify(budgets));
    }
}

// Export pour utilisation globale
window.BudgetAPI = BudgetAPI;
window.api = api;
window.DataMigration = DataMigration; 