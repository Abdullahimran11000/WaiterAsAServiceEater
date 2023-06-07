import React from 'react';
import {useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SocketContext, socket_connection} from '../Context/SocketContext';

// Auth Stack
import Splash from '../Auth/Splash';
import Login from '../Auth/Login';
import TablesList from '../Auth/TablesList';

// Stack
import Terms from '../Screens/Terms';
import Categories from '../Screens/Categories';
import CategoryProducts from '../Screens/CategoryProducts';
import ProductDetails from '../Screens/ProductDetails';
import Cart from '../Screens/Cart';
import Servey from '../Screens/Servey';
import AsyncStorage from '@react-native-async-storage/async-storage';

let AuthStack = createStackNavigator();
let Stack = createStackNavigator();

const navigationOption = () => {
  return {
    headerShown: false,
    headerBackTitleVisible: false,
  };
};

const AuthStackScreens = () => {
  return (
    <AuthStack.Navigator screenOptions={navigationOption()}>
      <AuthStack.Screen name="Splash" component={Splash} />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="TablesList" component={TablesList} />
    </AuthStack.Navigator>
  );
};

const StackScreens = () => {
  const {user, cloudIp} = useSelector(store => store.sessionReducer);

  const location_id = user?.role[0]?.staff_location_id;
  const user_id = user?.role[0]?.user_id;
  const role = user?.staff_role_name;
  const token = user?.token;

  return (
    <SocketContext.Provider
      value={socket_connection(user_id, role, location_id, token, cloudIp)}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={navigationOption()}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Terms" component={Terms} />
        <Stack.Screen name="Categories" component={Categories} />
        <Stack.Screen name="CategoryProducts" component={CategoryProducts} />
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="Servey" component={Servey} />
      </Stack.Navigator>
    </SocketContext.Provider>
  );
};

const Navigator = () => {
  const {session} = useSelector(store => store.sessionReducer);

  return (
    <NavigationContainer>
      {session == null ? <AuthStackScreens /> : <StackScreens />}
    </NavigationContainer>
  );
};

export default Navigator;
