function findMax(numbers) {
    let max = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] > max) {
        max = numbers[i];
      }
    }
    return max;
  }
  
  const numbers = [3, 7, 2, 9, 1];
  const maxNumber = findMax(numbers);
  console.log(maxNumber);
  