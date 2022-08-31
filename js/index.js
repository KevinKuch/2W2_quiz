/*******************************************************************************
    Sauvegarde et récupération des données (localStorage)
*******************************************************************************/
// [CODE LOCALSTORAGE]
// La variable historique qu'on mettra à jour durant le quiz.
// Initialement, elle aura la valeur retournée par recupererHistorique()
let historique = recupererHistorique();

/**
 * Sauvegarde l'historique dans localStorage.
 * @param {Array} historique Tableau contenant les objets d'historique de 
 * réponses au quiz
 */
function sauvegarderHistorique(historique) {
    window.localStorage.setItem('quiz-historique', JSON.stringify(historique));
}

/**
 * Récupère et retourne le tableau de l'historique de quiz de localStorage 
 * s'il y en a un (retourne un tableau vide sinon.)
 * @returns {Array} Tableau contenant l'historique du jeu (réponses au quiz)
 */
function recupererHistorique() {
    // On vérifie s'il y a un historique dans localStorage
    let histChaine = window.localStorage.getItem('quiz-historique');
    // On retourne l'historique décodé en JS ou un tableau vide
    return JSON.parse(histChaine) || [];
}

/************ Les variables du quiz *****************/
let noQuestion = 0;

//Score actuel
let score = 0;
//L'élément de la page pour indiquer le score actuel
let elmScore = document.querySelector("#score");
//Vérification du score et localStorage
let meilleurScore = localStorage.getItem("meilleurScoreJeu") || 0;
let elmMeilleurScore = document.querySelector("#meilleur-score").innerText = meilleurScore;

//Affiche les titres des questions et les choix
let titreQuestion = document.querySelector(".titre-question");
let lesChoixDeReponses = document.querySelector(".les-choix-de-reponse");

// Nombre de réponses justes
let nombreReponsesJustes = 0;

// Barre d'avancement du quiz
let barreAvancement = document.querySelector(".barre-avancement");
// Largeur de la barre à tout moment (initialement 0)
let largeurBarre = 0;

// Cible de largeur pour chaque étape d'avancement du quiz (calculée selon
// la progression dans les questions et le nombre total de questions)
let largeurCibleBarre = 0;

// Section contenant une question du quiz et sa position sur l'axe des X
let sectionQuestion = document.querySelector("section");
let positionX = 100;

//Zone quiz pour commencer
let zoneQuiz = document.querySelector(".quiz");

// Zone de fin du quiz
let zoneFin = document.querySelector(".fin");

// Bouton servant à recommencer le quiz
let btnRecommencer = document.querySelector('main.fin .btn-recommencer');

//Evenement pour le btn
btnRecommencer.addEventListener('click', recommencer);

/*///////////////////////////////////////////////////////////////////////
                            DÉBUT DU QUIZ
///////////////////////////////////////////////////////////////////////*/

//Gérer la fin de l'animation d'intro
let titreIntro = document.querySelector(".anim-titre-intro");
//Gestionnaire d'événement pour détecter la fin de l'animation d'intro
titreIntro.addEventListener("animationstart", afficherConsignePourDebuterLeJeu);

/**
 * Fonction pour afficher les consignes pour débuter le jeu
 * 
 * @param {Event} event : objet AnimationEvent de l'événement distribué 
 */
function afficherConsignePourDebuterLeJeu(event) {
    //afficher la consigne
    if (event.animationName == "intro-span") {
        //On affiche un message dans le pied de page
        let piedDePage = document.querySelector("footer");
        piedDePage.innerHTML = "<h1>Cliquer ici pour commencer</h1>";

        //On met un écouteur sur la fenêtre pour enlever l'intro et commencer le quiz
        piedDePage.addEventListener("click", commencerLeQuiz);
    }
}

//Enlever l'intro et commencer le quiz
function commencerLeQuiz() {
    //Enleve l'intro
    let intro = document.querySelector("main.intro");
    intro.parentNode.removeChild(intro);

    //Enleve le click qui gère le début du quiz
    window.removeEventListener("click", commencerLeQuiz);


    //Mettre visible le conteneur quiz
    zoneQuiz.style.display = "flex";

    //Afficher la 1er question
    afficherQuestion();
}


/******** Afficher la question courante ************/

function afficherQuestion() {

    //Récupère l'objet de la question en cours
    let objetQuestion = lesQuestions[noQuestion];
    //console.log(objetQuestion);
    //Affiche le text du titre
    titreQuestion.innerText = objetQuestion.titreQ;

    // Créer et afficher les balises des choix de réponse :
    // On commence par vider le conteneur des choix de réponses.
    lesChoixDeReponses.innerHTML = "";

    //Remplir les choix de réponses de la question
    let unChoix;
    for (let i = 0; i < objetQuestion.choix.length; i++) {
        //Créer la balise et mettre une class CSS
        unChoix = document.createElement("div");
        unChoix.classList.add("choix");

        //Valeur du choix des réponses
        unChoix.innerText = objetQuestion.choix[i];

        //Affectation dynamique de l'index des choix
        unChoix.indexChoix = i;

        //Écouteur pour la vérification des réponses
        unChoix.addEventListener("mousedown", verifierReponse);

        //Afficher le choix
        lesChoixDeReponses.appendChild(unChoix);
    }

    // Modifier la valeur de la position de la section sur l'axe des X 
    // pour son animation
    positionX = 100;

    //Partir la première requête pour l'animation de la section
    requestAnimationFrame(animerSection);

    // Fixer la largeur cible de la barre d'avancement (en proportion du nombre
    // de questions disponibles, et du numéro de la question à venir)
    largeurCibleBarre = (noQuestion + 1) / lesQuestions.length * 100;

    // Utiliser l'API RequestAnimationFrame pour démarrer l'animation de la 
    // barre d'avancement
    requestAnimationFrame(animerBarreAvancement);
}

/**
 * Animer la barre d'avancement
 */
function animerBarreAvancement() {

    //La largeur de la barre augmente de 1vw pour chaque question répondu
    largeurBarre++;
    barreAvancement.style.width = `${largeurBarre}vw`;

    
    // Si la largeur cible n'est pas encore atteinte, faire une autre requête 
    // d'animation à l'aide de RAF
    if (largeurBarre < largeurCibleBarre) {
        requestAnimationFrame(animerBarreAvancement);

    }

}

/**
 * Animer l'arrivée de la section contenant la question
 */
function animerSection() {
    //On décrémente la position de 2 (vw)
    positionX -= 2;
    sectionQuestion.style.transform = `translateX(${positionX}vw)`;

    //On part une autre requête  d'animation si la position n'est pas atteinte
    if (positionX > 0) {
        requestAnimationFrame(animerSection);
    }
}

/**
 * Fonction permettant de vérifier la réponse choisie et de gérer la suite
 * 
 * @param {object} event Informations sur l'événement MouseEvent distribué
 */
function verifierReponse(event) {

    lesChoixDeReponses.classList.toggle('desactiver');

    //Valider la réponse
    let reponseChoisi = event.target;
    let index = reponseChoisi.indexChoix;
    

    if (index == lesQuestions[noQuestion].bonneReponse) {
        reponseChoisi.classList.add("reponse-succes");
        score++;
    } else {
        reponseChoisi.classList.add("reponse-echec");
    }

    event.target.removeEventListener("click",verifierReponse);

    gererProchaineQuestion();

    //console.log(lesQuestions[noQuestion].bonneReponse);
}

/**
 * Fonction permettant de gérer l'affichage de la prochaine question
 * 
 */
function gererProchaineQuestion(event) {
    // On réactive les clics sur les choix de réponse
    lesChoixDeReponses.classList.toggle('desactiver');

    noQuestion++;

    //S'il reste une question on l'affiche, sinon c'est la fin du jeu...
    if (noQuestion < lesQuestions.length) {
        //On affiche la prochaine question
        afficherQuestion();
    } else {
        //C'est la fin du quiz
        afficherFinQuiz();
    }

}

/**
 * Fonction permettant d'afficher l'interface de la fin du quiz
 * 
 */
function afficherFinQuiz() {
    //On enlève le quiz de l'affichage et on affiche la fin du jeu
    document.querySelector(".quiz").style.display = "none";
    document.querySelector(".fin").style.display = "flex";

    // [CODE LOCALSTORAGE]
    // Obtenir la dernière version sauvegardée de l'historique
    elmScore.innerText = score;
    score++;

    meilleurScore = Math.max(meilleurScore, score);
    localStorage.setItem("meilleurScoreJeu", meilleurScore);

}

/**
 * Redémarrer le quiz (sans l'animation de début) en réinitialisant l'état de 
 * l'application.
 */
function recommencer() {
    noQuestion = 0;
    score = 0;

    largeurBarre = 0;
    largeurCibleBarre = 0;

    //On enlève le résultat et on réaffiche les questions du quiz
    zoneQuiz.style.display = "flex";
    zoneFin.style.display = "none";

    afficherQuestion();
}