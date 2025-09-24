import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import {
  loadQuestions,
  loadLevels,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addLevel,
  updateLevel,
  deleteLevel,
  selectQuestions,
  selectLevels,
  selectAdminLoading,
} from '../../store/slices/adminSlice';
import '../../styles/admin/dashboard.scss';

const Dashboard = () => {
  const dispatch = useDispatch();
  const language = useSelector(state => state.ui.language);
  const { questions, loading } = useSelector(state => ({
    questions: selectQuestions(state),
    loading: selectAdminLoading(state),
  }));
  const { levels } = useSelector(selectLevels);

  const [activeTab, setActiveTab] = useState('questions');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editingLevelData, setEditingLevelData] = useState(null);
  const [editingQuestionData, setEditingQuestionData] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    text: { fr: '', ar: '' },
    answers: [
      { text: { fr: '', ar: '' }, isCorrect: false },
      { text: { fr: '', ar: '' }, isCorrect: false },
      { text: { fr: '', ar: '' }, isCorrect: false },
      { text: { fr: '', ar: '' }, isCorrect: false },
    ],
    level: '',
  });
  const [newLevel, setNewLevel] = useState({
    name: { fr: '', ar: '' },
    description: { fr: '', ar: '' },
    order: 0,
  });
  const [showQuestionsList, setShowQuestionsList] = useState(true);
  const [openAnswers, setOpenAnswers] = useState({}); // état pour les réponses dépliées

  useEffect(() => {
    dispatch(loadQuestions());
    dispatch(loadLevels());
  }, [dispatch]);

  const handleAddQuestion = async () => {
    if (!newQuestion.text.fr || !newQuestion.text.ar || !newQuestion.level) {
      console.log("Validation échouée: champs requis manquants", newQuestion);
      return;
    }
    const hasCorrectAnswer = newQuestion.answers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      console.log("Validation échouée: aucune réponse correcte sélectionnée");
      return;
    }

    console.log("Tentative d'ajout de question avec les données:", newQuestion);
    try {
      const resultAction = await dispatch(addQuestion(newQuestion));
      if (addQuestion.fulfilled.match(resultAction)) {
        console.log("Question ajoutée avec succès:", resultAction.payload);
        setNewQuestion({
          text: { fr: '', ar: '' },
          answers: [
            { text: { fr: '', ar: '' }, isCorrect: false },
            { text: { fr: '', ar: '' }, isCorrect: false },
            { text: { fr: '', ar: '' }, isCorrect: false },
            { text: { fr: '', ar: '' }, isCorrect: false },
          ],
          level: '',
        });
      } else {
        // console.error("Échec de l'ajout de la question:", resultAction.payload || resultAction.error);
      }
    } catch (error) {
      // console.error("Erreur inattendue lors de l'ajout de la question:", error);
    }
  };

  const handleUpdateQuestion = (question) => {
    if (!question.text.fr || !question.text.ar || !question.level) {
      return;
    }
    const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      return;
    }
    dispatch(updateQuestion(question));
    setEditingQuestion(null);
    setEditingQuestionData(null);
  };

  const handleAddLevel = () => {
    if (!newLevel.name.fr || !newLevel.name.ar) {
      return;
    }
    dispatch(addLevel(newLevel));
    setNewLevel({
      name: { fr: '', ar: '' },
      description: { fr: '', ar: '' },
      order: levels.length,
    });
  };

  const handleUpdateLevel = (level) => {
    if (!level.name.fr || !level.name.ar) {
      return;
    }
    dispatch(updateLevel(level));
    setEditingLevel(null);
    setEditingLevelData(null);
  };

  const handleEditLevelClick = (level) => {
    setEditingLevel(level._id);
    setEditingLevelData(level);
  };

  const handleEditQuestionClick = (question) => {
    setEditingQuestion(question._id);
    const formattedQuestion = {
      ...question,
      text: {
        fr: question.text?.fr || '',
        ar: question.text?.ar || '',
      },
      answers: question.answers?.map(answer => ({
        ...answer,
        text: {
          fr: answer.text?.fr || '',
          ar: answer.text?.ar || '',
        },
      })) || [],
    };
    setEditingQuestionData(formattedQuestion);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        {language === 'fr' ? 'Chargement...' : 'جاري التحميل...'}
      </div>
    );
  }

  return (
    <motion.div
      className="admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="dashboard-title">
        {language === 'fr' ? 'Administration' : 'الإدارة'}
      </h1>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          {language === 'fr' ? 'Questions' : 'الأسئلة'}
        </button>
        <button
          className={`tab-button ${activeTab === 'levels' ? 'active' : ''}`}
          onClick={() => setActiveTab('levels')}
        >
          {language === 'fr' ? 'Niveaux' : 'المستويات'}
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="questions-section">
          <div className="section-header">
            <h2>{language === 'fr' ? 'Gestion des questions' : 'إدارة الأسئلة'}</h2>
            <button className="add-button" onClick={() => setEditingQuestion('new')}>
              <FaPlus /> {language === 'fr' ? 'Nouvelle question' : 'سؤال جديد'}
            </button>
          </div>

          {editingQuestion === 'new' && (
            <div className="edit-form">
              <div className="form-group">
                <label>{language === 'fr' ? 'Question (FR)' : 'السؤال (FR)'}</label>
                <input
                  type="text"
                  value={newQuestion.text.fr}
                  onChange={(e) => setNewQuestion({
                    ...newQuestion,
                    text: { ...newQuestion.text, fr: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label>{language === 'fr' ? 'Question (AR)' : 'السؤال (AR)'}</label>
                <input
                  type="text"
                  value={newQuestion.text.ar}
                  onChange={(e) => setNewQuestion({
                    ...newQuestion,
                    text: { ...newQuestion.text, ar: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label>{language === 'fr' ? 'Niveau' : 'المستوى'}</label>
                <select
                  value={newQuestion.level}
                  onChange={(e) => setNewQuestion({
                    ...newQuestion,
                    level: e.target.value
                  })}
                >
                  <option value="">{language === 'fr' ? 'Sélectionner un niveau' : 'اختر مستوى'}</option>
                  {levels.map(level => (
                    <option key={level._id} value={level._id}>
                      {level.name[language]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="answers-group">
                <h3>{language === 'fr' ? 'Réponses' : 'الإجابات'}</h3>
                {newQuestion.answers.map((answer, index) => (
                  <div key={index} className="answer-input">
                    <input
                      type="text"
                      placeholder={language === 'fr' ? `Réponse ${index + 1} (FR)` : `الإجابة ${index + 1} (FR)`}
                      value={answer.text.fr}
                      onChange={(e) => {
                        const newAnswers = [...newQuestion.answers];
                        newAnswers[index] = {
                          ...newAnswers[index],
                          text: { ...newAnswers[index].text, fr: e.target.value }
                        };
                        setNewQuestion({ ...newQuestion, answers: newAnswers });
                      }}
                    />
                    <input
                      type="text"
                      placeholder={language === 'fr' ? `Réponse ${index + 1} (AR)` : `الإجابة ${index + 1} (AR)`}
                      value={answer.text.ar}
                      onChange={(e) => {
                        const newAnswers = [...newQuestion.answers];
                        newAnswers[index] = {
                          ...newAnswers[index],
                          text: { ...newAnswers[index].text, ar: e.target.value }
                        };
                        setNewQuestion({ ...newQuestion, answers: newAnswers });
                      }}
                    />
                    <label className="correct-answer">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={answer.isCorrect}
                        onChange={() => {
                          const newAnswers = newQuestion.answers.map((a, i) => ({
                            ...a,
                            isCorrect: i === index
                          }));
                          setNewQuestion({ ...newQuestion, answers: newAnswers });
                        }}
                      />
                      {language === 'fr' ? 'Bonne réponse' : 'إجابة صحيحة'}
                    </label>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button className="save-button" onClick={handleAddQuestion}>
                  <FaSave /> {language === 'fr' ? 'Enregistrer' : 'حفظ'}
                </button>
                <button className="cancel-button" onClick={() => setEditingQuestion(null)}>
                  <FaTimes /> {language === 'fr' ? 'Annuler' : 'إلغاء'}
                </button>
              </div>
            </div>
          )}

          {/* BOUTON AFFICHER/MASQUER LES QUESTIONS */}
          <button
            className="toggle-questions-list add-button"
            onClick={() => setShowQuestionsList((prev) => !prev)}
          >
            {showQuestionsList
              ? (language === 'fr' ? 'Masquer les questions' : 'إخفاء الأسئلة')
              : (language === 'fr' ? 'Afficher les questions' : 'عرض الأسئلة')}
          </button>

          {/* LISTE DES QUESTIONS */}
          {showQuestionsList && (
            <div className="questions-list">
              {questions.map(question => (
                <div key={question._id} className="question-card">
                  {editingQuestion === question._id ? (
                    <div className="edit-form">
                      <h3>{language === 'fr' ? 'Modifier la question' : 'تعديل السؤال'}</h3>
                      <div className="form-group">
                        <label>{language === 'fr' ? 'Question (FR)' : 'السؤال (FR)'}</label>
                        <input
                          type="text"
                          value={editingQuestionData?.text?.fr || ''}
                          onChange={(e) =>
                            setEditingQuestionData({
                              ...editingQuestionData,
                              text: { ...editingQuestionData?.text, fr: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>{language === 'fr' ? 'Question (AR)' : 'السؤال (AR)'}</label>
                        <input
                          type="text"
                          value={editingQuestionData?.text?.ar || ''}
                          onChange={(e) =>
                            setEditingQuestionData({
                              ...editingQuestionData,
                              text: { ...editingQuestionData?.text, ar: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>{language === 'fr' ? 'Niveau' : 'المستوى'}</label>
                        <select
                          value={editingQuestionData?.level || ''}
                          onChange={(e) =>
                            setEditingQuestionData({
                              ...editingQuestionData,
                              level: e.target.value,
                            })
                          }
                        >
                          <option value="">{language === 'fr' ? 'Sélectionner un niveau' : 'اختر مستوى'}</option>
                          {levels.map(level => (
                            <option key={level._id} value={level._id}>
                              {level.name[language]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="answers-group">
                        <h3>{language === 'fr' ? 'Réponses' : 'الإجابات'}</h3>
                        {editingQuestionData?.answers?.map((answer, index) => (
                          <div key={index} className="answer-input">
                            <input
                              type="text"
                              placeholder={language === 'fr' ? `Réponse ${index + 1} (FR)` : `الإجابة ${index + 1} (FR)`}
                              value={answer.text?.fr || ''}
                              onChange={(e) => {
                                const newAnswers = [...editingQuestionData.answers];
                                newAnswers[index] = {
                                  ...newAnswers[index],
                                  text: { ...newAnswers[index].text, fr: e.target.value },
                                };
                                setEditingQuestionData({ ...editingQuestionData, answers: newAnswers });
                              }}
                            />
                            <input
                              type="text"
                              placeholder={language === 'fr' ? `Réponse ${index + 1} (AR)` : `الإجابة ${index + 1} (AR)`}
                              value={answer.text?.ar || ''}
                              onChange={(e) => {
                                const newAnswers = [...editingQuestionData.answers];
                                newAnswers[index] = {
                                  ...newAnswers[index],
                                  text: { ...newAnswers[index].text, ar: e.target.value },
                                };
                                setEditingQuestionData({ ...editingQuestionData, answers: newAnswers });
                              }}
                            />
                            <label className="correct-answer">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={answer.isCorrect}
                                onChange={() => {
                                  const newAnswers = editingQuestionData.answers.map((a, i) => ({
                                    ...a,
                                    isCorrect: i === index,
                                  }));
                                  setEditingQuestionData({ ...editingQuestionData, answers: newAnswers });
                                }}
                              />
                              {language === 'fr' ? 'Bonne réponse' : 'إجابة صحيحة'}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="form-actions">
                        <button
                          className="save-button"
                          onClick={() => handleUpdateQuestion(editingQuestionData)}
                        >
                          <FaSave /> {language === 'fr' ? 'Enregistrer' : 'حفظ'}
                        </button>
                        <button
                          className="cancel-button"
                          onClick={() => {
                            setEditingQuestion(null);
                            setEditingQuestionData(null);
                          }}
                        >
                          <FaTimes /> {language === 'fr' ? 'Annuler' : 'إلغاء'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="question-content">
                        <h3>{question.text?.[language] || ''}</h3>
                        <p className="level-badge">
                          {question.level?.name?.[language] || 'N/A'}
                        </p>
                        {/* BOUTON AFFICHER/MASQUER LES RÉPONSES */}
                        <button
                          className="toggle-answers-btn"
                          onClick={() => setOpenAnswers(prev => ({
                            ...prev,
                            [question._id]: !prev[question._id]
                          }))}
                          style={{ marginBottom: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                          aria-label={openAnswers[question._id]
                            ? (language === 'fr' ? 'Masquer les réponses' : 'إخفاء الإجابات')
                            : (language === 'fr' ? 'Afficher les réponses' : 'عرض الإجابات')}
                        >
                          {openAnswers[question._id] ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                        {/* LISTE DES RÉPONSES */}
                        {openAnswers[question._id] && (
                          <div className="answers-list">
                            {question.answers?.map((answer, index) => (
                              <div
                                key={index}
                                className={`answer-item ${answer.isCorrect ? 'correct' : ''}`}
                              >
                                {answer.text?.[language] || ''}
                                {answer.isCorrect && <FaCheck className="correct-icon" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="question-actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEditQuestionClick(question)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => {
                            if (window.confirm(language === 'fr'
                              ? 'Êtes-vous sûr de vouloir supprimer cette question ?'
                              : 'هل أنت متأكد من حذف هذا السؤال؟'
                            )) {
                              dispatch(deleteQuestion(question._id));
                            }
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'levels' && (
        <div className="levels-section">
          <div className="section-header">
            <h2>{language === 'fr' ? 'Gestion des niveaux' : 'إدارة المستويات'}</h2>
            <button className="add-button" onClick={() => setEditingLevel('new')}>
              <FaPlus /> {language === 'fr' ? 'Nouveau niveau' : 'مستوى جديد'}
            </button>
          </div>

          {(editingLevel === 'new' || editingLevelData) && (
            <div className="edit-form">
              <h3>
                {editingLevel === 'new'
                  ? (language === 'fr' ? 'Ajouter un nouveau niveau' : 'إضافة مستوى جديد')
                  : (language === 'fr' ? 'Modifier le niveau' : 'تعديل المستوى')}
              </h3>
              <div className="form-group">
                <label>{language === 'fr' ? 'Nom (FR)' : 'الاسم (FR)'}</label>
                <input
                  type="text"
                  value={editingLevelData?.name?.fr || newLevel.name.fr}
                  onChange={(e) =>
                    setEditingLevelData({
                      ...editingLevelData,
                      name: { ...editingLevelData?.name, fr: e.target.value },
                    })
                  }
                  placeholder="Nom du niveau en français"
                />
              </div>
              <div className="form-group">
                <label>{language === 'fr' ? 'Nom (AR)' : 'الاسم (AR)'}</label>
                <input
                  type="text"
                  value={editingLevelData?.name?.ar || newLevel.name.ar}
                  onChange={(e) =>
                    setEditingLevelData({
                      ...editingLevelData,
                      name: { ...editingLevelData?.name, ar: e.target.value },
                    })
                  }
                  placeholder="Nom du niveau en arabe"
                />
              </div>
              <div className="form-group">
                <label>{language === 'fr' ? 'Description (FR)' : 'الوصف (FR)'}</label>
                <textarea
                  value={editingLevelData?.description?.fr || newLevel.description.fr}
                  onChange={(e) =>
                    setEditingLevelData({
                      ...editingLevelData,
                      description: { ...editingLevelData?.description, fr: e.target.value },
                    })
                  }
                  placeholder="Description du niveau en français"
                ></textarea>
              </div>
              <div className="form-group">
                <label>{language === 'fr' ? 'Description (AR)' : 'الوصف (AR)'}</label>
                <textarea
                  value={editingLevelData?.description?.ar || newLevel.description.ar}
                  onChange={(e) =>
                    setEditingLevelData({
                      ...editingLevelData,
                      description: { ...editingLevelData?.description, ar: e.target.value },
                    })
                  }
                  placeholder="Description du niveau en arabe"
                ></textarea>
              </div>
              <div className="form-group">
                <label>{language === 'fr' ? 'Ordre' : 'الترتيب'}</label>
                <input
                  type="number"
                  value={editingLevelData?.order !== undefined ? editingLevelData.order : newLevel.order}
                  onChange={(e) =>
                    setEditingLevelData({ ...editingLevelData, order: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Ordre d'affichage"
                />
              </div>
              <div className="form-actions">
                <button
                  className="save-button"
                  onClick={() => {
                    if (editingLevel === 'new') {
                      handleAddLevel();
                    } else {
                      handleUpdateLevel(editingLevelData);
                    }
                  }}
                >
                  <FaSave /> {language === 'fr' ? 'Enregistrer' : 'حفظ'}
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setEditingLevel(null);
                    setEditingLevelData(null);
                    setNewLevel({
                      name: { fr: '', ar: '' },
                      description: { fr: '', ar: '' },
                      order: 0,
                    });
                  }}
                >
                  <FaTimes /> {language === 'fr' ? 'Annuler' : 'إلغاء'}
                </button>
              </div>
            </div>
          )}

          <div className="levels-list">
            {levels.map(level => (
              <div key={level._id} className="level-card">
                {editingLevel === level._id ? (
                  <div className="edit-form">
                    {/* Le formulaire d'édition est rendu plus haut */}
                  </div>
                ) : (
                  <>
                    <div className="level-content">
                      <h3>{level.name[language]}</h3>
                      <p>{level.description[language]}</p>
                      <span className="order-badge">
                        {language === 'fr' ? 'Ordre' : 'الترتيب'}: {level.order}
                      </span>
                    </div>
                    <div className="level-actions">
                      <button
                        className="edit-button"
                        onClick={() => handleEditLevelClick(level)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => {
                          if (window.confirm(language === 'fr'
                            ? 'Êtes-vous sûr de vouloir supprimer ce niveau ?'
                            : 'هل أنت متأكد من حذف هذا المستوى؟'
                          )) {
                            dispatch(deleteLevel(level._id));
                          }
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard; 