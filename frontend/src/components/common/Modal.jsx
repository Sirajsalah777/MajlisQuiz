import { useDispatch } from 'react-redux';
import { closeModal } from '../../store/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ type, data }) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(closeModal());
  };

  const renderContent = () => {
    switch (type) {
      case 'email':
        return (
          <div className="email-form">
            <h2>Recevoir vos résultats</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implémenter la soumission du formulaire
              handleClose();
            }}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="votre@email.com"
                />
              </div>
              <button type="submit" className="btn-primary">
                Envoyer
              </button>
            </form>
          </div>
        );

      case 'results':
        return (
          <div className="results-preview">
            <h2>Vos résultats</h2>
            <div className="results-content">
              {/* TODO: Afficher les résultats */}
              <p>Score: {data?.score}</p>
              <p>Temps: {data?.timeSpent}</p>
            </div>
            <div className="results-actions">
              <button className="btn-primary" onClick={() => window.print()}>
                Imprimer
              </button>
              <button className="btn-secondary" onClick={handleClose}>
                Fermer
              </button>
            </div>
          </div>
        );

      default:
        return <p>Contenu non disponible</p>;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="modal-content"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Fermer la fenêtre"
          >
            <FaTimes />
          </button>
          {renderContent()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal; 