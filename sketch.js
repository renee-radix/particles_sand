let emitters = [];
let emitter;
let pColor = 20;
let repelling = false;

let bucket;

function preload(){
  bucket = loadImage('bucket.png');
}






function setup() {
  createCanvas(windowWidth, windowHeight);
  emitter = new Emitter;
}








function draw() {
  background(0);
  //emitter = new Emitter(width/2, height/2);
  //emitter.addParticle();
  //emitter.run();

  let gravity = createVector(0, 0.1);
  emitter.applyGravity(gravity);

  if(mouseIsPressed == true){
    emitter.addParticle(mouseX, mouseY);
  }
  emitter.run();

  colorMode(HSB);
  fill(pColor, 100, 100);
  ellipse(width/1.1, height/1.1, 20, 20)
}




function keyPressed(){

  // Cycling through different colours with left and right arrows
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

  // using escape key to delete all the particles
  if (keyCode == 27){
    emitter.deleteColor(pColor);
  }

  if (key === 'r'){
    repelling = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}




class Particle {
  constructor(x, y, fill) {
    this.size = 5;
    this.position =  createVector(x, y);
    this.velocity = createVector(random(-.5, .5), random(-.5, 0));
    this.acceleration = createVector(0, 0);
    this.lifespan = 255.0;
    this.fill = fill;
    this.mass = map(fill, 0, 360, 1, 5);
    this.stopped = false;
  }


  run() {
    // Adds acceleration to velocity, adding velocity to the location
    // Then acceleration gets set to 0 because the force is getting re-added to it every draw loop
    let gravity = createVector(0, 0.05); // gravity needs to be declared as a variable to use the createVector function, since passing applyForce two numbers won't make it register a vector

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
    // lifespan determines the stroke and fill alpha of the particle
    noStroke();
    colorMode(HSB);
    fill(this.fill, 100, 100, this.lifespan);
    rect(this.position.x, this.position.y, this.size, this.size);
  }

  look(theseParticles){
    let desiredSeparation = this.size;
    for(let i = 0; i < theseParticles.length; i++){
      let d = p5.Vector.dist(theseParticles[i].position, this.position);
      if ((this != theseParticles[i] && theseParticles[i].stopped == true && d < desiredSeparation) || this.position.y >= height - 10) {
        this.stopped = true;
      } // I want to write "else this.stopped = false" but it breaks the code... why?
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
    this.repeller = new Repeller ();
  }

  addParticle(x, y){ 
      this.particles.push(new Particle(x, y, pColor));
  }

  applyForce(force) {
    for(let particle of this.particles){
      particle.applyForce(force);
    }
  }

  applyGravity(force) {
    for(let i = 0; i < this.particles.length; i++){
      if(this.particles[i].position.y <= height - 1){
        this.particles[i].applyGravity(force);
      }
    }
  }

  run(){
     //i.e. the size of the for loop is the size of the particle array this emitter has
    for (let i = this.particles.length - 1; i >= 0; i--){
      this.particles[i].run();
      this.particles[i].look(this.particles);
    }
    if(repelling == true){
      this.repeller.show();
      for (let i = 0; i < this.particles.length; i++){
        let force =  this.repeller.repel(this.particles[i]);
        this.particles[i].applyForce(force);
        console.log("yup!");
      }
      // for (let particle of this.particles){
      //   let force = this.repeller.repel(particle);
      //   particle.applyForce(force);
      // }

    }
  }

  deleteColor(colorVal){
    for(let i = this.particles.length - 1; i > 0; i--){
      if(this.particles[i].fill == colorVal){
        this.particles.splice(i, 1);
      }
    }
  }
}

class Repeller {

  constructor() {    
    //Change here to adjust strength
    this.power = 150;
    this.position = createVector(mouseX, mouseY);
  }

  show() {
    //this.position.x = mouseX;
    //this.position.y = mouseY;
    stroke(0);
    fill(255);
    ellipse(mouseX, mouseY, 50, 50);


  }

  repel(particle) {
    let force = p5.Vector.sub(this.position, particle.position);
    let distance = force.mag();

    distance = constrain(distance, 5, 50);
    let strength = -1 * this.power / (distance * distance);
    force.setMag(strength);
    return force;


  }

}



//https://natureofcode.com/particles/

// Some text at the bottom that says to press buttons to cycle through different sand colours
// Then more mouse interactivity if there's time (turn mouse into a repeller and push the sand around maybe? Other particles like water or gas that behave differently?)
// Or make it so you can press a key and all the particles of a certain colour dissapear, but then you'd want to check for whether or not they're stopped

// Add code that says: when a force other than gravity is applied, this.stopped = false