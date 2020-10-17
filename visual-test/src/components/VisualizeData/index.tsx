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
}) => {
  const [validDataPercent, setValidDataPercent] = useState(0);
  const [invalidDataPercent, setInValidDataPercent] = useState(0);
  const [totalConduitsCount, setTotalConduitsCount] = useState(0);
  useEffect(() => {
    async function onMount() {
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
      Math.floor((validConduits.length / totalConduitsCount) * 100)
    );
    setInValidDataPercent(
      Math.floor((invalidConduits.length / totalConduitsCount) * 100)
    );
  }, [conduitData]);

  return (
    <View>
      <dl>
        <dt>
          <Heading level={2} marginBottom="size-200">
            Data validity
          </Heading>
        </dt>
        <dd className={`percentage percentage-${validDataPercent}`}>
          <span className="text">Valid: {validDataPercent} %</span>
        </dd>
        <dd className={`percentage percentage-${invalidDataPercent}`}>
          <span className="text">Invalid: {invalidDataPercent} %</span>
        </dd>
      </dl>
    </View>
  );
};

export default VisualizeData;
