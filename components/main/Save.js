import React, { useState } from 'react'
import { View, TextInput, Image, Button } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { getFirestore, collection, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import {auth,storage} from '../../firebase'
export default function Save(props) {
    const [caption, setCaption] = useState("")
    const uploadImage = async () => {
        const uri = props.route.params.image;
        const user = auth.currentUser;
        const childPath = `post/${user.uid}/${Math.random().toString(36)}`;
        console.log(childPath)
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageReference = storageRef(storage, childPath);
        const uploadTask = uploadBytesResumable(storageReference, blob);
    
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            }, 
            (error) => {
                // Handle unsuccessful uploads
                console.error(error);
            }, 
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    savePostData(downloadURL);
                    console.log(downloadURL);
                });
            }
        );
       
    }

    const savePostData = (downloadURL) => {
        const auth = getAuth();
        const firestore = getFirestore();
        const user = auth.currentUser;
        
        if (!user) {
            // Handle the case where the user is not logged in
            console.error("No user logged in");
            return;
        }
        addDoc(collection(firestore, 'posts', user.uid, 'userPosts'), {
            downloadURL,
            caption,
            creation: serverTimestamp()
        }).then(() => {
            props.navigation.popToTop();
        }).catch((error) => {
            console.error("Error adding document: ", error);
        });
    }
    return (
        <View style={{ flex: 1 }}>
            <Image source={{ uri: props.route.params.image }} />
            <TextInput
                placeholder="Write a Caption . . ."
                onChangeText={(caption) => setCaption(caption)}
            />

            <Button title="Save" onPress={() => uploadImage()} />
        </View>
    )
  
}
