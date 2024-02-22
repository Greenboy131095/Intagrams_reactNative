import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Image, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { getFirestore, collection, doc,getDocs, getDoc, query, where, orderBy,setDoc,deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function Profile(props) {
    const [userPosts, setUserPosts] = useState([]);
    const [user, setUser] = useState({name:"",email:"",uid:""});
    const [following, setFollowing] = useState(false);

    useEffect(() => {
        const { currentUser, posts } = props;
        const auth = getAuth();
        const db = getFirestore();
          
        if (props.route.params.uid === currentUser.uid) {
            setUser(currentUser);
            setUserPosts(posts);
        } else {
            const userDocRef = doc(db, 'users', props.route.params.uid);
            const postsQuery = query(
                collection(db, 'posts', props.route.params.uid, 'userPosts'),
                orderBy('creation', 'asc')
            );

            getDoc(userDocRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        setUser(snapshot.data());
                    } else {
                        console.log('does not exist');
                    }
                })
                .catch((error) => {
                    console.error('Error getting user document:', error);
                });

            getDocs(postsQuery)
                .then((querySnapshot) => {
                    let posts = querySnapshot.docs.map((doc) => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data };
                    });
                    setUserPosts(posts);
                })
                .catch((error) => {
                    console.error('Error getting user posts:', error);
                });
        }
        console.log(props.following);
        if (props.following.indexOf(props.route.params.uid) > -1) {
            setFollowing(true);
        } else {
            setFollowing(false);
        }
    }, [props.route.params.uid, props.following]);

    const onFollow = () => {
        const auth = getAuth();
        const db = getFirestore();
        const currentUser = auth.currentUser;
        const followingRef = doc(db, 'following', currentUser.uid, 'userFollowing', props.route.params.uid);
        setDoc(followingRef, {});
    };
    const onLogout=()=>{
        const auth = getAuth();
        auth.signOut();
    }
    const onUnfollow = () => {
        const auth = getAuth();
        const db = getFirestore();
        const currentUser = auth.currentUser;
        const followingRef = doc(db, 'following', currentUser.uid, 'userFollowing', props.route.params.uid);
        deleteDoc(followingRef);
    };

    if (user === null) {
        return <View />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.containerInfo}>
                <Text>{user.name}</Text>
                <Text>{user.email}</Text>

                {props.route.params.uid !== getAuth().currentUser.uid ? (
                    <View>
                        {following ? (
                            <Button title="Following" onPress={() => onUnfollow()} />
                        ) : (
                            <Button title="Follow" onPress={() => onFollow()} />
                        )}
                    </View>
                ) : <Button 
                    title="logout"
                    onPress ={()=> onLogout()}

                />}
            </View>

            <View style={styles.containerGallery}>
                <FlatList
                    numColumns={3}
                    horizontal={false}
                    data={userPosts}
                    renderItem={({ item }) => (
                        <View style={styles.containerImage}>
                            <Image style={styles.image} source={{ uri: item.downloadURL }} />
                        </View>
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerInfo: {
        margin: 20,
    },
    containerGallery: {
        flex: 1,
    },
    containerImage: {
        flex: 1 / 3,
    },
    image: {
        flex: 1,
        aspectRatio: 1 / 1,
    },
});

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    posts: store.userState.posts,
    following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
