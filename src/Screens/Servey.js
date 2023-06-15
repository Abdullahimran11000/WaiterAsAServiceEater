import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';

import moment from 'moment';
import {useSelector, useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';

import Colors from '../Assets/Colors';
import {EndSession, SubmitResponse} from '../Server/Methods/Listing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SocketContext} from '../Context/SocketContext';
import StarRating from 'react-native-star-rating';
import {GetSurveyQuestionList} from '../Server/Methods/Listing';

const Servey = () => {
  const {session} = useSelector(store => store.sessionReducer);
  const {user} = useSelector(store => store.sessionReducer);

  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const location_id = user?.role[0]?.staff_location_id;

  const [fcm, setFcm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionList, setQuestionList] = useState([]);

  /* This `useEffect` hook is used to retrieve the FCM token from AsyncStorage and set it to the `fcm`
  state variable. It runs only once when the component mounts, as the dependency array `[]` is
  empty. */
  useEffect(() => {
    GetSurveyApi();
    AsyncStorage.getItem('fcmToken')
      .then(token => {
        setFcm(token);
      })
      .catch(error => {
        console.log('get fcm error ', error);
      });
  }, []);

  const GetSurveyApi = () => {
    try {
      GetSurveyQuestionList(location_id)
        .then(res => {
          setIsLoading(false);
          const {status, data} = res;
          if (status == 200 || status == 201) setQuestionList(data);
        })
        .catch(error => {
          setIsLoading(false);
          console.log('GetServerErrorInsideTry: ', error);
        });
    } catch (error) {
      setIsLoading(false);
      console.log('GetServeyError: ', error);
    }
  };

  const handleSubmitResponse = () => {
    setIsLoading(true);
    let response = [];

    questionList.map(data => {
      response.push({
        location_id: location_id,
        session_id: session.session_id,
        response: data.newTypeValue,
        question_id: data.question_id,
      });
    });

    try {
      SubmitResponse(location_id, {response: response})
        .then(res => {
          const {status} = res;
          if (status == 200 || status == 201) {
            setIsLoading(false);

            showMessage({
              message: 'Response Updated',
              type: 'success',
            });
            /*
             *  "handle close session" function is called here , we have to remove this function when need
             */
            handleCloseSession();
          } else {
            setIsLoading(false);
            showMessage({
              message: 'Could not update Response',
              type: 'warning',
            });
          }
        })
        .catch(error => {
          setIsLoading(false);
          console.log('submit response api error ', error);

          showMessage({
            message: 'Could not Response Api',
            type: 'warning',
          });
        });
    } catch (error) {
      setIsLoading(false);
      console.log('submit response Error ', error);

      showMessage({
        message: 'Could not Response',
        type: 'warning',
      });
    }
  };

  /**
   * This function handles the closing of a session by sending a request to the server and updating the
   * session status.
   */
  const handleCloseSession = () => {
    setIsLoading(true);

    try {
      const formData = {
        session_id: session.session_id,
        location_id: session.location_id,
        table_id: session.table_id,
        session_status: 'completed',
        session_date: session.session_date,
        start_time: session.start_time,
        end_time: moment().format('hh:mm:ss'),
        tab_device_token: fcm,
      };

      EndSession(formData)
        .then(res => {
          const {status, data} = res;

          if (status == 200 || status == 201) {
            setIsLoading(false);

            dispatch({
              type: 'SET_NEW_ORDER_TIME',
              payload: 0,
            });

            dispatch({
              type: 'RESET_SESSION_TOTAL',
            });

            dispatch({
              type: 'END_SESSION',
            });

            showMessage({
              message: 'Session Completed',
              type: 'success',
            });

            socket.emit('session_ended');
          } else {
            setIsLoading(false);
            showMessage({
              message: 'Could not complete session',
              type: 'warning',
            });
          }
        })
        .catch(error => {
          setIsLoading(false);
          console.log('end session api error ', error);

          showMessage({
            message: 'Could not complete session',
            type: 'warning',
          });
        });
    } catch (error) {
      setIsLoading(false);
      console.log('end session error ', error);

      showMessage({
        message: 'Could not complete session',
        type: 'warning',
      });
    }
  };

  const handleStarRating = (star, index) => {
    let copyArr = [...questionList];
    copyArr[index].typeValue = star;
    copyArr[index].newTypeValue = 'Rated ' + star;
    setQuestionList(copyArr);
  };

  const handleQuestionaire = (txt, index) => {
    let copyArr = [...questionList];
    copyArr[index].typeValue = txt;
    copyArr[index].newTypeValue = txt;
    setQuestionList(copyArr);
  };

  const handleComment = (txt, index) => {
    let copyArr = [...questionList];
    copyArr[index].typeValue = txt;
    copyArr[index].newTypeValue = txt;
    setQuestionList(copyArr);
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={'large'} color={Colors.primary} />
    </View>
  ) : (
    <>
      <View style={styles.container}>
        <View
          style={[styles.headerContainer, {backgroundColor: Colors.primary}]}>
          <Text style={styles.headerText}>Survey</Text>
        </View>
        <ScrollView
          style={styles.serveyContainer}
          showsVerticalScrollIndicator={false}>
          {questionList.map((quest, index) => (
            <View key={index} style={styles.question}>
              <Text style={styles.questionText}>{quest.question}</Text>
              {quest.type == 'Questionnaire' && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Anwer"
                  numberOfLines={2}
                  multiline
                  onChangeText={txt => handleQuestionaire(txt, index)}
                />
              )}
              {quest.type == 'Ratings' && (
                <View style={{width: '50%', alignSelf: 'center'}}>
                  <StarRating
                    disabled={false}
                    maxStars={5}
                    rating={quest?.typeValue}
                    selectedStar={rating => handleStarRating(rating, index)}
                    fullStarColor={Colors.primary}
                    halfStarEnabled={true}
                  />
                </View>
              )}
              {quest.type == 'Comments' && (
                <TextInput
                  style={styles.textInput}
                  numberOfLines={3}
                  multiline
                  placeholder="Comments"
                  onChangeText={txt => handleComment(txt, index)}
                />
              )}
            </View>
          ))}
        </ScrollView>
        <View style={styles.finishEat}>
          <TouchableOpacity
            style={[
              styles.startSessionButton,
              {
                paddingVertical: '2%',
              },
            ]}
            onPress={handleSubmitResponse}>
            <Text
              style={[
                styles.startSessionText,
                {
                  fontSize: 18,
                },
              ]}>
              Submit Survey
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Servey;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
    padding: 10,
  },
  headerText: {
    flex: 0.95,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.white,
  },
  serveyContainer: {
    width: Dimensions.get('window').width - 60,
    alignSelf: 'center',
    marginBottom: 20,
  },
  question: {
    paddingVertical: 10,
  },
  questionText: {
    fontSize: 20,
    color: Colors.blackText,
  },
  textInput: {
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  finishEat: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  startSessionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },

  startSessionButton: {
    width: '90%',
    borderRadius: 20,
    paddingVertical: 10,
    marginVertical: '1%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
});
