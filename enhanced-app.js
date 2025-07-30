/*
 * Améliorations pour Mon Budget Malin
 * Interactions utilisateur améliorées avec animations et retours visuels
 */

// Configuration des animations
const ANIMATION_CONFIG = {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    stagger: 100
};

// Gestionnaire d'événements amélioré
class EnhancedEventManager {
    constructor() {
        this.touchStartTime = 0;
        this.touchStartY = 0;
        this.isScrolling = false;
        this.init();
    }

    init() {
        this.setupTouchEvents();
        this.setupKeyboardEvents();
        this.setupScrollEvents();
        this.setupFormEnhancements();
    }

    setupTouchEvents() {
        // Détection du swipe pour la navigation
        document.addEventListener('touchstart', (e) => {
            this.touchStartTime = Date.now();
            this.touchStartY = e.touches[0].clientY;
            this.isScrolling = false;
        });

        document.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const deltaY = Math.abs(touchY - this.touchStartY);
            
            if (deltaY > 10) {
                this.isScrolling = true;
            }
        });

        document.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - this.touchStartTime;
            
            if (touchDuration < 300 && !this.isScrolling) {
                this.handleQuickTap(e);
            }
        });
    }

    setupKeyboardEvents() {
        // Navigation au clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
            
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                this.handleFormSubmit(e);
            }
        });
    }

    setupScrollEvents() {
        // Effet de parallaxe pour le header
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateHeaderParallax();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    setupFormEnhancements() {
        // Amélioration des formulaires
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Animation de focus
            input.addEventListener('focus', () => {
                this.animateInputFocus(input);
            });

            input.addEventListener('blur', () => {
                this.animateInputBlur(input);
            });

            // Validation en temps réel
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }

    animateInputFocus(input) {
        input.style.transform = 'scale(1.02)';
        input.style.boxShadow = '0 0 0 2px rgba(33, 150, 243, 0.3)';
    }

    animateInputBlur(input) {
        input.style.transform = 'scale(1)';
        input.style.boxShadow = '';
    }

    validateInput(input) {
        const value = input.value.trim();
        const isValid = this.checkInputValidity(input, value);
        
        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
    }

    checkInputValidity(input, value) {
        const type = input.type;
        const required = input.hasAttribute('required');
        
        if (required && !value) return false;
        
        switch (type) {
            case 'number':
                return !isNaN(value) && value >= 0;
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            default:
                return true;
        }
    }

    handleQuickTap(e) {
        const target = e.target.closest('.nav-card, .btn-primary, .btn-secondary');
        if (target) {
            this.animateButtonPress(target);
        }
    }

    animateButtonPress(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    updateHeaderParallax() {
        const header = document.querySelector('header');
        const scrollY = window.scrollY;
        const opacity = Math.max(0.8, 1 - scrollY / 200);
        
        if (header) {
            header.style.opacity = opacity;
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            this.hideModal(modal);
        });
    }

    hideModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleFormSubmit(e) {
        const form = e.target.closest('form');
        if (form) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                this.animateButtonPress(submitBtn);
            }
        }
    }
}

// Gestionnaire de notifications amélioré
class EnhancedNotificationManager {
    constructor() {
        this.notifications = [];
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 4000) {
        const notification = this.createNotification(message, type);
        this.notifications.push(notification);
        
        this.container.appendChild(notification);
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Auto-suppression
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
            max-width: 300px;
            word-wrap: break-word;
        `;

        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        // Bouton de fermeture
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        `;
        
        closeBtn.addEventListener('click', () => {
            this.hide(notification);
        });

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.opacity = '1';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.opacity = '0.7';
        });

        notification.appendChild(closeBtn);
        return notification;
    }

    hide(notification) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }
}

// Gestionnaire d'animations amélioré
class EnhancedAnimationManager {
    constructor() {
        this.observer = null;
        this.initIntersectionObserver();
    }

    initIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    }

    observeElements() {
        const elements = document.querySelectorAll('.nav-card, .summary-card, .summary-item, section');
        elements.forEach(element => {
            this.observer.observe(element);
        });
    }

    animateElement(element) {
        const animation = element.dataset.animation || 'fadeInUp';
        element.style.animation = `${animation} 0.6s ease-out forwards`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 100);
    }

    animateValue(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const difference = end - start;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (difference * this.easeOutCubic(progress));
            element.textContent = this.formatCurrency(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    }
}

// Gestionnaire de formulaires amélioré
class EnhancedFormManager {
    constructor() {
        this.forms = new Map();
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupAutoSave();
        this.setupSmartSuggestions();
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.enhanceFormValidation(form);
        });
    }

    enhanceFormValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Validation en temps réel
            input.addEventListener('input', () => {
                this.validateField(input);
            });

            // Validation au blur
            input.addEventListener('blur', () => {
                this.validateField(input, true);
            });

            // Auto-complétion pour les montants
            if (input.type === 'number' && input.id === 'amount') {
                input.addEventListener('input', (e) => {
                    this.formatAmountInput(e.target);
                });
            }
        });

        // Validation globale du formulaire
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
                this.showFormErrors(form);
            }
        });
    }

    validateField(input, showError = false) {
        const value = input.value.trim();
        const isValid = this.checkFieldValidity(input, value);
        
        this.updateFieldStatus(input, isValid, showError);
        return isValid;
    }

    checkFieldValidity(input, value) {
        const required = input.hasAttribute('required');
        const type = input.type;
        const pattern = input.pattern;
        
        if (required && !value) return false;
        if (!value) return true; // Champ optionnel vide
        
        switch (type) {
            case 'number':
                const num = parseFloat(value);
                const min = input.min ? parseFloat(input.min) : -Infinity;
                const max = input.max ? parseFloat(input.max) : Infinity;
                return !isNaN(num) && num >= min && num <= max;
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            default:
                if (pattern) {
                    return new RegExp(pattern).test(value);
                }
                return true;
        }
    }

    updateFieldStatus(input, isValid, showError = false) {
        const container = input.closest('.form-group');
        
        // Supprimer les classes précédentes
        input.classList.remove('valid', 'invalid');
        container.classList.remove('has-error', 'has-success');
        
        // Ajouter les nouvelles classes
        if (isValid) {
            input.classList.add('valid');
            container.classList.add('has-success');
        } else {
            input.classList.add('invalid');
            container.classList.add('has-error');
            
            if (showError) {
                this.showFieldError(input);
            }
        }
    }

    showFieldError(input) {
        // Supprimer les erreurs précédentes
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Créer le message d'erreur
        const error = document.createElement('div');
        error.className = 'field-error';
        error.style.cssText = `
            color: #F44336;
            font-size: 0.8rem;
            margin-top: 4px;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const message = this.getErrorMessage(input);
        error.textContent = message;
        
        input.parentNode.appendChild(error);
    }

    getErrorMessage(input) {
        const type = input.type;
        const value = input.value.trim();
        
        if (input.hasAttribute('required') && !value) {
            return 'Ce champ est requis';
        }
        
        switch (type) {
            case 'number':
                const num = parseFloat(value);
                if (isNaN(num)) return 'Veuillez entrer un nombre valide';
                if (num < 0) return 'Le montant doit être positif';
                return 'Veuillez entrer un montant valide';
            case 'email':
                return 'Veuillez entrer une adresse email valide';
            default:
                return 'Veuillez corriger ce champ';
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input, true)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    showFormErrors(form) {
        const notificationManager = new EnhancedNotificationManager();
        notificationManager.show('Veuillez corriger les erreurs dans le formulaire', 'error');
    }

    formatAmountInput(input) {
        let value = input.value.replace(/[^\d]/g, '');
        
        if (value) {
            const num = parseInt(value);
            input.value = num.toLocaleString('fr-FR');
        }
    }

    setupAutoSave() {
        const forms = document.querySelectorAll('form[data-autosave]');
        forms.forEach(form => {
            this.setupFormAutoSave(form);
        });
    }

    setupFormAutoSave(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let saveTimeout;
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    this.saveFormData(form);
                }, 1000);
            });
        });
    }

    saveFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        const formId = form.id || 'form-data';
        localStorage.setItem(`autosave_${formId}`, JSON.stringify(data));
        
        // Notification discrète
        const notificationManager = new EnhancedNotificationManager();
        notificationManager.show('Données sauvegardées automatiquement', 'info', 2000);
    }

    setupSmartSuggestions() {
        const amountInputs = document.querySelectorAll('input[type="number"][id="amount"]');
        amountInputs.forEach(input => {
            this.setupAmountSuggestions(input);
        });
    }

    setupAmountSuggestions(input) {
        const suggestions = [1000, 2000, 5000, 10000, 25000, 50000, 100000];
        const container = document.createElement('div');
        container.className = 'amount-suggestions';
        container.style.cssText = `
            display: flex;
            gap: 8px;
            margin-top: 8px;
            flex-wrap: wrap;
        `;
        
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.textContent = this.formatCurrency(suggestion);
            button.style.cssText = `
                padding: 4px 8px;
                border: 1px solid #E0E0E0;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                font-size: 0.8rem;
                transition: all 0.2s;
            `;
            
            button.addEventListener('click', () => {
                input.value = suggestion;
                input.dispatchEvent(new Event('input'));
            });
            
            button.addEventListener('mouseenter', () => {
                button.style.background = '#F5F5F5';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'white';
            });
            
            container.appendChild(button);
        });
        
        input.parentNode.appendChild(container);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    }
}

// Initialisation des améliorations
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les gestionnaires
    const eventManager = new EnhancedEventManager();
    const notificationManager = new EnhancedNotificationManager();
    const animationManager = new EnhancedAnimationManager();
    const formManager = new EnhancedFormManager();
    
    // Observer les éléments pour les animations
    animationManager.observeElements();
    
    // Améliorer les interactions existantes
    enhanceExistingInteractions();
});

function enhanceExistingInteractions() {
    // Améliorer les boutons existants
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const notificationManager = new EnhancedNotificationManager();
            notificationManager.show('Action en cours...', 'info', 1000);
        });
    });
    
    // Améliorer les cartes de navigation
    const navCards = document.querySelectorAll('.nav-card');
    navCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    
    // Améliorer les tableaux
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', () => {
            row.style.background = 'rgba(33, 150, 243, 0.1)';
            setTimeout(() => {
                row.style.background = '';
            }, 200);
        });
    });
} 