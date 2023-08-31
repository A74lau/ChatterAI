import Head from "next/head";
import Image from "next/image";
import firebase from "../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import  Auth  from "../components/Auth";
import { useState, useRef } from "react";
import styles from "./styles.module.css";
import Logo from "./logo.png";
import Icon from "./Icon.png";
import Link from 'next/link';
import { Configuration, OpenAIApi } from "openai";


const auth = firebase.auth();
const firestore = firebase.firestore();
const API_KEY = '';

function ChatRoom() {
  const scroll = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    if (formValue != '') {
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
    }

    setFormValue('');
    scroll.current.scrollIntoView({behavior: 'smooth'});
  }

  return (
  <>
    <h1 style={{color: 'white', paddingBottom: '10px', fontSize: '25px'}}>CHAT</h1>
    <div style={{ borderTop: '1px solid #ffff', paddingBottom: '30px'}}></div>

    <div>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <div ref={scroll}></div>

    </div>

    
    <form className={styles.form} onSubmit={sendMessage}>
      <input className={styles.formInput} value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type your message here..." />
      <button className={styles.formButton} type="submit">➤</button>
    </form>
  </>
  )
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <>
      <div className={styles[messageClass]}>
        <img src={photoURL} className={styles.userProfile}/>
        <p className={styles.message}>{text}</p>
      </div>
    </>
  )
}

function ChatQA(props) {
  const { text, uid, photoURL } = props.question;

  const questionClass = uid === auth.currentUser.uid ? 'sent' : 'chatbot';

  return (
    <>
      <div className={styles[questionClass]}>
        <img src={photoURL || Logo} className={styles.userProfile}/>
        <p className={styles.message}>{text}</p>
      </div>
    </>
  )
}

function ChatBot() {
  const scroll = useRef();

  const questionsRef = firestore.collection('questions');
  const responseRef = firestore.collection('responses');
  const query = questionsRef.orderBy('createdAt');
  const queryResponse = responseRef.orderBy('createdAt');

  const [questions] = useCollectionData(query, { idField: 'id' });
  const [responses] = useCollectionData(queryResponse, { idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const openai = new OpenAIApi(new Configuration({
    apiKey: API_KEY
  }))

  

  const receiveResponse = async(question) => {
    openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question}],
    }).then(res => {
      const responseMessage = res.data.choices[0].message.content;
      console.log(responseMessage);
      
      responseRef.add({
        text: responseMessage,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: "chatbot",
        photoURL: '',
      }).then(() => {
        scroll.current.scrollIntoView({ behavior: 'smooth' });
      })
    })
  }
  


  const sendQuestion = async (e) => {
    e.preventDefault();
  
    const { uid, photoURL } = auth.currentUser;
  
    if (formValue !== '') {
      await questionsRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });
  
      receiveResponse(formValue);
    }
    setFormValue('');
    scroll.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
  <>
    <h1 style={{color: 'white', paddingBottom: '10px', fontSize: '25px'}}>CHATBOT</h1>
    <div style={{ borderTop: '1px solid #ffff', paddingBottom: '30px'}}></div>

    <div>
      {questions && questions.map((q) => (
        <>
          <ChatQA key={q.id} question={q} />
          {responses && responses.map(r => {
            if (r.id === q.id) {
              return <ChatQA key={r.id} question={r} />;
            }
          })}
        </>
      ))}
      <div ref={scroll}></div>
    </div>

    
    <form className={styles.form} onSubmit={sendQuestion}>
      <input className={styles.formInput} value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Ask our AI anything..." />
      <button className={styles.formButton} type="submit">➤</button>
    </form>
  </>
  )
}

export default function Home() {
  /*destructure user, loading, and error out of hook:
      user: value of signin user
      loading: boolean value to see if loading or not
      error: see if error has occured trying to load user */
  const [user, loading, error] = useAuthState(auth);
  const [component, setComponent] = useState(<ChatRoom />);

  console.log("Loading:", loading, "|", "Current user:", user);
  console.log(component.type);

  return (
    <div className={styles.body}>
      {loading && <h4>Loading....</h4>}
      {!user && (
          <Auth/>
      )}
      {user && (
        <>
        <div className={styles.container}>
          <nav className = {styles.nav}>
            <Image src={Logo}  width={200} height={38} className={styles.navHead}/>
              <ul className={styles.navList}>
                <li>
                  <a onClick={() => setComponent(<ChatRoom />)} className={styles.navListItem}>💬 Chat</a>
                </li>
                <li>
                  <a onClick={() => setComponent(<ChatBot />)} className={styles.navListItem}>🤖 ChatBot</a>
                </li>
              </ul>
            <button className={styles.signOut} onClick={() => auth.signOut()}>Sign out</button>
          </nav>
          <div className={styles.chatRoom}>
            {component}
          </div>
        </div>
        </>
      )}
    </div>
  )
}





