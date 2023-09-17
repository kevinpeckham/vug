// //- string parsing utilities

export function findFirstCharacterOfSet(input: string, set: string[]) {
  const initialValue = -1;
  const firstMarkerIndex = set.reduce((
    accumulator, currentValue) => {
      const index = input.indexOf(currentValue);
      if (accumulator < 0) { return index } // whatever it is it trumps -1 (* it could be -1)
      else if (index > 0 && index < accumulator ) { return index } // a positive number that is less than the current accumulator
      else {return accumulator}
    },
    initialValue
  );
  return firstMarkerIndex;
}

