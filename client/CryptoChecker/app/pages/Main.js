import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import Login from '../components/Login';

const Main = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Login />
      <Button onPress={()=>{navigation.navigate('SignUp');}} style={styles.button} mode="contained">
        Registrar
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    marginTop: 10,
  },
});

export default Main;