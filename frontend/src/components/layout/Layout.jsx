import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import NotificationList from '../common/NotificationList';
import Modal from '../common/Modal';
import { useTheme } from '../../hooks/useTheme';
import '../../styles/layout.scss';

const Layout = () => {
  const { theme } = useTheme();
  const { notifications, modal } = useSelector((state) => state.ui);

  return (
    <div className={`app-container ${theme}`}>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <NotificationList notifications={notifications} />
      {modal.isOpen && <Modal {...modal} />}
    </div>
  );
};
export default Layout; 