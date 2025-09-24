import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClock, FaCheck, FaArrowRight, FaArrowLeft
} from 'react-icons/fa';
import {
  loadQuizByLevel,
  submitQuiz,
  selectCurrentQuiz,
  selectSubmissionStatus,
  clearCurrentQuiz,
  clearError,
} from '../store/slices/quizSlice';
import { APP_CONFIG } from '../config';
import '../styles/quiz-detail.scss';
import { selectPublicLevels } from '../store/slices/publicLevelsSlice';
import { v4 as uuidv4 } from 'uuid';

const QuizDetail = () => {
  const { levelId } = useParams();
  console.log('DEBUG FRONT levelId:', levelId);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector(state => state.ui.language);
  const { quiz, loading, error } = useSelector(selectCurrentQuiz);
  const submissionStatus = useSelector(selectSubmissionStatus);
  const { levels, loading: levelsLoading } = useSelector(selectPublicLevels);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [corrections, setCorrections] = useState({});
  const [showCorrection, setShowCorrection] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    // Réinitialiser l'erreur de soumission à l'ouverture du quiz
    dispatch(clearError());
  }, [dispatch, levelId]);

  // Soumettre le quiz (accepte un param answersParam pour garantir la fraîcheur)
  const handleSubmit = useCallback(async (answersParam) => {
    const answersToUse = answersParam || answers;
    setDebugInfo(
      prev => prev +
      `\nDEBUG SUBMIT - answers: ${JSON.stringify(answersToUse)}\n` +
      `DEBUG SUBMIT - questions: ${JSON.stringify(quiz.questions)}\n`
    );
    try {
      console.log('handleSubmit appelé');
      if (Object.keys(answersToUse).length < 1) {
        setGlobalError('Aucune réponse sélectionnée.');
        return;
      }
      console.log('answers state:', answersToUse);
      console.log('quiz.questions:', quiz?.questions);
      const answersArray = quiz.questions
        .filter(q => answersToUse[q.id || q._id] !== undefined)
        .map((q) => {
          const questionId = q.id || q._id;
          const selectedAnswerId = answersToUse[questionId];
          const answerList = (q.answers || []).map((a, idx) => ({ ...a, id: a.id || a._id || String(idx) }));
          const selectedAnswerIndex = answerList.findIndex(a => a.id === selectedAnswerId);
          return {
            questionId,
            selectedAnswer: Number(selectedAnswerIndex),
            timeSpent: 0
          };
        })
        .filter(a => a.selectedAnswer !== -1);
      console.log('DEBUG SUBMIT - answers:', answersToUse);
      console.log('DEBUG SUBMIT - answersArray:', answersArray);
      quiz.questions.forEach((q, i) => {
        console.log('DEBUG SUBMIT - question', i, 'id:', q.id || q._id, 'answers:', (q.answers || []).map((a, idx) => ({ id: a.id || a._id || String(idx), text: a.text })));
      });
      const selectedLevel = levels.find(lvl => lvl.key === quiz.level);
      const levelMongoId = selectedLevel ? selectedLevel._id : levelId;
      console.log('DEBUG levels:', levels);
      console.log('DEBUG quiz.level:', quiz.level);
      console.log('DEBUG levelMongoId:', levelMongoId);
      const now = new Date();
      const score = answersArray.reduce((acc, answer) => {
        const question = quiz.questions.find(q => q.id === answer.questionId);
        if (question && question.answers[answer.selectedAnswer]?.isCorrect) {
          return acc + 1;
        }
        return acc;
      }, 0);
      const totalTime = quiz.timeLimit * 60 - timeLeft;
      await dispatch(submitQuiz({
        sessionId: uuidv4(),
        levelId: levelMongoId,
        answers: answersArray,
        startTime: now.toISOString(),
        endTime: now.toISOString(),
        totalTime,
        score,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      }));
      setGlobalError(null);
    } catch (e) {
      setGlobalError('Erreur lors de la soumission du quiz. Détail : ' + (e?.message || e));
      console.error('Erreur lors de la soumission du quiz:', e);
    }
  }, [answers, dispatch, levelId, quiz, submissionStatus, levels, timeLeft]);

  // Charger le quiz au montage
  useEffect(() => {
    if (!levelsLoading && levels.length > 0) {
      dispatch(loadQuizByLevel(levelId));
    }
  }, [dispatch, levelId, levelsLoading, levels.length]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentQuiz());
    };
  }, [dispatch]);

  useEffect(() => {
    if (quiz && currentQuestionIndex >= quiz.questions.length) {
      handleSubmit();
    }
  }, [currentQuestionIndex, quiz, handleSubmit]);

  // Gérer le timer
  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, handleSubmit]);

  // Formater le temps
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Démarrer le quiz
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(quiz.timeLimit * 60);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Gérer la réponse à une question (utiliser mappedAnswers)
  const handleAnswer = (questionId, answerId) => {
    const key = questionId || (quiz.questions.find(q => q._id === questionId)?.id) || questionId;
    // Vérifier que l'id existe dans mappedAnswers
    const validId = mappedAnswers.find(a => a.id === answerId)?.id;
    setAnswers(prev => {
      const updated = { ...prev, [key]: validId };
      setDebugInfo(
        `DEBUG handleAnswer - mappedAnswers: ${JSON.stringify(mappedAnswers)}\n` +
        `DEBUG handleAnswer - questionId: ${questionId}, answerId: ${answerId}, validId: ${validId}\n` +
        `DEBUG handleAnswer - updated answers: ${JSON.stringify(updated)}`
      );
      if (quiz && quiz.questions.every(q => updated[q.id || q._id] !== undefined && updated[q.id || q._id] !== null)) {
        console.log('DEBUG handleAnswer - toutes les réponses sont présentes, soumission automatique');
        setTimeout(() => handleSubmit(updated), 300);
      }
      return updated;
    });
    setShowCorrection(true);
    const currentQ = quiz.questions.find(q => (q.id || q._id) === questionId);
    const correctAnswer = currentQ.answers.find(a => a.isCorrect);
    setCorrections(prev => ({
      ...prev,
      [questionId]: correctAnswer ? (correctAnswer.id || correctAnswer._id) : null
    }));
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setTimeout(() => {
        setShowCorrection(false);
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1000);
    }
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Revenir à la question précédente
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Animation des questions
  const questionVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // Redirection automatique après soumission
  useEffect(() => {
    console.log('DEBUG REDIRECT useEffect - submissionStatus:', submissionStatus);
    if (submissionStatus && submissionStatus.result && submissionStatus.result.id) {
      navigate(`/results/${submissionStatus.result.id}`);
    }
    if (submissionStatus && submissionStatus.result && submissionStatus.result._id) {
      navigate(`/results/${submissionStatus.result._id}`);
    }
  }, [submissionStatus, navigate]);

  // Vérification de sécurité après les hooks
  if (loading) {
    return (
      <div className="quiz-detail-loading">
        {language === 'fr' ? 'Chargement du quiz...' : 'جاري تحميل الاختبار...'}
      </div>
    );
  }

  if (error) {
    console.error('Erreur quiz:', error);
    return (
      <div className="quiz-detail-error">
        <p>{error}</p>
        <button onClick={() => navigate('/')}>
          {language === 'fr' ? "Retour Accueil" : 'العودة إلى الصفحة الرئيسية'}
        </button>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="quiz-detail-error">
        {language === 'fr'
          ? "Aucun quiz trouvé ou aucune question disponible pour ce niveau."
          : "لم يتم العثور على اختبار أو لا توجد أسئلة متاحة لهذا المستوى."}
        <button onClick={() => navigate('/')}>{language === 'fr' ? "Retour Accueil" : 'العودة إلى الصفحة الرئيسية'}</button>
      </div>
    );
  }

  // DEBUG : Afficher la structure réelle des questions reçues
  console.log('DEBUG quiz.questions:', quiz.questions);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  console.log('currentQuestion.answers:', currentQuestion.answers);

  // Patch critique : forcer le mapping des réponses pour garantir un id string
  const mappedAnswers = currentQuestion.answers.map((a, idx) => ({
    ...a,
    id: a.id || a._id || String(idx)
  }));

  if (!quizStarted) {
    return (
      <div className="quiz-detail-intro">
        <motion.div
          className="quiz-intro-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>{quiz.title[language]}</h1>
          
          <div className="quiz-info">
            <div className="info-item">
              <FaClock />
              <span>
                {quiz.timeLimit} {language === 'fr' ? 'minutes' : 'دقائق'}
              </span>
            </div>
            <div className="info-item">
              <span>
                {quiz.questions.length} {language === 'fr' ? 'questions' : 'أسئلة'}
              </span>
            </div>
            <div className="info-item">
              <span>
                {APP_CONFIG.quizLevels[quiz.level][language]}
              </span>
            </div>
          </div>

          <div className="quiz-description">
            <h2>
              {language === 'fr' ? 'Description' : 'الوصف'}
            </h2>
            <p>{quiz.description[language]}</p>
          </div>

          <div className="quiz-instructions">
            <h2>
              {language === 'fr' ? 'Instructions' : 'التعليمات'}
            </h2>
            <ul>
              <li>
                {language === 'fr'
                  ? 'Vous avez un temps limité pour répondre à toutes les questions'
                  : 'لديك وقت محدد للإجابة على جميع الأسئلة'
                }
              </li>
              <li>
                {language === 'fr'
                  ? 'Vous pouvez naviguer entre les questions'
                  : 'يمكنك التنقل بين الأسئلة'
                }
              </li>
              <li>
                {language === 'fr'
                  ? 'Vous devez répondre à toutes les questions pour soumettre le quiz'
                  : 'يجب عليك الإجابة على جميع الأسئلة لتقديم الاختبار'
                }
              </li>
            </ul>
          </div>

          <button className="start-quiz-button" onClick={handleStartQuiz}>
            {language === 'fr' ? 'Commencer le quiz' : 'ابدأ الاختبار'}
          </button>
        </motion.div>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / quiz.questions.length) * 100;

  // DEBUG : Afficher l'état des réponses et la logique de désactivation du bouton Terminer
  console.log('DEBUG answers:', answers);
  console.log('DEBUG questions:', quiz.questions.map(q => q.id));
  console.log('DEBUG disabled:', quiz.questions.some(q => answers[q.id] === undefined || answers[q.id] === null));

  return (
    <div className="quiz-detail-container">
      {globalError && (
        <div style={{background:'#ffdddd',color:'#b00',padding:'1rem',marginBottom:'1rem',border:'1px solid #b00',borderRadius:'6px',fontWeight:'bold'}}>
          {globalError}
        </div>
      )}
      <div className="quiz-header">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            {language === 'fr'
              ? `Question ${currentQuestionIndex + 1} sur ${quiz.questions.length}`
              : `سؤال ${currentQuestionIndex + 1} من ${quiz.questions.length}`
            }
          </span>
        </div>

        <div className="quiz-timer">
          <FaClock />
          <span className={timeLeft <= 60 ? 'warning' : ''}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          className="question-container"
          variants={questionVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <h2 className="question-text">
            {currentQuestion.text && currentQuestion.text[language]}
          </h2>

          <div className="answers-list">
            {mappedAnswers.map((answer) => {
              const isSelected = answers[currentQuestion.id || currentQuestion._id] === answer.id || mappedAnswers.length === 1;
              const isCorrect = answer.isCorrect;
              const isAnswered = answers[currentQuestion.id || currentQuestion._id] !== undefined;
              return (
                <button
                  key={answer.id}
                  className={`answer-button ${
                    isSelected ? 'selected' : ''
                  } ${
                    showCorrection && isAnswered
                      ? isCorrect
                        ? 'correct'
                        : isSelected
                          ? 'incorrect'
                          : ''
                      : ''
                  }`}
                  onClick={() => handleAnswer(currentQuestion.id || currentQuestion._id, answer.id)}
                >
                  <span className="answer-text">
                    {answer.text && answer.text[language]}
                  </span>
                  {showCorrection && isAnswered && isCorrect && <FaCheck className="check-icon" />}
                  {showCorrection && isAnswered && isSelected && !isCorrect && <FaArrowRight className="check-icon" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="quiz-navigation">
        <button
          className="nav-button"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <FaArrowLeft />
          {language === 'fr' ? 'Précédent' : 'السابق'}
        </button>
        {/* Le bouton Terminer est supprimé, la soumission est automatique */}
        {currentQuestionIndex < quiz.questions.length - 1 && (
          <button
            className="nav-button"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === quiz.questions.length - 1}
          >
            {language === 'fr' ? 'Suivant' : 'التالي'}
            <FaArrowRight />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="confirmation-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-content">
              <h3>
                {language === 'fr'
                  ? 'Quiz incomplet'
                  : 'اختبار غير مكتمل'
                }
              </h3>
              <p>
                {language === 'fr'
                  ? 'Vous n\'avez pas répondu à toutes les questions. Voulez-vous vraiment soumettre le quiz ?'
                  : 'لم تجب على جميع الأسئلة. هل تريد حقًا تقديم الاختبار؟'
                }
              </p>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowConfirmation(false)}
                >
                  {language === 'fr' ? 'Annuler' : 'إلغاء'}
                </button>
                <button
                  className="confirm-button"
                  onClick={() => {
                    setShowConfirmation(false);
                    handleSubmit();
                  }}
                >
                  {language === 'fr' ? 'Soumettre' : 'تقديم'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug visuel */}
      <pre style={{ background: '#eee', color: '#c00', padding: 8, fontSize: 12 }}>{debugInfo}</pre>
      {submissionStatus && submissionStatus.error && (
        <div style={{ color: 'red', fontWeight: 'bold', marginTop: 8 }}>
          Erreur backend : {submissionStatus.error}
          {submissionStatus.stack && (
            <pre style={{ color: '#a00', fontSize: 11, background: '#fee', marginTop: 4 }}>{submissionStatus.stack}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizDetail; 