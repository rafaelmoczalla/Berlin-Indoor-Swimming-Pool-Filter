import { useEffect, useState, useCallback } from 'react';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text } from 'react-native';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  
  const [text, onChangeText] = useState('Wrtie some Text');
  const [number, onChangeNumber] = useState('');

  const styles = StyleSheet.create({
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    },
  });

  const [badText, setBadText] = useState("Waiting...");
  
  // Read text from URL location
  const url = 'https://www.berlinerbaeder.de/baeder/bad-suche/#/';
  
  const makeAPICall = useCallback(async () => {
    await fetch('https://cors-anywhere.herokuapp.com/' + url, {
      method: 'GET'
    })
    .then(response => {
      if (response.ok) {
        console.log(response);
        response.text().then(text => {
          var parser = new DOMParser();
        	var list = parser.parseFromString(text, 'text/html').getElementById('filter');
          if (list !== null) {
            var bad = list.getElementsByTagName('li');
            console.log(bad);
            setBadText(bad[0].innerText);
          }
          else {
            console.log('Empty pool list.');
          }
        });
      } else {
        console.log('failed');
      }
    });
  }, []);

  // Send an async HTTP Get request to the url
  useEffect(() => {
    makeAPICall()
    .catch(console.error);
  }, [makeAPICall])

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
        <Text style={styles.input}>
          {badText}
        </Text>
      </SafeAreaProvider>
    );
  }
}
