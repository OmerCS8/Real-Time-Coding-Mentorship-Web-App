const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const path = require('path');
const fs = require('fs');


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const codeBlocks = [
  { id: 1, title: 'Add Two Numbers', code: 'addNumbers.js' },
  { id: 2, title: 'Find Maximum Number', code: 'findMax.js' },
  { id: 3, title: 'Check Prime Number', code: 'checkPrime.js' },
  { id: 4, title: 'Reverse String', code: 'reverseString.js' },
];

app.use(express.static('public'));

app.get('/codeBlock', (req, res) => {
  const codeBlockId = req.query.id;
  const codeBlock = codeBlocks.find((block) => block.id === parseInt(codeBlockId));

  if (codeBlock) {
    res.sendFile(path.join(__dirname, 'public', 'codeBlock.html'));
  } else {
    res.status(404).send('Code block not found');
  }
});

io.on('connection', (socket) => {
  socket.on('getCodeBlockList', () => {
    socket.emit('codeBlockList', codeBlocks);
  });

  socket.on('getCodeBlockDetails', (codeBlockId) => {
    const codeBlock = codeBlocks.find((block) => block.id === parseInt(codeBlockId));
    const filePath = path.join(__dirname, 'public', 'codeBlocks', codeBlock.code);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        socket.emit('codeBlockDetails', codeBlock, data);
      }
      });
  });

  socket.on('updateCodeBlock', (codeBlockId, updatedCode) => {
    const codeBlock = codeBlocks.find((block) => block.id === parseInt(codeBlockId));
    const filePath = path.join(__dirname, 'public', 'codeBlocks', codeBlock.code);
    fs.writeFile(filePath, updatedCode, 'utf8', (err) => {
      if (err) {
        console.error(err);
      } else {
        socket.broadcast.emit('codeBlockUpdated', updatedCode);
      }
    });
  });
});

// io.on('connection', (socket) => {
//   let isMentor = false;

//   // Determine if the user is the mentor or student
//   if (!isMentor) {
//     isMentor = true;
//     socket.emit('mentorJoined');
//   }

//   // Handle requesting code block details
//   socket.on('getCodeBlockDetails', () => {
//     if (isMentor) {
//       // Send the code block details to the mentor
//       socket.emit('codeBlockDetails', codeBlocks);
//     } else {
//       // Send the code block details to the student
//       socket.emit('codeBlockDetails', codeBlock);
//     }
//   });

//   // Handle code changes from the student
//   socket.on('codeChange', (newCode) => {
//     if (!isMentor) {
//       // Emit the code changes to the mentor
//       socket.broadcast.emit('codeChange', newCode);

//       if (newCode === solutionCode) {
//         // Emit an event to display a smiley face on the screen
//         socket.broadcast.emit('showSmiley');
//       }
//     }
//   });
// });