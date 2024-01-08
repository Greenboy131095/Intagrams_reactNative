
import { auth, firestore , storage} from '../../firebase';
import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE } from '../constants/index'
import { getFirestore, collection, doc,getDocs, getDoc, query, orderBy } from 'firebase/firestore';
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
    return ((dispatch) => {
        // Reference to the 'userFollowing' sub-collection
        const userFollowingRef = firestore.collection("following")
                                          .doc(auth.currentUser.uid)
                                          .collection("userFollowing");

        // Real-time listener
        userFollowingRef.onSnapshot((snapshot) => {
            let following = snapshot.docs.map(doc => doc.id);
            dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
        });
    });
}