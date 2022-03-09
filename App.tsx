import { useEffect, useState, useCallback } from 'react';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, FlatList, View } from 'react-native';

import useCachedResources from './hooks/useCachedResources';

export default function App() {
  const [textList, setTextList] = useState(["Waiting..."]);

  let dayMap = new Map<number, string>([
    [1, 'Montag'],
    [2, 'Dienstag'],
    [3, 'Mittwoch'],
    [4, 'Donnerstag'],
    [5, 'Freitag'],
    [6, 'Samstag'],
    [7, 'Sonntag']
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
    //'61', '62', '64', ];
  
  const makeAPICall = useCallback(async () => {
    do {
      var fetches: any[] = [];

      for (var ib in bathNrs) {
        fetches.push(
          fetch('https://thingproxy.freeboard.io/fetch/' + url + bathNrs[ib] + '/', {
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


  const isLoadingComplete = useCachedResources();

  const styles = StyleSheet.create({
    title: {
      height: 40,
      margin: 6,
      borderWidth: 1,
      padding: 10,
      fontWeight: 'bold',
      color: '#dc143c',
    },
    item: {
      height: 40,
      margin: 6,
      borderWidth: 1,
      padding: 10,
    },
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
        <FlatList data={textList} renderItem={renderItem}/>
      </SafeAreaProvider>
    );
  }
}
