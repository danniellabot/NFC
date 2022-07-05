// Watson Assistant API documentation:
// https://console.bluemix.net/apidocs/assistant
const MessageRequest = async (input, context = {}) => {
  const {URL, KEY} = process.env;
  let body = {
    alternate_intents: true,
    input: {
      text: input,
    },
  };
  if (context) {
    body.context = context;
  }
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + KEY,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const responseJson = await response.json();
    console.log('SWEETIES ITS', responseJson);
    return responseJson;
  } catch (error) {
    console.log('ERROR IS HERE');
    console.error(error);
  }
};

module.exports = {
  MessageRequest,
};
