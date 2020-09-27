import React from 'react';
import {
  TextField,
  View,
  Text,
  Button,
  Form,
  ButtonGroup,
  Heading,
} from '@adobe/react-spectrum';

interface Props {
  fakeEmailAndPassword: (count: number) => void;
  changeStep: (stepCounter: number) => void;
}

const SubmitForm = ({ fakeEmailAndPassword, changeStep }: Props) => {
  return (
    <View>
      <View paddingY="size-100">
        <div>
          This step demonstrates the capability of the conduit to write to the
          same spreadsheet using Conduit 1 which has write(POST) only access.
        </div>
        <div>
          You can manually enter the data using the input fields below or use
          the faker buttons which would generate random values for name and
          email for you.
        </div>
        <div>
          You can fake any number of requests and all of the entries should be
          in the spreadsheet.
        </div>
      </View>
      <View paddingY="size-100">
        <Form>
          <TextField label="Name" />
          <TextField label="Email" />
          <Button
            variant="primary"
            type="submit"
            maxWidth="size-1600"
            marginTop="size-500"
          >
            Submit
          </Button>
        </Form>
      </View>
      <View paddingY="size-200" flex={1}>
        <Heading level={3}>Fake requests</Heading>
        <ButtonGroup>
          <Button variant="primary">Fake 5 requests</Button>
          <Button variant="primary" onPress={() => fakeEmailAndPassword(10)}>
            Fake 10 requests
          </Button>
          <Button variant="primary" onPress={() => fakeEmailAndPassword(15)}>
            Fake 15 requests
          </Button>
          <Button variant="primary" onPress={() => fakeEmailAndPassword(20)}>
            Fake 20 requests
          </Button>
        </ButtonGroup>
        <View marginY="size-500" flex={1}>
          <div>
            To proceed to next step, kindly submit the form or fake the
            requests
          </div>
          <Button
            variant="cta"
            onPress={() => changeStep(3)}
            marginY="size-500"
            maxWidth="size-2400"
            isDisabled
          >
            Proceed to next step
          </Button>
        </View>
      </View>
    </View>
  );
};

export default SubmitForm;
