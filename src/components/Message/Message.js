import React, { useState, useEffect } from 'react';
import Alert from '@material-ui/lab/Alert';

const Message = props => {
    const [isLoading, setLoading] = useState(true)
    let isMtd = true

    useEffect(() => {
        if (isMtd) {
            if (props.severity == "error") {
                setTimeout(() => {
                    setLoading(false)
                }, 3000);
            } else {
                setLoading(false)
            }
        }
        return () => {
            isMtd = false
        }
    }, [])
    return (
        <>
            {isLoading ? <>
                <span>Loading...</span>
            </> : <Alert severity={props.severity}>{props.children}</Alert>}
        </>
    );
};

export default Message;
