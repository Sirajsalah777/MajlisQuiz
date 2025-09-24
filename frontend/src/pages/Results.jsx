import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaQrcode, FaShare, FaCheck, FaTimes, FaClock, FaChartBar } from 'react-icons/fa';
import QRCode from 'qrcode.react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  loadQuizResult,
  selectCurrentResult,
  clearCurrentQuiz,
} from '../store/slices/quizSlice';
import { APP_CONFIG } from '../config';
import '../styles/results.scss';

const Results = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector(state => state.ui.language);
  const result = useSelector(selectCurrentResult);
  const loading = useSelector(state => state.quiz.loading);
  const error = useSelector(state => state.quiz.error);
  const [showQRCode, setShowQRCode] = useState(false);

  // Charger les résultats au montage
  useEffect(() => {
    dispatch(loadQuizResult(resultId));
    return () => dispatch(clearCurrentQuiz());
  }, [dispatch, resultId]);

  // Générer le PDF des résultats
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // En-tête
    doc.setFontSize(24);
    doc.setTextColor(APP_CONFIG.colors.primary);
    doc.text(
      language === 'fr' ? 'Résultats du Quiz' : 'نتائج الاختبار',
      margin,
      margin + 10
    );

    // Utiliser la même logique que dans le rendu React
    const quizResult = result.result || result;

    // Informations du quiz
    const quizTitle = safeLang(quizResult.quiz?.title) || '-';
    const quizLevel = quizResult.quiz && quizResult.quiz.level && APP_CONFIG.quizLevels[quizResult.quiz.level]
      ? APP_CONFIG.quizLevels[quizResult.quiz.level][language]
      : (quizResult.quiz?.level || '-');
    const quizDate = quizResult.createdAt
      ? new Date(quizResult.createdAt).toLocaleDateString()
      : (quizResult.endTime ? new Date(quizResult.endTime).toLocaleDateString() : '-');
    const quizScore = (typeof quizResult.score === 'number' && Array.isArray(quizResult.answers))
      ? `${quizResult.score}/${quizResult.answers.length}`
      : '-';

    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text([
      `${language === 'fr' ? 'Quiz' : 'الاختبار'}: ${quizTitle}`,
      `${language === 'fr' ? 'Niveau' : 'المستوى'}: ${quizLevel}`,
      `${language === 'fr' ? 'Date' : 'التاريخ'}: ${quizDate}`,
      `${language === 'fr' ? 'Score' : 'النتيجة'}: ${quizScore}`
    ], margin, margin + 30);

    // Tableau des réponses
    doc.autoTable({
      startY: margin + 60,
      head: [[
        language === 'fr' ? 'Question' : 'السؤال',
        language === 'fr' ? 'Votre réponse' : 'إجابتك',
        language === 'fr' ? 'Bonne réponse' : 'الإجابة الصحيحة',
        language === 'fr' ? 'Statut' : 'الحالة'
      ]],
      body: Array.isArray(quizResult.answers) ? quizResult.answers.map(answer => {
        // Trouver la bonne réponse
        const correct = Array.isArray(answer.question.answers)
          ? answer.question.answers.find(a => a.isCorrect)
          : null;
        // Trouver la réponse sélectionnée
        const selected = Array.isArray(answer.question.answers) && typeof answer.selectedAnswer === 'number'
          ? answer.question.answers[answer.selectedAnswer]
          : null;
        return [
          safeLang(answer.question && answer.question.text),
          safeLang(selected && selected.text),
          safeLang(correct && correct.text),
          answer.isCorrect
            ? (language === 'fr' ? 'Correct' : 'صحيح')
            : (language === 'fr' ? 'Incorrect' : 'خاطئ')
        ];
      }) : [],
      theme: 'grid',
      headStyles: {
        fillColor: APP_CONFIG.colors.primary,
        textColor: 255,
        halign: 'center'
      },
      styles: {
        cellPadding: 5,
        fontSize: 10,
        halign: language === 'ar' ? 'right' : 'left'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // QR Code
    const qrCodeElement = document.querySelector('.qr-code canvas');
    if (qrCodeElement) {
      const qrCodeDataUrl = qrCodeElement.toDataURL();
      doc.addImage(qrCodeDataUrl, 'PNG', margin, doc.lastAutoTable.finalY + 20, 40, 40);
    }

    // Texte du QR Code
    doc.setFontSize(10);
    doc.text(
      language === 'fr'
        ? 'Scannez pour voir les résultats en ligne'
        : 'امسح لرؤية النتائج عبر الإنترنت',
      margin + 45,
      doc.lastAutoTable.finalY + 40
    );

    // Pied de page
    const footerText = language === 'fr'
      ? 'Chambre des Conseillers - Quiz sur le Parlement'
      : 'مجلس المستشارين - اختبار حول البرلمان';
    doc.setFontSize(8);
    doc.text(
      footerText,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );

    // Sauvegarder le PDF
    doc.save(`quiz-results-${resultId}.pdf`);
  };

  // Formater le temps
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!result) {
    return <div style={{color: 'orange'}}>Aucun résultat reçu du backend.</div>;
  }
  const quizResult = result.result || result;

  // Corrigé : calcul du score en pourcentage
  const calculateScore = () => {
    if (!Array.isArray(quizResult.answers) || quizResult.answers.length === 0) return 0;
    if (quizResult.score > quizResult.answers.length) return quizResult.score;
    return Math.round((quizResult.score / quizResult.answers.length) * 100);
  };

  // Déterminer le niveau de performance
  const getPerformanceLevel = () => {
    const score = calculateScore();
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'bon';
    if (score >= 60) return 'moyen';
    return 'à améliorer';
  };

  // Utilitaire pour accès sécurisé aux traductions
  const safeLang = (obj) => (obj && typeof obj === 'object' && obj[language]) ? obj[language] : '';

  // Affichage normal du composant
  const performanceLevel = getPerformanceLevel();
  const scorePercentage = calculateScore();

  console.log('DEBUG FRONT result:', result);
  console.log('DEBUG FRONT result.quiz:', result?.quiz);
  console.log('DEBUG loading:', loading, 'error:', error, 'result:', result);
  console.log('DEBUG FRONT result:', result);

  if (loading) {
    return <div style={{color: 'blue'}}>Chargement des résultats...</div>;
  }

  if (error) {
    return <div style={{color: 'red'}}>Erreur : {error}</div>;
  }

  return (
    <>
      <motion.div
        className="results-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="results-header">
          <h1>
            {language === 'fr' ? 'Résultats du Quiz' : 'نتائج الاختبار'}
          </h1>

          <div className="results-actions">
            <button className="action-button" onClick={generatePDF} disabled={loading || !quizResult || !quizResult.quiz}>
              <FaDownload />
              {language === 'fr' ? 'Télécharger PDF' : 'تحميل PDF'}
            </button>
            <button
              className="action-button"
              onClick={() => setShowQRCode(!showQRCode)}
            >
              <FaQrcode />
              {language === 'fr' ? 'Afficher QR Code' : 'عرض رمز QR'}
            </button>
            <button
              className="action-button"
              onClick={() => {
                navigator.share({
                  title: quizResult.quiz.title[language],
                  text: language === 'fr'
                    ? `J'ai obtenu ${calculateScore()}% au quiz "${quizResult.quiz.title[language]}"`
                    : `حصلت على ${calculateScore()}% في اختبار "${quizResult.quiz.title[language]}"`,
                  url: window.location.href,
                });
              }}
            >
              <FaShare />
              {language === 'fr' ? 'Partager' : 'مشاركة'}
            </button>
          </div>
        </div>

        <div className="results-content">
          <div className="results-summary">
            <div className="quiz-info">
              <h2>{safeLang(quizResult.quiz?.title)}</h2>
              <div className="info-items">
                <div className="info-item">
                  <FaChartBar />
                  <span>
                    {language === 'fr'
                      ? `${quizResult.score} ${quizResult.score === 1 ? 'réponse correcte' : 'réponses correctes'}`
                      : `${quizResult.score} ${quizResult.score === 1 ? 'إجابة صحيحة' : 'إجابات صحيحة'}`
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="score-card">
              <div className="score-circle">
                <svg viewBox="0 0 36 36" className="score-chart">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={APP_CONFIG.colors.primary}
                    strokeWidth="3"
                    strokeDasharray={`${calculateScore()}, 100`}
                  />
                </svg>
                <div className="score-text">
                  <span className="score-percentage">{calculateScore()}%</span>
                  <span className="score-label">
                    {language === 'fr' ? 'Score' : 'النتيجة'}
                  </span>
                </div>
              </div>
              <div className="performance-level">
                {language === 'fr'
                  ? `Niveau: ${performanceLevel}`
                  : `المستوى: ${performanceLevel}`
                }
              </div>
            </div>
          </div>

          <div className="answers-review">
            <h2>
              {language === 'fr' ? 'Révision des réponses' : 'مراجعة الإجابات'}
            </h2>
            <div className="answers-list">
              {Array.isArray(quizResult.answers) && quizResult.answers.map((answer, index) => (
                <div
                  key={answer.question._id || answer.question.id || index}
                  className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="answer-header">
                    <span className="question-number">
                      {language === 'fr'
                        ? `Question ${index + 1}`
                        : `سؤال ${index + 1}`
                      }
                    </span>
                    {answer.isCorrect ? (
                      <FaCheck className="status-icon correct" />
                    ) : (
                      <FaTimes className="status-icon incorrect" />
                    )}
                  </div>
                  <p className="question-text">
                    {safeLang(answer.question && answer.question.text)}
                  </p>
                  <div className="answer-details">
                    <div className="answer-row">
                      <span className="answer-label">
                        {language === 'fr' ? 'Votre réponse' : 'إجابتك'}
                      </span>
                      <span className="answer-text">
                        {safeLang(answer.selectedAnswer && answer.selectedAnswer.text)}
                      </span>
                    </div>
                    {!answer.isCorrect && (
                      <div className="answer-row">
                        <span className="answer-label">
                          {language === 'fr' ? 'Bonne réponse' : 'الإجابة الصحيحة'}
                        </span>
                        <span className="answer-text correct">
                          {safeLang(answer.correctAnswer && answer.correctAnswer.text)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {showQRCode && (
              <motion.div
                className="qr-code-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="qr-code-content">
                  <h3>
                    {language === 'fr'
                      ? 'Scannez pour voir les résultats'
                      : 'امسح لرؤية النتائج'
                    }
                  </h3>
                  <div className="qr-code">
                    <QRCode
                      value={`${window.location.origin}/results/${resultId}`}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>
                  <button
                    className="close-button"
                    onClick={() => setShowQRCode(false)}
                  >
                    {language === 'fr' ? 'Fermer' : 'إغلاق'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="results-footer">
          <button
            className="back-button"
            onClick={() => navigate('/')}
          >
            {language === 'fr' ? "Retour à l'accueil" : 'العودة إلى الصفحة الرئيسية'}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Results; 