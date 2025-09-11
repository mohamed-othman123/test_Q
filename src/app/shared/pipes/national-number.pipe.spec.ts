import { NationalNumberPipe } from './national-number.pipe';

describe('NationalNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new NationalNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
