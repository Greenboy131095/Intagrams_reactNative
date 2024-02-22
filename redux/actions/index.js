
import { auth, firestore , storage} from '../../firebase';
import { getAuth } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { USERS_DATA_STATE_CHANGE } from '../constants';
import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE,USER_FOLLOWING_STATE_CHANGE,USERS_POSTS_STATE_CHANGE } from '../constants/index'
import { getFirestore, collection, doc,getDocs, getDoc, query, orderBy,onSnapshot } from 'firebase/firestore';


export function clearData() {
  return ((dispatch) => {
      dispatch({type:'CLEAR_DATA'})
  })
}
     
export function fetchUser() {
    return ((dispatch) => {

        const user = auth.currentUser;
       
        if (!user) return;

        const userRef = doc(firestore, "users", user.uid);
        getDoc(userRef).then((snapshot) => {
            if(snapshot.exists()){
                const data = snapshot.data();
                dispatch({ type: USER_STATE_CHANGE, currentUser:{...data , uid:user.uid} });
            } else {
                console.log('does not exist');
            }
        });
    });
}
export function fetchUserPosts() {
    return async (dispatch) => {
        const currentUser = auth.currentUser;   
       console.log(firestore)

        // Ensure the user is authenticated before fetching their posts
        if (!auth.currentUser) {
            console.log('No user logged in');
            return;
        }

        const userPostsRef = collection(firestore, "posts", currentUser.uid, "userPosts");
        const q = query(userPostsRef, orderBy("creation", "asc"));

        try {
            const snapshot = await getDocs(q);
            let posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));   
            
            dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
        } catch (error) {
            console.error("Error fetching user posts:", error);
        }
    }
}
export function fetchUserFollowing() {
    return (dispatch) => {
        const db = getFirestore();
        const auth = getAuth();

        // Reference to the 'userFollowing' sub-collection
        const userFollowingRef = collection(db, 'following', auth.currentUser.uid, 'userFollowing');

        // Real-time listener
        onSnapshot(userFollowingRef, (snapshot) => {
            let following = snapshot.docs.map((doc) => doc.id);
            dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
            for(let i = 0; i < following.length; i++){
                dispatch(fetchUsersData(following[i],true));
            }
        });
    };
}
export function fetchUsersData(uid,getPosts){
    return async (dispatch,getState)=>{
        const db = getFirestore();
        const userFound = getState().usersState.users.some(el=>el.uid===uid)
        if (!userFound) {
            try {
              const userDocRef = doc(db, 'users', uid);
              const snapshot = await getDoc(userDocRef);
      
              if (snapshot.exists()) {
                const user = snapshot.data();
                user.uid = snapshot.id;

                dispatch({ type: USERS_DATA_STATE_CHANGE, user });
                if(getPosts){
                  dispatch(fetchUsersFollowingPosts(uid));
              }
              } else {
                console.log('User does not exist');
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }
    }
}
export function fetchUsersFollowingPosts(uid) {
    return (dispatch, getState) => {
      try {
        const user = getState().usersState.users.find(el => el.uid === uid);

  
        const q = query(
          collection(firestore, 'posts', uid, 'userPosts'),
          orderBy('creation', 'asc')
        );
  
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const posts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            user,
          }));
  
          dispatch({ type: USERS_POSTS_STATE_CHANGE, posts, uid });
        });
  
        return unsubscribe; // Return the unsubscribe function to stop listening to updates when necessary
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };
  }
  export function fetchUsersFollowingLikes(uid, postId) {
    return (dispatch) => {
        const db = getFirestore();
        const currentUserUid = firebase.auth().currentUser.uid;

        const unsubscribe = db.collection("posts")
            .doc(uid)
            .collection("userPosts")
            .doc(postId)
            .collection("likes")
            .doc(currentUserUid)
            .onSnapshot((snapshot) => {
                const postId = snapshot.id;

                let currentUserLike = false;
                if(snapshot.exists()){
                    currentUserLike = true;
                }

                dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike })
            });

        // Optionally, you can return the unsubscribe function
        // if you want to handle unsubscription elsewhere.
        // return unsubscribe;
    };
}
