import { useState, useEffect } from 'react';
import React from 'react';
import { Button, Table, Input, Radio, Modal, Form, message } from 'antd';
import './style.sass';
import Header from '../../components/Header';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { ColumnProps, ColumnsType } from 'antd/es/table';
import api from '../../connection/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


interface DataType {
    _id: string;
    name: string;
    email: string;
    cpf: string;
    telephone: string;
    __v: number;
}

const columns: ColumnProps<DataType>[] = [
    {
        title: 'Nome',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'CPF',
        dataIndex: 'cpf',
        key: 'cpf',
    },
    {
        title: 'Telefone',
        dataIndex: 'telephone',
        key: 'telephone',
    },
];


export default function Clientes() {

    const [searchData, setSearchData] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [clients, setClients] = useState<DataType[]>([]);
    const [edit, setEdit] = useState<DataType[]>([]);
    const [nome, setNome] = useState<React.Key[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCPF] = useState('');
    const [telephone, setPhone] = useState('');
    const [nameAproved, setNameAproved] = useState(true);
    const [emailAproved, setEmailAproved] = useState(true);
    const [cpfAproved, setCPFAproved] = useState(true);
    const [cellAproved, setTelephoneAproved] = useState(true);
    const [form] = Form.useForm();
    const [isNewClient, setIsNewClient] = useState(false);
    const [_id, setIdClient] = useState('');
    const [cpfNum, setCpfNum] = useState(false);
    const [cpfNumMenor, setCpfNumMenor] = useState(false);


    useEffect(() => {
        api.get<DataType[]>('clients')
            .then(response => {
                setClients(response.data);
                const dataWithKey = response.data.map(obj => ({ ...obj, key: obj._id }));
                setClients(dataWithKey)
                setIsFetching(false);
            })
            .catch(error => {
                console.error(error);
            });

    }, []);

    useEffect(() => {
        api.get<DataType[]>('clients')
            .then(response => {
                const items = response.data
                const filteredItem = items.filter(item => item._id === nome.toString());
                setEdit(filteredItem)
                setIdClient(filteredItem[0]._id)
                setName(filteredItem[0].name)
                setCPF(filteredItem[0].cpf)
                setEmail(filteredItem[0].email)
                setPhone(filteredItem[0].telephone)
            })
            .catch(error => {
                console.error(error);
            });
    }, [selectedRowKeys]);

    function formatCPF(value) {
        const formattedValue = value
            .replace(/\D/g, '')
            .slice(0, 11);

        let formattedCPF = '';
        if (formattedValue.length >= 3) {
            formattedCPF += formattedValue.substr(0, 3) + '.';
        }
        if (formattedValue.length >= 6) {
            formattedCPF += formattedValue.substr(3, 3) + '.';
        }
        if (formattedValue.length >= 9) {
            formattedCPF += formattedValue.substr(6, 3) + '-';
        }
        if (formattedValue.length >= 11) {
            formattedCPF += formattedValue.substr(9, 2);
        }

        if (value.replace(/\D/g, '').length > 11) {
            setCpfNum(true)
        } else {
            setCpfNum(false)
        }

        if (value.replace(/\D/g, '').length < 11) {
            setCpfNumMenor(true)
        } else {
            setCpfNumMenor(false)
        }

        setCPF(formattedCPF);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (name && emailFormat.test(email) && cpf && !cpfNum && !cpfNumMenor && telephone) {
            if (isNewClient) {
                try {
                    const response = await api.post('/client-new', { name, email, cpf, telephone });

                    message.success("Cliente Adicionado com sucesso!");
                    setTimeout(() => {
                        setIsModalOpen(false);
                        form.resetFields();
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    if (error.response.data === "Cliente já existe!") {
                        message.error("CPF já cadastrado. Por favor, insira um CPF válido.");
                        return;
                    }
                    message.error("Erro ao adicionar cliente!");
                }
            } else {
                try {
                    const response = await api.put('/clients/update', { _id, name, email, cpf, telephone });
                    message.success("Cliente atualizado com sucesso!");
                    setTimeout(() => {
                        setIsModalOpen(false);
                        form.resetFields();
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    message.error("Erro!");
                }
            }
        } else {
            if (!name && !email && !cpf && !telephone) {
                message.error("Campos vazios!");
            } else {
                if (!emailFormat.test(email)) {
                    setEmailAproved(false);
                    message.error("Email com formato errado! Exemplo: taxbrain@email.com");
                }
                if (!cpf) {
                    setCPFAproved(false);
                    message.error("Voce precisa adicionar um CPF compatível");
                }
                if (cpfNum) {
                    setCPFAproved(false);
                    message.error("CPF deve ter no máximo 11 caracteres");
                }
                if (cpfNumMenor) {
                    setCPFAproved(false);
                    message.error("CPF deve ter 11 caracteres");
                }
                if (!telephone) {
                    message.error("Voce precisa adicionar um Telefone");
                }
                if (!name) {
                    setNameAproved(false);
                    message.error("Voce precisa adicionar um Nome");
                }
            }

        }
    };

    const handleSave = () => {
        form.resetFields();
        setIsModalOpen(true);
        setIsNewClient(true)
    }

    const handleEdit = (response) => {
        form.resetFields();
        setIsModalOpen(true);
        setIsNewClient(false)
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[], data) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setNome(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelectedEdit = selectedRowKeys.length !== 1;
    const hasSelectedDelete = selectedRowKeys.length <= 0;

    const ids = nome

    const handleDeletarClick = async () => {
        try {
            const response = await api.delete('/clients/delete', { data: { ids: ids } });
            message.success("Cliente Deletado com sucesso!")
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            message.error("Erro!")
        }
    };

    function handleSearch(e) {
        setSearchData(e.target.value)
    }

    const handleCancel = () => {
        window.location.reload()
        form.resetFields();
        setIsModalOpen(false);
        setSelectedRowKeys([])
    };

    const filteredData = clients.filter(data => data.name.toLowerCase().includes(searchData.toLowerCase()))

    const exportToExcel = () => {

        const exportData = clients.map(client => ({
            Nome: client.name,
            Email: client.email,
            CPF: client.cpf,
            Telefone: client.telephone,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const filename = 'Clientes.xlsx';
        saveAs(data, filename);
    };



    return (
        <div>
            <Header />
            <div className='content'>
                <div className='title-default'>
                    <h1>Clientes</h1>
                </div>
                <div className='top-buttons-clientes'>
                    <div>
                        <Button onClick={handleSave} className='client-button new-client' type='primary' size='large' style={{ backgroundColor: "rgba(16, 39, 32, 0.92)" }}>
                            <PlusCircleOutlined />
                            Novo Cliente
                        </Button>
                        <Button onClick={handleEdit} disabled={hasSelectedEdit} className='client-button' type="text" size='large' style={{ color: "#ffffff" }}>
                            <EditOutlined style={{ fontSize: 24 }} />
                        </Button>
                        <Button onClick={handleDeletarClick} disabled={hasSelectedDelete} className='client-button' type="text" size='large' style={{ color: "#ffffff" }}>
                            <DeleteOutlined style={{ fontSize: 24 }} />
                        </Button>
                    </div>
                    <Modal
                        title="Usuarios"
                        open={isModalOpen}
                        onOk={handleSubmit}
                        onCancel={handleCancel}>


                        <Form
                            form={form}
                        >
                            <Form.Item
                                label="Nome:"
                                name="name"
                                rules={[{ required: true, message: 'Insira o nome!' }]}
                            >
                                <Input className='name-clients-modal' placeholder="Digite o Nome..." defaultValue={name} value={name} onChange={(event) => setName(event.target.value)} />
                            </Form.Item>
                            <Form.Item
                                label="CPF:"
                                name="cpf"
                                rules={[{ required: true, message: 'Insira o CPF!' }]}
                            >
                                <Input
                                    className='cpf-clients-modal'
                                    placeholder="Digite o CPF..."
                                    value={cpf}
                                    onChange={(event) => formatCPF(event.target.value)}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Email:"
                                name="email"
                                rules={[{ required: true, message: 'Insira o Email!' }]}
                            >
                                <Input className='email-clients-modal' placeholder="Digite o Email..." defaultValue={email} value={email} onChange={(event) => setEmail(event.target.value)} />
                            </Form.Item>
                            <Form.Item
                                label="Telefone:"
                                name="telefone"
                                rules={[{ required: true, message: 'Insira o Telefone' }]}
                            >
                                <Input className='cell-clients-modal' defaultValue={telephone} placeholder="Digite o Telefone..." value={telephone} onChange={(event) => setPhone(event.target.value)} />
                            </Form.Item>
                        </Form>
                    </Modal>
                    <div className='search-clients'>
                        <FileExcelOutlined title='Exportar' onClick={exportToExcel} style={{ marginTop: '4px', marginRight: '15px', fontSize: '24px', color: 'white' }} />
                        <Input onChange={handleSearch} size="middle" placeholder="Pesquisar" prefix={<SearchOutlined />} />
                    </div>
                </div>
                <div>
                    <Table rowSelection={rowSelection} className='table-clients' dataSource={filteredData} columns={columns} pagination={false} bordered rowClassName={() => 'no-hover'} />
                </div >
            </div>
        </div>
    )

}