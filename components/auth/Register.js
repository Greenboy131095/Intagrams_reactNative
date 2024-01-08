import React, { Component } from 'react'
import { View, Button, TextInput } from 'react-native'
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCSHSkzES1DTkDRSvSBLEyZy6O_yRhYgEI",
    authDomain: "instagram-7dc1d.firebaseapp.com",
    databaseURL: "https://instagram-7dc1d-default-rtdb.firebaseio.com",
    projectId: "instagram-7dc1d",
    storageBucket: "instagram-7dc1d.appspot.com",
    messagingSenderId: "65063750832",
    appId: "1:65063750832:web:38b908368b4321a1e97f75",
    measurementId: "G-Q1HY8L7GQG"
  };
  
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
export class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            name: ''
        }

        this.onSignUp = this.onSignUp.bind(this)
    }

    async onSignUp() {
        const { email, password, name } = this.state;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Signed in 
            const user = userCredential.user;
            console.log('Registered with:', user.email);

            // Add a new document in collection "users"
            await setDoc(doc(firestore, "users", user.uid), {
                name,
                email,
            });
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
            console.error(errorCode, errorMessage);
        }
    }

    render() {
        return (
            <View>
                <TextInput
                    placeholder="name"
                    onChangeText={(name) => this.setState({ name })}
                />
                <TextInput
                    placeholder="email"
                    onChangeText={(email) => this.setState({ email })}
                />
                <TextInput
                    placeholder="password"
                    secureTextEntry={true}
                    onChangeText={(password) => this.setState({ password })}
                />

                <Button
                    onPress={() => this.onSignUp()}
                    title="Sign Up"
                />
            </View>
        )
    }
}

export default Register