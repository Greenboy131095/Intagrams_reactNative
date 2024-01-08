import React , {useState} from 'react'
import {app} from '../../firebase'
// Import the modular functions from Firebase
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

import {View, Text, TextInput, FlatList, TouchableOpacity} from 'react-native'
export default function Search(props) {
    const [users, setUsers] = useState([])  
    const fetchUsers =  async (search)=>{
        // Using the modular approach for Firestore queries
        const db = getFirestore(app); // Initialize Firestore with your Firebase app
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '>=', search));

        try {
            const snapshot = await getDocs(q);
            const usersArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersArray);
        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    }
  return (
    <View>
            <TextInput
                placeholder="Type Here..."
                onChangeText={(search) => fetchUsers(search)} />

            <FlatList
                numColumns={1}
                horizontal={false}
                data={users}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => props.navigation.navigate("Profile", {uid: item.id})}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    
  )
}
