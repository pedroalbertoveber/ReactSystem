import { useState, useEffect, useContext } from 'react';
import firebase from '../../services/firebaseConnection';
import './dashboard.css';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiMessageSquare, FiPlus, FiSearch, FiEdit2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Modal from '../../components/Modal';

const listRef = firebase.firestore().collection('chamados').orderBy('created', 'desc');

function Dashboard() {
    const [chamados, setChamados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);
    const [lastDocs, setLastDocs] = useState('');

    const [showPostModal, setShowPostModal] = useState(false);
    const [detail, setDetail] = useState();

    useEffect(() => {

        async function loadChamados(){
            await listRef.limit(5)
            .get()
            .then((snapshot) => {
                updateState(snapshot);
            })
            .catch((error) => {
                console.log('Ops... algo deu errado: ' + error);
                setLoadingMore(false);
            })
    
            setLoading(false);
        }

        loadChamados();

        return () => {

        }
    }, []);



    async function updateState(snapshot) {
        const isCollectionEmpty = snapshot.size === 0;

        if (!isCollectionEmpty) {
            let lista = [];

            snapshot.forEach((doc) => {
                lista.push({
                    id: doc.id,
                    assunto: doc.data().assunto,
                    cliente: doc.data().cliente,
                    clienteId: doc.data().clienteId,
                    created: doc.data().created,
                    createdFormated: format(doc.data().created.toDate(), 'dd/MM/yyyy'),
                    status: doc.data().status,
                    complemento: doc.data().complemento,
                })
            })

            const lastDoc = snapshot.docs[snapshot.docs.length -1]; //ultimo documento buscado.

            setChamados(chamado => [...chamados, ...lista]);
            setLastDocs(lastDoc);
        } else {
            setIsEmpty(true);
        }

        setLoadingMore(false);
    }

    function togglePostModal(item) {
        setShowPostModal(!showPostModal);
        setDetail(item);
        console.log(item);
    }


    if (loading) {
        return(
            <div>
                <Header />
            
                <div className='content'>
                    <Title name='Atendimentos'>
                        <FiMessageSquare size={24} />
                    </Title>

                    <div className='container dashboard'>
                        <span>Buscando Chamados...</span>
                    </div>
                </div>
            </div>
        );
    }

    async function handleMore() {
        setLoadingMore(true);
        await listRef.startAfter(lastDocs).limit(5)
        .get()
        .then((snapshot) => {
            updateState(snapshot);
        })
    }

    return(
        <div>
            <Header />
            
            <div className='content'>
                <Title name='Atendimentos'>
                    <FiMessageSquare size={24} />
                </Title>
                {chamados.length === 0 ? (
                    <div className='container dashboard'>

                        <span>Nenhum chamado registrado</span>

                        <Link to = '/new' className='new' >
                            <FiPlus size={24} color='#fff' />
                            Novo Chamado
                        </Link>

                    </div>
                ) : (
                    <>
                        <Link to = '/new' className='new' >
                            <FiPlus size={24} color='#fff' />
                            Novo Chamado
                        </Link>

                        <table>
                            <thead>
                                <tr>
                                    <th scope='column'>Cliente</th>
                                    <th scope='column'>Assunto</th>
                                    <th scope='column'>Status</th>
                                    <th scope='column'>Cadastrado em</th>
                                    <th scope='column'>#</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chamados.map((item, index) => {
                                    return(
                                        <tr key={index}>
                                            <td data-label='Cliente'>{item.cliente}</td>
                                            <td data-label='Assunto'>{item.assunto}</td>
                                            <td data-label='Status'>
                                                <span className='badge' style={{backgroundColor: item.status === 'Aberto' ? '#5cb85c' : '#999'} }>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td data-label='Cadastrado'>{item.createdFormated}</td>
                                            <td data-label='#'>
                                                <button style={{backgroundColor: '#3583f6'}} className='action' onClick={() => togglePostModal(item) }>
                                                    <FiSearch color='#fff' size={17}/>
                                                </button>
                                                <Link style={{backgroundColor: '#f6a935'}} className='action' to={`/new/${item.id}`}>
                                                    <FiEdit2 color='#fff' size={17}/>
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                                
                            </tbody>

                        </table>
                        {loadingMore && <h3 style={{textAlign: 'center', marginTop: 15 }}>Buscando dados...</h3>}
                        {!loadingMore && !isEmpty && <button className='btn-more' onClick={handleMore}>
                            Buscar Mais
                        </button>}

                    </>
                )}
                

            </div>

            {showPostModal && (
                <Modal
                    conteudo={ detail }
                    close={togglePostModal}
                />
            )}

        </div>
    );
}

export default Dashboard;