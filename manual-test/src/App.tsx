import React from 'react';
import {
  Provider,
  defaultTheme,
  Grid,
  View,
  Well,
} from '@adobe/react-spectrum';
import SubmitForm from './components/SubmitForm';
import DataTable from './components/DataTable';

function App() {
  return (
    <Provider theme={defaultTheme}>
      <Grid
        areas={[
          'submit  submit-response',
          'evs evs-response',
          'ravs  ravs-response',
        ]}
        columns={['3fr', '3fr']}
        rows={['auto', 'auto', 'auto']}
        gap="size-100"
      >
        <View margin="size-100" gridArea="submit" justifySelf="center">
          <SubmitForm />
        </View>
        <View backgroundColor="static-black" borderRadius="small">
          <Well margin="size-100">Hello world</Well>
        </View>
        <View margin="size-100" gridArea="evs">
          <DataTable />
        </View>
        <View backgroundColor="static-black" borderRadius="small">
          <Well margin="size-100">Hello world</Well>
        </View>
        <View backgroundColor="magenta-600" gridArea="ravs" />
        <View backgroundColor="magenta-600" gridArea="ravs-response" />
      </Grid>
    </Provider>
  );
}

export default App;
