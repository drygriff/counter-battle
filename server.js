const express = require('express');
const app = express();

app.use(express.static('public'));

app.use(express.json());

let leftNumber = 0;
let rightNumber = 0;


app.post('/update', (req, res) => {
    const clientLeft = req.body.left;
    const clientRight = req.body.right;

    if ((typeof clientLeft === "number") && (typeof clientRight === "number")) {    
        leftNumber += clientLeft;
        rightNumber += clientRight;

        res.json({left: leftNumber, right: rightNumber})
    } else {
        res.status(400).json({ error: 'Invalid numbers' });
    }
})

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
  });