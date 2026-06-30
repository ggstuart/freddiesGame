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


  @group(0) @binding(0) var<storage> playerXY: vec2<f32>;

  @vertex fn vs(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    var newPosition = playerXY + input.position;
    output.position = vec4f(newPosition, 0.1, 1.0);
    return output;
  }

  @fragment fn fs(input: VertexOutput) -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
  }
  `,
});
