import './wasm_exec.js';
import './wasmTypes.d.ts';
import './LoadWasm.css';

import React, { useEffect } from 'react';

async function loadWasm(): Promise<void> {
  const goWasm = new window.Go();
  const result = await WebAssembly.instantiateStreaming(fetch('main.wasm'), goWasm.importObject);
  goWasm.run(result.instance);
}

export const LoadWasm: React.FC<React.PropsWithChildren<{}>> = (props) => {
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    loadWasm().then(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className='LoadWasm'>
        loading WebAssembly...
      </div>
    );
  } else {
    return <React.Fragment>{props.children}</React.Fragment>;
  }
};
