import React from 'react';
import {StyleSheet, View, SafeAreaView, Text} from 'react-native';
import {WebView} from 'react-native-webview';
import {MessageRequest} from './Assistant';
import WatsonIcon from './WatsonIcon';
import {GiftedChat} from 'react-native-gifted-chat';
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
