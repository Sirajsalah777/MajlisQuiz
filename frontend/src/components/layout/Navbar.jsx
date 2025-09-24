import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { setLanguage } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/adminSlice';
import { selectIsAuthenticated } from '../../store/slices/adminSlice';
import { FaLanguage } from 'react-icons/fa';
import logoChambre from '../../assets/logo-chambre.png';

const Navbar = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { language } = useSelector((state) => state.ui);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLanguageChange = () => {
    dispatch(setLanguage(language === 'fr' ? 'ar' : 'fr'));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-brand-button" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logoChambre} alt="Logo Chambre des Conseillers" style={{ height: 40, marginRight: 12 }} />
          MajlisQuiz
        </Link>

        <div className="nav-links">
          {/* <Link to="/admin" className="nav-button admin-button">
            Administration
          </Link> */}
          <button
            className="nav-button"
            onClick={handleLanguageChange}
            aria-label="Changer la langue"
          >
            <FaLanguage />
            <span className="language-text">{language.toUpperCase()}</span>
          </button>
          {isAuthenticated && (
            <button
              className="nav-button"
              onClick={handleLogout}
              aria-label="Déconnexion"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 