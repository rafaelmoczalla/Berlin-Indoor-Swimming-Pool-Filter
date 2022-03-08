import { useEffect, useState, useCallback } from 'react';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, FlatList, View } from 'react-native';

import useCachedResources from './hooks/useCachedResources';

export default function App() {
  const isLoadingComplete = useCachedResources();

  const styles = StyleSheet.create({
    input: {
      height: 40,
      margin: 6,
      borderWidth: 1,
      padding: 10,
    },
  });

  const Item = ({text = 'Item'}) => (
    <View>
      <Text style={styles.input}>{text}</Text>
    </View>
  );

  const renderItem = ({item = 'renderItem'}) => (
    <Item text={item} />
  );

  const [textList, setTextList] = useState(["Waiting..."]);
  
  // Read text from URL location
  const url = 'https://pretix.eu/Baeder/';
  
  let bathNrs: string[];
  bathNrs = [ '79' ];

  //for (var i = 1; i < 180; ++i) {
  //  bathNrs.push(i.toString());
  //}
    //'1', '2', '7', '9', '11', '15', '17', '18', '19', '21', '24', '26', '27', '28', '29',
    //'30', '31', '34', '38', '42', '43', '45', '46', '47', '48', '49', '51', '52', '54', '60',
    //'61', '62', '64', ];
  
  const makeAPICall = useCallback(async () => {
    do {
      var fetches: any[] = [];

      for (var ib in bathNrs) {
        fetches.push(
          fetch(url + bathNrs[ib] + '/', {
            method: 'GET'
          }).then(response => {
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
                
                var out: string[] = [name];
                
                for(var i = 0; i < list.length; ++i) {
                  var time = list[i].querySelector('time');
                  if (time !== null) {
                    out.push(time.innerText);
                  }
                }
                
                return(out);
              }
            }
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
  }, [makeAPICall])

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <StatusBar />
        <FlatList data={textList} renderItem={renderItem}/>
      </SafeAreaProvider>
    );
  }
}
