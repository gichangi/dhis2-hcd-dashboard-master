import React from 'react'

const Technical = () => {
	let u_rl = window.location.href.replace('/index.html', '').replace(window.location.hash, '')
	if(u_rl[u_rl.length - 1] != "/"){u_rl += '/docs/index.html'}else{u_rl += 'docs/index.html'}
	return (
		<div className="full-width">
			<iframe src={u_rl} title="Technical Documentation" className="full-width" frameBorder="0" style={{width: '100%', height: '100%', minHeight: '97vh'}}>
			</iframe>
		</div>
	)
}

export default Technical
