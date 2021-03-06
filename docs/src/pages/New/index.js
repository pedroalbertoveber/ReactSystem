import './new.css';
import Title from '../../components/Title';
import Header from '../../components/Header';
import { AuthContext } from '../../contexts/auth';
import { useHistory, useParams } from 'react-router-dom'

import firebase from '../../services/firebaseConnection';
import { toast } from 'react-toastify';

import { FiPlus } from 'react-icons/fi';

import { useState, useEffect, useContext } from 'react';

function New() {

    const { id } = useParams();
    const history = useHistory();

    const [loadCustomers, setLoadCustomers] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [customerSelected, setCustomerSelected] = useState(0);

    const [assunto, setAssunto] = useState('Suporte');
    const [status, setStatus] = useState('Aberto');
    const [complemento, setComplemento] = useState();

    const [idCustomer, setIdCustomer] = useState(false);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        async function loadCustomers() {
            await firebase.firestore().collection('customers')
            .get()
            .then((snapshot) => {

                let lista = [];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        nomeFantasia: doc.data().nomeFantasia,
                    })
                })

                if (lista.length === 0) {
                    console.log('Nenhuma empresa encontrada');
                    setLoadCustomers(false);
                    setCustomers([ {id: 1, nomeFantasia: ''} ]);
                    return;
                }

                setCustomers(lista);
                setLoadCustomers(false);

                if (id) {
                    loadId(lista);
                }

            })
            .catch((error) => {
                console.log('Deu algum erro: ' + error);
                setLoadCustomers(false);
                setCustomers([ {id: 1, nomeFantasia: ''} ]);
            })
        }

        async function loadId(lista) {
            await firebase.firestore().collection('chamados').doc(id)
            .get()
            .then((snapshot) => {
                setAssunto(snapshot.data().assunto);
                setStatus(snapshot.data().status);
                setComplemento(snapshot.data().complemento);
    
                let index = lista.findIndex(item => item.id === snapshot.data().clienteId);
                setCustomerSelected(index);
                setIdCustomer(true);
            })
            .catch((error) => {
                console.log('Erro no id passado: ' + error);
                setIdCustomer(false);
            })
        }

        loadCustomers();
    }, [id])

    //Chama quando troca o assunto:
    function handleChangeSelect(e) {
        setAssunto(e.target.value);
    }

    //Chama quando troca o status
    function handleOptionChange(e) {
        setStatus(e.target.value);
    }

    //Chamado quando troca de cliente
    function handleChangeCustomers(e) {
        setCustomerSelected(e.target.value);
    }

    function handleAddComplemento(e) {
        setComplemento(e.target.value);
    }

    async function handleRegister(e) {
        e.preventDefault();

        if(idCustomer) {
            await firebase.firestore().collection('chamados').doc(id)
            .update({
                cliente: customers[customerSelected].nomeFantasia,
                clienteId: customers[customerSelected].id,
                assunto: assunto,
                status: status,
                complemento: complemento,
                userId: user.uid,
            })
            .then(() => {
                toast.success('Chamado editado com sucesso!');
                setCustomerSelected(0);
                setComplemento('');
                history.push('/dashboard');
            })
            .catch((err) => {
                toast.error('Ops... algo deu errado!');
                console.log(err);
            })

            return;
        }

    

        await firebase.firestore().collection('chamados')
        .add({
            created: new Date(),
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            status: status,
            complemento: complemento,
            userId: user.uid,
        })

        .then(() => {
            toast.success('Chamado registrado com sucesso!');
            setComplemento();
            setCustomerSelected(0);
            setAssunto('Suporte');
        })

        .catch((error) => {
            console.log('Erro encontrado ' + error);
            toast.error('Ops... Algo deu errado!');
        })
    }

    return (
        <div>
            <Header />
            
            <div className='content'>
                <Title name='Novo Chamado'>
                    <FiPlus size={24} />
                </Title>

                <div className='container'>

                    <form className='form-profile' onSubmit={handleRegister}>

                        <label>
                            Cliente:
                        </label>

                        {loadCustomers ? (
                            <input type='text' disabled={true} value='Carregando clientes...' />
                        ) : (
                            <select value={customerSelected} onChange= {handleChangeCustomers}>
                            {customers.map((item, index) => {
                                return(
                                    <option key = {item.id} value = {index}>
                                        {item.nomeFantasia}
                                    </option>
                                    )
                                })}
                            </select>
                        )}



                        <label>
                            Assunto:
                        </label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value='Suporte'>
                                Suporte
                            </option>
                            <option value='Visita T??cnica'>
                                Visita T??cnica
                            </option>
                            <option value='Financeiro'>
                                Financeiro
                            </option>
                        </select>

                        <label>
                            Status:
                        </label>
                        <div className='status'>
                            <input 
                            type='radio'
                            name='radio'
                            value='Aberto'
                            onChange={handleOptionChange}
                            checked={ status === 'Aberto' }
                            />
                            <span>Em Aberto</span>

                            <input 
                            type='radio'
                            name='radio'
                            value='Progresso'
                            onChange={handleOptionChange}
                            checked={ status === 'Progresso' }
                            />
                            <span>Em Progresso</span>

                            <input 
                            type='radio'
                            name='radio'
                            value='Atendido'
                            onChange={handleOptionChange}
                            checked={ status === 'Atendido' }
                            />
                            <span>Atendido</span>
                        </div>

                        <label>
                            Complemento:
                        </label>
                        <textarea 
                        type='text'
                        placeholder='Descreva seu problema (opcional)'
                        onChange={handleAddComplemento}
                        value={complemento}
                        />

                        <button type='submit'>
                            Registrar
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}

export default New;