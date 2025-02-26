let emitters = [];
let emitter;
let pColor;
let exploding = false;
let currentSize = 4;

function setup() {
  createCanvas(windowWidth, windowHeight);
  emitter = new Emitter;
  pColor = random(360);

  // Buttons need to be in setup loop otherwise they'll slow the sketch to a crawl, since they're html elements they can't have a background go over them.
  // I could put them in the resizeWindow() function but that would lead to them being duplicated since I don't know how to delete buttons
  // There is a way I can change the way the buttons look in CSS but I don't know if I want to dig into that right now. 
  let leftColorChangeButton = createButton('Colour change to the left');
  leftColorChangeButton.position(width/1.4, height/16);
  leftColorChangeButton.mousePressed(incrementColor);

  let rightColorChangeButton = createButton('Color change to the right');
  rightColorChangeButton.position(width/1.4, (height/16) * 2);
  rightColorChangeButton.mousePressed(decrementColor);

  let deleteButton = createButton('Delete particles');
  deleteButton.position(width/1.4, (height/16) * 3);
  deleteButton.mousePressed(deleteColor);

  let explosionButton = createButton('Explode particles!');
  explosionButton.position(width/1.4, (height/16) * 4);
  explosionButton.mousePressed(explosion);

  let increaseSizeButton = createButton('Increase particle size');
  increaseSizeButton.position(width/1.4, (height/16)*5);
  increaseSizeButton.mousePressed(increaseSize);
  
  let decreaseSizeButton = createButton('Decrease particle size');
  decreaseSizeButton.position(width/1.4, (height/16)*6);
  decreaseSizeButton.mousePressed(decreaseSize);

  let resetButton = createButton('Reset');
  resetButton.position(width/1.4, (height/16) * 7);
  resetButton.mousePressed(reset);
  
}


function draw() {
  background(0);


  let gravity = createVector(0, 0.1);
  emitter.applyGravity(gravity);

  if(mouseIsPressed == true){
    emitter.addParticle(mouseX, mouseY);
  }
  emitter.run();

  colorMode(HSB);
  fill(pColor, 100, 100, 50);
  rect(width/1.1, height/1.1, currentSize, currentSize)

  if (exploding == true && keyIsPressed === true){
    explosion(emitter);
  }


}



// Alternative functionality for keyboard users
function keyPressed(){

  // Cycling through different colours with left and right arrows
  if (keyCode === LEFT_ARROW){
    exploding = false;
    incrementColor();

  }

  if (keyCode === RIGHT_ARROW){
    exploding = false;
    decrementColor();
  }

  // using escape key to delete all the particles
  if (keyCode == 27){
    exploding = false;
    deleteColor();
  }

  if (key === 'r'){
    reset();
  }

  if (keyCode === 32 && keyIsPressed === true){
    exploding = true;
  }
}
    

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}




class Particle {
  constructor(x, y, fill, size) {
    this.size = size;
    this.position =  createVector(x, y);
    this.velocity = createVector(random(-.5, .5), random(-.5, 0));
    this.acceleration = createVector(0, 0);
    this.fill = fill;
    this.mass = map(fill, 0, 360, 1, 5);
    this.stopped = false;
  }


  run() {
    // Adds acceleration to velocity, adding velocity to the location
    // Then acceleration gets set to 0 because the force is getting re-added to it every draw loop
    let gravity = createVector(0, 0.07); // gravity needs to be declared as a variable to use the createVector function, since passing applyForce two numbers won't make it register a vector

      if (this.stopped == false){
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
      }
      this.acceleration.mult(0);

      if (this.stopped == true){
        //mess with this if you want to make more advanced physics, currently the sand just stops immediately
        this.velocity.mult(0);
        this.stopped == true;
      }

      // If particle hits side of the screen it bounces off but retains its velocity. 
      if (this.position.x < 5){
        this.velocity.mult(-1, 1);
      }
      if (this.position.x >= width){
        this.velocity.mult(-1, 1);
      }
    noStroke();
    colorMode(HSB);
    fill(this.fill, 100, 100);
    rect(this.position.x, this.position.y, this.size, this.size);
  }

  look(theseParticles){
    let desiredSeparation = this.size;
    for(let i = 0; i < theseParticles.length; i++){
      let d = p5.Vector.dist(theseParticles[i].position, this.position);
      if ((this != theseParticles[i] && theseParticles[i].stopped == true && d < desiredSeparation) || this.position.y >= height - 10) {
        this.stopped = true;
      } 
      // this is the line of code that makes the particles bounce off each other, but it's not super clear that this is happening... can't decide if I want to keep this
      if(this != theseParticles[i] && d < desiredSeparation){
        this.velocity.mult(-1, 1);
      }
    }
  }

  // Adds whatever force is being applied to it in the draw loop to the acceleration
  applyForce(force) {
    let f = force.copy();
    f.div(this.mass);
    this.acceleration.add(f);
    this.stopped = false;
  }

  // Seperate applyGravity method because I want gravity to apply to the particles even when they're not moving

  applyGravity(force){
    let f = force.copy();
    f.div(this.mass);
    this.acceleration.add(f);
  }
}

class Emitter { //constructing an emitter class to clean up the draw loop and allow us to have multiple emitters
  constructor(x, y){
    this.origin = createVector(x, y);
    this.particles = []; //this takes the place of declaring a global particle array
    this.index = 0;
  }

  addParticle(x, y){ 
      this.particles.push(new Particle(x, y, pColor, currentSize));
  }

  applyForce(force) {
    for(let particle of this.particles){
      particle.applyForce(force);
    }
  }

  applyGravity(force) {
    for(let i = 0; i < this.particles.length; i++){
      if(this.particles[i].position.y <= height - 10){
        this.particles[i].applyGravity(force);
      }
    }
  }

  run(){
     //i.e. the size of the for loop is the size of the particle array this emitter has
    for (let i = this.particles.length - 1; i >= 0; i--){
      this.particles[i].run();
      this.particles[i].look(this.particles);
      //If the particle is below the bounds of the canvas (e.g. if the user resizes the window) delete it
      if (this.particles[i].position.y > height){
        this.particles.splice(i, 1);
      }
    }
  }
}


function explosion(){
  for(let i = 0; i < emitter.particles.length; i++){
    let force = createVector(random(-20, 20), random(-5, -20));
    emitter.particles[i].applyForce(force);
  }
}

function incrementColor(){
  if(pColor == 340){
    pColor = 20
  }else{
  pColor = pColor + 20
  }
}

function decrementColor(){
  if(pColor == 20){
    pColor = 360
  }else{
  pColor = pColor - 20
  }
}

function deleteColor(){
  for(let i = emitter.particles.length - 1; i > 0; i--){
    if(emitter.particles[i].fill == pColor){
      emitter.particles.splice(i, 1);
    }
  }
}

function increaseSize(){
  if(currentSize < 30){
    currentSize += 2;
  }
}

function decreaseSize(){
  if(currentSize >2){
    currentSize -= 2;
  }
}

function reset(){
  for(let i = emitter.particles.length - 1; i > 0; i--){
    emitter.particles.splice(i, 1);
  }
}

/* More mouse interactivity if there's time 
*/