import './header.css';
import { Button } from 'antd';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSettings, FiUsers } from "react-icons/fi"; // para icones svg
import { GiMoneyStack } from "react-icons/gi";
import logo from "../../assets/logo.png";

function handleExit() {
    localStorage.removeItem('token');
    localStorage.removeItem('_id');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    window.location.reload();
  }

export default function Header() {
  return (
    <div className='sideBar'>
      <div>
        <img src={logo} alt='Logo' width='110' height='110' />
      </div>

      <Link to='/dashboard'><FiHome color='#FFF' size={24} /> Dashboard</Link>
      <Link to='/clients'><FiUsers color='#FFF' size={24} /> Clientes</Link>
      <Link to='/config'><FiSettings color='#FFF' size={24} /> Configurações</Link>

      <div className='logout-button-container'>
        <Button onClick={handleExit} className='exit-button ant-btn-lg' type="text" size='large' style={{ backgroundColor: "rgba(80, 127, 112, 1)", color: 'white' }}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
