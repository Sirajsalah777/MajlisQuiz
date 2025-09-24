import { useSelector } from 'react-redux';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const { language } = useSelector((state) => state.ui);

  const content = {
    fr: {
      title: 'Chambre des Conseillers',
      contact: 'Contact',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email',
      rights: 'Tous droits réservés',
      addressText: 'Avenue Mohammed V, Rabat, Maroc',
      phoneText: '+212 5 37 76 60 00',
      emailText: 'contact@chambredesconseillers.ma'
    },
    ar: {
      title: 'مجلس المستشارين',
      contact: 'اتصل بنا',
      address: 'العنوان',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      rights: 'جميع الحقوق محفوظة',
      addressText: 'شارع محمد الخامس، الرباط، المغرب',
      phoneText: '+212 5 37 76 60 00',
      emailText: 'contact@chambredesconseillers.ma'
    }
  };

  const t = content[language];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{t.title}</h3>
          <p>{t.rights}</p>
        </div>

        <div className="footer-section">
          <h3>{t.contact}</h3>
          <p>
            <FaMapMarkerAlt /> {t.addressText}
          </p>
          <p>
            <FaPhone /> {t.phoneText}
          </p>
          <p>
            <FaEnvelope /> {t.emailText}
          </p>
        </div>

        <div className="footer-section">
          <h3>QuizMa</h3>
          <p>
            {language === 'fr'
              ? 'Testez vos connaissances sur la Chambre des Conseillers'
              : 'اختبر معرفتك بمجلس المستشارين'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 