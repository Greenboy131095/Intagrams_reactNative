import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TextInput } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUsersData } from '../../redux/actions/index';

// Firebase v10 modular imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Initialize Firebase
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
const db = getFirestore(app);
const auth = getAuth(app);

function Comment(props) {
    const [comments, setComments] = useState([]);
    const [postId, setPostId] = useState("");
    const [text, setText] = useState("");

    useEffect(() => {

        function matchUserToComment(comments) {
            for (let i = 0; i < comments.length; i++) {
                if (comments[i].hasOwnProperty('user')) {
                    continue;
                }
                console.log(props.users)
                const user = props.users.find(x => x.uid === comments[i].creator);
                if (user === undefined) {
                    props.fetchUsersData(comments[i].creator, false);
                } else {
                    comments[i].user = user;
                }
            }
            console.log(comments);
            setComments(comments);
        }

        if (props.route.params.postId !== postId) {
            const commentsRef = collection(db, 'posts', props.route.params.uid, 'userPosts', props.route.params.postId, 'comments');
            getDocs(commentsRef)
                .then((snapshot) => {
                    let comments = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data };
                    });
                    matchUserToComment(comments);
                });
            setPostId(props.route.params.postId);
        } else {
            matchUserToComment(comments);
        }
    }, [props.route.params.postId, props.users]);

    const onCommentSend = () => {
        const commentsRef = collection(db, 'posts', props.route.params.uid, 'userPosts', props.route.params.postId, 'comments');
        addDoc(commentsRef, {
            creator: auth.currentUser.uid,
            text
        });
    };

    return (
        <View>
            <FlatList
                numColumns={1}
                horizontal={false}
                data={comments}
                renderItem={({ item }) => (
                    <View>
                        {item.user !== undefined ?
                            <Text>
                                {item.user.name}
                            </Text>
                            : null}
                        <Text>{item.text}</Text>
                    </View>
                )}
            />

            <View>
                <TextInput
                    placeholder='comment...'
                    onChangeText={(text) => setText(text)} />
                <Button
                    onPress={() => onCommentSend()}
                    title="Send"
                />
            </View>
        </View>
    );
}

const mapStateToProps = (store) => ({
    users: store.usersState.users
});
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Comment);
