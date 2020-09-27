import React from 'react';
import { Grid, View, Heading, Text } from '@adobe/react-spectrum';

const DataTable = () => {
  return (
    <View>
      <View paddingY="size-100">
        <Text>
          This step demonstrates the capability of the conduit to read from
          the spreadsheet using Conduit 2 which has both read and update
          access (RACM: GET and PATCH request). Once the reading is done,
          based on a toss the conduit would be updated with valid or invalid
          which is then used to draw the chart in step 4.
        </Text>
      </View>
      <Grid
        areas={['data-table-name data-table-email data-table-validity']}
        columns={['1fr', '2fr', '1fr']}
      >
        <View gridArea="data-table-name">
          <View borderWidth="thin">
            <Heading level={4} margin="size-0">
              Name
            </Heading>
            <View borderTopWidth="thin">
              <Text>Hello world 1</Text>
            </View>
            <View borderTopWidth="thin">
              <Text>Hello world 1</Text>
            </View>
          </View>
        </View>
        <View gridArea="data-table-email">
          <View borderYWidth="thin">
            <Heading level={4} margin="size-0">
              Email
            </Heading>
            <View borderTopWidth="thin">
              <Text>Hello world 2</Text>
            </View>
            <View borderTopWidth="thin">
              <Text>Hello world 2</Text>
            </View>
          </View>
        </View>
        <View gridArea="data-table-validity">
          <View borderWidth="thin">
            <Heading level={4} margin="size-0">
              Validity
            </Heading>
            <View borderTopWidth="thin">
              <Text>Hello world 3</Text>
            </View>
            <View borderTopWidth="thin">
              <Text>Hello world 3</Text>
            </View>
          </View>
        </View>
      </Grid>
    </View>
  );
};

export default DataTable;