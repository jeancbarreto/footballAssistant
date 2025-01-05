export class KalmanFilter {
    private processNoise: number;
    private measurementNoise: number;
    private estimatedError: number;
    private currentEstimate: number;
  
    constructor(processNoise: number, measurementNoise: number, estimatedError: number, initialValue: number) {
      this.processNoise = processNoise;
      this.measurementNoise = measurementNoise;
      this.estimatedError = estimatedError;
      this.currentEstimate = initialValue;
    }
  
    update(measurement: number): number {
      const kalmanGain = this.estimatedError / (this.estimatedError + this.measurementNoise);
      this.currentEstimate = this.currentEstimate + kalmanGain * (measurement - this.currentEstimate);
      this.estimatedError = (1 - kalmanGain) * this.estimatedError + Math.abs(this.currentEstimate) * this.processNoise;
      return this.currentEstimate;
    }
  }