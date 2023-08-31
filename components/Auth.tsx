import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "../firebase/clientApp";


//Configure Firebase UI
const uiConfig = {
    // Redirect to root directory after sign in is successful.
    signInSuccessURL: "/",
    //display auth providers in array
    signInOptions:  [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
};

export default function SignInScreen() {
    return (
        <div
            style = {{
                maxWidth: "320px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: '0',
                color: 'white',
                padding: '30px',
                borderRadius: '20px',
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
            }}
        >
            <h1 style={{textAlign: 'center', fontSize: '20px', padding: '20px'}}>Welcome to ChatterAI</h1>
            <p>Please sign-in to continue</p>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>

        </div>
    )
}

