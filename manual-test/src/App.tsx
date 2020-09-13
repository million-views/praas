import React from 'react';
import { Provider, defaultTheme, Grid, View } from '@adobe/react-spectrum';

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
        height="size-6000"
        gap="size-100"
      >
        <View backgroundColor="celery-600" gridArea="submit" />
        <View backgroundColor="celery-600" gridArea="submit-response" />
        <View backgroundColor="blue-600" gridArea="evs" />
        <View backgroundColor="purple-600" gridArea="evs-response" />
        <View backgroundColor="magenta-600" gridArea="ravs" />
        <View backgroundColor="magenta-600" gridArea="ravs-response" />
      </Grid>
    </Provider>
  );
}

export default App;
