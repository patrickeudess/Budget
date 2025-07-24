/*
 * Intégration Mobile Money pour Mon Budget Malin
 * Simulation des API Mobile Money pour Orange Money, MTN Money et Moov Money
 */

class MobileMoneyIntegration {
    constructor() {
        this.providers = {
            'orange': {
                name: 'Orange Money',
                icon: '🟠',
                color: '#ff6600',
                apiEndpoint: 'https://api.orange-money.ci/v1',
                features: ['transfert', 'paiement', 'recharge', 'retrait']
            },
            'mtn': {
                name: 'MTN Money',
                icon: '🟡',
                color: '#ffcc00',
                apiEndpoint: 'https://api.mtn-money.ci/v1',
                features: ['transfert', 'paiement', 'recharge', 'retrait']
            },
            'moov': {
                name: 'Moov Money',
                icon: '🟢',
                color: '#00cc00',
                apiEndpoint: 'https://api.moov-money.ci/v1',
                features: ['transfert', 'paiement', 'recharge', 'retrait']
            }
        };
        
        this.connectedAccounts = this.loadConnectedAccounts();
        this.transactionHistory = this.loadTransactionHistory();
    }

    /**
     * Simule la connexion à un compte Mobile Money
     */
    async connectAccount(provider, phoneNumber, pin) {
        try {
            // Simulation d'une requête API
            const response = await this.simulateApiCall('connect', {
                provider: provider,
                phoneNumber: phoneNumber,
                pin: pin
            });

            if (response.success) {
                const account = {
                    id: Date.now(),
                    provider: provider,
                    phoneNumber: phoneNumber,
                    balance: response.balance,
                    accountName: response.accountName,
                    connectedAt: new Date().toISOString(),
                    lastSync: new Date().toISOString(),
                    isActive: true
                };

                this.connectedAccounts.push(account);
                this.saveConnectedAccounts();
                
                this.showNotification(`✅ Compte ${this.providers[provider].name} connecté avec succès !`, 'success');
                return account;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            this.showNotification(`❌ Erreur de connexion : ${error.message}`, 'error');
            return null;
        }
    }

    /**
     * Déconnecte un compte Mobile Money
     */
    disconnectAccount(accountId) {
        const index = this.connectedAccounts.findIndex(acc => acc.id === accountId);
        if (index !== -1) {
            const account = this.connectedAccounts[index];
            this.connectedAccounts.splice(index, 1);
            this.saveConnectedAccounts();
            
            this.showNotification(`✅ Compte ${this.providers[account.provider].name} déconnecté`, 'info');
            return true;
        }
        return false;
    }

    /**
     * Synchronise les transactions depuis un compte Mobile Money
     */
    async syncTransactions(accountId) {
        const account = this.connectedAccounts.find(acc => acc.id === accountId);
        if (!account) return false;

        try {
            // Simulation de récupération des transactions
            const response = await this.simulateApiCall('getTransactions', {
                provider: account.provider,
                phoneNumber: account.phoneNumber,
                lastSync: account.lastSync
            });

            if (response.success) {
                // Traite les nouvelles transactions
                const newTransactions = response.transactions.map(tx => ({
                    id: `mm_${tx.id}`,
                    amount: tx.amount,
                    type: tx.type === 'credit' ? 'revenu' : 'depense',
                    category: this.mapMobileMoneyCategory(tx.category),
                    description: tx.description,
                    date: tx.date,
                    paymentMethod: this.providers[account.provider].name,
                    source: 'mobile_money',
                    provider: account.provider,
                    originalTransaction: tx
                }));

                // Met à jour la date de synchronisation
                account.lastSync = new Date().toISOString();
                account.balance = response.currentBalance;
                this.saveConnectedAccounts();

                // Ajoute les nouvelles transactions à l'historique
                this.transactionHistory.push(...newTransactions);
                this.saveTransactionHistory();

                this.showNotification(`✅ ${newTransactions.length} nouvelles transactions synchronisées`, 'success');
                return newTransactions;
            }
        } catch (error) {
            this.showNotification(`❌ Erreur de synchronisation : ${error.message}`, 'error');
        }

        return false;
    }

    /**
     * Effectue un transfert Mobile Money
     */
    async makeTransfer(accountId, recipientNumber, amount, description) {
        const account = this.connectedAccounts.find(acc => acc.id === accountId);
        if (!account) return false;

        try {
            const response = await this.simulateApiCall('transfer', {
                provider: account.provider,
                fromNumber: account.phoneNumber,
                toNumber: recipientNumber,
                amount: amount,
                description: description
            });

            if (response.success) {
                // Met à jour le solde du compte
                account.balance = response.newBalance;
                account.lastSync = new Date().toISOString();
                this.saveConnectedAccounts();

                // Ajoute la transaction à l'historique
                const transaction = {
                    id: `mm_transfer_${Date.now()}`,
                    amount: amount,
                    type: 'depense',
                    category: 'Transfert',
                    description: `Transfert vers ${recipientNumber} - ${description}`,
                    date: new Date().toISOString().split('T')[0],
                    paymentMethod: this.providers[account.provider].name,
                    source: 'mobile_money',
                    provider: account.provider,
                    recipientNumber: recipientNumber
                };

                this.transactionHistory.push(transaction);
                this.saveTransactionHistory();

                this.showNotification(`✅ Transfert de ${amount.toFixed(0)} FCFA effectué`, 'success');
                return true;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            this.showNotification(`❌ Erreur de transfert : ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Effectue un paiement Mobile Money
     */
    async makePayment(accountId, merchantCode, amount, description) {
        const account = this.connectedAccounts.find(acc => acc.id === accountId);
        if (!account) return false;

        try {
            const response = await this.simulateApiCall('payment', {
                provider: account.provider,
                phoneNumber: account.phoneNumber,
                merchantCode: merchantCode,
                amount: amount,
                description: description
            });

            if (response.success) {
                // Met à jour le solde du compte
                account.balance = response.newBalance;
                account.lastSync = new Date().toISOString();
                this.saveConnectedAccounts();

                // Ajoute la transaction à l'historique
                const transaction = {
                    id: `mm_payment_${Date.now()}`,
                    amount: amount,
                    type: 'depense',
                    category: 'Paiement',
                    description: `Paiement ${description}`,
                    date: new Date().toISOString().split('T')[0],
                    paymentMethod: this.providers[account.provider].name,
                    source: 'mobile_money',
                    provider: account.provider,
                    merchantCode: merchantCode
                };

                this.transactionHistory.push(transaction);
                this.saveTransactionHistory();

                this.showNotification(`✅ Paiement de ${amount.toFixed(0)} FCFA effectué`, 'success');
                return true;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            this.showNotification(`❌ Erreur de paiement : ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Obtient le solde d'un compte
     */
    async getBalance(accountId) {
        const account = this.connectedAccounts.find(acc => acc.id === accountId);
        if (!account) return null;

        try {
            const response = await this.simulateApiCall('getBalance', {
                provider: account.provider,
                phoneNumber: account.phoneNumber
            });

            if (response.success) {
                account.balance = response.balance;
                account.lastSync = new Date().toISOString();
                this.saveConnectedAccounts();
                return response.balance;
            }
        } catch (error) {
            this.showNotification(`❌ Erreur de récupération du solde : ${error.message}`, 'error');
        }

        return null;
    }

    /**
     * Mappe les catégories Mobile Money vers les catégories de l'app
     */
    mapMobileMoneyCategory(mobileMoneyCategory) {
        const categoryMap = {
            'transfer': 'Transfert',
            'payment': 'Paiement',
            'recharge': 'Communication',
            'withdrawal': 'Retrait',
            'deposit': 'Revenu',
            'airtime': 'Communication',
            'data': 'Communication',
            'bill': 'Factures',
            'shopping': 'Divers',
            'food': 'Nourriture',
            'transport': 'Transport'
        };

        return categoryMap[mobileMoneyCategory] || 'Divers';
    }

    /**
     * Obtient les comptes connectés
     */
    getConnectedAccounts() {
        return this.connectedAccounts;
    }

    /**
     * Obtient un compte par ID
     */
    getAccount(accountId) {
        return this.connectedAccounts.find(acc => acc.id === accountId);
    }

    /**
     * Obtient l'historique des transactions Mobile Money
     */
    getTransactionHistory() {
        return this.transactionHistory;
    }

    /**
     * Obtient les informations d'un fournisseur
     */
    getProviderInfo(provider) {
        return this.providers[provider];
    }

    /**
     * Obtient tous les fournisseurs disponibles
     */
    getAvailableProviders() {
        return this.providers;
    }

    /**
     * Simule un appel API
     */
    async simulateApiCall(endpoint, data) {
        // Simulation d'un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Simulation de différents scénarios
        const scenarios = {
            'connect': () => {
                if (Math.random() > 0.1) { // 90% de succès
                    return {
                        success: true,
                        balance: Math.floor(Math.random() * 500000) + 10000,
                        accountName: `Compte ${data.provider}`
                    };
                } else {
                    return {
                        success: false,
                        error: 'Numéro de téléphone ou code PIN incorrect'
                    };
                }
            },
            'getTransactions': () => {
                const transactions = [];
                const days = Math.floor(Math.random() * 30) + 1;
                
                for (let i = 0; i < days; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    
                    if (Math.random() > 0.7) { // 30% de chance d'avoir une transaction
                        transactions.push({
                            id: `tx_${Date.now()}_${i}`,
                            amount: Math.floor(Math.random() * 50000) + 1000,
                            type: Math.random() > 0.5 ? 'credit' : 'debit',
                            category: ['transfer', 'payment', 'recharge', 'withdrawal'][Math.floor(Math.random() * 4)],
                            description: `Transaction ${i + 1}`,
                            date: date.toISOString().split('T')[0]
                        });
                    }
                }
                
                return {
                    success: true,
                    transactions: transactions,
                    currentBalance: Math.floor(Math.random() * 500000) + 10000
                };
            },
            'transfer': () => {
                if (Math.random() > 0.05) { // 95% de succès
                    return {
                        success: true,
                        newBalance: Math.floor(Math.random() * 500000) + 10000,
                        transactionId: `transfer_${Date.now()}`
                    };
                } else {
                    return {
                        success: false,
                        error: 'Solde insuffisant'
                    };
                }
            },
            'payment': () => {
                if (Math.random() > 0.05) { // 95% de succès
                    return {
                        success: true,
                        newBalance: Math.floor(Math.random() * 500000) + 10000,
                        transactionId: `payment_${Date.now()}`
                    };
                } else {
                    return {
                        success: false,
                        error: 'Code marchand invalide'
                    };
                }
            },
            'getBalance': () => {
                return {
                    success: true,
                    balance: Math.floor(Math.random() * 500000) + 10000
                };
            }
        };

        return scenarios[endpoint] ? scenarios[endpoint]() : { success: false, error: 'Endpoint non supporté' };
    }

    /**
     * Charge les comptes connectés depuis le stockage
     */
    loadConnectedAccounts() {
        try {
            const data = JSON.parse(localStorage.getItem('mobileMoneyAccounts'));
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Sauvegarde les comptes connectés
     */
    saveConnectedAccounts() {
        localStorage.setItem('mobileMoneyAccounts', JSON.stringify(this.connectedAccounts));
    }

    /**
     * Charge l'historique des transactions depuis le stockage
     */
    loadTransactionHistory() {
        try {
            const data = JSON.parse(localStorage.getItem('mobileMoneyTransactions'));
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Sauvegarde l'historique des transactions
     */
    saveTransactionHistory() {
        localStorage.setItem('mobileMoneyTransactions', JSON.stringify(this.transactionHistory));
    }

    /**
     * Affiche une notification
     */
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[Mobile Money - ${type.toUpperCase()}] ${message}`);
        }
    }
}

// Export pour utilisation dans d'autres fichiers
window.MobileMoneyIntegration = MobileMoneyIntegration; 