class Waves{
  constructor(holder,options){
    this.options = Object.assign({
      resize: true,
      rotation: 45,
      waves: 5,
      width: 100,
      hue: [11, 14],
      amplitude: 0.5,
      background: true,
      preload: true,
      speed: [0.004, 0.008],
      fps:25
    }, options);
    this.waves = [];
    this.holder = holder;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.holder.appendChild(this.canvas);
    this.hue = this.options.hue[0];
    this.hueFw = true;
    this.frame=-1
    this.interval = 1000/this.options.fps
    this.last=Date.now()
    this.resize();
    this.init(this.options.preload);
    if (this.options.resize) window.addEventListener('resize', ()=>{this.resize()}, false);
  }
  init(preload){
    this.setColor();
    for (let i = 0; i < this.options.waves; i++) {
      this.waves[i] = new Wave(this);
    }
    if (preload) this.preload();
  }
  preload() {
    for (let i = 0; i < this.options.waves; i++) {
      this.updateColor();
      for (let j = 0; j < this.options.width; j++) {
        this.waves[i].update();
      }
    }
  }
  render() {
    this.updateColor();
    this.clear();
    if (this.options.background) {
      this.background();
    }
    this.waves.forEach((w,i)=>{
      w.update()
      w.draw()
    })
  }
  animate() {
    this.frame=window.requestAnimationFrame(this.animate.bind(this))
    let now=Date.now()
    let delta=now-this.last
    if (delta>this.interval){
      this.last=now - (delta % this.interval)
      this.render()
    }
  }
  clear () {this.ctx.clearRect(0, 0, this.width, this.height);}
  background(){
    let gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#000');
    gradient.addColorStop(1, this.color);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  resize() {
    let width = this.holder.offsetWidth;
    let height = this.holder.offsetHeight;
    this.scale = window.devicePixelRatio || 1;
    this.width = width * this.scale;
    this.height = height * this.scale;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.radius = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / 2;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }
  updateColor() {
    this.hue += (this.hueFw) ? 0.01 : -0.01;
    if (this.hue > this.options.hue[1] && this.hueFw) {
      this.hue = this.options.hue[1];
    } else if (this.hue < this.options.hue[0] && !this.hueFw) {
      this.hue = this.options.hue[0];
    }
    this.setColor();
  }
  setColor() {
    let r = Math.floor(127 * Math.sin(0.3 * this.hue) + 128);
    let g = Math.floor(127 * Math.sin(0.3 * this.hue + 2) + 128);
    let b = Math.floor(127 * Math.sin(0.3 * this.hue + 4) + 128);
    this.color = 'rgba(' + r + ',' + g + ',' + b + ', 0.1)';
  }
  stop(){
    window.cancelAnimationFrame(this.frame)
  }
}

class Wave{
  constructor(waves) {
    let speed = waves.options.speed;
    this.waves = waves;
    this.lines = [];
    this.angle = [this.random(Math.PI * 2), this.random(Math.PI * 2), this.random(Math.PI * 2), this.random(Math.PI * 2)];
    this.speed = [
      this.random(speed[0], speed[1]) * this.random_sign(),
      this.random(speed[0], speed[1]) * this.random_sign(),
      this.random(speed[0], speed[1]) * this.random_sign(),
      this.random(speed[0], speed[1]) * this.random_sign(),
    ];
  }
  random(min,max){if (arguments.length === 1) {return Math.random() * min;}return min + Math.random() * (max - min);}
  random_sign(){return (Math.random() > 0.5) ? 1 : -1;}
  update(){
    let lines = this.lines
    lines.push(this.newLine(this.waves.color));
    if (lines.length > this.waves.options.width) {
      lines.shift();
    }
  }
  draw() {
    let waves = this.waves;
    let ctx = waves.ctx;
    let radius = waves.radius;
    let radius3 = radius / 3;
    let x = waves.centerX;
    let y = waves.centerY;
    let rotation = waves.options.rotation * Math.PI / 180;
    let amplitude = waves.options.amplitude;
    this.lines.forEach(line=>{
      let angle = line.angle;
      let x1 = x - radius * Math.cos(angle[0] * amplitude + rotation);
      let y1 = y - radius * Math.sin(angle[0] * amplitude + rotation);
      let x2 = x + radius * Math.cos(angle[3] * amplitude + rotation);
      let y2 = y + radius * Math.sin(angle[3] * amplitude + rotation);
      let cpx1 = x - radius3 * Math.cos(angle[1] * amplitude * 2);
      let cpy1 = y - radius3 * Math.sin(angle[1] * amplitude * 2);
      let cpx2 = x + radius3 * Math.cos(angle[2] * amplitude * 2);
      let cpy2 = y + radius3 * Math.sin(angle[2] * amplitude * 2);
      ctx.strokeStyle = line.color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
      ctx.stroke();
    })
  }
  newLine(color) {
    let angle = this.angle, speed = this.speed;
    return {
      angle: [Math.sin(angle[0] += speed[0]), Math.sin(angle[1] += speed[1]), Math.sin(angle[2] += speed[2]), Math.sin(angle[3] += speed[3])],
      color: color
    }
  }
}
export default Waves

