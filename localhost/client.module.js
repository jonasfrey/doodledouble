
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"

import {
    f_o_html__and_make_renderable,
}from 'https://deno.land/x/f_o_html_from_o_js@5.0.1/mod.js'

let o_mod_notifire = await import('https://deno.land/x/f_o_html_from_o_js@5.0.0/localhost/jsh_modules/notifire/mod.js');

import {
    f_o_webgl_program,
    f_delete_o_webgl_program,
    f_resize_canvas_from_o_webgl_program,
    f_render_from_o_webgl_program
} from "https://deno.land/x/handyhelpers@5.0.0/mod.js"

import {
    f_s_hms__from_n_ts_ms_utc,
} from "https://deno.land/x/date_functions@2.0.0/mod.js"  

let a_o_shader = []
let n_idx_a_o_shader = 0;
let o_state = {
    n_scl_x_brush : 50,
    s_color_brush: 'red',
    a_o_card: [

    ]
}

globalThis.o_state = o_state
o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    .app{
        width:100vw;
        height:100vh;
    }
    body{
        min-height: 100vh;
        min-width: 100vw;
        /* background: rgba(0,0,0,0.84);*/
        display:flex;
        justify-content:center; 
        align-items:flex-start;
    }
    canvas{
        width: 100%;
        height: 100%;
        position:fixed;
        border: 1px solid red !important;
        cursor: none !important;
    }
    .item{
        width:2rem;
        height:2rem;
    }
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    .brush_big{
        background: 'black'
        width: 80%;
        height: 80%;
    }
    .brush_medium{
        background: 'black'
        width: 50%;
        height: 50%;
    }
    .brush_small{
        background: 'black'
        width: 30%;
        height: 30%;
    }
    .color_red{
        background: 'red'
    }
    .color_green{
        background: 'green'
    }
    .color_blue{
        background: 'blue'
    }

    `
);

// it is our job to create or get the cavas
let o_canvas = document.createElement('canvas'); // or document.querySelector("#my_canvas");
// document.body.appendChild(o_canvas);

let o_webgl_program = null;
let f_update_shader = function(){

    if(o_webgl_program){
        f_delete_o_webgl_program(o_webgl_program)
    }
    o_webgl_program = f_o_webgl_program(
        o_canvas,
        `#version 300 es
        in vec4 a_o_vec_position_vertex;
        void main() {
            gl_Position = a_o_vec_position_vertex;
        }`, 
        `#version 300 es
        precision mediump float;
        in vec2 o_trn_nor_pixel;
        out vec4 fragColor;
        uniform vec4 iMouse;
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec4 iDate;
    

        void main() {
            float n_scl_min = min(iResolution.x, iResolution.y);
            vec2 o_trn = (gl_FragCoord.xy-iResolution.xy*.5)/n_scl_min;
            float n = length(o_trn);
            float na = atan(o_trn.x, o_trn.y);
            fragColor = vec4(
                sin(n*18.6+iTime+sin(na*3.)),
                sin(n*19.2+iTime+sin(na*3.)),
                sin(n*19.8+iTime+sin(na*3.)),
                sin(n*18.+iTime+na)
            );
        }
        `
    )
    
    o_state.o_ufloc__iResolution = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'iResolution');
    o_state.o_ufloc__iDate = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'iDate');
    o_state.o_ufloc__iMouse = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'iMouse');
    o_state.o_ufloc__iTime = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'iTime');

    f_resize()
}

// just for the demo 
// o_canvas.style.position = 'fixed';
// o_canvas.style.width = '100vw';
// o_canvas.style.height = '100vh';
let f_resize = function(){
    if(o_webgl_program){
        // this will resize the canvas and also update 'o_scl_canvas'
        f_resize_canvas_from_o_webgl_program(
            o_webgl_program,
            globalThis.innerWidth, 
            globalThis.innerHeight
        )
    
        o_webgl_program?.o_ctx.uniform2f(o_state.o_ufloc__iResolution,
            globalThis.innerWidth, 
            globalThis.innerHeight
        );
    
        f_render_from_o_webgl_program(o_webgl_program);
    }
}

globalThis.addEventListener('resize', ()=>{
    f_resize();
});

let n_id_raf = 0;


let mouseX = 0;
let mouseY = 0;
let clickX = 0;
let clickY = 0;
let isMouseDown = false;

// Event listener for mouse move
o_canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Event listener for mouse down
o_canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    clickX = event.clientX;
    clickY = event.clientY;
});

// Event listener for mouse up
o_canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

let n_ms_update_time_last = 0;
let n_ms_update_time_delta_max = 1000;
let f_raf = function(){

    if(o_webgl_program){
        let o_date = new Date();
        let n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value = (o_date.getTime()/1000.)%(60*60*24)
        // n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value = (60*60*24)-1 //test
        o_webgl_program?.o_ctx.uniform4f(o_state.o_ufloc__iDate,
            o_date.getUTCFullYear(),
            o_date.getUTCMonth(), 
            o_date.getUTCDate(),
            n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value
        );
        o_webgl_program?.o_ctx.uniform4f(o_state.o_ufloc__i_mouse,
            isMouseDown ? mouseX : 0.0,
            isMouseDown ? mouseY : 0.0,
            clickX,
            clickY
        );
        o_webgl_program?.o_ctx.uniform1f( o_state.o_ufloc__iTime,
            n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value
        );
       
        let s_time = `${f_s_hms__from_n_ts_ms_utc(o_date.getTime(), 'UTC')}.${((o_date.getTime()/1000)%1).toFixed(3).split('.').pop()}`
    
        let n_ms = globalThis.performance.now()
        let n_ms_delta = Math.abs(n_ms_update_time_last - n_ms);
        if(n_ms_delta > n_ms_update_time_delta_max){
            document.title = `${s_time.split('.').shift()} Shader-Clock` 
            n_ms_update_time_last = n_ms;
        }
        f_render_from_o_webgl_program(o_webgl_program);
    }

    n_id_raf = requestAnimationFrame(f_raf)

}
// n_id_raf = requestAnimationFrame(f_raf)



f_update_shader()


// Determine the current domain
const s_hostname = globalThis.location.hostname;

// Create the WebSocket URL, assuming ws for http and wss for https
const s_protocol_ws = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:';
const s_url_ws = `${s_protocol_ws}//${s_hostname}:${globalThis.location.port}`;

// Create a new WebSocket instance
const o_ws = new WebSocket(s_url_ws);

// Set up event listeners for your WebSocket
o_ws.onopen = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onopen called'
    })
};

o_ws.onerror = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onerror called'
    })
};

o_ws.onmessage = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onmessage called'
    })
    o_state.a_o_msg.push(o_e.data);
    o_state?.o_js__a_o_mod?._f_render();

};
globalThis.addEventListener('pointerdown', (o_e)=>{
    o_ws.send('pointerdown on client')
})


let f_a_a_n = function(n_num_of_symbols) {
    if (n_num_of_symbols < 7) {
        throw Error('Minimum 7 symbols required');
    }

    // Calculate n from the total number of symbols
    let n = Math.floor(Math.sqrt(n_num_of_symbols - 1));
    if (n * (n + 1) + 1 !== n_num_of_symbols) {
        throw Error('The number of symbols must be of the form n^2 + n + 1');
    }

    // Initialize the result array to hold all card combinations
    let result = [];

    // Add the main set of cards
    for (let i = 0; i <= n; i++) {
        let card = [];
        for (let j = 0; j <= n; j++) {
            card.push(i * n + j + 1);
        }
        result.push(card);
    }

    // Add the remaining cards
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let card = [i + 1];
            for (let k = 0; k < n; k++) {
                card.push(n + 1 + k * n + (j + k * i) % n);
            }
            result.push(card);
        }
    }

    return result;
}

document.body.appendChild(
    await f_o_html__and_make_renderable(
        {
            class: "app",
            a_o: [
                {
                    class: "a_o_canvas",
                    a_o: [
                        {
                            style: "max-width:100%;display:flex",
                            a_o: [
                                {
                                    class: 'item brush_big',
                                    onclick: async function(){
                                        o_state.n_scl_x_brush = 50
                                    },
                                    a_o:[
                                        {}
                                    ]
                                },
                                {
                                    class: 'item brush_medium',
                                    onclick: async function(){
                                        o_state.n_scl_x_brush = 30
                                    },
                                    a_o:[
                                        {}
                                    ]
                                },
                                {
                                    class: 'item brush_small',
                                    onclick: async function(){
                                        o_state.n_scl_x_brush = 10
                                    },
                                    a_o:[
                                        {}
                                    ]
                                }, 
                                {
                                    class: 'item color_red',
                                    onclick: async function(){
                                        o_state.s_color_brush = 'red'
                                    },
                                    a_o:[
                                        {}
                                    ]
                                },
                                {
                                    class: 'item color_green',
                                    onclick: async function(){
                                        o_state.s_color_brush = 'green'
                                    },
                                    a_o:[
                                        {}
                                    ]
                                },
                                {
                                    class: 'item color_blue',
                                    onclick: async function(){
                                        o_state.s_color_brush = 'blue'
                                    },
                                    a_o:[
                                        {}
                                    ]
                                }
                            ]
                        },
                        {
                            id: "drawing-canvas",
                            s_tag: "canvas",
                        }, 
                        {
                            id: "cursor-canvas",
                            s_tag: "canvas",
                            style: 'z-index:1'
                        }, 
                    ]
                },
            ]
        }
        )
)
o_mod_notifire.f_o_throw_notification(o_state.o_state_notifire,'hello!')


// Shared variable for brush size

const drawingSketch = (p) => {
  let eraserMode = false;

  p.setup = function() {
    const canvasElement = document.getElementById('drawing-canvas');
    console.log({canvasElement})
    let o_el_par = canvasElement.parentElement
    o_el_par.removeChild(canvasElement);
    const canvas = p.createCanvas(canvasElement.width, canvasElement.height);
    canvas.id('drawing-canvas');
    canvas.class('p5Canvas');
    o_el_par.appendChild(canvas.canvas);
    p.canvas = canvasElement;
    p.drawingContext = canvasElement.getContext('2d');
    p.width = canvasElement.width;
    p.height = canvasElement.height;
    p.strokeWeight(o_state.n_scl_x_brush);
    p.noCursor(); // Hide the default cursor
  };

  p.draw = function() {
    if (p.mouseIsPressed) {
      p.strokeWeight(o_state.n_scl_x_brush);
      if (eraserMode) {
        p.erase();
      } else {
        p.noErase();
        p.stroke(o_state.s_color_brush);
      }
      p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
      p.noErase(); // Ensure erasing is turned off after drawing
    }
  };
  p.keyPressed = function() {
    if (p.key === ' ') {
      eraserMode = true;
    }
  };

  p.keyReleased = function() {
    if (p.key === ' ') {
      eraserMode = false;
    }
  };
};

const cursorSketch = (p) => {
  p.setup = function() {
    const canvasElement = document.getElementById('cursor-canvas');
    console.log({canvasElement})
    let o_el_par = canvasElement.parentElement
    o_el_par.removeChild(canvasElement);
    const canvas = p.createCanvas(canvasElement.width, canvasElement.height);
    canvas.id('cursor-canvas');
    canvas.class('p5Canvas');
    o_el_par.appendChild(canvas.canvas);
    p.canvas = canvasElement;
    p.drawingContext = canvasElement.getContext('2d');
    p.width = canvasElement.width;
    p.height = canvasElement.height;
    p.noStroke();
    p.noCursor(); // Hide the default cursor
  };

  p.draw = function() {
    p.clear(); // Clear the canvas each frame to prevent trails
    p.fill(0, 255, 0, 150); // Semi-transparent green fill
    p.stroke(255, 0, 0); // Red border
    p.strokeWeight(2);

    // Draw the cursor circle at the mouse position
    if (
      p.mouseX >= 0 &&
      p.mouseX <= p.width &&
      p.mouseY >= 0 &&
      p.mouseY <= p.height
    ) {
      p.ellipse(p.mouseX, p.mouseY, o_state.n_scl_x_brush, o_state.n_scl_x_brush);
    }
  };
};

// Initialize the p5.js instances
const drawingP5 = new window.p5(drawingSketch);
const cursorP5 = new window.p5(cursorSketch);

// // Brush size control
// const brushSizeInput = document.getElementById('brush-size');

// brushSizeInput.addEventListener('input', (e) => {
//   brushSize = e.target.value;
// });
