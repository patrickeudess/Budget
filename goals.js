/*
 * Système d'objectifs et challenges pour Mon Budget Malin
 * Gestion des objectifs d'épargne, challenges et badges
 */

class GoalsManager {
    constructor() {
        this.initializeStorage();
    }

    // Initialisation du stockage
    initializeStorage() {
        if (!localStorage.getItem('goals')) {
            localStorage.setItem('goals', JSON.stringify([]));
        }
        if (!localStorage.getItem('challenges')) {
            localStorage.setItem('challenges', JSON.stringify([]));
        }
        if (!localStorage.getItem('achievements')) {
            localStorage.setItem('achievements', JSON.stringify([]));
        }
        if (!localStorage.getItem('badges')) {
            this.initializeBadges();
        }
    }

    // Initialisation des badges
    initializeBadges() {
        const badges = [
            { id: 1, name: 'Premier Pas', description: 'Créez votre premier objectif', icon: '🎯', earned: false, score: 10 },
            { id: 2, name: 'Épargnant', description: 'Épargnez 10 000 FCFA', icon: '💰', earned: false, score: 20 },
            { id: 3, name: 'Persévérant', description: 'Atteignez votre premier objectif', icon: '🏆', earned: false, score: 50 },
            { id: 4, name: 'Défieur', description: 'Relevez votre premier défi', icon: '🔥', earned: false, score: 15 },
            { id: 5, name: 'Champion', description: 'Complétez 5 défis', icon: '👑', earned: false, score: 100 },
            { id: 6, name: 'Millionnaire', description: 'Épargnez 100 000 FCFA', icon: '💎', earned: false, score: 200 },
            { id: 7, name: 'Régulier', description: 'Épargnez pendant 30 jours consécutifs', icon: '📅', earned: false, score: 75 },
            { id: 8, name: 'Multi-objectifs', description: 'Ayez 3 objectifs actifs simultanément', icon: '🎯', earned: false, score: 30 },
            { id: 9, name: 'Rapide', description: 'Atteignez un objectif en moins de 7 jours', icon: '⚡', earned: false, score: 40 },
            { id: 10, name: 'Maître Épargnant', description: 'Atteignez 5 objectifs', icon: '👑', earned: false, score: 150 }
        ];
        localStorage.setItem('badges', JSON.stringify(badges));
    }

    // Gestion des objectifs
    createGoal(goalData) {
        const goals = this.getGoals();
        const newGoal = {
            ...goalData,
            id: Date.now(),
            saved: 0,
            createdAt: new Date().toISOString(),
            completed: false,
            completedDate: null
        };
        
        goals.push(newGoal);
        this.saveGoals(goals);
        
        // Vérifier les badges
        this.checkBadges();
        
        return newGoal;
    }

    getGoals() {
        try {
            return JSON.parse(localStorage.getItem('goals')) || [];
        } catch (e) {
            return [];
        }
    }

    getActiveGoals() {
        const goals = this.getGoals();
        return goals.filter(goal => !goal.completed);
    }

    getCompletedGoals() {
        const goals = this.getGoals();
        return goals.filter(goal => goal.completed);
    }

    saveGoals(goals) {
        localStorage.setItem('goals', JSON.stringify(goals));
    }

    addToGoal(goalId, amount, description = '') {
        const goals = this.getGoals();
        const goalIndex = goals.findIndex(g => g.id === goalId);
        
        if (goalIndex === -1) return false;
        
        const goal = goals[goalIndex];
        goal.saved += amount;
        
        // Enregistrer la transaction d'épargne
        this.recordSavingsTransaction(goalId, amount, description);
        
        // Vérifier si l'objectif est atteint
        if (goal.saved >= goal.target && !goal.completed) {
            goal.completed = true;
            goal.completedDate = new Date().toISOString();
            this.recordAchievement('goal', `Objectif atteint : ${goal.name}`, `Vous avez atteint votre objectif de ${goal.target.toLocaleString()} FCFA !`, 50);
        }
        
        this.saveGoals(goals);
        this.checkBadges();
        
        return true;
    }

    deleteGoal(goalId) {
        const goals = this.getGoals();
        const filteredGoals = goals.filter(g => g.id !== goalId);
        this.saveGoals(filteredGoals);
    }

    getGoalProgress(goalId) {
        const goals = this.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return 0;
        return (goal.saved / goal.target) * 100;
    }

    // Gestion des défis
    getAvailableChallenges() {
        return [
            {
                id: 1,
                name: 'Défi de la Semaine',
                description: 'Épargnez 5 000 FCFA cette semaine',
                icon: '🔥',
                target: 5000,
                current: 0,
                duration: 7,
                difficulty: 1,
                reward: 'Badge "Défieur"',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                accepted: false
            },
            {
                id: 2,
                name: 'Défi du Mois',
                description: 'Épargnez 20 000 FCFA ce mois',
                icon: '📅',
                target: 20000,
                current: 0,
                duration: 30,
                difficulty: 2,
                reward: 'Badge "Persévérant"',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                accepted: false
            },
            {
                id: 3,
                name: 'Défi Économies',
                description: 'Réduisez vos dépenses de 30% ce mois',
                icon: '💡',
                target: 30,
                current: 0,
                duration: 30,
                difficulty: 3,
                reward: 'Badge "Économe"',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                accepted: false
            },
            {
                id: 4,
                name: 'Défi Régularité',
                description: 'Épargnez chaque jour pendant 7 jours',
                icon: '📊',
                target: 7,
                current: 0,
                duration: 7,
                difficulty: 2,
                reward: 'Badge "Régulier"',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                accepted: false
            },
            {
                id: 5,
                name: 'Défi Objectifs Multiples',
                description: 'Créez et maintenez 3 objectifs actifs',
                icon: '🎯',
                target: 3,
                current: 0,
                duration: 60,
                difficulty: 2,
                reward: 'Badge "Multi-objectifs"',
                deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                accepted: false
            }
        ];
    }

    getActiveChallenges() {
        const challenges = this.getChallenges();
        return challenges.filter(c => c.accepted && !c.completed);
    }

    getCompletedChallenges() {
        const challenges = this.getChallenges();
        return challenges.filter(c => c.completed);
    }

    getChallenges() {
        try {
            return JSON.parse(localStorage.getItem('challenges')) || [];
        } catch (e) {
            return [];
        }
    }

    saveChallenges(challenges) {
        localStorage.setItem('challenges', JSON.stringify(challenges));
    }

    acceptChallenge(challengeId) {
        const availableChallenges = this.getAvailableChallenges();
        const challenge = availableChallenges.find(c => c.id === challengeId);
        
        if (!challenge) return false;
        
        const challenges = this.getChallenges();
        const newChallenge = {
            ...challenge,
            accepted: true,
            acceptedDate: new Date().toISOString(),
            completed: false,
            completedDate: null
        };
        
        challenges.push(newChallenge);
        this.saveChallenges(challenges);
        
        return true;
    }

    updateChallengeProgress(challengeId, progress) {
        const challenges = this.getChallenges();
        const challengeIndex = challenges.findIndex(c => c.id === challengeId);
        
        if (challengeIndex === -1) return false;
        
        const challenge = challenges[challengeIndex];
        challenge.current = progress;
        
        // Vérifier si le défi est complété
        if (challenge.current >= challenge.target && !challenge.completed) {
            challenge.completed = true;
            challenge.completedDate = new Date().toISOString();
            this.recordAchievement('challenge', `Défi réussi : ${challenge.name}`, `Vous avez relevé le défi "${challenge.name}" !`, 25);
        }
        
        this.saveChallenges(challenges);
        this.checkBadges();
        
        return true;
    }

    // Gestion des réalisations
    recordAchievement(type, title, description, score) {
        const achievements = this.getAchievements();
        const achievement = {
            id: Date.now(),
            type: type,
            title: title,
            description: description,
            score: score,
            date: new Date().toISOString(),
            icon: this.getAchievementIcon(type)
        };
        
        achievements.push(achievement);
        this.saveAchievements(achievements);
        
        // Afficher une notification
        this.showAchievementNotification(achievement);
    }

    getAchievements() {
        try {
            return JSON.parse(localStorage.getItem('achievements')) || [];
        } catch (e) {
            return [];
        }
    }

    saveAchievements(achievements) {
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }

    getAchievementIcon(type) {
        const icons = {
            'goal': '🎯',
            'challenge': '🏅',
            'badge': '🏆',
            'savings': '💰',
            'streak': '📅'
        };
        return icons[type] || '🏆';
    }

    // Gestion des badges
    getBadges() {
        try {
            return JSON.parse(localStorage.getItem('badges')) || [];
        } catch (e) {
            return [];
        }
    }

    saveBadges(badges) {
        localStorage.setItem('badges', JSON.stringify(badges));
    }

    checkBadges() {
        const badges = this.getBadges();
        const goals = this.getGoals();
        const achievements = this.getAchievements();
        
        let updated = false;
        
        // Badge "Premier Pas"
        if (goals.length >= 1 && !badges[0].earned) {
            badges[0].earned = true;
            this.recordAchievement('badge', 'Premier Pas', 'Vous avez créé votre premier objectif !', 10);
            updated = true;
        }
        
        // Badge "Épargnant"
        const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
        if (totalSaved >= 10000 && !badges[1].earned) {
            badges[1].earned = true;
            this.recordAchievement('badge', 'Épargnant', 'Vous avez épargné 10 000 FCFA !', 20);
            updated = true;
        }
        
        // Badge "Persévérant"
        const completedGoals = goals.filter(goal => goal.completed);
        if (completedGoals.length >= 1 && !badges[2].earned) {
            badges[2].earned = true;
            this.recordAchievement('badge', 'Persévérant', 'Vous avez atteint votre premier objectif !', 50);
            updated = true;
        }
        
        // Badge "Défieur"
        const activeChallenges = this.getActiveChallenges();
        if (activeChallenges.length >= 1 && !badges[3].earned) {
            badges[3].earned = true;
            this.recordAchievement('badge', 'Défieur', 'Vous avez relevé votre premier défi !', 15);
            updated = true;
        }
        
        // Badge "Champion"
        const completedChallenges = this.getCompletedChallenges();
        if (completedChallenges.length >= 5 && !badges[4].earned) {
            badges[4].earned = true;
            this.recordAchievement('badge', 'Champion', 'Vous avez complété 5 défis !', 100);
            updated = true;
        }
        
        // Badge "Millionnaire"
        if (totalSaved >= 100000 && !badges[5].earned) {
            badges[5].earned = true;
            this.recordAchievement('badge', 'Millionnaire', 'Vous avez épargné 100 000 FCFA !', 200);
            updated = true;
        }
        
        // Badge "Multi-objectifs"
        const activeGoals = goals.filter(goal => !goal.completed);
        if (activeGoals.length >= 3 && !badges[7].earned) {
            badges[7].earned = true;
            this.recordAchievement('badge', 'Multi-objectifs', 'Vous avez 3 objectifs actifs !', 30);
            updated = true;
        }
        
        if (updated) {
            this.saveBadges(badges);
        }
    }

    // Transactions d'épargne
    recordSavingsTransaction(goalId, amount, description) {
        const transactions = this.getSavingsTransactions();
        const transaction = {
            id: Date.now(),
            goalId: goalId,
            amount: amount,
            description: description,
            date: new Date().toISOString()
        };
        
        transactions.push(transaction);
        this.saveSavingsTransactions(transactions);
    }

    getSavingsTransactions() {
        try {
            return JSON.parse(localStorage.getItem('savings_transactions')) || [];
        } catch (e) {
            return [];
        }
    }

    saveSavingsTransactions(transactions) {
        localStorage.setItem('savings_transactions', JSON.stringify(transactions));
    }

    // Notifications
    showAchievementNotification(achievement) {
        if (window.showNotification) {
            window.showNotification(`🏆 ${achievement.title}`, 'success');
        } else {
            console.log(`🏆 Achievement: ${achievement.title}`);
        }
    }

    // Statistiques
    getStats() {
        const goals = this.getGoals();
        const challenges = this.getChallenges();
        const achievements = this.getAchievements();
        
        const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
        const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
        const completedGoals = goals.filter(goal => goal.completed).length;
        const activeGoals = goals.filter(goal => !goal.completed).length;
        const completedChallenges = challenges.filter(challenge => challenge.completed).length;
        const totalScore = achievements.reduce((sum, achievement) => sum + achievement.score, 0);
        
        return {
            totalSaved,
            totalTarget,
            completedGoals,
            activeGoals,
            completedChallenges,
            totalScore,
            averageProgress: goals.length > 0 ? (totalSaved / totalTarget) * 100 : 0
        };
    }

    // Recommandations personnalisées
    getRecommendations() {
        const stats = this.getStats();
        const recommendations = [];
        
        if (stats.activeGoals === 0) {
            recommendations.push({
                type: 'info',
                title: 'Créez votre premier objectif',
                message: 'Commencez par définir un objectif d\'épargne simple et atteignable.',
                icon: '🎯'
            });
        }
        
        if (stats.averageProgress < 50) {
            recommendations.push({
                type: 'warning',
                title: 'Accélérez votre épargne',
                message: 'Vos objectifs progressent lentement. Essayez d\'épargner plus régulièrement.',
                icon: '⚡'
            });
        }
        
        if (stats.completedGoals === 0 && stats.activeGoals > 0) {
            recommendations.push({
                type: 'info',
                title: 'Persévérez !',
                message: 'Continuez vos efforts pour atteindre vos objectifs.',
                icon: '💪'
            });
        }
        
        if (stats.totalSaved >= 50000) {
            recommendations.push({
                type: 'success',
                title: 'Excellent travail !',
                message: 'Vous avez déjà épargné un montant significatif. Continuez ainsi !',
                icon: '🏆'
            });
        }
        
        return recommendations;
    }
} 