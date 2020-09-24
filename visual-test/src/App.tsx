import React, { FormEvent, useReducer } from 'react';
import {
  Provider,
  defaultTheme,
  Grid,
  View,
  Well,
  Heading,
} from '@adobe/react-spectrum';
import faker from 'faker';

import SubmitForm from './components/SubmitForm';
import DataTable from './components/DataTable';
import ConduitData from './components/ConduitData';

// Action Types
enum ActionTypes {
  SET_STEP,
  SET_CONDUIT_URI_LIST,
  SET_CONSOLE_INFO,
}

// Actions
const setStep = (payload: number) => ({
  type: ActionTypes.SET_STEP,
  payload,
});

const setConduitURIs = (payload: Object) => ({
  type: ActionTypes.SET_CONDUIT_URI_LIST,
  payload,
});

const setConsoleInfo = (payload: string) => ({
  type: ActionTypes.SET_CONSOLE_INFO,
  payload,
});

type State = {
  step: number;
  conduitURIList: conduitURIList;
  consoleInfo: string;
};

interface Action {
  type: ActionTypes;
  payload: any;
}

export const conduitNames = ['conduit-1', 'conduit-2', 'conduit-3'] as const;

export type conduitURIList = Record<typeof conduitNames[number], string>;

const appReducer = function (state: State, action: Action): State {
  switch (action.type) {
    case ActionTypes.SET_STEP:
      return {
        ...state,
        step: action.payload,
      };
    case ActionTypes.SET_CONDUIT_URI_LIST:
      localStorage.setItem(
        'conduitURIList',
        JSON.stringify({
          ...state.conduitURIList,
          [action.payload.name]: action.payload.value,
        })
      );
      return {
        ...state,
        conduitURIList: {
          ...state.conduitURIList,
          [action.payload.name]: action.payload.value,
        },
      };
    case ActionTypes.SET_CONSOLE_INFO:
      return {
        ...state,
        consoleInfo: `${state.consoleInfo}
        \n ${action.payload}`,
      };
    default:
      return state;
  }
};

const initialConduitValues: conduitURIList = conduitNames.reduce(
  (accumulator, value) => {
    accumulator[value] = '';
    return accumulator;
  },
  {} as conduitURIList
);

const storedConduitURIList = localStorage.getItem('conduitURIList');

const initialState = {
  step: 1,
  conduitURIList: ((storedConduitURIList &&
    JSON.parse(storedConduitURIList)) ||
    initialConduitValues) as conduitURIList,
  consoleInfo: '',
};

const stepTitles = [
  'Widget walkthrough',
  'Writing to Conduits',
  'Reading from Conduits',
  'Visualizing data',
];

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { step, conduitURIList, consoleInfo } = state;

  const fakeEmailAndPassword = () => {
    const name = faker.name.findName();
    const email = faker.internet.email();
  };

  const writeToConsole = (data: any) => {
    dispatch(setConsoleInfo(JSON.stringify(data)));
  };

  const handleConduitInputChange = (event: FormEvent<HTMLInputElement>) => {
    const name = (event.target as HTMLInputElement).getAttribute(
      'name'
    ) as string;
    const { value } = event.target as HTMLInputElement;
    dispatch(
      setConduitURIs({
        name,
        value,
      })
    );
  };

  const changeStep = (stepNumber: number) => {
    dispatch(setStep(stepNumber));
    writeToConsole(`Changing to step: ${stepNumber}`);
  };

  return (
    <Provider theme={defaultTheme}>
      <Grid areas={['sections']} columns={['1fr', '1fr']} height="100vh">
        <View padding="size-400" gridArea="sections">
          <Heading level={1}>
            Step: {step} {stepTitles[step]}
          </Heading>
          {step === 1 && (
            <ConduitData
              handleConduitChange={handleConduitInputChange}
              conduitURIList={conduitURIList}
              changeStep={changeStep}
              writeToConsole={writeToConsole}
            />
          )}
          {step === 2 && <SubmitForm />}
          {step === 3 && <DataTable />}
        </View>
        <View backgroundColor="static-black" borderRadius="small">
          <Well margin="size-100" UNSAFE_style={{ whiteSpace: 'pre-line' }}>
            {consoleInfo}
          </Well>
        </View>
      </Grid>
    </Provider>
  );
}

export default App;
