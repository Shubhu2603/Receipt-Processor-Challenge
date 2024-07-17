const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(bodyParser.json());

//store receipts
const receipts = new Map();

// Calculate points
function calculatePoints(receipt) {
    let points = 0;
    let breakdown=[];

  
    // Rule 1
    const retailerPoints = receipt.retailer.replace(/[^a-zA-Z0-9]/g, '').length;
    points += retailerPoints;
    if(retailerPoints!==0){
        breakdown.push(`    ${retailerPoints} points - retailer name (${receipt.retailer}) has ${retailerPoints} alphanumeric characters`);
        if (receipt.retailer.includes('&')) {
        breakdown.push(`                note: '&' is not alphanumeric`);
        }
    }
    // Rule 2
    if (parseFloat(receipt.total).toFixed(2).endsWith('.00')) {
        points += 50;
        breakdown.push(`    50 points - total is a round dollar amount`);
      } 
  
    // Rule 3
    if (parseFloat(receipt.total) % 0.25 === 0) {
        points += 25;
        breakdown.push(`    25 points - total is a multiple of 0.25`);
      } 
  
    // Rule 4
    const itemPairs = Math.floor(receipt.items.length / 2);
    const itemPairPoints = itemPairs * 5;
    points += itemPairPoints;
    breakdown.push(`    ${itemPairPoints} points - ${receipt.items.length} items (${itemPairs} pairs @ 5 points each)`);
  
    // Rule 5
    let descriptionPoints = 0;
    receipt.items.forEach(item => {
      const trimmedLength = item.shortDescription.trim().length;
      if (trimmedLength % 3 === 0) {
        const itemPoints = Math.ceil(parseFloat(item.price) * 0.2);
        descriptionPoints += itemPoints;
        breakdown.push(`     ${itemPoints} points - "${item.shortDescription.trim()}" is ${trimmedLength} characters (a multiple of 3)`);
        breakdown.push(`                item price of ${item.price} * 0.2 = ${(parseFloat(item.price) * 0.2).toFixed(2)}, rounded up is ${itemPoints} points`);
      }
    });
    points += descriptionPoints;
  
    // Rule 6
    const [year, month, day] = receipt.purchaseDate.split('-').map(Number);
    if (day % 2 !== 0) {
      points += 6;
      breakdown.push(`     6 points - purchase day is odd`);
    } 
  
    // Rule 7
    const [hour, minute] = receipt.purchaseTime.split(':').map(Number);
    if ((hour === 14 && minute > 0) || (hour === 15)) {
      points += 10;
      breakdown.push(`    10 points - ${receipt.purchaseTime} is between 2:00pm and 4:00pm`);
    }
  
    console.log(`Total Points: ${points}`);
    console.log('Breakdown:');
    breakdown.forEach(line => console.log(line));
    console.log("  + ---------");
    console.log(`  = ${points} points`);
    return points;
  }

// POST
app.post('/receipts/process', (req, res) => {
  const receipt = req.body;
  const id = uuidv4();
  const points = calculatePoints(receipt);
  
  receipts.set(id, points);
  
  res.json({ id });

});

// GET
app.get('/receipts/:id/points', (req, res) => {
  const id = req.params.id;
  const points = receipts.get(id);
  
  if (points === undefined) {
    res.status(404).json({ error: 'Receipt not found' });
  } else {
    res.json({ points });
  }
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});