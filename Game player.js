var objects = [],
	ball_image = new Image(),
	is_falling = false,
	eyes = {x:0, y:0, z:1000},
	screen_z = 750,
	level = 0;
ball_image.src = "ball.png";

function mouse_move(event) {
	eyes.x = 500 - event.clientX + parseFloat($("canvas").css("top"));
	eyes.y = - 500 + event.clientY - parseFloat($("canvas").css("left"));
	draw_cube();
}

function mouse_wheel(event) {
	screen_z = Math.min(Math.max(event.deltaY + screen_z, -500), 966);
	draw_cube();
}

function mouse_click(event) {
	if (event.which == 1) { // left click
		tilt_counter_clockwise();
	} else if (event.which == 3) { // right click
		tilt_clockwise();
	}
}

function tilt_clockwise() {
	if (!is_falling) {
		objects.forEach(function(e) {
			e.New_y = -e.x;
			e.x = e.y;
			e.y = e.New_y;
			e.New_height = e.width;
			e.width = e.height;
			e.height = e.New_height;
		});
		draw_cube();
	}
}

function tilt_counter_clockwise() {
	if (!is_falling) {
		objects.forEach(function(e) {
			e.New_y = e.x;
			e.x = -e.y;
			e.y = e.New_y;
			e.New_height = e.width;
			e.width = e.height;
			e.height = e.New_height;
		});
		draw_cube();
	}
}

function draw_cube() {
	canvas.clearRect(0,0,1000,1000);
	objects.sort(is_a_in_front_of_b);
	for (var i = 0; i < objects.length; i++) {
		const obj = objects[i];
		canvas.fillStyle = "#00000060";
		canvas.strokeStyle = "#000000";
		if (obj.selected) {
			canvas.fillStyle = "#ffff0060"
		} else if (obj.type == "cube_side") {
			canvas.fillStyle = "#00000000";
		} else if (obj.type == "exit") {
			canvas.fillStyle = "#ff000060";
		}
		if (obj.type == "ball") {
			const slope1 = find_slope(eyes, {x: obj.x - obj.width/2, y: obj.y - obj.width/2, z: obj.z}),
				pos1 = {x: slope1.x * (eyes.z - screen_z), y: slope1.y * (eyes.z - screen_z)},
				slope2 = find_slope(eyes, {x: obj.x + obj.width/2, y: obj.y + obj.width/2, z: obj.z}),
				pos2 = {x: slope2.x * (eyes.z - screen_z), y: slope2.y * (eyes.z - screen_z)};
			canvas.drawImage(ball_image, pos1.x + 500, 500 - pos1.y, pos2.x - pos1.x, pos1.y - pos2.y);
		} else {
			var slopes;
			if (obj.depth == 0) {
				slopes = [
					find_slope(eyes, {x:obj.x + obj.width/2, y:obj.y + obj.height/2, z:obj.z}),
					find_slope(eyes, {x:obj.x + obj.width/2, y:obj.y - obj.height/2, z:obj.z}),
					find_slope(eyes, {x:obj.x - obj.width/2, y:obj.y - obj.height/2, z:obj.z}),
					find_slope(eyes, {x:obj.x - obj.width/2, y:obj.y + obj.height/2, z:obj.z})];
			} else if (obj.width == 0) {
				slopes = [
					find_slope(eyes, {x:obj.x, y:obj.y + obj.height/2, z:obj.z + obj.depth/2}),
					find_slope(eyes, {x:obj.x, y:obj.y + obj.height/2, z:obj.z - obj.depth/2}),
					find_slope(eyes, {x:obj.x, y:obj.y - obj.height/2, z:obj.z - obj.depth/2}),
					find_slope(eyes, {x:obj.x, y:obj.y - obj.height/2, z:obj.z + obj.depth/2})];
			} else if (obj.height == 0) {
				slopes = [
					find_slope(eyes, {x:obj.x + obj.width/2, y:obj.y, z:obj.z + obj.depth/2}),
					find_slope(eyes, {x:obj.x + obj.width/2, y:obj.y, z:obj.z - obj.depth/2}),
					find_slope(eyes, {x:obj.x - obj.width/2, y:obj.y, z:obj.z - obj.depth/2}),
					find_slope(eyes, {x:obj.x - obj.width/2, y:obj.y, z:obj.z + obj.depth/2})];
			} else {
				alert("slopes actually wasn't defined on level " + level);
			}
			var points = [];
			for (var j = 0; j < 4; j++) {
				points.push(slopes[j].x * (eyes.z - screen_z));
				points.push(slopes[j].y * (eyes.z - screen_z));
			}
			polygon(points);
		}
	}
}

function is_a_in_front_of_b(a, b) {
	if (a.type == "ball" && b.type == "ball") {
		return distance(a, eyes) > distance(b, eyes) ? 1 : -1;
	} else if (b.type == "ball") {
		return - is_a_in_front_of_b(b, a);
	}
	const slope = find_slope(eyes, a);
	if (b.depth == 0) {
		return a.z < b.z ? -1 : 1;
	} else if (b.width == 0) {
		return eyes.x > b.x ^ a.x > b.x ? -1 : 1;
	} else if (b.height == 0) {
		return eyes.y > b.y ^ a.y > b.y ? -1 : 1;
	} else {
		console.log("Object not plane.");
	}
}

function distance(a, b) {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function find_slope(a, b) {
	return {x:(b.x - a.x)/(a.z - b.z), y:(b.y - a.y)/(a.z - b.z)};
}

function polygon(points) {
	canvas.beginPath();
	canvas.moveTo(points[0] + 500, 500 - points[1]);
	for (var i = 2; i < points.length - 1; i += 2) {
		canvas.lineTo(points[i] + 500, 500 - points[i + 1]);
		canvas.stroke();
	}
	canvas.lineTo(points[0] + 500, 500 - points[1]);
	canvas.stroke();
	canvas.closePath();
	canvas.fill();
}

function view_right() {
	objects.forEach(function(e) {
		e.New_z = -e.x;
		e.x = e.z;
		e.z = e.New_z;
		e.New_depth = e.width;
		e.width = e.depth;
		e.depth = e.New_depth;
	});
	draw_cube();
}

function view_left() {
	objects.forEach(function(e) {
		e.New_z = e.x;
		e.x = -e.z;
		e.z = e.New_z;
		e.New_depth = e.width;
		e.width = e.depth;
		e.depth = e.New_depth;
	});
	draw_cube();
}

function new_obj(type, x, y, z, width, height, depth, identifier) {
	objects.push({x:x,y:y,z:z + depth/2,width:width,height:height,depth:0,type:type,identifier:identifier});
	objects.push({x:x,y:y,z:z - depth/2,width:width,height:height,depth:0,type:type,identifier:identifier});
	objects.push({x:x + width/2,y:y,z:z,width:0,height:height,depth:depth,type:type,identifier:identifier});
	objects.push({x:x - width/2,y:y,z:z,width:0,height:height,depth:depth,type:type,identifier:identifier});
	objects.push({x:x,y:y + height/2,z:z,width:width,height:0,depth:depth,type:type,identifier:identifier});
	objects.push({x:x,y:y - height/2,z:z,width:width,height:0,depth:depth,type:type,identifier:identifier});
}

function ball(x, y, z) {
	objects.push({type: "ball", width:20, height:20, depth:20, x:x, y:y, z:z})
}

function overlap1d(x1, width1, x2, width2) {
	return (
		(x1 <= x2 && x2 - width2/2 <= x1 + width1/2)||
		(x2 <= x1 && x1 - width1/2 <= x2 + width2/2));
}

function overlap(object1, object2) {
	var xol = overlap1d(object1.x, object1.width, object2.x, object2.width),
		yol = overlap1d(object1.y, object1.height, object2.y, object2.height),
		zol = overlap1d(object1.z, object1.depth, object2.z, object2.depth);
	return (xol && yol && zol);
}

function fall() {
	var not_falling_number = 0;
	var total_number = 0;
	for (i = 0; i < objects.length; i++) {
		if (objects[i].type == 'ball' || objects[i].type == 'movable') {
			objects[i].speed += 0.2;
			objects[i].y -= objects[i].speed;
			total_number++;
			for (j = 0; j < objects.length; j++) {
				if ((overlap(objects[i], objects[j]) && i != j)) {
					not_falling_number++;
					while (overlap(objects[i], objects[j])) {
						objects[i].y += 0.2;
					}
					objects[i].speed = 0.2;
					if (objects[j].type == 'exit' && objects[i].type == 'ball') {
						next_level();
					}
					break;
				}
			}
			draw_cube();
		}
	}
	is_falling = (not_falling_number != total_number);
	setTimeout(fall, 0); //keep falling
}

$(document).keydown(function(e) {
	switch(e.which) {
		case 37: tilt_counter_clockwise(); break;
		case 39: tilt_clockwise(); break;
		case 65: view_left(); break;
		case 68: view_right(); break;
	}
});