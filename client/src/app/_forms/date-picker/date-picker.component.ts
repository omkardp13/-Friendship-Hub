import { Component, Input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements ControlValueAccessor {

  @Input() label: string = '';
  @Input() maxDate: Date | undefined;
  bsConfig: Partial<BsDatepickerConfig>;

  onChange: any = () => {};
  onTouched: any = () => {};

  

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;

    this.bsConfig = {
      containerClass: 'theme-red',
      dateInputFormat: 'DD MMMM YYYY'
    };
    
  }

  

  writeValue(value: any): void {
    const currentValue = this.control?.value;
  
    // Check if the incoming value is different from the current form control value
    if (value !== currentValue) {
      if (value !== undefined && value !== null) {
        const date = new Date(value); // Ensure it's a Date object
        this.control?.setValue(date, { emitEvent: false }); // Avoid triggering another change event
      } else {
        this.control?.reset();
      }
    }
  }
  
  
  

  
onDateChange(date: Date | null): void { // Check if this logs the correct date
  this.onChange(date);  // Pass the value to Angular's form control
  this.onTouched();     // Mark the control as touched
}

  

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.control?.disable();
    } else {
      this.control?.enable();
    }
  }

  get control(): FormControl | null {
    if (!this.ngControl || !this.ngControl.control) {
      return null;
    }
    return this.ngControl.control as FormControl;
  }
  
}
