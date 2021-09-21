import { StatusBar } from 'expo-status-bar';
  
import React, {useState, useEffect} from 'react';
import { PermissionStatus, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Button, Image, BackHandler, ToastAndroid, LayoutAnimation } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import AppLoading from 'expo-app-loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
const BACKGROUND_COLOR = "white"
const FONT_COLOR = "#61adbf"
const COMPONENT_COLOR = '#bfb5d7'
const SUB_COMPONENT_COLOR = 'yellow'

import { LocationGeofencingEventType } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

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
    	height: 200,
  	},
	taskListView: {
		  padding: 10
	},
	taskBox: {
		alignItems: "center",
		margin: 10,
		// borderStyle: 'solid',
		// borderWidth: 1,
		// marginLeft: "40%",
		// marginRight: "40%",
		padding: 10,
		borderRadius: 10,
		backgroundColor: 'white'
	},
	collapseTask: {
		padding: 10,
		marginTop: 10,
		display: 'flex',
		flexDirection: 'row',
		
	}

})

Notifications.setNotificationHandler({
	handleNotification: async () => ({
	  shouldShowAlert: true,
	  shouldPlaySound: false,
	  shouldSetBadge: false,
	}),
  });


const requestLocationPermission = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status != 'granted') {
    ToastAndroid.show("Permission Denied")
	BackHandler.exitApp();
  }
}


const Title = (props) => {

	return (
		<View style={styles.navbar}>
			<Text style={styles.titleText}>Map List</Text>
		</View>
	)
}


const Task = (props) => {
	const [collapse, setCollapse] = useState(false);
	const onPress = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setCollapse(!collapse);
	}
	const taskDetails = JSON.parse(props.params);
	return (
		<View style={[styles.taskBox, !collapse && {height: 40}]} >
			<TouchableOpacity onPress={onPress}>
				<Text>{taskDetails.task}</Text>
			</TouchableOpacity>
			{ collapse && 
			<View style={styles.collapseTask}>
				<MapView style={styles.mapView} zoomEnabled={true} initialRegion={{
				longitude: taskDetails.location.longitude,
				latitude: taskDetails.location.latitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01
			}}>
					<Marker coordinate={taskDetails.location} />
					<Circle center={taskDetails.location} radius={parseInt(taskDetails.radius)} strokeWidth={1.5} strokeColor={"#1484CD"} fillColor={"#1484CD50"} />
				</MapView>
			</View>
			}
		</View>
	)
}

const TaskList = (props) => {
	return (
		<View style={styles.listComponent}>
			<ScrollView style={styles.taskListView}>
				{props.tasks.map((data) => {
					return (
						<Task key={data[0]} params={data[1]} />
					)
				})}
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
	let [marker, setMarker] = useState(null);
	let [AOE, setAOE] = useState(null);
	let [coord, setCoord] = useState(null);

	const saveTask = async () => {
		console.log("Clicked on saveTask");
		// Verify Data
		if (taskName == "" || radius == "0" || coord == null) {
			ToastAndroid.show("Might be something you haven't filled yet.", ToastAndroid.SHORT);
			return
		}
		const data = {
			task: taskName,
			radius: radius,
			location: coord
		};
		const hash = require("object-hash");
		await AsyncStorage.setItem(`@task:${hash(data)}`, JSON.stringify(data));
		ToastAndroid.show("Task saved successfully!", ToastAndroid.SHORT)
		console.log('toast done');
		props.setPg(true);
	}
	
	
	const modifiedParseInt = (val) => {
		if (val === "") return 0
		else return parseInt(val)
	}
  
  if (props.userLocation == null) {
    
    return (
      <AppLoading />
    )
  } else {
	
    return (
      <View style={styles.mainWrapper}>
		<ScrollView >
        <View style={styles.taskEditorComponent}>
          <GotoHome state={props.setPg}/>
        </View>
        
        <View style={styles.taskEditorComponent}>
          <TextInput style={styles.textField} onChangeText={setTaskName} value={taskName} placeholder="task name" />
        </View>
  
        <View style={styles.taskEditorComponent}>
          <Text style={[styles.labelField, {fontWeight: 'bold'}]}>radius:</Text>
          <TextInput style={styles.textField} onChangeText={setRadius} value={radius} keyboardType="numeric" placeholder={"radius"} />
          <Text style={styles.labelField}>m</Text>
        </View>

        <View style={[styles.taskEditorComponent]}>
          <MapView style={styles.mapView} showsUserLocation={true} zoomEnabled={true} initialRegion={{
            longitude: props.userLocation.coords.longitude,
            latitude: props.userLocation.coords.latitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }} onPress={(point) => {
			  setCoord(point.nativeEvent.coordinate);
			  setMarker(<Marker coordinate={point.nativeEvent.coordinate} />);
			  setAOE(<Circle center={point.nativeEvent.coordinate} radius={modifiedParseInt(radius)} strokeWidth={1.5} strokeColor={"#1484CD"} fillColor={"#1484CD50"} />)
		  }}>
			  {marker}
			  {AOE}
		  </MapView>
        </View>
  
  
        <View style={styles.taskEditorComponent}>
          <Button title="save" onPress={saveTask} style={styles.onlyButton}/>
        </View>
		</ScrollView>
      </View>
    )
  }
	
}

export default function App() {
	let [getPage, setPage] = useState(true);
	let [userLocation, setUserLocation] = useState();
	let [locreq, dolocreq] = useState(false);
	let [tasks, setTasks] = useState([]);
	const getKeyData = async () => {
		const keys = await AsyncStorage.getAllKeys();
		const task_keys = keys.filter((val) => val.startsWith("@task"));
		const data = await AsyncStorage.multiGet(task_keys);
		data.forEach((value) => {
			return [value[0], JSON.parse(value[1])]
		});
		return data
	}

	useEffect(() => {
		getKeyData()
		.then((data) => {
			setTasks(data);
			
			// Location.startGeofencingAsync("@geofencing", data.map(([key, reg]) => {
			// 	return {
			// 		identifier: key,
			// 		latitude: reg.location.latitude,
			// 		longitude: reg.location.longitude,
			// 		radius: reg.radius
			// 	}
			// })) // BUG
		})
		.catch(console.warn)
	}, [tasks, setTasks]);
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
		if (!locreq) { 
			dolocreq(true)				// Location.getBackgroundPermissionsAsync();
		Location.getLastKnownPositionAsync()
		.then((loc) => {
			setUserLocation(loc);
			// dolocreq(false)
			console.log(loc)
		})
		.catch((err) => {
			console.warn(err)
		})

		}

		return () => backHandler.remove();
	})
	
	if (getPage) {
		return (
			<View style={styles.mainWrapper}>
				<Title />
				<TaskList tasks={tasks}/>
				<AddTask state={setPage}/>
			</View>
		)
	} else {
		
		return (
			<TaskCreator setPg={setPage} userLocation={userLocation}/>
		)
	}
	

}

// // Create a background Task, that checks if the device has entered any of the location stored in async storage
// TaskManager.defineTask('check-location', async () => {
// 	const data = await getKeyData();
// 	const { identifier, latitude, longitude, radius } = data[0][1];
// 	const location = {
// 		latitude,
// 		longitude,
// 		radius
// 	}
// 	const { coords } = await Location.getCurrentPositionAsync();
// 	const { latitude: lat, longitude: lon } = coords;
// 	const distance = await Location.distanceBetweenAsync(latitude, longitude, latitude, longitude);
// 	if (distance <= radius) {
// 		Notifications.presentLocalNotificationAsync({
// 			title: "You have entered the area",
// 			body: "You have entered the area",
// 			sound: true,
// 			data: {
// 				identifier
// 			}
// 		});
// 	}
// });



// TaskManager.defineTask('@geofencing', ({ data: { eventType, region }, error }) => {
// 	if (error) {
// 		console.log(error.message);
// 		return;
// 	}

// 	if ( eventType == LocationGeofencingEventType.Enter ) {
// 		Notifications.scheduleNotificationAsync({
// 			content: {
// 				title: "Time's up!",
// 				body: 'Change sides!',
// 			},
// 			trigger: {
// 				seconds: 5
// 			}

// 		})
// 	}
// })