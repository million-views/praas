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
} from '@adobe/react-spectrum';

const SubmitForm = () => {
  return (
    <View>
      <Picker
        label="Number of fake requests(Default 5)"
        defaultSelectedKey="read"
      >
        <Item textValue="Five" key="5">
          <Text>Five</Text>
          <Text slot="description">Fake five requests</Text>
        </Item>
        <Item textValue="Ten" key="10">
          <Text>Ten</Text>
          <Text slot="description">Fake ten requests</Text>
        </Item>
        <Item textValue="Fifteen" key="15">
          <Text>Fifteen</Text>
          <Text slot="description">Fake fifteen requests</Text>
        </Item>
        <Item textValue="Twenty" key="20">
          <Text>Twenty</Text>
          <Text slot="description">Fake twenty requests</Text>
        </Item>
      </Picker>
      <Flex direction="row" gap="size-100">
        <View>
          <TextField label="Conduit URI" />
        </View>
      </Flex>
      <form>
        <Flex direction="column" gap="size-125">
          <View>
            <TextField label="Name" />
          </View>
          <View>
            <TextField label="Email" />
          </View>
          <View>
            <Flex direction="row">
              <Checkbox>Bot</Checkbox>
              <Button variant="primary" type="submit">
                Fake request
              </Button>
            </Flex>
          </View>
        </Flex>
      </form>
    </View>
  );
};

export default SubmitForm;
