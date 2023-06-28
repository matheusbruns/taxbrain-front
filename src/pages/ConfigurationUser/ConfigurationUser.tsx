import React, { useEffect, useState } from 'react';
import './style.sass';
import Header from '../../components/Header';
import { Input, Button, message, Form } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import api from '../../connection/api';

interface DataType {
  _id: string;
  name: string;
  email: string;
  __v: number;
}

export default function Configurations() {
  const [userInfo, setUserInfo] = useState<DataType>();
  const id = localStorage.getItem('_id');
  const nameUser = localStorage.getItem('name');
  const emailUser = localStorage.getItem('email');
  const [name, setName] = useState(nameUser);
  const [email, setEmail] = useState(emailUser);
  const [password, setPassword] = useState('');

  const handleSubmit = async (values: any) => {
    try {
      const response = await api.put('/user-update', { id, ...values });
      message.success("Usuário atualizado com sucesso!");
    } catch (error) {
      message.error("Erro!");
    }
  }

  return (
    <div className='content'>
      <div>
        <Header></Header>
      </div>
      <div className='title-default'>
        <h1>Configurações</h1>
      </div>
      <Form onFinish={handleSubmit}>
        <div className='input-name-clients'>
          <label style={{ color: "#fff" }}>Alterar Nome:</label>
          <p></p>
          <Form.Item name="name" initialValue={name}>
            <Input className='name-clients' placeholder="Digite o nome..." />
          </Form.Item>
        </div>
        <div className='input-name-clients'>
          <label style={{ color: "#fff" }}>Alterar Email:</label>
          <p></p>
          <Form.Item name="email" initialValue={email}>
            <Input className='name-clients' placeholder="Digite o Email..." />
          </Form.Item>
        </div>
        <div className='input-name-clients'>
          <label style={{ color: "#fff" }}>Alterar Senha:</label>
          <p></p>
          <Form.Item name="password">
            <Input.Password className='name-clients' placeholder="Digite a Senha..." iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
          </Form.Item>
        </div>
        <div className='input-name-clients'>
          <Form.Item>
            <Button htmlType="submit" style={{ backgroundColor: "rgba(16, 39, 32, 0.92)" }} size="large" className='button-save' type="primary">
              Atualizar dados
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
