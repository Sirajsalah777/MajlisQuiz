import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { FaGraduationCap, FaBook, FaAward } from 'react-icons/fa';
import { loadPublicLevels, selectPublicLevels } from '../store/slices/publicLevelsSlice';
import '../styles/home.scss';

const Home = () => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.ui);
  const { levels, loading, error } = useSelector(selectPublicLevels);

  useEffect(() => {
    dispatch(loadPublicLevels());
  }, [dispatch]);

  // Définitions des icônes pour chaque niveau (ces icônes sont statiques)
  const levelIcons = {
    beginner: FaGraduationCap,
    intermediate: FaBook,
    expert: FaAward,
  };

  const content = {
    fr: {
      title: 'Connaissez-vous bien la Chambre des Conseillers ?',
      subtitle: 'Testez vos connaissances sur le Parlement Marocain',
      startButton: 'Commencer le quiz',
    },
    ar: {
      title: 'هل تعرف مجلس المستشارين جيداً؟',
      subtitle: 'اختبر معرفتك بالبرلمان المغربي',
      startButton: 'ابدأ الاختبار',
    },
  };

  const t = content[language];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  console.log('Current state:', { levels, loading, error });

  if (loading) {
    return (
      <div className="home-page">
        <motion.div
          className="hero-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </motion.div>
        <div className="levels-container">
          <p>{language === 'fr' ? 'Chargement des niveaux...' : 'جاري تحميل المستويات...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <motion.div
          className="hero-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </motion.div>
        <div className="levels-container">
          <p>{language === 'fr' ? 'Erreur lors du chargement des niveaux.' : 'خطأ في تحميل المستويات.'}</p>
        </div>
      </div>
    );
  }

  console.log('Rendering levels:', levels);

  return (
    <div className="home-page">
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>{t.title}</h1>
        <p className="subtitle">{t.subtitle}</p>
      </motion.div>

      <motion.div
        className="levels-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {levels.map((level) => {
          const Icon = levelIcons[level.key] || FaGraduationCap;
          console.log('Rendering level:', level);
          return (
            <motion.div
              key={level._id}
              className="level-card"
              variants={itemVariants}
            >
              <div className="level-icon">
                <Icon />
              </div>
              <h2>{level.name[language]}</h2>
              <p>{level.description[language]}</p>
              <Link
                to={`/quiz/${level._id}`}
                className="btn-primary"
              >
                {t.startButton}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Home; 