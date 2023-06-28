import { Button, DatePicker, Form, Input, Modal, Select, Space, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import React from 'react';
import Header from '../../components/Header';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined, FileExcelOutlined } from '@ant-design/icons';
import './style.sass';
import api from '../../connection/api';
import unidecode from 'unidecode';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx'
import { ColumnProps } from 'antd/es/table/Column';

const { RangePicker } = DatePicker;


export default function Dashboard() {

  interface DataTypeFilter {
    _id: string;
    startDate: number;
    endDate: number;
    client: string;
    fixedIncome: number;
    extraIncome: number;
    clientName: string;
    month: number;
    year: number;
    inssDiscount: number;
    irDiscount: number;
    totalDiscount: number;
    netIncome: number;
    __v: number;
  }
  interface DataTypeIncome {
    _id: string;
    fixedIncome: number;
    extraIncome: number;
    clientName: string;
    month: number;
    year: number;
    inssDiscount: number;
    irDiscount: number;
    totalDiscount: number;
    netIncome: number;
    __v: number;
  }
  interface DataType {
    _id: string;
    name: string;
    email: string;
    cpf: string;
    telephone: string;
    __v: number;
  }

  interface DataTypeTable {
    _id: string;
    clientName: string;
    month: number;
    year: number;
    fixedIncome: number;
    extraIncome: number;
    inssDiscount: number;
    irDiscount: number;
    allDiscount: number;
    liquidValue: number;
    __v: number;
  }

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Mês',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Ano',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Renda Fixa',
      dataIndex: 'fixedIncome',
      key: 'fixedIncome',
    },
    {
      title: 'Renda Extra',
      dataIndex: 'extraIncome',
      key: 'extraIncome',
    },
    {
      title: 'Desconto INSS',
      dataIndex: 'inssDiscount',
      key: 'inssDiscount',
    },
    {
      title: 'Desconto IR',
      dataIndex: 'irDiscount',
      key: 'irDiscount',
    },
    {
      title: 'Desconto Total',
      dataIndex: 'totalDiscount',
      key: 'totalDiscount',
    },
    {
      title: 'Valor Liquido',
      dataIndex: 'netIncome',
      key: 'netIncome',
    },
  ];

  const a = [
    {
      key: '1',
      client: 'Mike',
      month: 7,
      year: 2023,
      fixedIncome: 20000,
      extraIncome: 3000,
      inssDiscount: 550,
      irDiscount: 300,
      allDiscount: 850,
      liquidValue: 15000,
    },
    {
      key: '2',
      client: 'Mike',
      month: 7,
      year: 2023,
      fixedIncome: 20000,
      extraIncome: 3000,
      inssDiscount: 550,
      irDiscount: 300,
      allDiscount: 850,
      liquidValue: 15000,
    },
  ];

  const [dateRange, setDateRange] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [nome, setNome] = useState<React.Key[]>([]);
  const [_id, setIdClient] = useState('');
  const [searchData, setSearchData] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFilter, setIsModalFilter] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [income, setIncome] = useState<DataTypeIncome[]>([])
  const [form] = Form.useForm();
  const [clients, setClients] = useState<DataType[]>([]);
  const [fixedIncome, setFixedIncome] = useState<number>();
  const [extraIncome, setExtraIncome] = useState<number>();
  const [client, setClient] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [month, setMonth] = useState<number>();
  const [year, setYear] = useState<number>();
  const [dateFilter, setDateFilter] = useState<DataTypeFilter[]>([]);
  const [hasFilters, setHasFilters] = useState(false);

  useEffect(() => {
    api.get<DataType[]>('clients')
      .then(response => {
        const dataKeyAndValue = response.data.map(obj => ({ ...obj, _id: obj._id, key: obj.name, value: obj.name }));
        setClients(dataKeyAndValue);
      })
      .catch(error => {
        console.error(error);
      });
  }, [isModalOpen]);

  function fetchData() {
    api.get<DataTypeIncome[]>('income/find-all')
      .then(response => {
        setIncome(response.data);
        const dataWithKey = response.data.map(obj => ({ ...obj, key: obj._id }));
        setIncome(dataWithKey)
      })
      .catch(error => {
        console.error(error);
      });
  }
  
  useEffect(() => {
    fetchData();
  }, []);
  
  function handleRemoveFilters() {
    message.success("Filtros Retirados com sucesso!");
    fetchData();
    setHasFilters(false);
  }

  const ids = nome

  const handleDeletarClick = async () => {
    try {
      const response = await api.delete('/income/delete', { data: { ids: ids } });
      message.success("Cliente Deletado com sucesso!")
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      message.error("Erro!")
    }
  };

  const exportToExcel = () => {
    const filteredData = income.map(({ clientName, month, year, fixedIncome, extraIncome, inssDiscount, irDiscount, totalDiscount, netIncome }) => ({
      Cliente: clientName,
      Mês: month,
      Ano: year,
      'Renda Fixa': fixedIncome,
      'Renda Extra': extraIncome,
      'Desconto INSS': inssDiscount,
      'Desconto IR': irDiscount,
      'Desconto Total': totalDiscount,
      'Valor Líquido': netIncome,
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Renda');

    const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([excelBlob]), 'Dados_Renda.xlsx');
  };

  const handleSubmit = async (event) => {
    if (extraIncome == null || extraIncome == undefined) {
      setExtraIncome(0);
    }
    try {
      const response = await api.post('/income', { fixedIncome, extraIncome, client, month, year });
      message.success("Calculo realizado com sucesso!");
      setTimeout(() => {
        setIsModalOpen(false);
        form.resetFields();
        window.location.reload();
      }, 2000);
    } catch (error) {
      message.error("Erro!");
    }

  };

  const handleFilterSubmit = async (event) => {
    const fetchFilteredData = async () => {
      try {
        const response = await api.post<DataTypeFilter[]>('income/filter', {
          startDate: Number(dateRange[0].format("YYYY") + dateRange[0].format("MM")),
          endDate: Number(dateRange[1].format("YYYY") + dateRange[1].format("MM")),
          client: clientFilter,
        }).then((response) => {
          setIncome(response.data)
          setHasFilters(true);
          setIsModalFilter(false);
          message.success("Filtro aplicado com sucesso!")
        });
      } catch (error) {
        console.error(error);
        message.error("Erro! Nao esqueca de adicionar todos os campos!")
      }
    };

    fetchFilteredData();
  };

  const handleFilterCancel = () => {
    setIsModalFilter(false);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], data) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setNome(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelectedDelete = selectedRowKeys.length <= 0;

  function handleDateChange(date) {
    if (!date) return;
    setDateRange(date)
  }

  const handleChange = (selectedOption) => {
    setClient(selectedOption)
  };

  const handleChangeFilter = (selectedOption) => {
    setClientFilter(selectedOption)
  };

  const handleSave = () => {
    form.resetFields();
    setIsModalOpen(true);
    setIsNewClient(true)
    setSelectedRowKeys([])
  }

  const handleFilterClick = () => {
    setIsModalFilter(true);
  }

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setSelectedRowKeys([])
  };

  function handleSearch(e) {
    setSearchData(e.target.value)
  }

  const getMonthName = (monthNumber) => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril',
      'Maio', 'Junho', 'Julho', 'Agosto',
      'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[monthNumber - 1] || '';
  };

  const filteredData = income
    .filter(data => unidecode(data.clientName.toLowerCase()).includes(unidecode(searchData.toLowerCase())))
    .map(data => {
      const month = getMonthName(data.month);
      const newData = {
        ...data,
        fixedIncome: `R$ ${data.fixedIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        extraIncome: `R$ ${data.extraIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        inssDiscount: `R$ ${data.inssDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        irDiscount: `R$ ${data.irDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalDiscount: `R$ ${data.totalDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        netIncome: `R$ ${data.netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        month
      };
      return newData;
    });

  return (
    <div className='content'>
      <Header />
      <div className='title-default'>
        <h1>Dashboard</h1>
      </div>

      <div className='top-filter'>
        <div>
          <Button onClick={handleSave} className='client-button new-client' type='primary' size='large' style={{ backgroundColor: "rgba(16, 39, 32, 0.92)" }}>
            <PlusCircleOutlined />
            Nova Renda
          </Button>
          <Button onClick={handleDeletarClick} disabled={hasSelectedDelete} className='client-button' type="text" size='large' style={{ color: "#ffffff" }}>
            <DeleteOutlined style={{ fontSize: 24 }} />
          </Button>
          <Button onClick={handleFilterClick} className='client-button' type="text" size='large' style={{ color: "#ffffff" }}>
            <FilterOutlined style={{ fontSize: 24 }} />
          </Button>
          {hasFilters &&
            <Button onClick={handleRemoveFilters} className='client-button' type="text" size='large' style={{ backgroundColor: "rgba(16, 39, 32, 0.92)", color: 'white' }}>
              Limpar filtros
            </Button>
          }

          {/* <DatePicker style={{ marginLeft: 20 }} /> */}


        </div>
        <div className='search-dashboard'>
          <FileExcelOutlined title='Exportar' onClick={exportToExcel} style={{ marginTop: '4px', marginRight: '15px', fontSize: '24px', color: 'white' }} />
          <Input onChange={handleSearch} size="middle" placeholder="Pesquisar" prefix={<SearchOutlined />} />
        </div>

      </div>

      <Modal
        title="Filtro"
        open={isModalFilter}
        onOk={handleFilterSubmit}
        onCancel={handleFilterCancel}>

        <Form
          form={form}
        >
          <Form.Item
            label="Cliente:"
            name="clients-filter"
            rules={[{ required: true, message: 'Insira o cliente!' }]}
          >
            <Select
              className='select-clients'
              defaultValue="Clientes"
              onChange={handleChangeFilter}
              options={clients.map(client => ({ value: client._id, label: client.name }))}
              style={{ width: '91%' }}
            />
          </Form.Item>
          <Form.Item
            label="Filtro de data:"
            name="filter-date"
            rules={[{ required: true, message: 'Insira a Data!' }]}
          >
            <RangePicker
              value={dateRange}
              onChange={(a) => handleDateChange(a)}
              picker="month"
              style={{ marginRight: 10 }}
            />
          </Form.Item>
        </Form>

      </Modal>

      <Modal
        title="Renda"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}>

        <Form
          form={form}
        >
          <Form.Item
            label="Cliente:"
            name="clients"
            rules={[{ required: true, message: 'Insira o cliente!' }]}
          >
            <Select
              className='select-clients'
              defaultValue="Clientes"
              onChange={handleChange}
              options={clients.map(client => ({ value: client._id, label: client.name }))}
            />
          </Form.Item>
          <Form.Item
            label="Mês:"
            name="month"
            rules={[{ required: true, message: 'Insira o Mes!' }]}
          >
            <Select
              className='select-month'
              defaultValue="Mês"
              onChange={(selectedOption) => {
                if (selectedOption && selectedOption.valueOf()) {
                  const selectedValue = parseInt(selectedOption.valueOf());
                  setMonth(selectedValue);
                }
              }}
              options={[
                { value: "1", label: 'Janeiro' },
                { value: "2", label: 'Fevereiro' },
                { value: "3", label: 'Março' },
                { value: "4", label: 'Abril' },
                { value: "5", label: 'Maio' },
                { value: "6", label: 'Junho' },
                { value: "7", label: 'Julho' },
                { value: "8", label: 'Agosto' },
                { value: "9", label: 'Setembro' },
                { value: "10", label: 'Outubro' },
                { value: "11", label: 'Novembro' },
                { value: "12", label: 'Dezembro' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Ano:"
            name="year"
            rules={[{ required: true, message: 'Insira o Ano!' }]}
          >
            <Select
              className='select-year'
              defaultValue="Ano"
              onChange={(selectedOptionYear) => {
                if (selectedOptionYear && selectedOptionYear.valueOf()) {
                  const selectedValueYear = parseInt(selectedOptionYear.valueOf());
                  setYear(selectedValueYear);
                }
              }}
              options={[
                { value: "2023", label: '2023' },
                { value: "2024", label: '2024' },
                { value: "2025", label: '2025' },
                { value: "2026", label: '2026' },
                { value: "2027", label: '2027' },
                { value: "2028", label: '2028' },
                { value: "2029", label: '2029' },
                { value: "2030", label: '2030' },
                { value: "2031", label: '2031' },
                { value: "2032", label: '2032' },
                { value: "2033", label: '2033' },
                { value: "2034", label: '2034' },
                { value: "2035", label: '2035' },
                { value: "2036", label: '2036' },
                { value: "2037", label: '2037' },
                { value: "2038", label: '2038' },
                { value: "2039", label: '2039' },
                { value: "2040", label: '2040' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Renda Fixa:"
            name="fixedIncome"
            rules={[{ required: true, message: 'Insira a Renda Fixa' }]}
          >
            <Input type='number' className='fixed-income' placeholder="Digite aqui..." value={fixedIncome} onChange={(event) => setFixedIncome(parseInt(event.target.value))} />
          </Form.Item>
          <Form.Item
            label="Renda Extra:"
            name="extraIncome"
            rules={[{ required: true, message: 'Insira a Renda Extra' }]}
          >
            <Input type='number' className='extra-income' placeholder="Digite aqui..." value={extraIncome} onChange={(event) => setExtraIncome(parseInt(event.target.value))} />
          </Form.Item>
        </Form>
      </Modal>

      <div>
        <Table rowSelection={rowSelection} className='table-clients' dataSource={filteredData} columns={columns} pagination={false} bordered rowClassName={() => 'no-hover'} />
      </div >

    </div>

  )

}