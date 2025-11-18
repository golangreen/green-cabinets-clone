import { useState } from 'react';

export const useVanityLocation = () => {
  const [zipCode, setZipCode] = useState("");
  const [state, setState] = useState("");

  return {
    zipCode,
    setZipCode,
    state,
    setState,
  };
};
