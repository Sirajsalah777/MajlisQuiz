import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaStar, FaClock, FaChartBar } from 'react-icons/fa';
import {
  loadQuizzes,
  loadFavoriteQuizzes,
  toggleFavoriteQuiz,
  setFilters,
  setPagination,
  selectQuizzes,
  selectFilters,
  selectPagination,
  selectQuizLoading,
  selectQuizError,
} from '../store/slices/quizSlice';
import { APP_CONFIG } from '../config';
import '../styles/quiz-list.scss';

const QuizList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const language = useSelector(state => state.ui.language);

  const { list: quizzes, favorites, loading, error } = useSelector(selectQuizzes);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les quiz et les favoris au montage
  useEffect(() => {
    dispatch(loadQuizzes({ ...filters, page: pagination.currentPage }));
    dispatch(loadFavoriteQuizzes());
  }, [dispatch, filters, pagination.currentPage]);

  // Gérer la recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setFilters({ search: searchTerm }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, filters.search]);

  // Gérer le changement de page
  const handlePageChange = (newPage) => {
    dispatch(setPagination({ currentPage: newPage }));
  };

  // Gérer le changement de filtres
  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  // Gérer le toggle des favoris
  const handleToggleFavorite = async (quizId, isFavorite) => {
    dispatch(toggleFavoriteQuiz({ quizId, isFavorite }));
  };

  // Formater le temps
  const formatTime = (minutes) => {
    return `${minutes} ${language === 'fr' ? 'minutes' : 'دقائق'}`;
  };

  // Animation des cartes
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (error) {
    return (
      <div className="quiz-list-error">
        {language === 'fr' ? 'Erreur lors du chargement des quiz' : 'خطأ في تحميل الاختبارات'}
        <button onClick={() => dispatch(loadQuizzes(filters))}>
          {language === 'fr' ? 'Réessayer' : 'إعادة المحاولة'}
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-list-container">
      <div className="quiz-list-header">
        <h1>
          {language === 'fr' ? 'Quiz disponibles' : 'الاختبارات المتاحة'}
        </h1>
        
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder={language === 'fr' ? 'Rechercher un quiz...' : 'البحث عن اختبار...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>

        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          {language === 'fr' ? 'Filtres' : 'تصفية'}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filters-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="filter-group">
              <label>
                {language === 'fr' ? 'Niveau' : 'المستوى'}
              </label>
              <select
                value={filters.level || ''}
                onChange={(e) => handleFilterChange('level', e.target.value || null)}
              >
                <option value="">
                  {language === 'fr' ? 'Tous les niveaux' : 'جميع المستويات'}
                </option>
                {Object.entries(APP_CONFIG.quizLevels).map(([key, level]) => (
                  <option key={key} value={key}>
                    {level[language]}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                {language === 'fr' ? 'Catégorie' : 'الفئة'}
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || null)}
              >
                <option value="">
                  {language === 'fr' ? 'Toutes les catégories' : 'جميع الفئات'}
                </option>
                {Object.entries(APP_CONFIG.quizCategories).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category[language]}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                {language === 'fr' ? 'Trier par' : 'ترتيب حسب'}
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="date">
                  {language === 'fr' ? 'Date' : 'التاريخ'}
                </option>
                <option value="level">
                  {language === 'fr' ? 'Niveau' : 'المستوى'}
                </option>
                <option value="category">
                  {language === 'fr' ? 'Catégorie' : 'الفئة'}
                </option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="quiz-list-loading">
          {language === 'fr' ? 'Chargement des quiz...' : 'جاري تحميل الاختبارات...'}
        </div>
      ) : (
        <>
          <div className="quiz-grid">
            <AnimatePresence mode="popLayout">
              {quizzes.map((quiz) => (
                <motion.div
                  key={quiz._id}
                  className="quiz-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  onClick={() => navigate(`/quiz/${quiz._id}`)}
                >
                  <div className="quiz-card-header">
                    <h3>{quiz.title[language]}</h3>
                    <button
                      className={`favorite-button ${favorites.includes(quiz._id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(quiz._id, favorites.includes(quiz._id));
                      }}
                    >
                      <FaStar />
                    </button>
                  </div>

                  <div className="quiz-card-content">
                    <p className="quiz-description">
                      {quiz.description[language]}
                    </p>

                    <div className="quiz-meta">
                      <span className="quiz-level">
                        {APP_CONFIG.quizLevels[quiz.level][language]}
                      </span>
                      <span className="quiz-category">
                        {APP_CONFIG.quizCategories[quiz.category][language]}
                      </span>
                    </div>

                    <div className="quiz-info">
                      <div className="info-item">
                        <FaClock />
                        <span>{formatTime(quiz.timeLimit)}</span>
                      </div>
                      <div className="info-item">
                        <FaChartBar />
                        <span>
                          {quiz.questions.length} {language === 'fr' ? 'questions' : 'أسئلة'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {pagination.totalItems > 0 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                {language === 'fr' ? 'Précédent' : 'السابق'}
              </button>
              
              <span className="page-info">
                {language === 'fr'
                  ? `Page ${pagination.currentPage} sur ${Math.ceil(pagination.totalItems / pagination.pageSize)}`
                  : `صفحة ${pagination.currentPage} من ${Math.ceil(pagination.totalItems / pagination.pageSize)}`
                }
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= Math.ceil(pagination.totalItems / pagination.pageSize)}
              >
                {language === 'fr' ? 'Suivant' : 'التالي'}
              </button>
            </div>
          )}

          {quizzes.length === 0 && !loading && (
            <div className="no-quizzes">
              {language === 'fr'
                ? 'Aucun quiz ne correspond à vos critères'
                : 'لا توجد اختبارات تطابق معاييرك'
              }
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizList; 