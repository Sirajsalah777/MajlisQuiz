import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/uiSlice';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginAdmin, fetchAllQuestions, addQuestion, updateQuestion, deleteQuestion } from '../api/admin.api';
import '../styles/admin.scss';

const Admin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, error: authError } = useSelector((state) => state.auth);
  const { language } = useSelector((state) => state.ui);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestionData, setNewQuestionData] = useState({
    question: { fr: '', ar: '' },
    options: { fr: [], ar: [] },
    correctAnswer: { fr: '', ar: '' },
    level: 'beginner',
  });

  // Translations
  const t = {
    fr: {
      adminPanel: 'Panneau d\'Administration',
      loginRequired: 'Veuillez vous connecter pour accéder au panneau d\'administration.',
      username: 'Nom d\'utilisateur',
      password: 'Mot de passe',
      login: 'Se connecter',
      logout: 'Déconnexion',
      questionManagement: 'Gestion des Questions',
      addNewQuestion: 'Ajouter une nouvelle question',
      editQuestion: 'Modifier la question',
      question: 'Question',
      options: 'Options (séparées par une virgule)',
      correctAnswer: 'Bonne réponse',
      level: 'Niveau',
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      expert: 'Expert',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      actions: 'Actions',
      noQuestions: 'Aucune question à afficher.',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette question ?',
      loginSuccess: 'Connexion réussie !',
      loginFailed: 'Échec de la connexion. Vérifiez vos identifiants.',
      fetchError: 'Erreur lors de la récupération des questions.',
      addSuccess: 'Question ajoutée avec succès !',
      addError: 'Erreur lors de l\'ajout de la question.',
      updateSuccess: 'Question mise à jour avec succès !',
      updateError: 'Erreur lors de la mise à jour de la question.',
      deleteSuccess: 'Question supprimée avec succès !',
      deleteError: 'Erreur lors de la suppression de la question.',
      invalidOptions: 'Veuillez entrer au moins 2 options et vous assurer que la bonne réponse est parmi elles.',
      fillAllFields: 'Veuillez remplir tous les champs.'
    },
    ar: {
      adminPanel: 'لوحة الإدارة',
      loginRequired: 'الرجاء تسجيل الدخول للوصول إلى لوحة الإدارة.',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      questionManagement: 'إدارة الأسئلة',
      addNewQuestion: 'إضافة سؤال جديد',
      editQuestion: 'تعديل السؤال',
      question: 'السؤال',
      options: 'الخيارات (افصل بينها بفاصلة)',
      correctAnswer: 'الإجابة الصحيحة',
      level: 'المستوى',
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      expert: 'خبير',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      actions: 'الإجراءات',
      noQuestions: 'لا توجد أسئلة لعرضها.',
      confirmDelete: 'هل أنت متأكد أنك تريد حذف هذا السؤال؟',
      loginSuccess: 'تم تسجيل الدخول بنجاح !',
      loginFailed: 'فشل تسجيل الدخول. تحقق من بيانات الاعتماد الخاصة بك.',
      fetchError: 'خطأ أثناء جلب الأسئلة.',
      addSuccess: 'تمت إضافة السؤال بنجاح !',
      addError: 'خطأ أثناء إضافة السؤال.',
      updateSuccess: 'تم تحديث السؤال بنجاح !',
      updateError: 'خطأ أثناء تحديث السؤال.',
      deleteSuccess: 'تم حذف السؤال بنجاح !',
      deleteError: 'خطأ أثناء حذف السؤال.',
      invalidOptions: 'الرجاء إدخال خيارين على الأقل والتأكد من أن الإجابة الصحيحة موجودة بينهما.',
      fillAllFields: 'الرجاء ملء جميع الحقول.'
    }
  }[language];

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      dispatch(loginSuccess(data));
      dispatch(addNotification({ message: t.loginSuccess, type: 'success' }));
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
    },
    onError: (err) => {
      dispatch(loginFailure(err.message));
      dispatch(addNotification({ message: t.loginFailed, type: 'error' }));
    },
  });

  // Fetch questions query
  const { data: questionsData, isLoading: questionsLoading, isError: questionsError } = useQuery({
    queryKey: ['allQuestions'],
    queryFn: fetchAllQuestions,
    enabled: isAuthenticated,
    onError: (err) => {
      dispatch(addNotification({ message: t.fetchError, type: 'error' }));
    },
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: addQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['allQuestions']);
      dispatch(addNotification({ message: t.addSuccess, type: 'success' }));
      setIsAddingNew(false);
      setNewQuestionData({
        question: { fr: '', ar: '' },
        options: { fr: [], ar: [] },
        correctAnswer: { fr: '', ar: '' },
        level: 'beginner',
      });
    },
    onError: (err) => {
      dispatch(addNotification({ message: t.addError, type: 'error' }));
    },
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['allQuestions']);
      dispatch(addNotification({ message: t.updateSuccess, type: 'success' }));
      setEditingQuestion(null);
    },
    onError: (err) => {
      dispatch(addNotification({ message: t.updateError, type: 'error' }));
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['allQuestions']);
      dispatch(addNotification({ message: t.deleteSuccess, type: 'success' }));
    },
    onError: (err) => {
      dispatch(addNotification({ message: t.deleteError, type: 'error' }));
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (token && user) {
      dispatch(loginSuccess({ user: JSON.parse(user), token }));
    }
  }, [dispatch]);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginStart());
    loginMutation.mutate({ username, password });
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/'); // Redirect to home after logout
  };

  const handleAddOrUpdateSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      !newQuestionData.question.fr ||
      !newQuestionData.question.ar ||
      !newQuestionData.correctAnswer.fr ||
      !newQuestionData.correctAnswer.ar ||
      !newQuestionData.level ||
      newQuestionData.options.fr.length < 2 ||
      newQuestionData.options.ar.length < 2
    ) {
      dispatch(addNotification({ message: t.fillAllFields, type: 'error' }));
      return;
    }

    // Validate correct answer is within options
    if (
      !newQuestionData.options.fr.includes(newQuestionData.correctAnswer.fr) ||
      !newQuestionData.options.ar.includes(newQuestionData.correctAnswer.ar)
    ) {
      dispatch(addNotification({ message: t.invalidOptions, type: 'error' }));
      return;
    }

    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, questionData: newQuestionData });
    } else {
      addQuestionMutation.mutate(newQuestionData);
    }
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm(t.confirmDelete)) {
      deleteQuestionMutation.mutate(id);
    }
  };

  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setNewQuestionData({
      question: { fr: question.question.fr, ar: question.question.ar },
      options: { fr: question.options.fr, ar: question.options.ar },
      correctAnswer: { fr: question.correctAnswer.fr, ar: question.correctAnswer.ar },
      level: question.level,
    });
    setIsAddingNew(true);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setIsAddingNew(false);
    setNewQuestionData({
      question: { fr: '', ar: '' },
      options: { fr: [], ar: [] },
      correctAnswer: { fr: '', ar: '' },
      level: 'beginner',
    });
  };

  const handleQuestionChange = (e, lang) => {
    setNewQuestionData(prev => ({
      ...prev,
      question: {
        ...prev.question,
        [lang]: e.target.value
      }
    }));
  };

  const handleOptionsChange = (e, lang) => {
    const options = e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt);
    setNewQuestionData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [lang]: options
      }
    }));
  };

  const handleCorrectAnswerChange = (e, lang) => {
    setNewQuestionData(prev => ({
      ...prev,
      correctAnswer: {
        ...prev.correctAnswer,
        [lang]: e.target.value
      }
    }));
  };

  const handleLevelChange = (e) => {
    setNewQuestionData(prev => ({
      ...prev,
      level: e.target.value
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <h2>{t.adminPanel}</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">{t.username}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {authError && <div className="error">{authError}</div>}
          <button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? '...' : t.login}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>{t.adminPanel}</h2>
        <button onClick={handleLogout} className="logout-btn">
          {t.logout}
        </button>
      </div>

      {isAddingNew ? (
        <div className="question-form">
          <h3>{editingQuestion ? t.editQuestion : t.addNewQuestion}</h3>
          <form onSubmit={handleAddOrUpdateSubmit}>
            <div className="form-group">
              <label>{t.question} (FR)</label>
              <input
                type="text"
                value={newQuestionData.question.fr}
                onChange={(e) => handleQuestionChange(e, 'fr')}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.question} (AR)</label>
              <input
                type="text"
                value={newQuestionData.question.ar}
                onChange={(e) => handleQuestionChange(e, 'ar')}
                required
                dir="rtl"
              />
            </div>
            <div className="form-group">
              <label>{t.options} (FR)</label>
              <input
                type="text"
                value={newQuestionData.options.fr.join(', ')}
                onChange={(e) => handleOptionsChange(e, 'fr')}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.options} (AR)</label>
              <input
                type="text"
                value={newQuestionData.options.ar.join(', ')}
                onChange={(e) => handleOptionsChange(e, 'ar')}
                required
                dir="rtl"
              />
            </div>
            <div className="form-group">
              <label>{t.correctAnswer} (FR)</label>
              <input
                type="text"
                value={newQuestionData.correctAnswer.fr}
                onChange={(e) => handleCorrectAnswerChange(e, 'fr')}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.correctAnswer} (AR)</label>
              <input
                type="text"
                value={newQuestionData.correctAnswer.ar}
                onChange={(e) => handleCorrectAnswerChange(e, 'ar')}
                required
                dir="rtl"
              />
            </div>
            <div className="form-group">
              <label>{t.level}</label>
              <select value={newQuestionData.level} onChange={handleLevelChange}>
                <option value="beginner">{t.beginner}</option>
                <option value="intermediate">{t.intermediate}</option>
                <option value="expert">{t.expert}</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={addQuestionMutation.isPending || updateQuestionMutation.isPending}>
                {addQuestionMutation.isPending || updateQuestionMutation.isPending ? '...' : t.save}
              </button>
              <button type="button" onClick={handleCancelEdit}>
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="questions-list">
          <button onClick={() => setIsAddingNew(true)} className="add-btn">
            {t.addNewQuestion}
          </button>
          
          {questionsLoading ? (
            <div className="loading">Chargement...</div>
          ) : questionsError ? (
            <div className="error">{t.fetchError}</div>
          ) : questionsData?.length === 0 ? (
            <div className="no-questions">{t.noQuestions}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t.question}</th>
                  <th>{t.level}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {questionsData?.map((question) => (
                  <tr key={question.id}>
                    <td>
                      <div className="question-text">
                        <div>{question.question[language]}</div>
                        <small>{question.question[language === 'fr' ? 'ar' : 'fr']}</small>
                      </div>
                    </td>
                    <td>{t[question.level]}</td>
                    <td>
                      <div className="actions">
                        <button onClick={() => handleEditClick(question)} className="edit-btn">
                          {t.editQuestion}
                        </button>
                        <button onClick={() => handleDeleteQuestion(question.id)} className="delete-btn">
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
