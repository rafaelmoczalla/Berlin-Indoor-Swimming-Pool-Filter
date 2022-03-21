import React, { useEffect, useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import SelectDropdown from 'react-native-select-dropdown'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, Text, SectionList, Linking, SectionListData, View, ScrollView } from 'react-native';

import useCachedResources from './hooks/useCachedResources';
import DomParser from 'dom-parser';

const dayMap = new Map<number, string>([
  [0, 'Sunday'],
  [1, 'Monday'],
  [2, 'Tuesday'],
  [3, 'Wednesday'],
  [4, 'Thursday'],
  [5, 'Friday'],
  [6, 'Saturday']
]);

// Read text from URL location
var proxy = 'https://berlin-indoor-swimming-backend.herokuapp.com/';//'http://localhost:5000/api/' or 'https://berlin-indoor-swimming-backend.herokuapp.com/'
if (Platform.OS === "android")
  proxy = '';
const url = 'https://pretix.eu/Baeder/';

type poolData = {
  title: string;
  url: string;
  data: string[];
};

// Function to get all free slots from a indoor bath pool
function getFreeSlots(index: string, poolName: string): Promise<poolData | null> {
  return fetch(proxy + url + index + '/', {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html; charset=UTF-8'
    }
  }).then(async (response) => {
    if (response.ok) {
      var text = await response.text();

      var parser = new DomParser();
      var doc = parser.parseFromString(text);
      var list = doc.getElementsByClassName('event  available');

      if (list !== null) {
        var name = poolName;
        var link = response.url.substring(proxy.length);

        var data: string[] = [];

        for (var i = 0; i < list.length; ++i) {
          var outStr: string = '';

          var times: DomParser.Node[] | null = list[i].getElementsByTagName('time');
          var time = 'XX:XX';
          if (times !== null)
            time = times[0]?.innerHTML;
          var date:(string | undefined);
          list[i].getElementsByTagName('span')?.forEach((element: DomParser.Node) => {
            if (element.getAttribute('data-time') !== null)
              date = element.getAttribute('data-time')?.toString();
          });

          if (date !== null && date !== undefined) {
            outStr += dayMap.get(new Date(date).getDay()) + ', ';
          }

          if (time !== null) {
            outStr += time + ', ';
          }

          if (date !== null && date !== undefined) {
            outStr += date.substring(8, 10) + '.'
              + date.substring(5, 7) + '.'
              + date.substring(0, 4);
          } else {
            console.log(name + '    ' + date);
          }

          data.push(outStr);
        }

        if (data.length == 0) {
          var out: poolData = {
            title: name,
            url: link,
            data: [ 'Booked Out' ],
          };
  
          return out;
        }

        var out: poolData = {
          title: name,
          url: link,
          data: data,
        };

        return out;
      } else {
        return null;
      }
    } else {
      console.error('Cannot communicate with website.');
      return null;
    }
  }).catch(error => {
    console.log('Error Msg: \n' + error);
    return null;
  });
};

export default function App() {
  const appName = 'Berlin Indoor Swimming Pool Filter';
  const [textList, setTextList] = useState<poolData[]>([]);
  const defaultPool = '79';
  const [selectedPool, setSelectedPool] = useState<string | null>(defaultPool);
  
  // list of indoor swimming pool indexes
  const pools = new Map<string, string>([
    [ '1', 'Stadtbad Mitte' ],
    [ '2', 'Schwimmhalle Fischerinsel' ],
    [ '7', 'Sommerbad Humboldthain' ],
    [ '9', 'Kombibad Seestraße (Halle)' ],
    [ '11', 'Schwimmhalle Thomas-Mann-Straße' ],
    [ '15', 'Wellenbad am Spreewaldplatz' ],
    [ '17', 'Sommerbad Kreuzberg' ],
    [ '18', 'Stadtbad Schöneberg' ],
    [ '19', 'Sport - und Lehrschwimmhalle Schöneberg' ],
    [ '21', 'Stadtbad Charlottenburg "Alte Halle"' ],
    [ '24', 'Sommerbad Olympiastadion' ],
    [ '26', 'Stadtbad Spandau Nord' ],
    [ '27', 'Sommerbad Staaken' ],
    [ '28', 'Kombibad Spandau Süd (Halle)' ],
    [ '29', 'Stadtbad Wilmersdorf 1' ],
    [ '30', 'Stadtbad Wilmersdorf 2' ],
    [ '31', 'Sommerbad Wilmersdorf' ],
    [ '34', 'Schwimmhalle Hüttenweg' ],
    [ '38', 'Stadtbad Märkisches Viertel' ],
    [ '42', 'Stadtbad Lankwitz' ],
    [ '43', 'Schwimmhalle Finckensteinallee (Bad nur für Schwimmer geeignet)' ],
    [ '45', 'Sommerbad Insulaner' ],
    [ '46', 'Stadtbad Tempelhof' ],
    [ '47', 'Kombibad Mariendorf (Halle)' ],
    [ '48', 'Sommerbad Mariendorf (Rixdorfer Straße)' ],
    [ '49', 'Stadtbad Neukölln' ],
    [ '51', 'Sommerbad Neukölln' ],
    [ '52', 'Kombibad Gropiusstadt (Halle)' ],
    [ '54', 'Schwimmhalle Baumschulenweg' ],
    [ '60', 'Kleine Schwimmhalle Wuhlheide' ],
    [ '61', 'Schwimmhalle Allendeviertel' ],
    [ '62', 'Sommerbad Wuhlheide' ],
    [ '64', 'Schwimmhalle Sewanstraße' ],
    [ '68', 'Schwimmhalle Buch' ],
    [ '70', 'Sommerbad Pankow' ],
    [ '71', 'Schwimmhalle Helene-Weigel-Platz' ],
    [ '74', 'Schwimmhalle Zingster Straße' ],
    [ '76', 'Schwimmhalle Kaulsdorf' ],
    [ '79', 'Schwimm- und Sprunghalle im Europasportpark' ],
    [ '81', 'Schwimmhalle Kreuzberg' ]
  ]);

  const poolList = Array.from(pools.values());
  poolList.unshift('All');
  const indexList = Array.from(pools.keys());
  indexList.unshift('0');

  const fetchSlots = () => {
    var fetches: Promise<poolData | null>[] = [];

    if (selectedPool === null) {
      pools.forEach((value: string, key: string) => {
        fetches.push(getFreeSlots(key, value));
      });
    } else {
      var name = pools.get(selectedPool);
      if (name !== undefined)
        fetches.push(getFreeSlots(selectedPool, name));
    } 

    // collect data
    Promise.all(fetches).then((list: (poolData | null)[]) => {
      var outList: poolData[] = [];
      
      list.forEach((item: (poolData | null)) => {
        // only swimming pools with free spots
        if (item !== null)
          outList.push(item);
      });
      
      setTextList(outList);
    });
  };

  // Send an async HTTP Get requests to the urls
  useEffect(() => {
    fetchSlots();

    const id = setInterval(() => fetchSlots(), 60000);

    return () => clearInterval(id);
  }, [selectedPool]);


  const isLoadingComplete = useCachedResources();

  const width = '99%';
  const margin = '0.5%';

  const styles = StyleSheet.create({
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#dc143c'
    },
    titleBox: {
      height: 80,
      width: width,
      margin: margin,
      borderWidth: 1,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      textAlignVertical: 'center',
      alignContent: 'center',
      textAlign: 'center',
    },
    item: {
      height: 40,
      width: width,
      margin: margin,
      borderWidth: 1,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      textAlignVertical: 'center',
      alignContent: 'center',
      textAlign: 'center',
    },
    link: {
      textAlign: 'center',
      color: 'blue'
    },
    linkBox: {
      height: 40,
      width: width,
      margin: margin,
      borderWidth: 1,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      textAlignVertical: 'center',
      alignContent: 'center',
      textAlign: 'center'
    },
    button: {
      height: 40,
      width: width,
      margin: margin,
      borderWidth: 1,
      textAlign: 'center'
    },
    dropDown: {
      width: width,
      borderWidth: 1,
      textAlign: 'center'
    },
    container: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center'
    },
  });

  const renderItem = ({item = 'renderItem'}) => (
    <View style={styles.item}><Text>{item}</Text></View>
  );

  const renderSection = (info: { section: SectionListData<string, poolData>; }) => (
    <View style={styles.linkBox}>
      <Text style={styles.link} onPress={() => Linking.openURL(info.section.url)}>
        {info.section.title}
      </Text>
    </View>
  );

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <StatusBar />
        <View style={styles.titleBox}><Text style={styles.title}>{appName}</Text></View>
        <SelectDropdown
          dropdownStyle={styles.dropDown}
          buttonStyle={styles.button}
          data={poolList}
          defaultValue={pools.get(defaultPool)}
          onSelect={(selectedItem, index) => {
            if (selectedItem === 'All') {
              setSelectedPool(null);
            } else {
              var i = indexList[index];
              if (i !== null && i !== undefined) {
                setSelectedPool(i);
              }
            }
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem;
          }}
          rowTextForSelection={(item, index) => {
            return item;
          }}
        />
        <SectionList sections={textList}
          keyExtractor={(item, index) => item + index}
          renderItem={renderItem}
          renderSectionHeader={renderSection}
        />
      </SafeAreaProvider>
    );
  }
};
