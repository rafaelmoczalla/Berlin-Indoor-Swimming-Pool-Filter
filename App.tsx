import React, { useEffect, useState, useCallback, Component } from 'react';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, FlatList, View, Linking } from 'react-native';

import useCachedResources from './hooks/useCachedResources';

export default function App() {
  const [textList, setTextList] = useState(["Waiting..."]);

  let dayMap = new Map<number, string>([
    [0, 'Sonntag'],
    [1, 'Montag'],
    [2, 'Dienstag'],
    [3, 'Mittwoch'],
    [4, 'Donnerstag'],
    [5, 'Freitag'],
    [6, 'Samstag']
  ]);
  
  // Read text from URL location
  const url = 'https://pretix.eu/Baeder/';
  
  let bathNrs: string[];
  bathNrs = [ '79' ];

  //for (var i = 1; i < 180; ++i) {
  //  bathNrs.push(i.toString());
  //}
  //'1', '2', '7', '9', '11', '15', '17', '18', '19', '21', '24', '26', '27', '28', '29',
  //'30', '31', '34', '38', '42', '43', '45', '46', '47', '48', '49', '51', '52', '54', '60',
  //'61', '62', '64'
  
  const makeAPICall = useCallback(async () => {
    do {
      var fetches: any[] = [];

      for (var ib in bathNrs) {
        fetches.push(
          fetch('https://berlin-indoor-swimming-backend.herokuapp.com/' + url + bathNrs[ib] + '/', {//'http://localhost:5000/api/' + or 'https://backend-rafaelmoczalla.vercel.app/api/' +
            method: 'GET',
            headers: { 'Content-Type': 'application/json'}
          }).then(response => {
            console.log('res: ' + response);
            if (response.ok) {
              return response.text();
            } else {
              console.error('Cannot communicate with website.');
            }

            return 'failed';
          }).then(text => {
            if (text !== 'failed') {
              var parser = new DOMParser();
              var doc = parser.parseFromString(text, 'text/html');
              var list = doc.getElementsByClassName('event  available');
              if (list !== null) {
                var bath = doc.getElementsByClassName('content-header');
                var name = "Missing Name";
                if (bath[0].textContent !== null) {
                  name = bath[0].textContent.trim();
                }
                
                var out: string[] = [];//[name]; //this is to add the bath name, but it is uncommented, as we only look for one and this one is specially treated by adding a hyperlink to the text
                
                for(var i = 0; i < list.length; ++i) {
                  var outStr: string = '';

                  var time = list[i].querySelector('time');
                  var date = list[i].querySelector('span')?.getAttribute('data-time');
                  var dateStr: string;

                  if (date !== null && date !== undefined) {
                    dateStr = date;
                    var dateDate: Date = new Date(dateStr);
                    outStr += dayMap.get(dateDate.getDay()) + ', ';
                  }

                  if (time !== null) {
                    outStr += time.innerText + ', ';
                  }

                  if (date !== null && date !== undefined) {
                    dateStr = date;
                    var dateDate: Date = new Date(dateStr);
                    outStr += ("00" + dateDate.getDay()).slice(-2) + '.'
                      + ("00" + dateDate.getMonth()).slice(-2) + '.'
                      + dateDate.getFullYear();
                  }

                  out.push(outStr);
                }
                
                return(out);
              }
            }
          }).catch(error => {
            console.log('Error Msg: \n' + error);
            var out: string[] = [error.toString()];
            return(out);
          })
        );
      }

      Promise.all(fetches).then(function(list) {
        var outList: string[] = [];
        
        for (var strs in list) {
          if (list[strs] !== 'no slots free' && list[strs] !== 'failed') {
            for (var str in list[strs]) {
              outList.push(list[strs][str]);
            }
          }
        }
        
        setTextList(outList);
      });

      await new Promise(f => setTimeout(f, 60000));
    } while (true);
  }, []);

  // Send an async HTTP Get request to the url
  useEffect(() => {
    makeAPICall()
    .catch(console.error);
  }, [makeAPICall]);


  const isLoadingComplete = useCachedResources();

  const styles = StyleSheet.create({
    title: {
      height: 40,
      margin: 6,
      borderWidth: 1,
      padding: 10,
      fontWeight: 'bold',
      color: '#dc143c'
    },
    item: {
      height: 40,
      margin: 6,
      borderWidth: 1,
      padding: 10
    },
    link: {
      height: 40,
      margin: 6,
      borderWidth: 1,
      padding: 10,
      color: 'blue'
    }
  });

  const Item = ({text = 'Item'}) => (
    <View>
      <Text style={styles.item}>{text}</Text>
    </View>
  );

  const renderItem = ({item = 'renderItem'}) => (
    <Item text={item} />
  );

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <StatusBar />
        <Text style={styles.title}>Berlin Indoor Swimming Pool Filter</Text>
        <Text style={styles.link} onPress={() => Linking.openURL(url + bathNrs[0])}>
          Schwimm- und Sprunghalle im Europasportpark
        </Text>
        <FlatList data={textList} renderItem={renderItem}/>
      </SafeAreaProvider>
    );
  }
}
