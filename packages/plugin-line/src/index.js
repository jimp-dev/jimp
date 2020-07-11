let Jimp = require("jimp");

function plot(x, y, c, img)
{
	img.setPixelColor(Jimp.rgbaToInt(0, 0, 0, c * 255), x, y);
}
function ipart(x){
	return Math.floor(x);
}
function round(x){
	return ipart(x + 0.5);
}
function fpart(x){
	return x - Math.floor(x);
}
function rfpart(x){
	return 1 - fpart(x);
}
function wuDrawLine(x0, y0, x1, y1, img)
{
	if(x1 == x0){
		for(let y = Math.min(y0, y1); y < Math.max(y0, y1); y++){
			plot(x1, y, 1, img);
		}
	}
	else{
		let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
		let t;
		if(steep){
			t = x0;
			x0 = x1;
			x1 = t;
			t = y0;
			y0 = y1;
			y1 = t;
		}
		if(x0 > x1){
			t = x0;
			x0 = x1;
			x1 = t;
			t = y0;
			y0 = y1;
			y1 = t;
		}
		let dx = x1 - x0;
		let dy = y1 - y0;
		let gradient = dy / dx
		if(dx == 0.0){
			gradient = 1.0;
		}
		let xend = Math.round(x0);
		let yend = y0 + gradient * (xend - x0);
		let xgap = rfpart(x0 + 0.5);
		let xpxl1 = xend;
		let ypxl1 = ipart(yend);
		if(steep){
			plot(ypxl1, xpxl1, rfpart(yend) * xgap, img);
			plot(xpxl1, ypxl1 + 1, fpart(yend) * xgap, img); 
		}
		let intery = yend + gradient;
		xend = Math.round(x1);
		yend = y1 + gradient * (xend - x1);
		xgap = fpart(x1 + 0.5)
		let xpxl2 = xend;
		let ypxl2 = ipart(yend);
		if(steep){
			plot(xpxl2, ypxl2, rfpart(yend) * xgap, img);
			plot(xpxl2, ypxl2 + 1, fpart(yend) * xgap, img);
		}
		if(steep){
			for(let x = xpxl1 + 1; x < xpxl2 - 1; x++){
				plot(ipart(intery), x, rfpart(intery), img);
				plot(ipart(intery) + 1, x, fpart(intery), img);
				intery = intery + gradient;
			}
		}
		else{
			for(let x = xpxl1 + 1; x < xpxl2 - 1; x++){
				plot(x, ipart(intery), fpart(intery), img);
				plot(x, ipart(intery) + 1, fpart(intery), img);
				intery = intery + gradient;
			}
		}
	}
}

function drawLine(x0, y0, x1, y1, img)
{
	let height = img.bitmap.height;
	let width = img.bitmap.width;
	let deltax = x1 - x0;
	let deltay = y1 - y0;
	let deltaerr = Math.abs(deltay / deltax);

	let error = 0.0;
	let y = y0;
	for(let x = x0; x < x1; x++)
	{
		img.setPixelColor(000, x, y);
		error = error + deltaerr
		if(error >= 0.5)
		{
			y = y + Math.sign(deltay) * 1
			error = error - 1.0
		}
	}
}

// Jimp.read('blank.jpeg', (error, img) => {
// 	if(error) throw error;
// 	console.log(img);
// 	//wuDrawLine(50, 500, 1000, 500, img);
// 	wuDrawLine(1000, 200, 1000, 540, img);
// 	//drawLine(300, 200, 1080, 540, img);
// 	img.write("result.jpeg");
// 	console.log('done');
// });

module.exports = { wuDrawLine, drawLine }