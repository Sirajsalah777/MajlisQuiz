import { useDispatch } from 'react-redux';
import { removeNotification } from '../../store/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const NotificationList = ({ notifications }) => {
  const dispatch = useDispatch();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <div className="notification-list">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={`notification notification-${notification.type}`}
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          >
            <div className="notification-content">
              <span className="notification-icon">
                {getIcon(notification.type)}
              </span>
              <p>{notification.message}</p>
            </div>
            <button
              className="notification-close"
              onClick={() => dispatch(removeNotification(notification.id))}
              aria-label="Fermer la notification"
            >
              <FaTimes />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationList; 