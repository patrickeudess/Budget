/*
 * Système de paramètres et personnalisation pour Mon Budget Malin
 * Gestion des thèmes, langues et préférences utilisateur
 */

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.themes = this.getAvailableThemes();
        this.languages = this.getAvailableLanguages();
        this.applySettings();
    }

    /**
     * Applique les paramètres actuels
     */
    applySettings() {
        this.applyTheme(this.settings.theme);
        this.applyLanguage(this.settings.language);
        this.applyFontSize(this.settings.fontSize);
        this.applyNotifications(this.settings.notifications);
    }

    /**
     * Applique un thème
     */
    applyTheme(themeName) {
        const theme = this.themes.find(t => t.name === themeName);
        if (!theme) return;

        // Supprime les anciens thèmes
        document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-green', 'theme-blue', 'theme-purple');
        
        // Applique le nouveau thème
        document.documentElement.classList.add(`theme-${themeName}`);
        
        // Met à jour les variables CSS
        Object.keys(theme.colors).forEach(key => {
            document.documentElement.style.setProperty(`--${key}`, theme.colors[key]);
        });

        this.settings.theme = themeName;
        this.saveSettings();
    }

    /**
     * Applique une langue
     */
    applyLanguage(languageCode) {
        const language = this.languages.find(l => l.code === languageCode);
        if (!language) return;

        // Change l'attribut lang du document
        document.documentElement.lang = languageCode;
        
        // Traduit les éléments de l'interface
        this.translateInterface(languageCode);

        this.settings.language = languageCode;
        this.saveSettings();
    }

    /**
     * Applique la taille de police
     */
    applyFontSize(size) {
        const sizes = {
            'small': '14px',
            'medium': '16px',
            'large': '18px',
            'xlarge': '20px'
        };

        if (sizes[size]) {
            document.documentElement.style.fontSize = sizes[size];
            this.settings.fontSize = size;
            this.saveSettings();
        }
    }

    /**
     * Applique les paramètres de notifications
     */
    applyNotifications(notifications) {
        this.settings.notifications = notifications;
        this.saveSettings();
    }

    /**
     * Traduit l'interface
     */
    translateInterface(languageCode) {
        const translations = this.getTranslations(languageCode);
        
        // Traduit les éléments avec l'attribut data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        // Traduit les placeholders
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });
    }

    /**
     * Obtient les traductions pour une langue
     */
    getTranslations(languageCode) {
        const translations = {
            'fr': {
                'app_title': 'Mon Budget Malin',
                'new_transaction': 'Nouvelle transaction',
                'history': 'Historique',
                'budgets': 'Budgets',
                'analytics': 'Analyses',
                'savings': 'Sauvegarde',
                'tips': 'Conseils',
                'settings': 'Paramètres',
                'amount': 'Montant',
                'category': 'Catégorie',
                'description': 'Description',
                'date': 'Date',
                'save': 'Enregistrer',
                'cancel': 'Annuler',
                'delete': 'Supprimer',
                'edit': 'Modifier',
                'export': 'Exporter',
                'import': 'Importer',
                'search': 'Rechercher',
                'filter': 'Filtrer',
                'clear': 'Effacer',
                'loading': 'Chargement...',
                'error': 'Erreur',
                'success': 'Succès',
                'warning': 'Attention',
                'info': 'Information'
            },
            'en': {
                'app_title': 'My Smart Budget',
                'new_transaction': 'New Transaction',
                'history': 'History',
                'budgets': 'Budgets',
                'analytics': 'Analytics',
                'savings': 'Backup',
                'tips': 'Tips',
                'settings': 'Settings',
                'amount': 'Amount',
                'category': 'Category',
                'description': 'Description',
                'date': 'Date',
                'save': 'Save',
                'cancel': 'Cancel',
                'delete': 'Delete',
                'edit': 'Edit',
                'export': 'Export',
                'import': 'Import',
                'search': 'Search',
                'filter': 'Filter',
                'clear': 'Clear',
                'loading': 'Loading...',
                'error': 'Error',
                'success': 'Success',
                'warning': 'Warning',
                'info': 'Information'
            }
        };

        return translations[languageCode] || translations['fr'];
    }

    /**
     * Obtient les thèmes disponibles
     */
    getAvailableThemes() {
        return [
            {
                name: 'light',
                displayName: 'Clair',
                icon: '☀️',
                colors: {
                    'primary-green': '#009879',
                    'secondary-green': '#00b894',
                    'light-green': '#00d4aa',
                    'dark-green': '#006c5a',
                    'white': '#ffffff',
                    'light-gray': '#f8f9fa',
                    'gray': '#6c757d',
                    'dark-gray': '#343a40'
                }
            },
            {
                name: 'dark',
                displayName: 'Sombre',
                icon: '🌙',
                colors: {
                    'primary-green': '#00d4aa',
                    'secondary-green': '#00b894',
                    'light-green': '#009879',
                    'dark-green': '#006c5a',
                    'white': '#1a1a1a',
                    'light-gray': '#2d2d2d',
                    'gray': '#a0a0a0',
                    'dark-gray': '#ffffff'
                }
            },
            {
                name: 'green',
                displayName: 'Vert Nature',
                icon: '🌿',
                colors: {
                    'primary-green': '#2d5a27',
                    'secondary-green': '#4a7c59',
                    'light-green': '#6b9b7a',
                    'dark-green': '#1a3d1a',
                    'white': '#ffffff',
                    'light-gray': '#f0f7f0',
                    'gray': '#6c757d',
                    'dark-gray': '#2d5a27'
                }
            },
            {
                name: 'blue',
                displayName: 'Bleu Océan',
                icon: '🌊',
                colors: {
                    'primary-green': '#0066cc',
                    'secondary-green': '#0099ff',
                    'light-green': '#66b3ff',
                    'dark-green': '#003366',
                    'white': '#ffffff',
                    'light-gray': '#f0f8ff',
                    'gray': '#6c757d',
                    'dark-gray': '#0066cc'
                }
            },
            {
                name: 'purple',
                displayName: 'Violet Royal',
                icon: '👑',
                colors: {
                    'primary-green': '#663399',
                    'secondary-green': '#9966cc',
                    'light-green': '#cc99ff',
                    'dark-green': '#330066',
                    'white': '#ffffff',
                    'light-gray': '#f8f0ff',
                    'gray': '#6c757d',
                    'dark-gray': '#663399'
                }
            }
        ];
    }

    /**
     * Obtient les langues disponibles
     */
    getAvailableLanguages() {
        return [
            {
                code: 'fr',
                name: 'Français',
                flag: '🇫🇷',
                native: true
            },
            {
                code: 'en',
                name: 'English',
                flag: '🇺🇸',
                native: false
            }
            // Ajoutez d'autres langues ici
        ];
    }

    /**
     * Obtient les paramètres actuels
     */
    getSettings() {
        return this.settings;
    }

    /**
     * Met à jour un paramètre
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Applique le changement immédiatement
        switch (key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'language':
                this.applyLanguage(value);
                break;
            case 'fontSize':
                this.applyFontSize(value);
                break;
            case 'notifications':
                this.applyNotifications(value);
                break;
        }
    }

    /**
     * Réinitialise les paramètres par défaut
     */
    resetSettings() {
        this.settings = this.getDefaultSettings();
        this.applySettings();
        this.saveSettings();
    }

    /**
     * Obtient les paramètres par défaut
     */
    getDefaultSettings() {
        return {
            theme: 'light',
            language: 'fr',
            fontSize: 'medium',
            notifications: {
                enabled: true,
                sound: true,
                vibration: true,
                reminders: true
            },
            privacy: {
                dataSharing: false,
                analytics: false,
                crashReports: false
            },
            accessibility: {
                highContrast: false,
                reduceMotion: false,
                screenReader: false
            }
        };
    }

    /**
     * Charge les paramètres depuis le stockage
     */
    loadSettings() {
        try {
            const data = JSON.parse(localStorage.getItem('appSettings'));
            return data || this.getDefaultSettings();
        } catch (e) {
            return this.getDefaultSettings();
        }
    }

    /**
     * Sauvegarde les paramètres
     */
    saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
    }

    /**
     * Exporte les paramètres
     */
    exportSettings() {
        const data = {
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'budget_settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Importe les paramètres
     */
    importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.settings) {
                        this.settings = { ...this.getDefaultSettings(), ...data.settings };
                        this.applySettings();
                        this.saveSettings();
                        resolve(true);
                    } else {
                        reject(new Error('Format de fichier invalide'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    /**
     * Obtient les statistiques d'utilisation
     */
    getUsageStats() {
        const stats = {
            firstUse: this.settings.firstUse || new Date().toISOString(),
            lastUse: new Date().toISOString(),
            themeUsage: this.settings.themeUsage || {},
            languageUsage: this.settings.languageUsage || {},
            totalSessions: (this.settings.totalSessions || 0) + 1
        };

        // Met à jour les statistiques
        this.settings.firstUse = stats.firstUse;
        this.settings.lastUse = stats.lastUse;
        this.settings.totalSessions = stats.totalSessions;

        // Met à jour l'utilisation des thèmes
        if (!this.settings.themeUsage) this.settings.themeUsage = {};
        this.settings.themeUsage[this.settings.theme] = (this.settings.themeUsage[this.settings.theme] || 0) + 1;

        // Met à jour l'utilisation des langues
        if (!this.settings.languageUsage) this.settings.languageUsage = {};
        this.settings.languageUsage[this.settings.language] = (this.settings.languageUsage[this.settings.language] || 0) + 1;

        this.saveSettings();
        return stats;
    }
}

// Export pour utilisation dans d'autres fichiers
window.SettingsManager = SettingsManager; 