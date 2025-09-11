import { HijriDatePipe } from './hijri-date.pipe';

describe('HijriDatePipe', () => {
  it('create an instance', () => {
    const pipe = new HijriDatePipe();
    expect(pipe).toBeTruthy();
  });
});
