import React from 'react';
import {StyleSheet, View, SafeAreaView, Text, PermissionsAndroid, Platform} from 'react-native';
import {WebView} from 'react-native-webview';
import {MessageRequest} from './Assistant';
import WatsonIcon from './WatsonIcon';
import {GiftedChat} from 'react-native-gifted-chat';
import Geocoder from 'react-native-geocoding';

const GOOLE_API_KEY = "AIzaSyAdr5PRXhg-kNQGXr-D3-WtiUoGT2PAWDY";
Geocoder.init(GOOLE_API_KEY);

import Geolocation from 'react-native-geolocation-service';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      conversationID: null,
      context: null,
    };
  }

  componentDidMount() {
    console.log('CAN ACCESS STATE', this.state);
    this.initalMessage();
    this.getLocation();
  }

  render() {
    console.log('SPECIFIC', this.state.messages);
    return (
      <SafeAreaView
        style={{
          flex: 1,
          paddingBottom: 30,
          backgroundColor: '#fff',
          borderBottomColor: '#000',
          borderWidth: 2
        }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Chat with Watson</Text>
        </View>
        <GiftedChat
          textInputStyle={{color: '#000'}}
          placeholder="Send your message to Watson..."
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          renderAvatar={this.renderAvatar}
          multiline={false}
          user={{
            _id: '1',
          }}
        />
      </SafeAreaView>
    );
  }

  renderCustomView = props => {
    if (props.currentMessage.text.includes('Welcome')) {
      return (
        <WebView
          style={styles.container}
          javaScriptEnabled={true}
          source={{
            uri: 'https://www.youtube.com/embed/phOW-CZJWT0?rel=0&autoplay=0&showinfo=0&controls=0',
          }}
        />
      );
    }
    return null;
  };

  onSend = (message = []) => {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, message),
      }),
      () => {
        this.getMessage(message[0].text.replace(/[\n\r]+/g, ' '));
      },
    );
  };

  initalMessage = async () => {
    let response = await MessageRequest('');
    console.log('I WANNA SEE RESPNSE', JSON.stringify(response));
    this.setState({
      context: response.context,
    });
    let message = {
      _id: Math.round(Math.random() * 1000000).toString(),
      // text: response.output.text.join(' '),
      text: response.output.generic[0].text,
      createdAt: new Date(),
      user: {
        _id: '2',
        name: 'Watson Assistant',
      },
      image:
        'https://i.ebayimg.com/00/s/MTYwMFgxNjAw/z/d4IAAOSw-CpX~8b~/$_35.JPG',
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, message),
    }));
  };

  getMessage = async text => {
    let response = await MessageRequest(text, this.state.context);
    this.setState({
      context: response.context,
    });
    console.log(
      'SHOW ME RESPONSE',
      JSON.stringify(response.output.generic[0].text),
    );
    let message = {
      _id: Math.round(Math.random() * 1000000).toString(),
      text: response.output.generic[0].text,
      // text: response.output.text.join(' '),
      createdAt: new Date(),
      user: {
        _id: '2',
        name: 'Watson Assistant',
      },
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, message),
    }));
  };

  renderAvatar = () => {
    return <WatsonIcon />;
  };

  reverseGeocode = async (latitude, longitude) => {
    try {
      const result = await Geocoder.from({latitude,longitude})
      return this.parseAddresses(result);
    } catch (error) {
      console.log("Error getting addresses ", error);
    }
  }

  parseAddresses = (addressResults) => {
    const appendAddressLine = (exsitingPart, newPart) => {
      if (!exsitingPart.lenght) return newPart;
      return exsitingPart + " " + newPart;
    };

    const parseSingleAddress = (addressParts) => {
      return addressParts.reduce((addressObj, addressPart) => {
        const types = addressPart.types
        if (types.includes("street_number")) {
          addressObj.addressLine1 = appendAddressLine(addressObj.addressLine1, addressPart.long_name);
        } else if (types.includes("route")) {
          addressObj.addressLine1 = appendAddressLine(addressObj.addressLine1, addressPart.long_name);
        } else if (types.includes("subpremise")) {
          addressObj.addressLine1 = appendAddressLine(addressObj.addressLine1, addressPart.long_name);
        } else if (types.includes("administrative_area_level_2")) {
          addressObj.addressLine2 = addressPart.long_name;
        } else if (types.includes("postal_code")) {
          addressObj.postcode = addressPart.long_name;
        } else if (types.includes("postal_town")) {
          addressObj.town = addressPart.long_name;
        } else if (types.includes("country")) {
          addressObj.country = addressPart.long_name;
        }
        return addressObj;
      }, {
        addressLine1: "",
        addressLine2: "",
        town: "",
        postcode: "",
        country: ""
      })
    };

    return addressResults.results
      .filter(({types}) => (types.includes("street_address") || types.includes("premise")))
      .map(result => {
        return {
          formatted: result.formatted_address,
          address: parseSingleAddress(result.address_components)
        }
      });
  }

  requestLocationPermission = async () => {
    if (Platform.OS === "ios") { 
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "NFC App Location Permisson",
          message: "NFC App would like access to your location",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("location granted");
        return true;
      } else {
        console.log("location permission denied");
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getLocation = () => {
    this.requestLocationPermission().then((locationPermissinon) => {
      if (locationPermissinon) {
        Geolocation.getCurrentPosition(
            (position) => {
              console.log("POSITION", position);
              this.reverseGeocode(position.coords.latitude, position.coords.longitude).then(addresses => {
                console.log("ADDRESS RESULTS:", JSON.stringify(addresses));
                return addresses;
              });
            },
            (error) => {
              console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, accuracy: {android: "high", ios: "best" } }
        );
      } else {
        return null;
      }
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});
