import React, { FormEvent, useMemo } from 'react';
import { View, Form, TextField, Text, Button } from '@adobe/react-spectrum';
import { conduitNames, conduitURIList } from '../../App';

interface Props {
  handleConduitChange: (event: FormEvent<HTMLInputElement>) => void;
  conduitURIList: conduitURIList;
  changeStep: (stepCounter: number) => void;
  writeToConsole: (data: any) => void;
}

const urlValidationRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.trickle.cc$/;

const ConduitData = ({
  handleConduitChange,
  conduitURIList,
  changeStep,
  writeToConsole,
}: Props) => {
  const isConduitOneValid = useMemo(
    () => urlValidationRegex.test(conduitURIList[conduitNames[0]]),
    [conduitURIList[conduitNames[0]]]
  );
  const isConduitTwoValid = useMemo(
    () => urlValidationRegex.test(conduitURIList[conduitNames[1]]),
    [conduitURIList[conduitNames[1]]]
  );
  const isConduitThreeValid = useMemo(
    () => urlValidationRegex.test(conduitURIList[conduitNames[2]]),
    [conduitURIList[conduitNames[2]]]
  );
  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isConduitOneValid && isConduitTwoValid && isConduitThreeValid) {
      writeToConsole('Validating conduit URI...');
      writeToConsole(
        `Conduits are valid and has values: ${
          conduitURIList[conduitNames[0]]
        } ${conduitURIList[conduitNames[1]]} and ${
          conduitURIList[conduitNames[2]]
        }`
      );
      changeStep(2);
    }
  };
  return (
    <View>
      <Text>
        This application allows you to visually test the various capabilities
        of conduits.xyz. To begin with, you have to create 3 conduits pointing
        to the same Airtable sheet with the following criteria:
        <ol>
          <li>
            The first conduit should be a write only conduit(Supports only
            RACM: POST request)
          </li>
          <li>
            The second conduit must support both read and update (Supports
            RACM: GET and PATCH request)
          </li>
          <li>
            The third conduit should be a read only conduit(Supports only
            RACM: GET request)
          </li>
        </ol>
        Once created, please enter the conduit URI's in the input fields below
        to proceed
      </Text>
      <Form marginY="size-160" onSubmit={handleFormSubmit}>
        <TextField
          label="Conduit 1 (With RACM: POST enabled)"
          name={conduitNames[0]}
          value={conduitURIList[conduitNames[0]]}
          isRequired
          inputMode="url"
          validationState={isConduitOneValid ? 'valid' : 'invalid'}
          onInput={handleConduitChange}
        />
        <TextField
          label="Conduit 2 (With RACM: GET, PATCH enabled)"
          name={conduitNames[1]}
          value={conduitURIList[conduitNames[1]]}
          isRequired
          inputMode="url"
          validationState={isConduitTwoValid ? 'valid' : 'invalid'}
          onInput={handleConduitChange}
        />
        <TextField
          label="Conduit 3 (With RACM: GET enabled)"
          name={conduitNames[2]}
          value={conduitURIList[conduitNames[2]]}
          isRequired
          inputMode="url"
          validationState={isConduitThreeValid ? 'valid' : 'invalid'}
          onInput={handleConduitChange}
        />
        <Button
          variant="cta"
          type="submit"
          marginY="size-500"
          maxWidth="size-2400"
        >
          Proceed to next step
        </Button>
      </Form>
    </View>
  );
};

export default ConduitData;
