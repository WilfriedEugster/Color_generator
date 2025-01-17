let data;
let n_data_palettes;
let colors;
let sliders;
let buttons;
let mouse_pressing = false;
let mouse_releasing = false;
let dragging = false;
let current_palette_saved = false;

const tags1 = ["passive", "dull", "cold", "wet", "sugary", "mild", "silent", "harsh"];
const tags2 = ["active", "bright", "warm", "dry", "bitter", "acid", "noisy", "harmonious"];
const buttons_tags = ["Reset all", "New palette", "Save data"];

const n_colors = 4;
const color_stroke_weight = 2;

let margin, side_margin, margin2, text_size, main_width, color_height, color_text_height, y_sliders, slider_height, y_buttons, button_height, button_width, y_foot, foot_height;

function update_dimensions() {
  margin = min(width, height) / 16;
  side_margin = margin;
  margin2 = margin / 2;
  text_size = min(25, width / 24);

  main_width = min(width - 2 * side_margin, height);
  side_margin = (width - main_width) / 2;
  color_height = height / 8;
  color_text_height = height / 16;

  y_sliders = margin + color_height + color_text_height + margin2 / 2;
  slider_height = height / 16;

  y_buttons = y_sliders + slider_height * tags1.length + margin2;
  button_height = height / 16;
  button_width = (main_width - 2 * (buttons_tags.length - 1) * margin2) / buttons_tags.length;

  y_foot = y_buttons + button_height;
  foot_height = height - y_foot - margin;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  update_dimensions();

  for (let i = 0; i < sliders.length; i++){
    sliders[i].resize(side_margin, y_sliders + slider_height * i, main_width, slider_height);
  }
  
  for (let i = 0; i < buttons.length; i++){
    buttons[i].resize(side_margin + margin2 + i * (button_width + margin2), y_buttons, button_width, button_height, buttons_tags[i]);
  }
  
}

class Slider {
  constructor(x, y, dx, dy, size, tag1, tag2) {
    this.size = size;
    this.tag1 = tag1;
    this.tag2 = tag2;
    
    this.resize(x, y, dx, dy);
    
    this.value = 0.5;
    this.hover = false;
    this.drag = false;
    this.bar_color = 80;
    this.circle_color = 40;
  }

  resize(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;

    this.tag_width = dx * 0.3;
    this.bar_width = dx - 2 * this.tag_width;
    this.bar_inside_width = this.bar_width - this.size;
    this.left_limit = x + this.tag_width + this.size / 2;
    this.right_limit = this.left_limit + this.bar_inside_width;
    this.y_center = y + dy / 2;
    this.click_max_distance = min(this.size * 2, this.dy / 2);
  }
  
  update() {
    this.hover = this.left_limit - this.click_max_distance <= mouseX && mouseX <= this.right_limit + this.click_max_distance && this.y_center - this.click_max_distance <= mouseY && mouseY <= this.y_center + this.click_max_distance;
    
    if (mouse_pressing && this.hover && !this.drag && !dragging) {
      this.drag = true;
      dragging = true;
    }
    if (mouse_releasing && this.drag && dragging) {
      this.drag = false;
      dragging = false;
    }
    
    if (this.drag || (this.hover && !dragging)){
      this.bar_color = 70;
      this.circle_color = 30;
    }
    else {
      this.bar_color = 80;
      this.circle_color = 40;
    }
    if (this.drag) {
      this.value = (mouseX - this.left_limit) / this.bar_inside_width;
      if (this.value < 0)
        this.value = 0;
      else if (this.value > 1)
        this.value = 1;
    }
    this.value = round(this.value, 1);
  }

  display() {
    fill(this.bar_color);
    rectMode(CORNER);
    rect(this.x + this.tag_width, this.y_center - this.size / 2, this.bar_width, this.size, this.size / 2);
    
    stroke(100);
    strokeWeight(4);
    let ruler_spacing = this.bar_inside_width / 10;
    let line_x = this.left_limit + ruler_spacing;
    let line_y1 = this.y_center - this.size / 2;
    let line_y2 = line_y1 + this.size;
    for(let i = 1; i < 10; i++) {
      line(line_x, line_y1, line_x, line_y2);
      line_x += ruler_spacing;
    }
    
    noStroke();
    fill(this.circle_color);
    circle(this.x + this.tag_width + this.size / 2 + this.value * this.bar_inside_width, this.y_center, this.size * 2);
    
    fill(0);
    textSize(min(text_size, this.dy * 0.75 - 1));
    textAlign(CENTER, CENTER);
    text(this.tag1, this.x, this.y, this.tag_width, this.dy);
    text(this.tag2, this.x + this.bar_width + this.tag_width, this.y, this.tag_width, this.dy);
  }
}

class Button {
  constructor(x, y, dx, dy, tag) {
    this.tag = tag;

    this.resize(x, y, dx, dy);
    
    this.clicked = false;
    this.button_color = 70;
  }
  
  resize(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }

  update() {
    this.hover = this.x <= mouseX && mouseX <= this.x + this.dx && this.y <= mouseY && mouseY <= this.y + this.dy;
    
    if (mouse_pressing && this.hover && !dragging) {
      this.clicked = true;
    }
    
    if (this.hover && !dragging){
      this.button_color = 80;
    }
    else {
      this.button_color = 90;
    }
  }
  
  display() {
    fill(this.button_color);
    rectMode(CORNER);
    rect(this.x, this.y, this.dx, this.dy, 10);
    
    fill(0);
    textSize(min(text_size, this.dy * 0.75 - 1));
    textAlign(CENTER, CENTER);
    text(this.tag, this.x, this.y, this.dx, this.dy);
  }
  
  pop_clicked() {
    if (!this.clicked)
      return false;
    
    this.clicked = false;
    return true;
  }
}

function empty_data() {
  n_data_palettes = 1;
  
  let line0 = "";
  for (let i = 1; i <= n_colors; i++)
    line0 += "H" + i +";S" + i + ";L" + i + ";";
  for (let t of tags2)
    line0 += t + ";";
  
  data = [line0];
}

function add_data(palette, sliders) {
  n_data_palettes++;
  
  let new_line = "";
  for (let c of palette)
    new_line += round(hue(c)) + ";" + round(saturation(c)) + ";" + round(lightness(c)) + ";";
  for (let s of sliders)
    new_line += s.value + ";";
  
  data.push(new_line);
}

function framed_gaussian(avg, std, maxi) {
  let res = randomGaussian(avg, std) % maxi;
  if (res < 0)
    return res + maxi;
  return res;
}

function random_color() {
  colorMode(HSL);
  return color(random(0, 365), framed_gaussian(50, 35, 100), framed_gaussian(50, 35, 100));
}

function color_dist(c1, c2) {
  return dist(red(c1)/255, green(c1)/255, blue(c1)/255, red(c2)/255, green(c2)/255, blue(c2)/255);
}

function random_palette() {
  let res = [];
  let c1, valid_color;
  for (let i = 0; i < n_colors; i++) {
    valid_color = false;
    while (!valid_color) {
      c1 = random_color();
      valid_color = true;
      for (let c2 of res){
        if (color_dist(c1, c2) < 0.1) {
          valid_color = false;
        }
      }
    }
    res.push(random_color());
  }
  return res;
}

function display_palette(x, y, dx, dy, palette) {
  const color_width = dx / n_colors;
  
  min(text_size, this.dy * 0.75 - 1)
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  
  for (let i = 0; i < palette.length; i++) {
    fill(palette[i]);
    rect(x + color_width * i, y, color_width, dy);
    
    fill(40);
    text(palette[i].toString('#rrggbb'), x + color_width * i, y + dy, color_width, color_text_height);
  }
}

function generate_new_palette() {
  palette = random_palette();
  for (let s of sliders){
    s.value = 0.5;
  }
  current_palette_saved = false;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //createCanvas(1600, 800);
  update_dimensions();
  colorMode(HSL);
  textFont('Gadugi');
  noStroke();
  
  empty_data();
  
  palette = random_palette();
  
  sliders = [];
  for (let i = 0; i < tags1.length; i++){
    sliders.push(new Slider(side_margin, y_sliders + slider_height * i, main_width, slider_height, 10, tags1[i], tags2[i]));
  }
  
  buttons = [];
  for (let i = 0; i < buttons_tags.length; i++){
    buttons.push(new Button(side_margin + margin2 + i * (button_width + margin2), y_buttons, button_width, button_height, buttons_tags[i]));
  }
}

function draw() {
  background(100);
  
  display_palette(side_margin, margin, main_width, color_height, palette);
  
  for (let s of sliders){
    s.update();
    s.display();
  }
  
  for (let b of buttons){
    b.update();
    b.display();
  }
  
  if (buttons[0].pop_clicked()) { // delete the data that is ready to be saved
    empty_data();
    generate_new_palette();
  }
  
  if (buttons[2].pop_clicked()) { // save the data in a csv file
    if (!current_palette_saved) {
      add_data(palette, sliders);
      current_palette_saved = true;
    }
    saveStrings(data, "data", "csv");
  }
  
  if (buttons[1].pop_clicked()) { // generate a new palette
    add_data(palette, sliders);
    generate_new_palette();
  }
  
  fill(0);
  textSize(min(text_size, foot_height * 0.75 - 1));
  textAlign(CENTER, CENTER);
  text("Palettes in the data : " + n_data_palettes, 0, y_foot, width, foot_height);
  
  
  noFill();
  stroke(40);
  strokeWeight(color_stroke_weight);
  rect(side_margin - color_stroke_weight / 2, margin - color_stroke_weight / 2, main_width + color_stroke_weight, color_height + color_stroke_weight, 2);
  noStroke();

  if (mouse_pressing)
    mouse_pressing = false;
  if (mouse_releasing)
    mouse_releasing = false;
}

function mousePressed(){
  mouse_pressing = true;
}

function mouseReleased(){
  mouse_releasing = true;
}

function touchStarted(){
  mouse_pressing = true;
}

function touchEnded(){
  mouse_releasing = true;
}
