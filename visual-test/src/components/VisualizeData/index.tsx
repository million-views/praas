import { View, Heading } from '@adobe/react-spectrum';
import React, { useEffect, useState } from 'react';
import {
  ConduitData,
  conduitNames,
  conduitURIList,
  Validity,
} from '../../App';

import './chart.scss';

interface Props {
  conduitData: ConduitData[];
  conduitURIList: conduitURIList;
  getConduitData: (conduitURI: string) => void;
  writeToConsole: (data: any) => void;
}

const VisualizeData: React.FC<Props> = ({
  conduitData,
  conduitURIList,
  getConduitData,
  writeToConsole,
}) => {
  const [validDataPercent, setValidDataPercent] = useState(0);
  const [invalidDataPercent, setInValidDataPercent] = useState(0);
  const [totalConduitsCount, setTotalConduitsCount] = useState(0);
  useEffect(() => {
    async function onMount() {
      writeToConsole(
        `Fetching data using conduit URI ${conduitURIList[conduitNames[2]]}`
      );
      await getConduitData(conduitURIList[conduitNames[2]]);
    }
    onMount();
  }, []);

  useEffect(() => {
    setTotalConduitsCount(conduitData.length);
    const validConduits = conduitData.filter(
      (data) => data.fields.validity === Validity.VALID
    );
    const invalidConduits = conduitData.filter(
      (data) => data.fields.validity === Validity.INVALID
    );
    setValidDataPercent(
      Math.round((validConduits.length / totalConduitsCount) * 100)
    );
    setInValidDataPercent(
      Math.round((invalidConduits.length / totalConduitsCount) * 100)
    );
  }, [conduitData]);

  return (
    <View>
      <dl className="DataChart">
        <dt className="DataChart__header">
          <Heading level={2} marginBottom="size-200">
            Data validity plot
          </Heading>
        </dt>
        <dd
          className={`DataChart__percentage DataChart__percentage--${validDataPercent}`}
        >
          <span className="DataChart__label">
            Valid: {validDataPercent} %
          </span>
        </dd>
        <dd
          className={`DataChart__percentage DataChart__percentage--${invalidDataPercent}`}
        >
          <span className="DataChart__label">
            Invalid: {invalidDataPercent} %
          </span>
        </dd>
      </dl>
    </View>
  );
};

export default VisualizeData;
