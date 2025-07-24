/*
 * Contenu éducatif pour Mon Budget Malin
 * Articles, FAQ et quiz sur la gestion de budget et l'épargne
 */

class EducationManager {
    constructor() {
        this.articles = this.loadArticles();
        this.faq = this.loadFAQ();
        this.quiz = this.loadQuiz();
        this.userProgress = this.loadUserProgress();
    }

    /**
     * Obtient tous les articles éducatifs
     */
    getArticles() {
        return this.articles;
    }

    /**
     * Obtient un article par ID
     */
    getArticle(articleId) {
        return this.articles.find(article => article.id === articleId);
    }

    /**
     * Obtient les articles par catégorie
     */
    getArticlesByCategory(category) {
        return this.articles.filter(article => article.category === category);
    }

    /**
     * Obtient la FAQ
     */
    getFAQ() {
        return this.faq;
    }

    /**
     * Obtient les quiz disponibles
     */
    getQuiz() {
        return this.quiz;
    }

    /**
     * Obtient un quiz par ID
     */
    getQuizById(quizId) {
        return this.quiz.find(quiz => quiz.id === quizId);
    }

    /**
     * Marque un article comme lu
     */
    markArticleAsRead(articleId) {
        if (!this.userProgress.readArticles.includes(articleId)) {
            this.userProgress.readArticles.push(articleId);
            this.saveUserProgress();
        }
    }

    /**
     * Soumet les réponses d'un quiz
     */
    submitQuizAnswers(quizId, answers) {
        const quiz = this.getQuizById(quizId);
        if (!quiz) return null;

        let score = 0;
        const results = [];

        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                score++;
            }

            results.push({
                question: question.text,
                userAnswer: question.options[userAnswer],
                correctAnswer: question.options[question.correctAnswer],
                isCorrect: isCorrect,
                explanation: question.explanation
            });
        });

        const percentage = (score / quiz.questions.length) * 100;
        const passed = percentage >= 70;

        // Sauvegarde le résultat
        const result = {
            quizId: quizId,
            score: score,
            total: quiz.questions.length,
            percentage: percentage,
            passed: passed,
            date: new Date().toISOString(),
            results: results
        };

        this.userProgress.quizResults.push(result);
        this.saveUserProgress();

        return result;
    }

    /**
     * Obtient les progrès de l'utilisateur
     */
    getUserProgress() {
        return this.userProgress;
    }

    /**
     * Obtient les statistiques de lecture
     */
    getReadingStats() {
        const totalArticles = this.articles.length;
        const readArticles = this.userProgress.readArticles.length;
        const percentage = totalArticles > 0 ? (readArticles / totalArticles) * 100 : 0;

        return {
            totalArticles: totalArticles,
            readArticles: readArticles,
            percentage: percentage,
            remaining: totalArticles - readArticles
        };
    }

    /**
     * Obtient les statistiques des quiz
     */
    getQuizStats() {
        const totalQuizzes = this.quiz.length;
        const completedQuizzes = this.userProgress.quizResults.length;
        const passedQuizzes = this.userProgress.quizResults.filter(r => r.passed).length;
        const averageScore = completedQuizzes > 0 
            ? this.userProgress.quizResults.reduce((sum, r) => sum + r.percentage, 0) / completedQuizzes 
            : 0;

        return {
            totalQuizzes: totalQuizzes,
            completedQuizzes: completedQuizzes,
            passedQuizzes: passedQuizzes,
            averageScore: averageScore
        };
    }

    /**
     * Charge les articles depuis le stockage
     */
    loadArticles() {
        try {
            const data = JSON.parse(localStorage.getItem('educationArticles'));
            if (Array.isArray(data)) {
                return data;
            }
        } catch (e) {
            // Continue avec les articles par défaut
        }

        // Articles par défaut
        return [
            {
                id: 1,
                title: 'Les bases du budget personnel',
                category: 'Budget',
                icon: '📊',
                content: `
                    <h3>Qu'est-ce qu'un budget personnel ?</h3>
                    <p>Un budget personnel est un plan financier qui vous aide à gérer vos revenus et vos dépenses. Il vous permet de :</p>
                    <ul>
                        <li>Suivre vos dépenses quotidiennes</li>
                        <li>Identifier vos habitudes de consommation</li>
                        <li>Planifier vos objectifs financiers</li>
                        <li>Éviter les dettes inutiles</li>
                    </ul>

                    <h3>La règle du 50/30/20</h3>
                    <p>Cette règle simple vous aide à répartir vos revenus :</p>
                    <ul>
                        <li><strong>50%</strong> pour les besoins essentiels (logement, nourriture, transport)</li>
                        <li><strong>30%</strong> pour les envies (loisirs, sorties, shopping)</li>
                        <li><strong>20%</strong> pour l'épargne et les objectifs financiers</li>
                    </ul>

                    <h3>Comment commencer ?</h3>
                    <ol>
                        <li>Listez tous vos revenus mensuels</li>
                        <li>Identifiez vos dépenses fixes (loyer, factures)</li>
                        <li>Estimez vos dépenses variables (nourriture, transport)</li>
                        <li>Définissez vos objectifs d'épargne</li>
                        <li>Suivez vos dépenses quotidiennement</li>
                    </ol>
                `,
                readingTime: 5,
                difficulty: 'Débutant',
                tags: ['budget', 'bases', 'planification']
            },
            {
                id: 2,
                title: 'Construire un fonds d\'urgence',
                category: 'Épargne',
                icon: '🛡️',
                content: `
                    <h3>Pourquoi un fonds d'urgence ?</h3>
                    <p>Un fonds d'urgence vous protège contre les imprévus financiers :</p>
                    <ul>
                        <li>Réparations de voiture ou de maison</li>
                        <li>Frais médicaux imprévus</li>
                        <li>Perte d'emploi temporaire</li>
                        <li>Dépenses urgentes</li>
                    </ul>

                    <h3>Combien épargner ?</h3>
                    <p>L'objectif recommandé est de 3 à 6 mois de dépenses :</p>
                    <ul>
                        <li><strong>Minimum</strong> : 3 mois de dépenses essentielles</li>
                        <li><strong>Idéal</strong> : 6 mois de dépenses complètes</li>
                        <li><strong>Commencez petit</strong> : 50 000 FCFA puis augmentez</li>
                    </ul>

                    <h3>Où placer votre fonds d'urgence ?</h3>
                    <ul>
                        <li>Compte bancaire séparé</li>
                        <li>Compte d'épargne liquide</li>
                        <li>Évitez les placements risqués</li>
                        <li>Assurez-vous de pouvoir retirer rapidement</li>
                    </ul>
                `,
                readingTime: 4,
                difficulty: 'Intermédiaire',
                tags: ['épargne', 'urgence', 'sécurité']
            },
            {
                id: 3,
                title: 'Gérer ses dettes intelligemment',
                category: 'Dettes',
                icon: '💳',
                content: `
                    <h3>Types de dettes</h3>
                    <p>Il existe deux types principaux de dettes :</p>
                    <ul>
                        <li><strong>Dettes bonnes</strong> : investissements qui génèrent des revenus (immobilier, formation)</li>
                        <li><strong>Dettes mauvaises</strong> : consommation qui perd de la valeur (voiture, crédit revolving)</li>
                    </ul>

                    <h3>Stratégies de remboursement</h3>
                    <p>Deux méthodes principales :</p>
                    <ul>
                        <li><strong>Méthode avalanche</strong> : remboursez d'abord les dettes à taux élevé</li>
                        <li><strong>Méthode boule de neige</strong> : remboursez d'abord les petites dettes pour la motivation</li>
                    </ul>

                    <h3>Conseils pratiques</h3>
                    <ul>
                        <li>Faites l'inventaire de toutes vos dettes</li>
                        <li>Priorisez les dettes à taux élevé</li>
                        <li>Négociez avec vos créanciers</li>
                        <li>Évitez de contracter de nouvelles dettes</li>
                        <li>Consolidez vos dettes si possible</li>
                    </ul>
                `,
                readingTime: 6,
                difficulty: 'Avancé',
                tags: ['dettes', 'remboursement', 'stratégie']
            },
            {
                id: 4,
                title: 'Investir pour son avenir',
                category: 'Investissement',
                icon: '📈',
                content: `
                    <h3>Pourquoi investir ?</h3>
                    <p>L'investissement vous permet de :</p>
                    <ul>
                        <li>Faire fructifier votre épargne</li>
                        <li>Préparer votre retraite</li>
                        <li>Générer des revenus passifs</li>
                        <li>Protéger votre patrimoine contre l'inflation</li>
                    </ul>

                    <h3>Types d'investissements</h3>
                    <ul>
                        <li><strong>Actions</strong> : parts d'entreprises, potentiel de croissance élevé</li>
                        <li><strong>Obligations</strong> : prêts à des entreprises ou États, revenus fixes</li>
                        <li><strong>Immobilier</strong> : propriété locative, plus-value potentielle</li>
                        <li><strong>Fonds communs</strong> : diversification automatique</li>
                    </ul>

                    <h3>Principes d'investissement</h3>
                    <ul>
                        <li><strong>Diversification</strong> : ne mettez pas tous vos œufs dans le même panier</li>
                        <li><strong>Horizon temporel</strong> : investissez selon vos objectifs</li>
                        <li><strong>Risque/rendement</strong> : plus le risque est élevé, plus le rendement potentiel l'est</li>
                        <li><strong>Investissement régulier</strong> : l'effet des intérêts composés</li>
                    </ul>
                `,
                readingTime: 7,
                difficulty: 'Avancé',
                tags: ['investissement', 'croissance', 'avenir']
            },
            {
                id: 5,
                title: 'Utiliser les services financiers en Côte d\'Ivoire',
                category: 'Services Financiers',
                icon: '🏦',
                content: `
                    <h3>Services bancaires</h3>
                    <p>Les banques ivoiriennes offrent :</p>
                    <ul>
                        <li>Comptes courants et d'épargne</li>
                        <li>Cartes bancaires (Visa, Mastercard)</li>
                        <li>Services de transfert d'argent</li>
                        <li>Crédits et prêts</li>
                    </ul>

                    <h3>Mobile Money</h3>
                    <p>Services populaires en Côte d'Ivoire :</p>
                    <ul>
                        <li><strong>Orange Money</strong> : transferts, paiements, recharge</li>
                        <li><strong>MTN Money</strong> : services similaires à Orange</li>
                        <li><strong>Moov Money</strong> : alternative aux deux premiers</li>
                    </ul>

                    <h3>Sécurité et bonnes pratiques</h3>
                    <ul>
                        <li>Ne partagez jamais vos codes PIN</li>
                        <li>Vérifiez vos relevés régulièrement</li>
                        <li>Utilisez des mots de passe forts</li>
                        <li>Méfiez-vous des arnaques par SMS</li>
                        <li>Gardez vos informations confidentielles</li>
                    </ul>
                `,
                readingTime: 5,
                difficulty: 'Intermédiaire',
                tags: ['services', 'sécurité', 'mobile money']
            }
        ];
    }

    /**
     * Charge la FAQ depuis le stockage
     */
    loadFAQ() {
        return [
            {
                id: 1,
                question: 'Comment créer un budget efficace ?',
                answer: 'Commencez par lister tous vos revenus et dépenses. Utilisez la règle 50/30/20 : 50% pour les besoins essentiels, 30% pour les envies, 20% pour l\'épargne. Suivez vos dépenses quotidiennement et ajustez votre budget chaque mois.',
                category: 'Budget'
            },
            {
                id: 2,
                question: 'Combien dois-je épargner chaque mois ?',
                answer: 'L\'objectif recommandé est d\'épargner au moins 10% de vos revenus. Commencez par un petit pourcentage et augmentez progressivement. L\'important est d\'épargner régulièrement, même de petites sommes.',
                category: 'Épargne'
            },
            {
                id: 3,
                question: 'Que faire si mes dépenses dépassent mes revenus ?',
                answer: 'Identifiez vos dépenses non essentielles et réduisez-les. Cherchez des sources de revenus supplémentaires. Établissez un budget strict et suivez-le rigoureusement. Considérez la consolidation de dettes si nécessaire.',
                category: 'Budget'
            },
            {
                id: 4,
                question: 'Qu\'est-ce qu\'un fonds d\'urgence ?',
                answer: 'Un fonds d\'urgence est une épargne destinée aux dépenses imprévues (réparations, frais médicaux, perte d\'emploi). L\'objectif est d\'avoir 3 à 6 mois de dépenses de côté.',
                category: 'Épargne'
            },
            {
                id: 5,
                question: 'Comment gérer mes dettes efficacement ?',
                answer: 'Faites l\'inventaire de toutes vos dettes. Priorisez les dettes à taux élevé. Négociez avec vos créanciers pour de meilleures conditions. Évitez de contracter de nouvelles dettes pendant le remboursement.',
                category: 'Dettes'
            },
            {
                id: 6,
                question: 'Quand dois-je commencer à investir ?',
                answer: 'Commencez à investir après avoir constitué votre fonds d\'urgence et remboursé vos dettes à taux élevé. Investissez régulièrement, même de petites sommes, pour bénéficier de l\'effet des intérêts composés.',
                category: 'Investissement'
            },
            {
                id: 7,
                question: 'Comment protéger mes informations financières ?',
                answer: 'Ne partagez jamais vos codes PIN ou mots de passe. Utilisez des mots de passe forts et différents pour chaque compte. Vérifiez régulièrement vos relevés. Méfiez-vous des arnaques par SMS ou email.',
                category: 'Sécurité'
            },
            {
                id: 8,
                question: 'Quelle est la différence entre épargne et investissement ?',
                answer: 'L\'épargne est de l\'argent mis de côté pour des objectifs à court terme (fonds d\'urgence, achats). L\'investissement vise la croissance à long terme et comporte des risques mais aussi des rendements potentiels plus élevés.',
                category: 'Investissement'
            }
        ];
    }

    /**
     * Charge les quiz depuis le stockage
     */
    loadQuiz() {
        return [
            {
                id: 1,
                title: 'Quiz : Les bases du budget',
                description: 'Testez vos connaissances sur la gestion de budget',
                category: 'Budget',
                icon: '📊',
                questions: [
                    {
                        text: 'Quelle est la règle recommandée pour répartir ses revenus ?',
                        options: [
                            '30/30/40',
                            '50/30/20',
                            '40/30/30',
                            '60/20/20'
                        ],
                        correctAnswer: 1,
                        explanation: 'La règle 50/30/20 recommande 50% pour les besoins essentiels, 30% pour les envies, 20% pour l\'épargne.'
                    },
                    {
                        text: 'Qu\'est-ce qu\'un budget ?',
                        options: [
                            'Un plan de dépenses illimitées',
                            'Un plan financier pour gérer revenus et dépenses',
                            'Un compte bancaire',
                            'Un prêt bancaire'
                        ],
                        correctAnswer: 1,
                        explanation: 'Un budget est un plan financier qui vous aide à gérer vos revenus et vos dépenses.'
                    },
                    {
                        text: 'Quelle est la première étape pour créer un budget ?',
                        options: [
                            'Dépenser sans compter',
                            'Lister tous ses revenus et dépenses',
                            'Ouvrir un compte bancaire',
                            'Demander un prêt'
                        ],
                        correctAnswer: 1,
                        explanation: 'La première étape est de lister tous vos revenus et dépenses pour avoir une vue d\'ensemble.'
                    }
                ],
                passingScore: 70
            },
            {
                id: 2,
                title: 'Quiz : L\'épargne intelligente',
                description: 'Testez vos connaissances sur l\'épargne',
                category: 'Épargne',
                icon: '💰',
                questions: [
                    {
                        text: 'Combien de mois de dépenses recommande-t-on pour un fonds d\'urgence ?',
                        options: [
                            '1 mois',
                            '3-6 mois',
                            '12 mois',
                            '2 mois'
                        ],
                        correctAnswer: 1,
                        explanation: 'L\'objectif recommandé est de 3 à 6 mois de dépenses pour un fonds d\'urgence.'
                    },
                    {
                        text: 'Quel pourcentage de ses revenus recommande-t-on d\'épargner ?',
                        options: [
                            '5%',
                            '10% minimum',
                            '20%',
                            '30%'
                        ],
                        correctAnswer: 1,
                        explanation: 'Il est recommandé d\'épargner au moins 10% de ses revenus.'
                    },
                    {
                        text: 'Où placer son fonds d\'urgence ?',
                        options: [
                            'Dans des actions risquées',
                            'Dans un compte d\'épargne liquide',
                            'Dans l\'immobilier',
                            'Dans des cryptomonnaies'
                        ],
                        correctAnswer: 1,
                        explanation: 'Le fonds d\'urgence doit être placé dans un compte d\'épargne liquide pour être accessible rapidement.'
                    }
                ],
                passingScore: 70
            }
        ];
    }

    /**
     * Charge les progrès de l'utilisateur
     */
    loadUserProgress() {
        try {
            const data = JSON.parse(localStorage.getItem('educationProgress'));
            return data || {
                readArticles: [],
                quizResults: [],
                lastActivity: null
            };
        } catch (e) {
            return {
                readArticles: [],
                quizResults: [],
                lastActivity: null
            };
        }
    }

    /**
     * Sauvegarde les progrès de l'utilisateur
     */
    saveUserProgress() {
        this.userProgress.lastActivity = new Date().toISOString();
        localStorage.setItem('educationProgress', JSON.stringify(this.userProgress));
    }
}

// Export pour utilisation dans d'autres fichiers
window.EducationManager = EducationManager; 