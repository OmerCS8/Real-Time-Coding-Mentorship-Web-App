function reverseString(str) {
    return str.split('').reverse().join('');
  }
  
  const text = 'Hello, World!';
  const reversedText = reverseString(text);
  console.log(reversedText);
  