import React from 'react';

export default function ShadedCell(props) {
  let { classes, val, prefix, suffix } = props;
  if(!prefix || prefix == "" || prefix == null || prefix == undefined){prefix=""}
  if(!suffix || suffix == "" || suffix == null || suffix == undefined){suffix=""}
  return (
    <>
	  {prefix}{isNaN(val) ? (val) : new Intl.NumberFormat().format(val)}{suffix}
	  <span className={classes} aria-hidden="true" tabIndex="-1"> &nbsp; </span>
    </>
  );
}
