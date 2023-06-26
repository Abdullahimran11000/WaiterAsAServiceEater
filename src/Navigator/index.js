import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
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
import Popup from '../Components/Popup';

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
  const dispatch = useDispatch();
  const {user, cloudIp} = useSelector(store => store.sessionReducer);
  const [popup, setPopup] = useState(false);

  const location_id = user?.role[0]?.staff_location_id;
  const user_id = user?.role[0]?.user_id;
  const role = user?.staff_role_name;
  const token = user?.token;

  const handlePopClose = () => {
    dispatch({
      type: 'SET_IS_POPUP_RECEIVED',
      payload: false,
    });
    dispatch({
      type: 'SET_POPUP_DATA',
      payload: null,
    });
    setPopup(false);
  };

  return (
    <SocketContext.Provider
      value={socket_connection(user_id, role, location_id, token, cloudIp)}>
      <SocketContext.Consumer>
        {socket => {
          socket.on('test', res => {
            if (Object.keys(res).length > 0) {
              dispatch({
                type: 'SET_POPUP_DATA',
                payload: res.data,
              });
              setPopup(true);
            }
          });

          return (
            <>
              {popup ? <Popup handlePopClose={handlePopClose} /> : null}
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={navigationOption()}>
                <Stack.Screen name="Splash" component={Splash} />
                <Stack.Screen name="Terms" component={Terms} />
                <Stack.Screen name="Categories" component={Categories} />
                <Stack.Screen
                  name="CategoryProducts"
                  component={CategoryProducts}
                />
                <Stack.Screen
                  name="ProductDetails"
                  component={ProductDetails}
                />
                <Stack.Screen name="Cart" component={Cart} />
                <Stack.Screen name="Servey" component={Servey} />
              </Stack.Navigator>
            </>
          );
        }}
      </SocketContext.Consumer>
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
