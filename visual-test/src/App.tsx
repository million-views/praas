import React, { FormEvent, useReducer } from 'react';
import {
  Provider,
  defaultTheme,
  Grid,
  View,
  Well,
  Heading,
  Divider,
  Header,
} from '@adobe/react-spectrum';
import faker from 'faker';

import SubmitForm from './components/SubmitForm';
import DataTable from './components/DataTable';
import ConduitData from './components/ConduitData';
import API from './api';
import VisualizeData from './components/VisualizeData';

// Action Types
enum ActionTypes {
  SET_STEP,
  SET_CONDUIT_URI_LIST,
  SET_CONSOLE_INFO,
  SET_TOTAL_RECORDS_COUNT,
  SET_CONDUIT_DATA,
  SET_IS_UNVALIDATED_DATA_EXISTING,
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

const setTotalRecordsCount = (payload: number) => ({
  type: ActionTypes.SET_TOTAL_RECORDS_COUNT,
  payload,
});

const setConduitData = (payload: ConduitData[]) => ({
  type: ActionTypes.SET_CONDUIT_DATA,
  payload,
});
const setIsUnvalidatedDataExisting = (payload: boolean) => ({
  type: ActionTypes.SET_IS_UNVALIDATED_DATA_EXISTING,
  payload,
});

export type ConduitData = {
  id: string;
  fields: ConduitBaseData;
  createdTime: string;
};

export type ConduitGetResponse = {
  records: ConduitData[];
};

export enum Validity {
  VALID = 'valid',
  INVALID = 'invalid',
}

type State = {
  step: number;
  conduitURIList: conduitURIList;
  consoleInfo: string;
  totalRecordsCount: number;
  conduitData: ConduitData[];
  isUnvalidatedDataExisting: boolean;
};

interface Action {
  type: ActionTypes;
  payload: any;
}

export type ConduitBaseData = {
  name: string;
  email: string;
  validity?: Validity;
};

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
    case ActionTypes.SET_TOTAL_RECORDS_COUNT:
      return {
        ...state,
        totalRecordsCount: state.totalRecordsCount + action.payload,
      };
    case ActionTypes.SET_CONDUIT_DATA:
      return {
        ...state,
        conduitData: action.payload,
      };

    case ActionTypes.SET_IS_UNVALIDATED_DATA_EXISTING:
      return {
        ...state,
        isUnvalidatedDataExisting: action.payload,
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
  totalRecordsCount: 0,
  conduitData: [],
  isUnvalidatedDataExisting: false,
};

const stepTitles = [
  'Widget walkthrough',
  'Writing to Conduits',
  'Reading from Conduits',
  'Visualizing data',
];

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    step,
    conduitURIList,
    consoleInfo,
    totalRecordsCount,
    conduitData,
    isUnvalidatedDataExisting,
  } = state;

  const writeToConsole = (data: any) => {
    dispatch(setConsoleInfo(JSON.stringify(data)));
  };

  const changeStep = (stepNumber: number) => {
    dispatch(setStep(stepNumber));
    writeToConsole(`Changing to step: ${stepNumber}`);
  };

  const updateTotalCount = (count: number) => {
    dispatch(setTotalRecordsCount(count));
  };

  const updateIsDataWithoutValidityExisting = (newDataCreated: boolean) => {
    dispatch(setIsUnvalidatedDataExisting(newDataCreated));
  };

  const fakeDataAndPush = async (count: number) => {
    let successCount = 0;
    for (let i = 0; i < count; i += 1) {
      const name = faker.name.findName();
      const email = faker.internet.email();
      const response = await pushDataToConduit({
        name,
        email,
      });
      if (response?.status === 200) {
        successCount = successCount + 1;
      }
    }
    updateTotalCount(successCount);
    updateIsDataWithoutValidityExisting(true);
    writeToConsole(
      'Created entries. Please check the spreadsheet to see if the values are populated'
    );
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

  const pushDataToConduit = async (data: ConduitBaseData) => {
    try {
      const response = await API.create(
        data,
        conduitURIList[conduitNames[0]]
      );
      writeToConsole(`Created conduit with data: ${JSON.stringify(data)}`);
      return response;
    } catch (error) {
      writeToConsole(
        `Error creating conduit with name: ${data.name} and email: ${data.email}`
      );
    }
  };

  const updateConduitData = async (
    id: string,
    data: { valid: keyof typeof Validity }
  ) => {
    try {
      await API.update(id, data, conduitURIList[conduitNames[1]]);
      writeToConsole(`Updated conduit with data: ${JSON.stringify(data)}`);
    } catch (error) {
      writeToConsole(`Updating conduit failed`);
    }
  };

  const handleFormSubmit = async (data: ConduitBaseData) => {
    const response = await pushDataToConduit(data);
    if (response) {
      updateTotalCount(1);
      updateIsDataWithoutValidityExisting(true);
    }
  };

  const getDataFromConduit = async (conduitURI: string) => {
    try {
      const data: ConduitData[] = await API.get(conduitURI);
      dispatch(setConduitData(data));
    } catch (error) {
      writeToConsole('Error getting data from conduit');
    }
  };
  return (
    <Provider theme={defaultTheme}>
      <Grid areas={['sections']} columns={['1fr', '1fr']} height="100vh">
        <View
          gridArea="sections"
          UNSAFE_style={{ overflow: 'auto', maxHeight: '100vh' }}
        >
          <Header position="sticky" top="size-0" zIndex={10}>
            <View
              backgroundColor="gray-50"
              paddingY="size-100"
              paddingX="size-400"
            >
              <Heading level={1}>
                Step: {step} {stepTitles[step - 1]}
              </Heading>
            </View>
          </Header>
          {step >= 1 && (
            <View paddingY="size-800" paddingX="size-400">
              <ConduitData
                handleConduitChange={handleConduitInputChange}
                conduitURIList={conduitURIList}
                changeStep={changeStep}
                writeToConsole={writeToConsole}
              />
            </View>
          )}
          {step >= 2 && (
            <>
              <Divider size="S" />
              <View paddingY="size-800" paddingX="size-400">
                <SubmitForm
                  fakeDataAndPush={fakeDataAndPush}
                  changeStep={changeStep}
                  totalRecordsCount={totalRecordsCount}
                  submitForm={handleFormSubmit}
                  writeToConsole={writeToConsole}
                />
              </View>
            </>
          )}
          {step >= 3 && (
            <>
              <Divider size="S" />
              <View paddingY="size-800" paddingX="size-400">
                <DataTable
                  getConduitData={getDataFromConduit}
                  conduitData={conduitData}
                  writeToConsole={writeToConsole}
                  updateConduit={updateConduitData}
                  changeStep={changeStep}
                  conduitURIList={conduitURIList}
                  isUnvalidatedDataExisting={isUnvalidatedDataExisting}
                  updateIsDataWithoutValidityExisting={
                    updateIsDataWithoutValidityExisting
                  }
                />
              </View>
            </>
          )}
          {step === 4 && (
            <>
              <Divider size="S" />
              <View paddingY="size-800" paddingX="size-400">
                <VisualizeData
                  conduitData={conduitData}
                  conduitURIList={conduitURIList}
                  getConduitData={getDataFromConduit}
                  writeToConsole={writeToConsole}
                />
              </View>
            </>
          )}
        </View>
        <View
          backgroundColor="static-black"
          borderRadius="small"
          UNSAFE_style={{ overflow: 'auto', maxHeight: '100vh' }}
        >
          <Well margin="size-100" UNSAFE_style={{ whiteSpace: 'pre-line' }}>
            {consoleInfo}
          </Well>
        </View>
      </Grid>
    </Provider>
  );
}

export default App;
