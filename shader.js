import { device } from './setup.js';

export const module = device.createShaderModule({
  label: 'shaders',
  code: /* wgsl */ `

  struct VertexInput {
    @location(0) position: vec2<f32>
  };

  struct VertexOutput {
    @builtin(position) position: vec4<f32>,
  };

  struct Entity {
    xy: vec2<f32>,
  };


  @group(0) @binding(0) var<storage> player: Entity;
  @group(0) @binding(0) var<storage> bullets: array<Entity>;

  @vertex fn vsPlayer(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    var newPosition = player.xy + input.position;
    output.position = vec4f(newPosition, 0.1, 1.0);
    return output;
  }

  @vertex fn vsBullets(input: VertexInput, @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
    var output: VertexOutput;
    var newPosition = bullets[instanceIndex].xy + input.position;
    output.position = vec4f(newPosition, 0.1, 1.0);
    return output;
  }


  @fragment fn fs(input: VertexOutput) -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
  }
  @fragment fn fsBullet(input: VertexOutput) -> @location(0) vec4f {
    return vec4f(1, 1, 0, 1);
  }
  `,
});
