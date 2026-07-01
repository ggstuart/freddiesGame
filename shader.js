import { device } from './setup.js';

export const module = device.createShaderModule({
  label: 'shaders',
  code: /* wgsl */ `

  struct VertexInput {
    @location(0) position: vec2<f32>,
  };

  struct Entity {
    xy: vec2<f32>,
    _pad: vec2<f32>,
    color: vec4<f32>,
  };

  struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
  };
  struct Canvas {
    width: f32,
    height: f32,
  };

  @group(0) @binding(0) var<storage> entities: array<Entity>;
  @group(0) @binding(1) var<uniform> canvas: Canvas;

  @vertex fn vsEntity(input: VertexInput, @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
    var output: VertexOutput;
    let entity = entities[instanceIndex];
    let aspect = canvas.width / canvas.height;
    var realPos = input.position;
    realPos.x = realPos.x / aspect;
    output.position = vec4f(entity.xy + realPos, 0.1, 1.0);
    
    output.color = entity.color;
    return output;
  }

  @fragment fn fsEntity(input: VertexOutput) -> @location(0) vec4f {
    return input.color;
  }
  `,

});
