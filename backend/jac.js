
class Toy {
  constructor(name) {
    this.name = name;
  }

  play() {
    console.log(`${this.name} is playing...`);
  }
}

class Child extends Toy {
  constructor(name, toy) {
    super(toy);
    this.childName = name;
  }

  play() {
    console.log(
      `${this.childName} is playing with ${this.name}...`
    );
  }
}

// Create an object
const child1 = new Child("Ronne", "Robot");

// Run the method
child1.play();

