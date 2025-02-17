let emitters = [];
let emitter;
let pColor = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
  emitter = new Emitter;
}



function draw() {
  background(0);
  //emitter = new Emitter(width/2, height/2);
  //emitter.addParticle();
  //emitter.run();

  if(mouseIsPressed == true){
    emitter.addParticle(mouseX, mouseY);
  }
  emitter.run();

  console.log(mouseIsPressed);

  colorMode(HSB);
  fill(pColor, 100, 100);
  ellipse(width/1.1, height/1.1, 20, 20)
}

// function mousePressed(){
//   pColor = random(100);
// }

function keyPressed(){
  if (keyCode === LEFT_ARROW){
    if(pColor == 340){
      pColor = 20
    }else{
    pColor = pColor + 20
    }
  }

  if (keyCode === RIGHT_ARROW){
    if(pColor == 20){
      pColor = 360
    }else{
    pColor = pColor - 20
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Particle {
  constructor(x,y, fill) {
    this.position =  createVector(x, y);
    // For demonstration purposes, the particle has a random velocity.
    // Starts by moving up a little bit and in a random left or right direction slightly
    this.velocity = createVector(random(-1, 1), random(-1, 0));
    this.acceleration = createVector(0, 0);
    this.lifespan = 255.0;
    this.fill = fill;
  }


  run() {
    // Adds acceleration to velocity, adding velocity to the location
    // Then acceleration gets set to 0 because the force is getting re-added to it every draw loop
   let gravity = createVector(0, 0.05); // gravity needs to be declared as a variable to use the createVector function, since passing applyForce two numbers won't make it register a vector
    this.applyForce(gravity);
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 2.0;
    this.acceleration.mult(0);
    // lifespan determines the stroke and fill alpha of the particle
    noStroke();
    colorMode(HSB);
    fill(this.fill, 100, 100, this.lifespan);
    rect(this.position.x, this.position.y, 2, 2);
  }

  // Adds whatever force is being applied to it in the draw loop to the acceleration
  applyForce(force) {
    this.acceleration.add(force);
  }

  // Is the particle alive or dead?
  isDead() {
    return (this.lifespan < 0.0);
  }
}

class Emitter { //constructing an emitter class to clean up the draw loop and allow us to have multiple emitters
  constructor(x, y){
    this.origin = createVector(x, y);
    this.particles = []; //this takes the place of declaring a global particle array
    this.index = 0;
  }

  addParticle(x, y){ 
      this.particles.push(new Particle(x, y, pColor));
    
  }

  run(){
     //i.e. the size of the for loop is the size of the particle array this emitter has
    for (let i = this.particles.length - 1; i >= 0; i--){
      this.particles[i].run();
      if (this.particles[i].isDead()) { //i.e. if particle.isDead is true
      this.particles.splice(i, 1);  // removes particle at index i
      }
    }
  }
}

// maybe come back to some of the examples, e.g. having the particle system follow the mouse

//https://natureofcode.com/particles/

// Have it so you can cycle through colours using arrow keys, maybe pressing left or right adds or subtracts 10?
// Have it set up so that when the particles hit the bottom of the screen they stop and sit there (so force downwards is only applied when it's above 0 and not below another particle)
// Some text at the bottom that says to press buttons to cycle through different sand colours
// Then more mouse interactivity if there's time (turn mouse into a repeller and push the sand around maybe? Other particles like water or gas that behave differently?)