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
  { id: 1, title: 'Add Two Numbers', code: 'addNumbers.js', MentorID: null },
  { id: 2, title: 'Find Maximum Number', code: 'findMax.js', MentorID: null },
  { id: 3, title: 'Check Prime Number', code: 'checkPrime.js', MentorID: null },
  { id: 4, title: 'Reverse String', code: 'reverseString.js', MentorID: null },
];

app.use(express.static('public'));

app.get('/codeBlock', (req, res) => {
  const codeBlockId = req.query.id;
  const codeBlock = codeBlocks.find((block) => block.id === parseInt(codeBlockId));

  if (codeBlock) {
    codeBlock.usersNumber++;
    res.sendFile(path.join(__dirname, 'public', 'codeBlock.html'));
  } else {
    res.status(404).send('Code block not found');
  }
});

io.on('connection', (socket) => {
  socket.on('getCodeBlockList', () => {
    socket.emit('codeBlockList', codeBlocks);
  });

  socket.on('getIsMentor', (codeBlockId) => {
    const codeBlock = codeBlocks.find((block) => block.id === parseInt(codeBlockId));
    if (!codeBlock.MentorID) {
      codeBlock.MentorID = socket.id;
    }
    socket.emit('isMentor', codeBlock.MentorID === socket.id);
  });

  socket.on('disconnect', () => {
    codeBlocks.forEach(codeBlock => {
      if (codeBlock.MentorID === socket.id) {
        codeBlock.MentorID = null;
      }
    });
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