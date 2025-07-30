/*
 * Configuration des améliorations pour Mon Budget Malin
 * Centralise les paramètres d'interface et les fonctionnalités améliorées
 */

const ENHANCEMENTS_CONFIG = {
    // Configuration des animations
    animations: {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        stagger: 100,
        enableReducedMotion: true
    },

    // Configuration des notifications
    notifications: {
        duration: 4000,
        position: 'top-right',
        maxNotifications: 3,
        sound: false
    },

    // Configuration des formulaires
    forms: {
        autoSave: true,
        autoSaveDelay: 1000,
        validation: {
            realTime: true,
            showErrors: true,
            highlightValid: true
        },
        suggestions: {
            amounts: [1000, 2000, 5000, 10000, 25000, 50000, 100000],
            categories: {
                revenu: ['salaire', 'bonus', 'freelance', 'investissement'],
                depense: ['nourriture', 'transport', 'logement', 'sante', 'communication', 'loisirs']
            }
        }
    },

    // Configuration des graphiques
    charts: {
        colors: {
            revenus: '#4CAF50',
            depenses: '#F44336',
            solde: '#2196F3',
            categories: ['#FF5722', '#9C27B0', '#3F51B5', '#009688', '#FF9800', '#795548']
        },
        animations: {
            duration: 1000,
            easing: 'easeOutQuart'
        }
    },

    // Configuration de l'interface mobile
    mobile: {
        touchFeedback: true,
        swipeNavigation: true,
        gestureSupport: true,
        optimizeForTouch: true
    },

    // Configuration de l'accessibilité
    accessibility: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrast: false,
        largeText: false,
        reducedMotion: false
    },

    // Configuration des performances
    performance: {
        lazyLoading: true,
        debounceDelay: 300,
        throttleDelay: 100,
        cacheResults: true
    }
};

// Gestionnaire de configuration
class EnhancementConfigManager {
    constructor() {
        this.config = ENHANCEMENTS_CONFIG;
        this.loadUserPreferences();
    }

    loadUserPreferences() {
        const savedConfig = localStorage.getItem('enhancements-config');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
    }

    saveUserPreferences() {
        localStorage.setItem('enhancements-config', JSON.stringify(this.config));
    }

    updateConfig(key, value) {
        this.config[key] = value;
        this.saveUserPreferences();
        this.applyConfig();
    }

    applyConfig() {
        // Appliquer les préférences d'accessibilité
        if (this.config.accessibility.reducedMotion) {
            document.documentElement.style.setProperty('--android-transition', 'none');
        }

        if (this.config.accessibility.highContrast) {
            document.documentElement.classList.add('high-contrast');
        }

        if (this.config.accessibility.largeText) {
            document.documentElement.classList.add('large-text');
        }
    }

    getAnimationConfig() {
        return this.config.animations;
    }

    getNotificationConfig() {
        return this.config.notifications;
    }

    getFormConfig() {
        return this.config.forms;
    }

    getChartConfig() {
        return this.config.charts;
    }

    getMobileConfig() {
        return this.config.mobile;
    }
}

// Gestionnaire de thèmes
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themes = {
            light: {
                '--android-background': '#FFFFFF',
                '--android-surface': '#FFFFFF',
                '--android-card': '#FFFFFF',
                '--android-divider': '#E0E0E0',
                '--android-text-primary': '#212121',
                '--android-text-secondary': '#757575'
            },
            dark: {
                '--android-background': '#121212',
                '--android-surface': '#1E1E1E',
                '--android-card': '#2D2D2D',
                '--android-divider': '#404040',
                '--android-text-primary': '#FFFFFF',
                '--android-text-secondary': '#B0B0B0'
            },
            blue: {
                '--android-background': '#F5F8FF',
                '--android-surface': '#FFFFFF',
                '--android-card': '#FFFFFF',
                '--android-divider': '#E3F2FD',
                '--android-text-primary': '#1565C0',
                '--android-text-secondary': '#42A5F5'
            }
        };
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            const theme = this.themes[themeName];
            
            Object.keys(theme).forEach(property => {
                document.documentElement.style.setProperty(property, theme[property]);
            });

            localStorage.setItem('selected-theme', themeName);
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    toggleTheme() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
}

// Gestionnaire de personnalisation
class PersonalizationManager {
    constructor() {
        this.configManager = new EnhancementConfigManager();
        this.themeManager = new ThemeManager();
        this.init();
    }

    init() {
        // Charger le thème sauvegardé
        const savedTheme = localStorage.getItem('selected-theme');
        if (savedTheme) {
            this.themeManager.setTheme(savedTheme);
        }

        // Appliquer la configuration
        this.configManager.applyConfig();

        // Détecter les préférences système
        this.detectSystemPreferences();
    }

    detectSystemPreferences() {
        // Détecter le mode sombre
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.themeManager.setTheme('dark');
        }

        // Détecter la préférence de mouvement réduit
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.configManager.updateConfig('accessibility.reducedMotion', true);
        }
    }

    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-header">
                <h3>⚙️ Paramètres</h3>
                <button class="settings-close">&times;</button>
            </div>
            <div class="settings-content">
                <div class="setting-group">
                    <h4>🎨 Thème</h4>
                    <div class="theme-options">
                        <button class="theme-btn" data-theme="light">Clair</button>
                        <button class="theme-btn" data-theme="dark">Sombre</button>
                        <button class="theme-btn" data-theme="blue">Bleu</button>
                    </div>
                </div>
                <div class="setting-group">
                    <h4>♿ Accessibilité</h4>
                    <label class="setting-toggle">
                        <input type="checkbox" id="reduced-motion">
                        <span class="toggle-slider"></span>
                        Mouvement réduit
                    </label>
                    <label class="setting-toggle">
                        <input type="checkbox" id="high-contrast">
                        <span class="toggle-slider"></span>
                        Contraste élevé
                    </label>
                    <label class="setting-toggle">
                        <input type="checkbox" id="large-text">
                        <span class="toggle-slider"></span>
                        Texte agrandi
                    </label>
                </div>
                <div class="setting-group">
                    <h4>📱 Mobile</h4>
                    <label class="setting-toggle">
                        <input type="checkbox" id="touch-feedback">
                        <span class="toggle-slider"></span>
                        Retour tactile
                    </label>
                    <label class="setting-toggle">
                        <input type="checkbox" id="swipe-navigation">
                        <span class="toggle-slider"></span>
                        Navigation par swipe
                    </label>
                </div>
            </div>
        `;

        // Ajouter les gestionnaires d'événements
        this.addSettingsEventListeners(panel);

        return panel;
    }

    addSettingsEventListeners(panel) {
        // Gestionnaires pour les thèmes
        const themeButtons = panel.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.themeManager.setTheme(theme);
                
                // Mettre à jour l'état actif
                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Gestionnaires pour les toggles
        const toggles = panel.querySelectorAll('.setting-toggle input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.handleSettingChange(toggle);
            });
        });

        // Gestionnaire de fermeture
        const closeBtn = panel.querySelector('.settings-close');
        closeBtn.addEventListener('click', () => {
            panel.remove();
        });
    }

    handleSettingChange(toggle) {
        const setting = toggle.id;
        const value = toggle.checked;

        switch (setting) {
            case 'reduced-motion':
                this.configManager.updateConfig('accessibility.reducedMotion', value);
                break;
            case 'high-contrast':
                this.configManager.updateConfig('accessibility.highContrast', value);
                break;
            case 'large-text':
                this.configManager.updateConfig('accessibility.largeText', value);
                break;
            case 'touch-feedback':
                this.configManager.updateConfig('mobile.touchFeedback', value);
                break;
            case 'swipe-navigation':
                this.configManager.updateConfig('mobile.swipeNavigation', value);
                break;
        }
    }

    showSettings() {
        const panel = this.createSettingsPanel();
        document.body.appendChild(panel);
        
        // Animation d'entrée
        setTimeout(() => {
            panel.classList.add('active');
        }, 10);
    }
}

// Export pour utilisation globale
window.EnhancementConfigManager = EnhancementConfigManager;
window.ThemeManager = ThemeManager;
window.PersonalizationManager = PersonalizationManager;
window.ENHANCEMENTS_CONFIG = ENHANCEMENTS_CONFIG; 