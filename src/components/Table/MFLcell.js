import React, {useEffect, useState} from 'react';
import { getMflCode } from 'common/utils';

export default function MFLcell(props) {
  const { dhis_code } = props;

  const [mflCode, setMflCode] = useState(dhis_code)

  useEffect(() => {
	  (()=>{
		setMflCode( getMflCode(dhis_code) )
	  })()
	  return () => {
		// console.log(`cancelling getMflCode(${dhis_code})`);
	  }
  }, [dhis_code])
  return (
    <div>
      {mflCode}
    </div>
  );
}
