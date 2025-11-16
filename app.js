// app.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

const products = JSON.parse(fs.readFileSync(path.join(__dirname,'products.json')));
let couponPtr = 0;

function scoreProducts({who, type, diet}){
  return products.map(p => {
    let score = p.popularity || 0;
    if (type && p.category.toLowerCase().includes(type.toLowerCase())) score += 12;
    if (who && who.toLowerCase() === 'child' && p.category.toLowerCase().includes('infant')) score += 8;
    if (diet && diet.toLowerCase() === 'sugar-free' && p.tags && p.tags.includes('sugar-free')) score += 6;
    score += Math.random() * 3;
    return {...p, score};
  }).sort((a,b) => b.score - a.score);
}

app.post('/compute-recs', (req, res) => {
  const {who='', type='', diet=''} = req.body;
  const recs = scoreProducts({who,type,diet}).slice(0,3).map(p => ({id:p.id,name:p.name,category:p.category,benefit:p.benefit,img:p.img,coupon:p.coupon}));
  res.json({recs});
});

app.post('/issue-coupon', (req, res) => {
  const coupons = products.reduce((acc,p)=>{ if (p.coupon) acc.push(p.coupon); return acc; }, []);
  if (coupons.length === 0) return res.status(404).json({error:'no coupons configured'});
  const code = coupons[couponPtr % coupons.length];
  couponPtr += 1;
  res.json({code, notes:'placeholder — mark as issued in admin sheet'});
});

app.get('/health', (req,res)=>res.send('ok'));

app.use(express.static(path.join(__dirname,'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server started on', PORT));