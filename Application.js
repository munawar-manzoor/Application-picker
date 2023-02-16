import React, { useEffect, useState } from 'react'
import { Switch, Text, View, FlatList, TouchableOpacity, Image, StyleSheet ,ImageBackground} from 'react-native'
import { HStack, AppBar, Button,ActivityIndicator } from "@react-native-material/core";
import RNInstalledApplication from 'react-native-installed-application';
import { openDatabase } from 'react-native-sqlite-storage';
const appbg=require('../BackgroundImage/bg2.jpg')
var db = openDatabase({ name: 'App.db' });

function Application({ route, navigation }) {

  const [data, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
 
  useEffect(() => {
    setIsLoading(true);
    RNInstalledApplication.getNonSystemApps()
      .then(apps => {
       var temp=[];
        for (let i = 0; i < apps.length; i++) {

          setData(prevState => [...prevState, {
             appName: apps[i].appName,
             packageName: apps[i].packageName,
            icon: apps[i].icon
          }]);


        }

        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      })


  }, []);

 
  renderSeparator = () => (
    <View
      style={{
        backgroundColor: 'blue',

        height: 2,
      }}
    />
  );

  useEffect(() => {

    db.transaction((txn) => {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Photo_Table'",
        [],
        (tx, res) => {
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
          //  txn.executeSql('DROP TABLE IF EXISTS App_Table', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS App_Table(App_name VARCHAR(300),App_path VARCHAR(300),app_Icon VARCHAR(1000))',
              []
            );
          }
        }
      );

    })

    console.log('SQLite Database and Table Successfully Created...');
  })


  appDataBase = () => {

    db.transaction((tx) => {

      for (let i = 0; i < selected.length; i++) {
        const appName = selected[i].appName;
        const appPath = selected[i].packageName;
        const appIcon = selected[i].icon;
        tx.executeSql(
          'INSERT INTO App_Table (App_name,App_path,app_Icon) VALUES (?,?,?)',
          [appName, appPath,appIcon],
          (tx, results) => {
            console.log(`Inserted data: `);
          },
          (tx, error) => {
            console.log(`Error inserting data:`, error);
          },
        );

      }

    });
  
    navigation.navigate("Home_Screen", { file: 'file' });

  }


  return (

    <View style={{ flex: 1 }}>
      <ImageBackground source={appbg}>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        <HStack m={0} spacing={10}>
          <Text style={{ backgroundColor: 'blue', color: 'white', width: '50%' }}>application</Text>
          <Button title='select' style={{ marginLeft: 60 }} onPress={appDataBase}></Button>
        </HStack>


      </View>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
        data={data}
        ItemSeparatorComponent={renderSeparator}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', margin: 1 }}>
            <Image
              style={{ height: 50, width: 50, margin: 20 }}
              source={{ uri: `data:image/png;base64,${item.icon}` }}
            />
            <TouchableOpacity
              onPress={() => {
                if (selected.includes(item)) {
                  setSelected(selected.filter(i => i !== item));
                } else {
                  setSelected([...selected, item]);
                }
              }}
            >
              <Text style={{ color: selected.includes(item) ? "red" : "black", margin: 15 }}>
                {item.appName}
              </Text>

            </TouchableOpacity>
            
          </View>
        )}

      />
        
      )}
     
   </ImageBackground>
    </View>

   
  )
}




export default Application