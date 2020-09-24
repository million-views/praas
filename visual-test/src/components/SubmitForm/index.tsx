import React from 'react';
import {
  Item,
  TextField,
  View,
  Flex,
  Picker,
  Text,
  Button,
  Checkbox,
  Form,
} from '@adobe/react-spectrum';

const SubmitForm = () => {
  return (
    <View>
      <Form>
        <TextField label="Name" />
        <TextField label="Email" />
        <Button variant="primary" type="submit">
          Fake 5 requests
        </Button>
        <Button variant="primary" type="submit">
          Fake 10 requests
        </Button>
        <Button variant="primary" type="submit">
          Fake 15 requests
        </Button>
        <Button variant="primary" type="submit">
          Fake 20 requests
        </Button>
      </Form>
    </View>
  );
};

export default SubmitForm;
