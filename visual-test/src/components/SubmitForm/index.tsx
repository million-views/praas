import React, { FormEvent, FormEventHandler, useMemo, useState } from 'react';
import {
  TextField,
  View,
  Text,
  Button,
  Form,
  ButtonGroup,
  Heading,
} from '@adobe/react-spectrum';
import { ConduitBaseData } from '../../App';

interface Props {
  fakeDataAndPush: (count: number) => void;
  changeStep: (stepCounter: number) => void;
  totalRecordsCount: number;
  submitForm: (data: ConduitBaseData) => void;
  writeToConsole: (data: any) => void;
}

const SubmitForm = ({
  fakeDataAndPush,
  changeStep,
  totalRecordsCount,
  writeToConsole,
  submitForm,
}: Props) => {
  const [formData, setFormData] = useState<ConduitBaseData>({
    name: '',
    email: '',
  });
  const handleInputChange = (fieldName: string, value: string) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };
  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isEmailValid && formData.name !== '') {
      submitForm(formData);
    } else {
      writeToConsole(`Fill in the form data: ${JSON.stringify(formData)}`);
    }
  };

  const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  const isEmailValid = useMemo(() => emailRegex.test(formData.email), [
    formData,
  ]);

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
        <Form onSubmit={handleFormSubmit}>
          <TextField
            label="Name"
            onChange={(value) => handleInputChange('name', value)}
            isRequired
            validationState={formData.name !== '' ? 'valid' : 'invalid'}
          />
          <TextField
            label="Email"
            onChange={(value) => handleInputChange('email', value)}
            isRequired
            inputMode="email"
            validationState={isEmailValid ? 'valid' : 'invalid'}
          />
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
          <Button variant="primary" onPress={() => fakeDataAndPush(5)}>
            Fake 5 requests
          </Button>
          <Button variant="primary" onPress={() => fakeDataAndPush(10)}>
            Fake 10 requests
          </Button>
          <Button variant="primary" onPress={() => fakeDataAndPush(15)}>
            Fake 15 requests
          </Button>
          <Button variant="primary" onPress={() => fakeDataAndPush(20)}>
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
            isDisabled={totalRecordsCount === 0}
          >
            Proceed to next step
          </Button>
        </View>
      </View>
    </View>
  );
};

export default SubmitForm;
