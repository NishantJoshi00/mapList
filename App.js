import { StatusBar } from 'expo-status-bar';
  
import React, {useState, useEffect} from 'react';
import { PermissionsAndroid, PermissionStatus, KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ScrollView, Platform, Button, Image, BackHandler, Dimensions, ToastAndroid } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
const BACKGROUND_COLOR = "white"
const FONT_COLOR = "#61adbf"
const COMPONENT_COLOR = '#bfb5d7'
const SUB_COMPONENT_COLOR = 'yellow'
import AppLoading from 'expo-app-loading';

const styles = StyleSheet.create({
	mainWrapper: {
		height: "100%",
		width: "100%",
		padding: 10,
		paddingTop: 40,
		backgroundColor: BACKGROUND_COLOR
	},
	navbar: {
		width: "100%",
	},
	titleText: {
		textAlign: "center",
		fontSize: 50,
		color: FONT_COLOR,
	},
	listComponent: {
		backgroundColor: COMPONENT_COLOR,
		height: "80%",
		margin: 10,
		borderRadius: 20
	},
	textField: {
		borderStyle: "solid",
		borderWidth: .5,
		padding: 10,
		marginTop: 10,
		marginBottom: 10,
		fontSize: 20,
		borderRadius: 2,
		flex: 1
		
	},
	labelField: {
		padding: 10,
		marginTop: 10,
		marginBottom: 10,
		fontSize: 20,
		flex: 1
	},
	taskEditorComponent: {
		padding: 10,
		marginTop: 10,
		display: 'flex',
		flexDirection: 'row'
	},
	navButton: {

	},
	icon: {
		width: 30,
		height: 30
	},
	onlyButton: {
		alignItems: "center",
		margin: 20,
		borderStyle: 'solid',
		borderWidth: 1,
		marginLeft: "40%",
		marginRight: "40%",
		padding: 10,
		borderRadius: 2
	},
  mapView: {
    width: "100%",
    height: 500,
  },

})




const requestLocationPermission = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status != 'granted') {
    ToastAndroid.show("Permission Denied")
  }
}


const Title = (props) => {

	return (
		<View style={styles.navbar}>
			<Text style={styles.titleText}>Map List</Text>
		</View>
	)
}

const TaskList = (props) => {

	return (
		<View style={styles.listComponent}>
			<ScrollView>

			</ScrollView>
		</View>
	)
}



const AddTask = (props) => {
	const addTaskPage = () => {
		props.state(false)
	}
	return (
		<View>
			<TouchableOpacity onPress={addTaskPage} title="+" style={styles.onlyButton}>
				<Image source={require("./assets/plus.png")} style={styles.icon}/>
			</TouchableOpacity>
		</View>
	)
}

const GotoHome = (props) => {
	const goHome = () => {
		props.state(true)
	}
	return (
		<TouchableOpacity onPress={goHome} title="" style={styles.navButton}>
			<Image source={require("./assets/back-arrow.png")} style={styles.icon}/>
		</TouchableOpacity>
	)
}

const TaskCreator = (props) => {
	let [taskName, setTaskName] = useState("");
	let [radius, setRadius] = useState("50");
	let [userLocation, setUserLocation] = useState();
	let [marker, setMarker] = useState(null);
	let [AOE, setAOE] = useState(null);
	let [coord, setCoord] = useState(null);
  	Location.getForegroundPermissionsAsync()
    	.then((data) => {
    	  if (!data.granted) BackHandler.exitApp()
    	  else {
    	    Location.getCurrentPositionAsync()
    	      .then((data) => {
    	        setUserLocation(data)
    	      })
    	      .catch(console.warn)
    	  }
    	})
    .catch(console.warn)
	const saveTask = () => {
		// Verify Data
		if (taskName == "" || radius == "0" || coord == null) {
			ToastAndroid.show("Might be something you haven't filled yet.", ToastAndroid.SHORT)
		}
	}
  
  if (userLocation == null) {
    
    return (
      <AppLoading />
    )
  } else {
    
    return (
      <View style={styles.mainWrapper}>
        <View style={styles.taskEditorComponent}>
          <GotoHome state={props.setPage}/>
        </View>
        
        <View style={styles.taskEditorComponent}>
          <TextInput style={styles.textField} onChangeText={setTaskName} value={taskName} placeholder="task name" />
        </View>
  
        <View style={styles.taskEditorComponent}>
          <Text style={[styles.labelField, {fontWeight: 'bold'}]}>radius:</Text>
          <TextInput style={styles.textField} onChangeText={(val) => {
			  if (val == "") {
				  setRadius("0")
			  } else {
				  setRadius(val)
			  }
		  }} value={radius} keyboardType="numeric" />
          <Text style={styles.labelField}>m</Text>
        </View>
        <View style={[styles.taskEditorComponent]}>
          <MapView style={styles.mapView} showsUserLocation={true} zoomEnabled={true} initialRegion={{
            longitude: userLocation.coords.longitude,
            latitude: userLocation.coords.latitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }} onPress={(point) => {
			  setCoord(point.nativeEvent.coordinate);
			  setMarker(<Marker coordinate={point.nativeEvent.coordinate} />);
			  setAOE(<Circle center={point.nativeEvent.coordinate} radius={parseInt(radius)} strokeWidth={1.5} strokeColor={"#1484CD"} fillColor={"#1484CD50"} />)
		  }}>
			  {marker}
			  {AOE}
		  </MapView>
        </View>
  
  
        <View style={styles.taskEditorComponent}>
          <Button title="save" onPress={saveTask} style={styles.onlyButton}/>
        </View>
  
      </View>
    )
  }
	
}

export default function App() {
	let [getPage, setPage] = useState(true);
	
	useEffect(() => {
    requestLocationPermission()
		const backHandler = BackHandler.addEventListener("hardwareBackPress", () => { 
			if (!getPage) {
				setPage(true)
				return true
			} else {
				BackHandler.exitApp()
				return false
			}
			
		})

		return () => backHandler.remove();
	})
	
	if (getPage) {
		return (
			<View style={styles.mainWrapper}>
				<Title />
				<TaskList />
				<AddTask state={setPage}/>
			</View>
		)
	} else {
		
		return (
			<TaskCreator page={getPage} setPage={setPage}/>
		)
	}
	

}

