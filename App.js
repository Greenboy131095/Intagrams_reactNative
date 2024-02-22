import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from './components/auth/Register'
import LandingScreen from './components/auth/Landing'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import LoginScreen from './components/auth/Login';
import {app,auth} from './firebase';
import { Provider } from 'react-redux';
import { applyMiddleware } from 'redux';
import rootReducer from './redux/reducers'
import { thunk } from 'redux-thunk';
import MainScreen from './components/Main';
import { configureStore } from '@reduxjs/toolkit';
import AddScreen from './components/main/Add'
import ProfileScreen from './components/main/Profile'
import SaveScreen from './components/main/Save'
import CommentScreen from './components/main/Comment'
import { getDefaultMiddleware } from '@reduxjs/toolkit';
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),

});
const Stack = createStackNavigator();
export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      loggedIn: false,
    }
  }
  componentDidMount() {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.setState({
          loggedIn: false,
          loaded: true,
        });
      } else {
        this.setState({
          loggedIn: true,
          loaded: true,
        });
      }
    });
  }

  render() {
    const { loggedIn, loaded } = this.state;
    if (!loaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text>Loading</Text>
        </View>
      )
    }
    if (!loggedIn) {
      return (
        
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return (
      <Provider store={store}>
        <NavigationContainer>
        <Stack.Navigator initialRouteName="Main">
          <Stack.Screen name="Main" component={MainScreen} options={{headerShown:false}}/>
          <Stack.Screen name="Add" component={AddScreen} navigation={this.props.navigation}/>
          <Stack.Screen name="Save" component={SaveScreen} navigation={this.props.navigation}/>
          <Stack.Screen name="Comment" component={CommentScreen} navigation={this.props.navigation}/>
        </Stack.Navigator>
        </NavigationContainer>
       
    </Provider>
    )
  }
}

export default App



