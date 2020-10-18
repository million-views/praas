import React, { useEffect, useState } from 'react';
import { Grid, View, Heading, Text, Button } from '@adobe/react-spectrum';
import { markValidOrInvalid } from '../../utils';
import {
  ConduitData,
  conduitNames,
  conduitURIList,
  Validity,
} from '../../App';
interface Props {
  getConduitData: (conduitURI: string) => void;
  changeStep: (stepCounter: number) => void;
  conduitData: ConduitData[];
  writeToConsole: (data: any) => void;
  updateConduit: Function;
  conduitURIList: conduitURIList;
  isUnvalidatedDataExisting: boolean;
  updateIsDataWithoutValidityExisting: Function;
}

const DataTable = ({
  getConduitData,
  conduitData,
  writeToConsole,
  updateConduit,
  changeStep,
  conduitURIList,
  isUnvalidatedDataExisting,
  updateIsDataWithoutValidityExisting,
}: Props) => {
  const updateDataForValidity = async (id: string) => {
    const validity = markValidOrInvalid();
    await updateConduit(id, {
      validity,
    });
    writeToConsole('Updating validity of fields');
  };

  const handleUpdateConduitData = async () => {
    for (let i = 0; i < conduitData.length; i++) {
      if (!conduitData[i].fields.validity) {
        await updateDataForValidity(conduitData[i].id);
      }
    }
    writeToConsole('Completed updating data validity');
  };

  const checkForConduitDataValidity = () => {
    let isAllDataValid = true;
    for (let i = 0; i < conduitData.length; i++) {
      const { validity } = conduitData[i].fields;
      if (validity !== Validity.INVALID && validity !== Validity.VALID) {
        isAllDataValid = false;
        break;
      }
    }
  };

  const handleUpdateAndRefetch = async () => {
    await handleUpdateConduitData();
    updateIsDataWithoutValidityExisting(false);
    await getConduitData(conduitURIList[conduitNames[1]]);
    writeToConsole('Done refetching data');
  };

  useEffect(() => {
    checkForConduitDataValidity();
  }, [conduitData]);

  useEffect(() => {
    async function onMount() {
      await getConduitData(conduitURIList[conduitNames[1]]);
    }
    onMount();
  }, []);

  useEffect(() => {
    async function onNewDataCreation() {
      await getConduitData(conduitURIList[conduitNames[1]]);
    }
    onNewDataCreation();
  }, [isUnvalidatedDataExisting]);

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
      {!conduitData.length ? (
        <div>No data to display</div>
      ) : (
        <Grid
          areas={['data-table-name data-table-email data-table-validity']}
          columns={['1fr', '2fr', '1fr']}
        >
          <View gridArea="data-table-name">
            <View borderWidth="thin">
              <Heading level={4} margin="size-0">
                Name
              </Heading>
              {conduitData.map((conduit: ConduitData) => (
                <View borderTopWidth="thin" key={conduit.id}>
                  <Text>{conduit.fields.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View gridArea="data-table-email">
            <View borderYWidth="thin">
              <Heading level={4} margin="size-0">
                Email
              </Heading>
              {conduitData.map((conduit: ConduitData) => (
                <View borderTopWidth="thin" key={conduit.id}>
                  <Text>{conduit.fields.email}</Text>
                </View>
              ))}
            </View>
          </View>
          <View gridArea="data-table-validity">
            <View borderWidth="thin">
              <Heading level={4} margin="size-0">
                Validity
              </Heading>
              {conduitData.map((conduit: ConduitData) => (
                <View borderTopWidth="thin" key={conduit.id}>
                  <Text>{conduit.fields.validity}</Text>
                </View>
              ))}
            </View>
          </View>
          <View paddingY="size-200" flex={1}>
            <Button
              variant="primary"
              onPress={handleUpdateAndRefetch}
              minWidth="size-3000"
            >
              Fetch and update data validity
            </Button>
            <Button
              variant="cta"
              type="submit"
              marginY="size-500"
              maxWidth="size-2400"
              onPress={() => changeStep(4)}
              isDisabled={isUnvalidatedDataExisting}
            >
              Proceed to next step
            </Button>
          </View>
        </Grid>
      )}
    </View>
  );
};

export default DataTable;
