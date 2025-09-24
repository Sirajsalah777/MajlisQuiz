import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaCheck, FaTimes, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import quizApi from '../api/quiz.api';
import { setLoading, addNotification } from '../store/slices/uiSlice';
import '../styles/quiz.scss';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector(state => state.ui.language);

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger le quiz
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        dispatch(setLoading(true));
        const data = await quizApi.fetchQuiz(quizId);
        setQuiz(data);
        setTimeLeft(data.timeLimit * 60); // Convertir en secondes
        setAnswers(data.questions.reduce((acc, q) => ({ ...acc, [q._id]: null }), {}));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: language === 'fr' ? 'Erreur lors du chargement du quiz' : 'خطأ في تحميل الاختبار'
        }));
        navigate('/');
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadQuiz();
  }, [quizId, dispatch, navigate, language]);

  // Gérer le timer
  useEffect(() => {
    if (!timeLeft || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quiz]);

  // Formater le temps restant
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Gérer la sélection d'une réponse
  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  // Gérer la navigation entre les questions
  const handleQuestionNavigation = (direction) => {
    if (direction === 'next' && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Soumettre le quiz
  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));

      // 1. Vérification de l'objet answers
      console.log('1. answers (état brut):', answers);

      const unansweredQuestions = Object.entries(answers)
        .filter(([_, answer]) => answer === null)
        .length;

      if (unansweredQuestions > 0) {
        const confirmSubmit = window.confirm(
          language === 'fr'
            ? `Il reste ${unansweredQuestions} question(s) sans réponse. Voulez-vous vraiment soumettre ?`
            : `باقي ${unansweredQuestions} سؤال(ات) بدون إجابة. هل تريد التقديم حقًا؟`
        );

        if (!confirmSubmit) {
          setIsSubmitting(false);
          dispatch(setLoading(false));
          return;
        }
      }

      // 2. Construction du tableau answersArray attendu par le backend
      const answersArray = quiz.questions
        .filter(q => answers[q.id || q._id] !== null && answers[q.id || q._id] !== undefined)
        .map((q) => {
          const questionId = q.id || q._id;
          const selectedAnswerId = answers[questionId];
          const selectedAnswerIndex = q.answers.findIndex(a => (a.id || a._id) === selectedAnswerId);
          return {
            questionId,
            selectedAnswer: selectedAnswerIndex,
            timeSpent: 0 // À améliorer si tu veux tracker le temps par question
          };
        })
        .filter(a => a.selectedAnswer !== -1);
      console.log('2. answersArray (tableau envoyé au backend):', answersArray);

      // 3. Calcul du score
      const score = answersArray.reduce((acc, answer) => {
        const question = quiz.questions.find(q => q._id === answer.questionId);
        if (question && question.answers[answer.selectedAnswer]?.isCorrect) {
          return acc + 1;
        }
        return acc;
      }, 0);
      console.log('3. score (calculé):', score);

      // 4. Calcul du temps total
      const totalTime = quiz.timeLimit * 60 - timeLeft;
      console.log('4. totalTime (calculé):', totalTime);

      // 5. Vérification finale avant envoi
      if (!Array.isArray(answersArray) || answersArray.length === 0) {
        console.error('ERREUR: answersArray est vide. Le backend refusera la soumission.');
      }
      if (typeof score !== 'number' || typeof totalTime !== 'number') {
        console.error('ERREUR: score ou totalTime ne sont pas des nombres.');
      }

      // 6. Appel direct à quizApi.submitQuiz pour envoyer tous les champs requis
      const now = new Date();
      const result = await quizApi.submitQuiz(
        Date.now().toString(), // sessionId
        quiz.levelId || quiz.level?._id || quiz.level || quizId, // levelId (à adapter selon la structure)
        answersArray,
        now.toISOString(), // startTime (à améliorer si tu veux le vrai début)
        now.toISOString(), // endTime
        {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        totalTime,
        score
      );
      navigate(`/results/${result._id}`);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: language === 'fr' ? 'Erreur lors de la soumission du quiz' : 'خطأ في تقديم الاختبار'
      }));
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  if (!quiz) {
    return (
      <div className="quiz-loading">
        {language === 'fr' ? 'Chargement du quiz...' : 'جاري تحميل الاختبار...'}
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h1>{quiz.title[language]}</h1>
          <div className="quiz-meta">
            <span className="level">{quiz.level[language]}</span>
            <span className="question-count">
              {language === 'fr' 
                ? `Question ${currentQuestionIndex + 1} sur ${quiz.questions.length}`
                : `سؤال ${currentQuestionIndex + 1} من ${quiz.questions.length}`
              }
            </span>
          </div>
        </div>
        <div className="timer">
          <FaClock />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="question-container"
        >
          <h2 className="question-text">
            {currentQuestion.text[language]}
          </h2>

          <div className="answers-list">
            {currentQuestion.answers.map((answer) => (
              <motion.button
                key={answer.id || answer._id}
                className={`answer-option ${answers[currentQuestion.id || currentQuestion._id] === (answer.id || answer._id) ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestion.id || currentQuestion._id, answer.id || answer._id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="answer-text">{answer.text[language]}</span>
                {answers[currentQuestion.id || currentQuestion._id] === (answer.id || answer._id) && (
                  <FaCheck className="check-icon" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="quiz-navigation">
        <button
          className="nav-button prev"
          onClick={() => handleQuestionNavigation('prev')}
          disabled={currentQuestionIndex === 0}
        >
          <FaArrowLeft />
          {language === 'fr' ? 'Précédent' : 'السابق'}
        </button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            className="nav-button submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (language === 'fr' ? 'Soumission...' : 'جاري التقديم...')
              : (language === 'fr' ? 'Soumettre' : 'تقديم')
            }
          </button>
        ) : (
          <button
            className="nav-button next"
            onClick={() => handleQuestionNavigation('next')}
          >
            {language === 'fr' ? 'Suivant' : 'التالي'}
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz; 